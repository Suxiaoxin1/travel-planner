/**
 * 用户数据统一持久化与同步服务
 *
 * 核心职责：
 * 1. 统一管理所有用户模块数据的持久化（localStorage + 服务端）
 * 2. 登录后自动从服务端拉取全量数据，与本地合并
 * 3. 数据变更时自动同步到服务端
 * 4. 多端数据同步：基于时间戳的"最后写入胜出"冲突解决
 * 5. 跨标签页同步：通过 storage 事件和 BroadcastChannel
 * 6. 会话状态无缝恢复
 */

import { getCurrentUserId, onLoginLoad, onLogoutReset, isLoginCompleted } from '../stores/user.js'
import { getUserStorageKey } from '../services/auth.js'

// ============================================================
// 配置
// ============================================================
const SYNC_API_BASE = '/api/user-data'
const SYNC_INTERVAL_MS = 30_000       // 自动同步间隔（30秒）
const DEBOUNCE_MS = 2_000             // 变更后防抖同步延迟
const MAX_RETRY = 3                   // 最大重试次数

// ============================================================
// 模块注册表
// ============================================================
const MODULE_REGISTRY = new Map()

/**
 * 注册一个数据模块
 * @param {string} name - 模块名（如 'trip', 'chat', 'persona', 'mbti'）
 * @param {object} handlers - 处理函数
 * @param {function} handlers.getLocalData - 获取本地数据 () => any
 * @param {function} handlers.setLocalData - 设置本地数据 (data) => void
 * @param {function} handlers.mergeData - 合并数据 (local, remote, localTs, remoteTs) => any
 * @param {function} handlers.getTimestamp - 获取数据最后更新时间戳 () => string
 */
export function registerModule(name, handlers) {
  MODULE_REGISTRY.set(name, {
    name,
    getLocalData: handlers.getLocalData,
    setLocalData: handlers.setLocalData,
    mergeData: handlers.mergeData || defaultMerge,
    getTimestamp: handlers.getTimestamp || (() => new Date().toISOString()),
  })
}

/**
 * 默认合并策略：基于时间戳，最后写入胜出
 */
function defaultMerge(localData, remoteData, localTs, remoteTs) {
  if (!remoteData) return localData
  if (!localData) return remoteData
  // 比较时间戳，新的胜出
  return new Date(remoteTs) > new Date(localTs) ? remoteData : localData
}

// ============================================================
// 服务端同步
// ============================================================

/**
 * 从服务端拉取用户全量数据
 * @param {string} userId
 * @returns {Promise<object|null>} { modules: { trip: { data, timestamp }, ... }, syncTime }
 */
