/**
 * 用户认证与状态管理模块
 * 核心职责：
 * 1. 登录/退出状态管理
 * 2. 用户级数据隔离（通过 userId 前缀 localStorage key）
 * 3. 登录时加载预设存档，退出时清除所有模块数据
 */
import { reactive } from 'vue'
import { login as doLogin, getPresetArchive, getUserStorageKey } from '../services/auth.js'

// 当前登录用户的 userId（用于构建其他模块的存储key）
let currentUserId = null

// 标记是否已完成登录（供延迟加载的store检测）
let _loginCompleted = false

/**
 * 获取当前登录用户ID
 */
export function getCurrentUserId() {
  if (currentUserId) return currentUserId
  try {
    const stored = localStorage.getItem('travel_app_current_user')
    if (stored) {
      currentUserId = JSON.parse(stored)
      return currentUserId
    }
  } catch {}
  return null
}

/**
 * 检查是否已有用户登录完成（供延迟加载的store使用）
 */
export function isLoginCompleted() {
  return _loginCompleted
}

function setCurrentUserId(userId) {
  currentUserId = userId
  try {
    localStorage.setItem('travel_app_current_user', JSON.stringify(userId))
  } catch (e) {
    console.error('保存当前用户ID失败:', e)
  }
}

function clearCurrentUserId() {
  currentUserId = null
  try {
    localStorage.removeItem('travel_app_current_user')
  } catch {}
}

// 清理旧版 localStorage key（不带用户前缀的）
function cleanupOldStorageKeys() {
  const oldKeys = [
    'travel_app_persona',
    'travel_app_mbti',
    'travel_app_user'
  ]
  oldKeys.forEach(key => {
    try { localStorage.removeItem(key) } catch {}
  })
}

// 读取用户基本信息
function loadUserInfo(userId) {
  if (!userId) return null
  try {
    const stored = localStorage.getItem(getUserStorageKey(userId, 'user'))
    return stored ? JSON.parse(stored) : null
  } catch {
    return null
  }
}

// ============================================================
// 初始化时尝试恢复登录状态
// ============================================================
const restoredUserId = getCurrentUserId()
const storedUserInfo = restoredUserId ? loadUserInfo(restoredUserId) : null

export const userState = reactive({
  isLoggedIn: !!storedUserInfo,
  userInfo: storedUserInfo || {
    userId: '',
    nickname: '',
    avatar: '',
    phone: '',
    sex: 0,
    province: '',
    city: '',
    country: '',
    loginType: '',
    loginTime: '',
    bio: ''
  }
})

// 如果恢复了用户数据，标记登录完成
if (storedUserInfo) {
  _loginCompleted = true
  cleanupOldStorageKeys()
}

/**
 * 登录（账号密码方式）
 */
export function performLogin(username, password) {
  const result = doLogin(username, password)
  if (!result.success) {
    return { success: false, error: result.error }
  }
  return loginWithUserInfo(result.userInfo)
}

/**
 * 直接使用用户信息登录（微信回调等场景）
 */
export function loginWithUserInfo(userInfo) {
  const userId = userInfo.userId || userInfo.openid || `user_${Date.now()}`
  const fullUserInfo = { ...userInfo, userId, loginTime: userInfo.loginTime || new Date().toISOString() }

  // 设置当前用户
  setCurrentUserId(userId)
  userState.isLoggedIn = true
  // 使用 Object.keys 逐一赋值确保 Vue 响应性
  const defaultInfo = {
    userId: '', nickname: '', avatar: '', phone: '', sex: 0,
    province: '', city: '', country: '', loginType: '', loginTime: '', bio: ''
  }
  // 先重置再赋值，确保所有字段都有响应式
  Object.keys(defaultInfo).forEach(key => {
    userState.userInfo[key] = fullUserInfo[key] !== undefined ? fullUserInfo[key] : defaultInfo[key]
  })

  // 保存用户基本信息
  try {
    localStorage.setItem(getUserStorageKey(userId, 'user'), JSON.stringify(userState.userInfo))
  } catch (e) {
    console.error('保存用户数据失败:', e)
  }

  // 清理旧版存储key
  cleanupOldStorageKeys()

  // 加载预设存档（如果是预设账号且首次登录）
  loadPresetArchiveIfNeeded(userId)

  // 标记登录完成（必须在通知模块之前设置，确保 onLoginLoad 能正确触发）
  _loginCompleted = true

  // 通知各模块加载数据
  notifyModulesToLoad(userId)

  return { success: true }
}

