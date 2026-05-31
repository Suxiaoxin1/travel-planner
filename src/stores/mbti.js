/**
 * MBTI状态管理模块
 * 支持用户级数据隔离，登录时加载，退出时重置
 * 集成数据同步服务，支持多端数据一致性
 */
import { reactive } from 'vue'
import { analyzeByResponses, analyzeByType } from '../services/mbti.js'
import { getCurrentUserId, onLoginLoad, onLogoutReset } from './user.js'
import { getUserStorageKey } from '../services/auth.js'
import { registerModule, markDirty } from '../services/dataSync.js'

function getStorageKey() {
  const userId = getCurrentUserId()
  return userId ? getUserStorageKey(userId, 'mbti') : null
}

function loadFromStorage() {
  const key = getStorageKey()
  if (!key) return { answers: {}, directType: '', result: null, isCompleted: false, inputMode: 'questionnaire' }
  try {
    const stored = localStorage.getItem(key)
    return stored ? JSON.parse(stored) : { answers: {}, directType: '', result: null, isCompleted: false, inputMode: 'questionnaire' }
  } catch {
    return { answers: {}, directType: '', result: null, isCompleted: false, inputMode: 'questionnaire' }
  }
}

function saveToStorage(data) {
  const key = getStorageKey()
  if (!key) return
  try {
    localStorage.setItem(key, JSON.stringify(data))
  } catch (e) {
    console.error('保存MBTI数据失败:', e)
  }
}

// 获取MBTI数据最后更新时间
function getMbtiTimestamp() {
  const key = getStorageKey()
  if (!key) return new Date(0).toISOString()
  try {
    const ts = localStorage.getItem(key + '_ts')
    return ts || new Date(0).toISOString()
  } catch {
    return new Date(0).toISOString()
  }
}

// MBTI数据合并策略：已完成的优先，同状态下取较新的
function mergeMbtiData(localData, remoteData, localTs, remoteTs) {
  if (!remoteData || (!remoteData.answers && !remoteData.result && !remoteData.directType)) return localData
  if (!localData || (!localData.answers && !localData.result && !localData.directType)) return remoteData

  // 如果一端已完成而另一端未完成，取已完成的
  if (remoteData.isCompleted && !localData.isCompleted) return remoteData
  if (localData.isCompleted && !remoteData.isCompleted) return localData

  // 都已完成或都未完成，取较新的
  return new Date(remoteTs) > new Date(localTs) ? remoteData : localData
}

// 注册数据同步模块
registerModule('mbti', {
  getLocalData: () => ({
    answers: mbtiState.answers,
    directType: mbtiState.directType,
    result: mbtiState.result,
    isCompleted: mbtiState.isCompleted,
    inputMode: mbtiState.inputMode,
  }),
  setLocalData: (data) => {
    mbtiState.answers = data.answers || {}
    mbtiState.directType = data.directType || ''
    mbtiState.result = data.result || null
    mbtiState.isCompleted = data.isCompleted || false
    mbtiState.inputMode = data.inputMode || 'questionnaire'
  },
  mergeData: mergeMbtiData,
  getTimestamp: getMbtiTimestamp,
})

// 初始化数据
const initialData = loadFromStorage()

export const mbtiState = reactive({
  answers: initialData.answers || {},
  directType: initialData.directType || '',
  result: initialData.result || null,
  isCompleted: initialData.isCompleted || false,
  inputMode: initialData.inputMode || 'questionnaire',
})

/**
 * 设置某题的回答
 */
export function setAnswer(questionId, choice) {
  mbtiState.answers[questionId] = choice
  saveState()
}

/**
 * 移除某题的回答
 */
export function removeAnswer(questionId) {
  delete mbtiState.answers[questionId]
  saveState()
}

/**
 * 获取已答题数
 */
export function getAnsweredCount() {
  return Object.keys(mbtiState.answers).length
}

/**
 * 设置直接输入的MBTI类型
 */
export function setDirectType(type) {
  mbtiState.directType = type
  mbtiState.inputMode = 'direct'
  saveState()
}

/**
 * 切换输入模式
 */
export function setInputMode(mode) {
  mbtiState.inputMode = mode
  saveState()
}

/**
 * 执行MBTI分析并保存结果（问卷模式）
 */
export function executeAnalysisByResponses() {
  const result = analyzeByResponses(mbtiState.answers)
  if (result.success) {
    mbtiState.result = result.data
    mbtiState.isCompleted = true
    mbtiState.inputMode = 'questionnaire'
  }
  saveState()
  return result
}

/**
 * 执行MBTI分析并保存结果（直接输入模式）
 */
export function executeAnalysisByType() {
  const result = analyzeByType(mbtiState.directType)
  if (result.success) {
    mbtiState.result = result.data
    mbtiState.isCompleted = true
    mbtiState.inputMode = 'direct'
  }
  saveState()
  return result
}

/**
 * 统一执行分析（根据当前模式）
 */
export function executeAnalysis() {
  if (mbtiState.inputMode === 'direct' && mbtiState.directType) {
    return executeAnalysisByType()
  }
  return executeAnalysisByResponses()
}

/**
 * 重置MBTI测试
 */
export function resetMbti() {
  mbtiState.answers = {}
  mbtiState.directType = ''
  mbtiState.result = null
  mbtiState.isCompleted = false
  mbtiState.inputMode = 'questionnaire'
  // 清除用户级存储
  const key = getStorageKey()
  if (key) {
    try { localStorage.removeItem(key) } catch {}
  }
}

function saveState() {
  saveToStorage({
    answers: mbtiState.answers,
    directType: mbtiState.directType,
    result: mbtiState.result,
    isCompleted: mbtiState.isCompleted,
    inputMode: mbtiState.inputMode,
  })
  // 标记数据已变更，触发同步
  markDirty('mbti')
}

// 注册登录时加载数据
onLoginLoad((userId) => {
  const data = loadFromStorage()
  mbtiState.answers = data.answers || {}
  mbtiState.directType = data.directType || ''
  mbtiState.result = data.result || null
  mbtiState.isCompleted = data.isCompleted || false
  mbtiState.inputMode = data.inputMode || 'questionnaire'
})

// 注册退出时重置数据
onLogoutReset(() => {
  mbtiState.answers = {}
  mbtiState.directType = ''
  mbtiState.result = null
  mbtiState.isCompleted = false
  mbtiState.inputMode = 'questionnaire'
})