async function fetchRemoteData(userId) {
  try {
    const resp = await fetch(`${SYNC_API_BASE}/${userId}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    })
    if (!resp.ok) {
      if (resp.status === 404) return null // 新用户，无远端数据
      throw new Error(`HTTP ${resp.status}`)
    }
    const result = await resp.json()
    if (result.success) return result.data
    return null
  } catch (e) {
    console.warn('[DataSync] 拉取远端数据失败:', e.message)
    return null
  }
}

/**
 * 推送用户数据到服务端
 * @param {string} userId
 * @param {object} modulesData - { moduleName: { data, timestamp } }
 */
async function pushRemoteData(userId, modulesData) {
  try {
    const resp = await fetch(`${SYNC_API_BASE}/${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ modules: modulesData }),
    })
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`)
    const result = await resp.json()
    return result.success
  } catch (e) {
    console.warn('[DataSync] 推送远端数据失败:', e.message)
    return false
  }
}

// ============================================================
// 数据合并（核心同步逻辑）
// ============================================================

/**
 * 合并本地和远端数据
 * 策略：逐模块比较时间戳，最后写入胜出
 *
 * @param {object} localModules - 本地各模块数据 { name: data }
 * @param {object} remoteModules - 远端各模块数据 { name: { data, timestamp } }
 * @param {object} localTimestamps - 本地各模块时间戳 { name: timestamp }
 * @returns {object} 合并后的数据 { name: data, hasChanges: boolean }
 */
function mergeAllModules(localModules, remoteModules, localTimestamps) {
  const result = {}
  let hasChanges = false

  const allModuleNames = new Set([
    ...Object.keys(localModules || {}),
    ...Object.keys(remoteModules || {}),
  ])

  for (const name of allModuleNames) {
    const mod = MODULE_REGISTRY.get(name)
    const localData = localModules?.[name]
    const remoteEntry = remoteModules?.[name]
    const remoteData = remoteEntry?.data
    const remoteTs = remoteEntry?.timestamp
    const localTs = localTimestamps?.[name]

    if (!remoteData && localData) {
      // 仅本地有数据，保留本地
      result[name] = localData
    } else if (remoteData && !localData) {
      // 仅远端有数据，使用远端
      result[name] = remoteData
      hasChanges = true
    } else if (remoteData && localData) {
      // 两端都有数据，需要合并
      const merged = mod ? mod.mergeData(localData, remoteData, localTs, remoteTs) : defaultMerge(localData, remoteData, localTs, remoteTs)
      result[name] = merged
      if (merged !== localData) hasChanges = true
    }
  }

  return { modules: result, hasChanges }
}

// ============================================================
// 同步状态管理
// ============================================================

const syncState = {
  isSyncing: false,
  lastSyncTime: null,
  lastError: null,
  pendingChanges: new Set(),     // 有未同步变更的模块名
  syncTimerId: null,
  debounceTimerId: null,
}

/**
 * 获取同步状态
 */
export function getSyncState() {
  return {
    isSyncing: syncState.isSyncing,
    lastSyncTime: syncState.lastSyncTime,
    lastError: syncState.lastError,
    hasPendingChanges: syncState.pendingChanges.size > 0,
  }
}

// ============================================================
// 核心同步操作
// ============================================================

/**
 * 全量同步：拉取远端 → 合并 → 推送
 * 用于登录时或手动触发
 */
export async function fullSync() {
  const userId = getCurrentUserId()
  if (!userId) return

  if (syncState.isSyncing) return
  syncState.isSyncing = true
  syncState.lastError = null

  try {
    // 1. 收集本地所有模块数据
    const localModules = {}
    const localTimestamps = {}
    for (const [name, mod] of MODULE_REGISTRY) {
      const data = mod.getLocalData()
      if (data !== null && data !== undefined) {
        localModules[name] = data
        // 从 localStorage 元数据获取时间戳
        localTimestamps[name] = getModuleTimestamp(userId, name)
      }
    }

    // 2. 拉取远端数据
    const remoteResult = await fetchRemoteData(userId)

    // 3. 合并
    let mergedModules = localModules
    if (remoteResult?.modules) {
      const mergeResult = mergeAllModules(localModules, remoteResult.modules, localTimestamps)
      mergedModules = mergeResult.modules

      // 4. 如果合并结果有变化，更新本地数据
      if (mergeResult.hasChanges) {
        for (const [name, data] of Object.entries(mergedModules)) {
          const mod = MODULE_REGISTRY.get(name)
          if (mod) {
            mod.setLocalData(data)
          }
        }
      }
    }

    // 5. 推送合并后的完整数据到远端
    const pushData = {}
    const now = new Date().toISOString()
    for (const [name, data] of Object.entries(mergedModules)) {
      pushData[name] = { data, timestamp: now }
      // 更新本地时间戳
      setModuleTimestamp(userId, name, now)
    }

    await pushRemoteData(userId, pushData)

    // 6. 更新同步状态
    syncState.lastSyncTime = now
    syncState.pendingChanges.clear()

  } catch (e) {
    syncState.lastError = e.message
    console.error('[DataSync] 全量同步失败:', e)
  } finally {
    syncState.isSyncing = false
  }
}

/**
 * 增量同步：仅推送有变更的模块
 */
export async function incrementalSync() {
  const userId = getCurrentUserId()
  if (!userId || syncState.pendingChanges.size === 0) return

  if (syncState.isSyncing) return
  syncState.isSyncing = true
  syncState.lastError = null

  try {
    const pushData = {}
    const now = new Date().toISOString()

    for (const name of syncState.pendingChanges) {
      const mod = MODULE_REGISTRY.get(name)
      if (mod) {
        const data = mod.getLocalData()
        if (data !== null && data !== undefined) {
          pushData[name] = { data, timestamp: now }
          setModuleTimestamp(userId, name, now)
        }
      }
    }

    if (Object.keys(pushData).length > 0) {
      await pushRemoteData(userId, pushData)
    }

    syncState.lastSyncTime = now
    syncState.pendingChanges.clear()

  } catch (e) {
    syncState.lastError = e.message
    console.error('[DataSync] 增量同步失败:', e)
  } finally {
    syncState.isSyncing = false
  }
}

/**
 * 标记模块数据已变更（防抖推送）
 */
export function markDirty(moduleName) {
  if (!getCurrentUserId()) return

  syncState.pendingChanges.add(moduleName)

  // 防抖：延迟推送
  if (syncState.debounceTimerId) {
    clearTimeout(syncState.debounceTimerId)
  }
  syncState.debounceTimerId = setTimeout(() => {
    incrementalSync()
  }, DEBOUNCE_MS)
}

// ============================================================
// 时间戳管理（存储在 localStorage 的元数据 key 中）
// ============================================================

function getTimestampKey(userId, moduleName) {
  return `travel_app_${userId}_${moduleName}_ts`
}

function getModuleTimestamp(userId, moduleName) {
  try {
    const ts = localStorage.getItem(getTimestampKey(userId, moduleName))
    return ts || new Date(0).toISOString()
  } catch {
    return new Date(0).toISOString()
  }
}

function setModuleTimestamp(userId, moduleName, timestamp) {
  try {
    localStorage.setItem(getTimestampKey(userId, moduleName), timestamp)
  } catch {}
}

// ============================================================
// 定时同步
// ============================================================

function startAutoSync() {
  stopAutoSync()
  syncState.syncTimerId = setInterval(() => {
    if (syncState.pendingChanges.size > 0) {
      incrementalSync()
    }
  }, SYNC_INTERVAL_MS)
}

function stopAutoSync() {
  if (syncState.syncTimerId) {
    clearInterval(syncState.syncTimerId)
    syncState.syncTimerId = null
  }
  if (syncState.debounceTimerId) {
    clearTimeout(syncState.debounceTimerId)
    syncState.debounceTimerId = null
  }
}

// ============================================================
// 跨标签页同步（BroadcastChannel + storage 事件）
// ============================================================

let broadcastChannel = null

function initCrossTabSync() {
  // BroadcastChannel（同源标签页通信）
  try {
    broadcastChannel = new BroadcastChannel('travel_app_sync')
    broadcastChannel.onmessage = (event) => {
      const { type, moduleName, userId } = event.data
      if (type === 'data_updated' && userId === getCurrentUserId()) {
        // 其他标签页更新了数据，从 localStorage 重新读取
        const mod = MODULE_REGISTRY.get(moduleName)
        if (mod) {
          try {
            const key = getUserStorageKey(userId, moduleName)
            const stored = localStorage.getItem(key)
            if (stored) {
              mod.setLocalData(JSON.parse(stored))
            }
          } catch {}
        }
      }
    }
  } catch {
    // BroadcastChannel 不可用，降级为 storage 事件
  }

  // storage 事件（跨标签页 localStorage 变更监听）
  window.addEventListener('storage', (event) => {
    if (!event.key || !event.newValue) return
    const userId = getCurrentUserId()
    if (!userId) return

    // 检查是否是用户相关的 key
    const prefix = `travel_app_${userId}_`
    if (!event.key.startsWith(prefix)) return

    // 提取模块名
    const suffix = event.key.slice(prefix.length)
    const moduleName = suffix.replace(/_ts$/, '') // 去掉时间戳后缀

    const mod = MODULE_REGISTRY.get(moduleName)
    if (mod) {
      // 从 localStorage 重新读取数据并设置
      try {
        const freshData = JSON.parse(event.newValue)
        mod.setLocalData(freshData)
      } catch {}
    }
  })
}

/**
 * 通知其他标签页数据已更新
 */
function notifyCrossTab(moduleName) {
  const userId = getCurrentUserId()
  if (!userId) return

  if (broadcastChannel) {
    try {
      broadcastChannel.postMessage({
        type: 'data_updated',
        moduleName,
        userId,
      })
    } catch {}
  }
}

// ============================================================
// 生命周期集成
// ============================================================

// 登录时：全量同步
onLoginLoad(async (userId) => {
  console.log('[DataSync] 用户登录，启动数据同步:', userId)
  initCrossTabSync()
  await fullSync()
  startAutoSync()
})

// 退出时：推送未同步数据，停止同步
onLogoutReset(async () => {
  console.log('[DataSync] 用户退出，执行最终同步')
  // 尝试推送所有未同步的变更
  if (syncState.pendingChanges.size > 0) {
    await incrementalSync().catch(() => {})
  }
  stopAutoSync()
  syncState.pendingChanges.clear()
  syncState.isSyncing = false
  syncState.lastError = null
  if (broadcastChannel) {
    broadcastChannel.close()
    broadcastChannel = null
  }
})

// 页面关闭前推送未同步数据
window.addEventListener('beforeunload', () => {
  if (syncState.pendingChanges.size > 0 && getCurrentUserId()) {
    // 使用 sendBeacon 尝试发送（可能不保证成功）
    const userId = getCurrentUserId()
    const pushData = {}
    const now = new Date().toISOString()
    for (const name of syncState.pendingChanges) {
      const mod = MODULE_REGISTRY.get(name)
      if (mod) {
        const data = mod.getLocalData()
        if (data !== null && data !== undefined) {
          pushData[name] = { data, timestamp: now }
        }
      }
    }
    if (Object.keys(pushData).length > 0) {
      try {
        const blob = new Blob(
          [JSON.stringify({ modules: pushData })],
          { type: 'application/json' }
        )
        navigator.sendBeacon(`${SYNC_API_BASE}/${userId}`, blob)
      } catch {}
    }
  }
})

// ============================================================
// 导出
// ============================================================

export default {
  registerModule,
  fullSync,
  incrementalSync,
  markDirty,
  getSyncState,
  notifyCrossTab,
}