/**
 * 退出登录
 * 不再删除用户数据，仅重置当前会话的内存状态
 * 数据保留在 localStorage 和服务端，下次登录可自动恢复
 */
export function performLogout() {
  const userId = getCurrentUserId()

  // 不再删除 localStorage 数据，保留用于下次登录恢复
  // （数据同步服务会在退出时自动推送未同步的变更到服务端）

  // 重置登录标记（必须在通知模块之前重置）
  _loginCompleted = false

  // 重置用户状态
  userState.isLoggedIn = false
  const defaultInfo = {
    userId: '', nickname: '', avatar: '', phone: '', sex: 0,
    province: '', city: '', country: '', loginType: '', loginTime: '', bio: ''
  }
  Object.keys(defaultInfo).forEach(key => {
    userState.userInfo[key] = defaultInfo[key]
  })

  clearCurrentUserId()

  // 通知各模块重置内存状态（不清除 localStorage）
  notifyModulesToReset()
}

/**
 * 更新用户信息
 */
export function updateUserInfo(updates) {
  Object.assign(userState.userInfo, updates)
  saveUserInfo()
}

function saveUserInfo() {
  const userId = getCurrentUserId()
  if (!userId) return
  try {
    localStorage.setItem(getUserStorageKey(userId, 'user'), JSON.stringify(userState.userInfo))
  } catch (e) {
    console.error('保存用户数据失败:', e)
  }
}

/**
 * 加载预设存档（仅首次登录时，本地没有该用户数据时）
 */
function loadPresetArchiveIfNeeded(userId) {
  const archive = getPresetArchive(userId)
  if (!archive) return

  // 预设存档中 trips 和 chats 的 key 与模块名不同
  const moduleKeyMap = {
    'persona': 'persona',
    'mbti': 'mbti',
    'trip': 'trips',   // archive 中用 trips，localStorage 用 trip
    'chat': 'chats',   // archive 中用 chats，localStorage 用 chat
  }

  for (const [modName, archiveKey] of Object.entries(moduleKeyMap)) {
    const key = getUserStorageKey(userId, modName)
    const existing = localStorage.getItem(key)
    if (existing) continue

    const presetData = archive[archiveKey]
    if (presetData !== null && presetData !== undefined) {
      try {
        localStorage.setItem(key, JSON.stringify(presetData))
      } catch (e) {
        console.error(`写入预设存档${modName}失败:`, e)
      }
    }
  }
}

// ============================================================
// 模块通知机制
// ============================================================
const moduleLoadCallbacks = []
const moduleResetCallbacks = []

export function onLoginLoad(callback) {
  moduleLoadCallbacks.push(callback)
  // 如果登录已经完成，立即触发一次（解决延迟加载store错过通知的问题）
  const userId = getCurrentUserId()
  if (_loginCompleted && userId) {
    try { callback(userId) } catch (e) { console.error('模块加载回调出错:', e) }
  }
}

export function onLogoutReset(callback) {
  moduleResetCallbacks.push(callback)
}

function notifyModulesToLoad(userId) {
  moduleLoadCallbacks.forEach(cb => {
    try { cb(userId) } catch (e) { console.error('模块加载回调出错:', e) }
  })
}

function notifyModulesToReset() {
  moduleResetCallbacks.forEach(cb => {
    try { cb() } catch (e) { console.error('模块重置回调出错:', e) }
  })
}

/**
 * 检查登录状态并恢复
 */
export function checkLoginStatus() {
  const userId = getCurrentUserId()
  if (!userId) return false
  const info = loadUserInfo(userId)
  if (info) {
    userState.isLoggedIn = true
    Object.assign(userState.userInfo, info)
    _loginCompleted = true
    notifyModulesToLoad(userId)
    return true
  }
  return false
}

// 初始化时如果已登录，延迟通知模块加载（确保路由和Vue实例都已就绪）
// 使用 queueMicrotask 替代 nextTick，因为 nextTick 在模块初始化阶段可能不可靠
if (restoredUserId && storedUserInfo) {
  queueMicrotask(() => {
    notifyModulesToLoad(restoredUserId)
  })
}

export default {
  userState,
  performLogin,
  loginWithUserInfo,
  performLogout,
  updateUserInfo,
  checkLoginStatus,
  getCurrentUserId,
  isLoginCompleted,
  onLoginLoad,
  onLogoutReset
}
