/**
 * 人物画像状态管理模块
 * 支持用户级数据隔离，登录时加载，退出时重置
 * 集成数据同步服务，支持多端数据一致性
 */
import { reactive } from 'vue'
import { analyze as doAnalyze } from '../services/persona.js'
import { getCurrentUserId, onLoginLoad, onLogoutReset } from './user.js'
import { getUserStorageKey } from '../services/auth.js'
import { registerModule, markDirty } from '../services/dataSync.js'

function getStorageKey() {
  const userId = getCurrentUserId()
  return userId ? getUserStorageKey(userId, 'persona') : null
}

function loadFromStorage() {
  const key = getStorageKey()
  if (!key) return { answers: {}, result: null, isCompleted: false }
  try {
    const stored = localStorage.getItem(key)
    return stored ? JSON.parse(stored) : { answers: {}, result: null, isCompleted: false }
  } catch {
    return { answers: {}, result: null, isCompleted: false }
  }
}

function saveToStorage(data) {
  const key = getStorageKey()
  if (!key) return
  try {
    localStorage.setItem(key, JSON.stringify(data))
  } catch (e) {
    console.error('保存画像数据失败:', e)
  }
}

// 获取画像数据最后更新时间
function getPersonaTimestamp() {
  const key = getStorageKey()
  if (!key) return new Date(0).toISOString()
  try {
    const ts = localStorage.getItem(key + '_ts')
    return ts || new Date(0).toISOString()
  } catch {
    return new Date(0).toISOString()
  }
}

// 画像数据合并策略：已完成的画像优先，同状态下取较新的
function mergePersonaData(localData, remoteData, localTs, remoteTs) {
  if (!remoteData || (!remoteData.answers && !remoteData.result)) return localData
  if (!localData || (!localData.answers && !localData.result)) return remoteData

  // 如果一端已完成而另一端未完成，取已完成的
  if (remoteData.isCompleted && !localData.isCompleted) return remoteData
  if (localData.isCompleted && !remoteData.isCompleted) return localData

  // 都已完成或都未完成，取较新的
  return new Date(remoteTs) > new Date(localTs) ? remoteData : localData
}

// 注册数据同步模块
registerModule('persona', {
  getLocalData: () => ({
    answers: personaState.answers,
    result: personaState.result,
    isCompleted: personaState.isCompleted,
  }),
  setLocalData: (data) => {
    personaState.answers = data.answers || {}
    personaState.result = data.result || null
    personaState.isCompleted = data.isCompleted || false
  },
  mergeData: mergePersonaData,
  getTimestamp: getPersonaTimestamp,
})

// 初始化数据
const initialData = loadFromStorage()

export const personaState = reactive({
  answers: initialData.answers || {},
  result: initialData.result || null,
  isCompleted: initialData.isCompleted || false,
})

/**
 * 设置某题的回答
 */
export function setAnswer(questionId, choice) {
  personaState.answers[questionId] = choice
  saveState()
}

/**
 * 移除某题的回答
 */
export function removeAnswer(questionId) {
  delete personaState.answers[questionId]
  saveState()
}

/**
 * 获取已答题数
 */
export function getAnsweredCount() {
  return Object.keys(personaState.answers).length
}

/**
 * 执行画像分析并保存结果
 */
export function executeAnalysis() {
  const result = doAnalyze(personaState.answers)
  if (result.success) {
    personaState.result = result.data
    personaState.isCompleted = true
  }
  saveState()
  return result
}

/**
 * 重置画像测试
 */
export function resetPersona() {
  personaState.answers = {}
  personaState.result = null
  personaState.isCompleted = false
  // 清除用户级存储
  const key = getStorageKey()
  if (key) {
    try { localStorage.removeItem(key) } catch {}
  }
}

function saveState() {
  saveToStorage({
    answers: personaState.answers,
    result: personaState.result,
    isCompleted: personaState.isCompleted,
  })
  // 标记数据已变更，触发同步
  markDirty('persona')
}

// 注册登录时加载数据
onLoginLoad((userId) => {
  const data = loadFromStorage()
  personaState.answers = data.answers || {}
  personaState.result = data.result || null
  personaState.isCompleted = data.isCompleted || false
})

// 注册退出时重置数据
onLogoutReset(() => {
  personaState.answers = {}
  personaState.result = null
  personaState.isCompleted = false
})
