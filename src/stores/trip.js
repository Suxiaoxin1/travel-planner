/**
 * 行程规划状态管理模块
 * 支持用户级数据隔离，登录时加载，退出时重置
 * 集成数据同步服务，支持多端数据一致性
 */
import { reactive } from 'vue'
import { getCurrentUserId, onLoginLoad, onLogoutReset } from './user.js'
import { getUserStorageKey } from '../services/auth.js'
import { registerModule, markDirty } from '../services/dataSync.js'

function getStorageKey() {
  const userId = getCurrentUserId()
  return userId ? getUserStorageKey(userId, 'trip') : null
}

function loadFromStorage() {
  const key = getStorageKey()
  if (!key) return []
  try {
    const stored = localStorage.getItem(key)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

function saveToStorage(data) {
  const key = getStorageKey()
  if (!key) return
  try {
    localStorage.setItem(key, JSON.stringify(data))
  } catch (e) {
    console.error('保存行程数据失败:', e)
  }
}

// 获取行程数据最后更新时间
function getTripTimestamp() {
  const key = getStorageKey()
  if (!key) return new Date(0).toISOString()
  try {
    const ts = localStorage.getItem(key + '_ts')
    return ts || new Date(0).toISOString()
  } catch {
    return new Date(0).toISOString()
  }
}

// 行程数据合并策略：基于 updatedAt 时间戳的条目级合并
function mergeTripData(localTrips, remoteTrips, localTs, remoteTs) {
  if (!remoteTrips || remoteTrips.length === 0) return localTrips
  if (!localTrips || localTrips.length === 0) return remoteTrips

  // 按 ID 构建映射，逐条合并
  const localMap = new Map(localTrips.map(t => [t.id, t]))
  const remoteMap = new Map(remoteTrips.map(t => [t.id, t]))

  const mergedIds = new Set([...localMap.keys(), ...remoteMap.keys()])
  const result = []

  for (const id of mergedIds) {
    const local = localMap.get(id)
    const remote = remoteMap.get(id)

    if (!local && remote) {
      result.push(remote) // 仅远端有
    } else if (local && !remote) {
      result.push(local) // 仅本地有
    } else {
      // 两端都有，比较 updatedAt，保留较新的
      const localUpdated = local.updatedAt || local.createdAt || ''
      const remoteUpdated = remote.updatedAt || remote.createdAt || ''
      result.push(remoteUpdated > localUpdated ? remote : local)
    }
  }

  return result
}

// 注册数据同步模块
registerModule('trip', {
  getLocalData: () => tripState.trips,
  setLocalData: (data) => { tripState.trips = data },
  mergeData: mergeTripData,
  getTimestamp: getTripTimestamp,
})

export const tripState = reactive({
  trips: loadFromStorage()
})

/**
 * 获取所有行程
 */
export function getAllTrips() {
  return tripState.trips
}

/**
 * 根据ID获取行程
 */
export function getTripById(tripId) {
  return tripState.trips.find(t => t.id === tripId)
}

/**
 * 添加行程
 */
export function addTrip(trip) {
  tripState.trips.push({
    ...trip,
    id: trip.id || `trip_${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  })
  saveState()
}

/**
 * 更新行程
 */
export function updateTrip(tripId, updates) {
  const index = tripState.trips.findIndex(t => t.id === tripId)
  if (index !== -1) {
    tripState.trips[index] = {
      ...tripState.trips[index],
      ...updates,
      updatedAt: new Date().toISOString()
    }
    saveState()
  }
}

/**
 * 删除行程
 */
export function deleteTrip(tripId) {
  const index = tripState.trips.findIndex(t => t.id === tripId)
  if (index !== -1) {
    tripState.trips.splice(index, 1)
    saveState()
  }
}

/**
 * 重置行程数据
 */
export function resetTrips() {
  tripState.trips = []
}

function saveState() {
  saveToStorage(tripState.trips)
  // 标记数据已变更，触发同步
  markDirty('trip')
}

// 注册登录时加载数据
onLoginLoad((userId) => {
  tripState.trips = loadFromStorage()
})

// 注册退出时重置数据
onLogoutReset(() => {
  tripState.trips = []
})
