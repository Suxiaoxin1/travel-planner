/**
 * AI对话记录状态管理模块
 * 支持用户级数据隔离，登录时加载，退出时重置
 * 支持流式消息追加和上下文连续对话
 * 集成数据同步服务，支持多端数据一致性
 */
import { reactive } from 'vue'
import { getCurrentUserId, onLoginLoad, onLogoutReset } from './user.js'
import { getUserStorageKey } from '../services/auth.js'
import { registerModule, markDirty } from '../services/dataSync.js'

function getStorageKey() {
  const userId = getCurrentUserId()
  return userId ? getUserStorageKey(userId, 'chat') : null
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
    console.error('保存对话数据失败:', e)
  }
}

// 获取对话数据最后更新时间
function getChatTimestamp() {
  const key = getStorageKey()
  if (!key) return new Date(0).toISOString()
  try {
    const ts = localStorage.getItem(key + '_ts')
    return ts || new Date(0).toISOString()
  } catch {
    return new Date(0).toISOString()
  }
}

// 对话数据合并策略：基于 ID 和 updatedAt 的条目级合并
function mergeChatData(localChats, remoteChats, localTs, remoteTs) {
  if (!remoteChats || remoteChats.length === 0) return localChats
  if (!localChats || localChats.length === 0) return remoteChats

  const localMap = new Map(localChats.map(c => [c.id, c]))
  const remoteMap = new Map(remoteChats.map(c => [c.id, c]))

  const mergedIds = new Set([...localMap.keys(), ...remoteMap.keys()])
  const result = []

  for (const id of mergedIds) {
    const local = localMap.get(id)
    const remote = remoteMap.get(id)

    if (!local && remote) {
      result.push(remote)
    } else if (local && !remote) {
      result.push(local)
    } else {
      // 两端都有，比较 updatedAt，保留较新的
      const localUpdated = local.updatedAt || local.createdAt || ''
      const remoteUpdated = remote.updatedAt || remote.createdAt || ''
      result.push(remoteUpdated > localUpdated ? remote : local)
    }
  }

  // 按更新时间倒序排列
  result.sort((a, b) => (b.updatedAt || b.createdAt || '').localeCompare(a.updatedAt || a.createdAt || ''))

  return result
}

// 注册数据同步模块
registerModule('chat', {
  getLocalData: () => chatState.conversations,
  setLocalData: (data) => { chatState.conversations = data },
  mergeData: mergeChatData,
  getTimestamp: getChatTimestamp,
})

export const chatState = reactive({
  conversations: loadFromStorage(),
  activeConversationId: null,
  isGenerating: false,
  generatingContent: '',
  // 跨页面传递的待输入文本（首页卡片 → AI规划页）
  pendingInput: '',
})

/**
 * 获取所有对话
 */
export function getAllConversations() {
  return chatState.conversations
}

/**
 * 获取当前活跃对话
 */
export function getActiveConversation() {
  if (!chatState.activeConversationId) return null
  return chatState.conversations.find(c => c.id === chatState.activeConversationId)
}

/**
 * 设置活跃对话
 */
export function setActiveConversation(conversationId) {
  chatState.activeConversationId = conversationId
}

/**
 * 创建新对话
 */
export function createConversation(title = '新对话', useProfile = false) {
  const conversation = {
    id: `chat_${Date.now()}`,
    title,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    messages: [],
    useProfile,
  }
  chatState.conversations.unshift(conversation)
  chatState.activeConversationId = conversation.id
  saveState()
  return conversation
}

/**
 * 添加消息到对话
 */
export function addMessage(conversationId, message) {
  const conversation = chatState.conversations.find(c => c.id === conversationId)
  if (conversation) {
    conversation.messages.push({
      ...message,
      id: message.id || `msg_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      timestamp: message.timestamp || new Date().toISOString()
    })
    conversation.updatedAt = new Date().toISOString()

    if (message.role === 'user' && conversation.messages.filter(m => m.role === 'user').length === 1) {
      conversation.title = message.content.slice(0, 20) + (message.content.length > 20 ? '...' : '')
    }

    saveState()
  }
}

/**
 * 更新对话中最后一条助手消息的内容（流式追加用）
 */
export function updateLastAssistantMessage(conversationId, content) {
  const conversation = chatState.conversations.find(c => c.id === conversationId)
  if (conversation) {
    const lastMsg = conversation.messages[conversation.messages.length - 1]
    if (lastMsg && lastMsg.role === 'assistant') {
      lastMsg.content = content
    }
  }
}

/**
 * 完成流式生成后保存最终内容到 localStorage
 */
export function finalizeAssistantMessage(conversationId) {
  const conversation = chatState.conversations.find(c => c.id === conversationId)
  if (conversation) {
    conversation.updatedAt = new Date().toISOString()
    saveState()
  }
}

/**
 * 删除对话
 */
export function deleteConversation(conversationId) {
  const index = chatState.conversations.findIndex(c => c.id === conversationId)
  if (index !== -1) {
    chatState.conversations.splice(index, 1)
    if (chatState.activeConversationId === conversationId) {
      chatState.activeConversationId = null
    }
    saveState()
  }
}

/**
 * 设置对话是否使用用户画像/MBTI数据
 */
export function setConversationUseProfile(conversationId, useProfile) {
  const conversation = chatState.conversations.find(c => c.id === conversationId)
  if (conversation) {
    conversation.useProfile = useProfile
    saveState()
  }
}

/**
 * 清空对话的消息
 */
export function clearConversationMessages(conversationId) {
  const conversation = chatState.conversations.find(c => c.id === conversationId)
  if (conversation) {
    conversation.messages = []
    conversation.updatedAt = new Date().toISOString()
    saveState()
  }
}

/**
 * 重置对话数据
 */
export function resetChats() {
  chatState.conversations = []
  chatState.activeConversationId = null
  chatState.isGenerating = false
  chatState.generatingContent = ''
}

/**
 * 设置生成状态
 */
export function setGenerating(status, content = '') {
  chatState.isGenerating = status
  chatState.generatingContent = content
}

/**
 * 设置待输入文本（从其他页面传入AI规划页）
 */
export function setPendingInput(text) {
  chatState.pendingInput = text
}

/**
 * 消费待输入文本（读取后清空，确保只使用一次）
 */
export function consumePendingInput() {
  const text = chatState.pendingInput
  chatState.pendingInput = ''
  return text
}

/**
 * 获取对话的上下文消息列表（用于发送给 API）
 */
export function getConversationContext(conversationId, maxMessages = 20) {
  const conversation = chatState.conversations.find(c => c.id === conversationId)
  if (!conversation) return []

  const recentMessages = conversation.messages.slice(-maxMessages)
  return recentMessages.map(m => ({
    role: m.role,
    content: m.content
  }))
}

function saveState() {
  saveToStorage(chatState.conversations)
  // 标记数据已变更，触发同步
  markDirty('chat')
}

onLoginLoad((userId) => {
  chatState.conversations = loadFromStorage()
  chatState.activeConversationId = null
  chatState.isGenerating = false
  chatState.generatingContent = ''
})

onLogoutReset(() => {
  chatState.conversations = []
  chatState.activeConversationId = null
  chatState.isGenerating = false
  chatState.generatingContent = ''
})
