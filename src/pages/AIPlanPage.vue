<template>
  <!-- 聊天界面，占据底部导航栏上方的空间 -->
  <div class="fixed top-0 left-0 right-0 bottom-[60px] z-40 flex bg-gray-50">
    <!-- 侧边栏遮罩（移动端） -->
    <div
      v-if="sidebarOpen"
      class="fixed inset-0 bg-black/40 z-[45] lg:hidden"
      @click="sidebarOpen = false"
    ></div>

    <!-- 侧边栏 -->
    <aside
      class="fixed lg:relative z-[55] h-full bg-white border-r border-gray-200 flex flex-col transition-transform duration-300 w-[280px]"
      :class="sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'"
    >
      <!-- 侧边栏头部 -->
      <div class="p-4 border-b border-gray-100">
        <button
          @click="handleNewChat"
          class="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-gray-300 text-[14px] font-medium text-gray-700 hover:bg-gray-50 active:bg-gray-100 transition-colors"
        >
          <Plus :size="16" />
          新建对话
        </button>
      </div>

      <!-- 对话列表 -->
      <div class="flex-1 overflow-y-auto">
        <div v-if="conversations.length === 0" class="p-4 text-center text-[13px] text-gray-400">
          暂无对话
        </div>
        <div
          v-for="conv in conversations"
          :key="conv.id"
          class="group relative flex items-center px-3 py-2.5 mx-2 mt-1 rounded-lg cursor-pointer transition-colors"
          :class="activeId === conv.id ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'"
          @click="switchConversation(conv.id)"
        >
          <MessageSquare :size="16" class="shrink-0 mr-2 opacity-60" />
          <span class="flex-1 text-[13px] truncate">{{ conv.title }}</span>
          <span
            v-if="conv.useProfile"
            class="shrink-0 mr-1 px-1.5 py-0.5 rounded text-[10px] bg-purple-50 text-purple-600 border border-purple-200"
          >画像</span>
          <button
            @click.stop="confirmDelete(conv.id)"
            class="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-50 hover:text-red-500 transition-all"
          >
            <Trash2 :size="14" />
          </button>
        </div>
      </div>

      <!-- 侧边栏底部：模型状态 -->
      <div class="p-3 border-t border-gray-100">
        <div class="flex items-center gap-2 text-[12px]" :class="ollamaConnected ? 'text-green-600' : 'text-red-500'">
          <span class="w-2 h-2 rounded-full" :class="ollamaConnected ? 'bg-green-500' : 'bg-red-400'"></span>
          {{ ollamaConnected ? '模型已就绪' : '模型未连接' }}
        </div>
      </div>
    </aside>

    <!-- 主聊天区域 -->
    <main class="flex-1 flex flex-col min-w-0">
      <!-- 顶部栏 -->
      <header class="h-[52px] flex items-center px-4 bg-white border-b border-gray-200 shrink-0">
        <button @click="sidebarOpen = !sidebarOpen" class="p-1.5 -ml-1 rounded-lg hover:bg-gray-100 lg:hidden">
          <PanelLeft :size="20" class="text-gray-600" />
        </button>
        <h1 class="flex-1 text-center text-[16px] font-semibold text-gray-800 truncate">
          {{ activeConversation ? activeConversation.title : 'AI 旅行规划' }}
        </h1>
        <button
          v-if="activeConversation"
          @click="handleNewChat"
          class="p-1.5 -mr-1 rounded-lg hover:bg-gray-100"
          title="新建对话"
        >
          <Plus :size="20" class="text-gray-500" />
        </button>
      </header>

      <!-- 消息区域 -->
      <div ref="messagesContainer" class="flex-1 overflow-y-auto">
        <!-- 空状态 -->
        <div v-if="!activeConversation || activeConversation.messages.length === 0" class="flex flex-col items-center justify-center h-full px-6">
          <div class="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mb-4">
            <Sparkles :size="32" class="text-blue-500" />
          </div>
          <h2 class="text-[18px] font-semibold text-gray-800 mb-2">AI 旅行规划助手</h2>
          <p class="text-[14px] text-gray-500 text-center max-w-[320px] mb-6">
            告诉我你的旅行需求，我来为你量身定制行程方案
          </p>
          <div class="grid grid-cols-2 gap-2 w-full max-w-[360px]">
            <button
              v-for="prompt in quickPrompts"
              :key="prompt.text"
              @click="sendQuickPrompt(prompt.text)"
              class="flex items-start gap-2 p-3 rounded-xl border border-gray-200 text-left hover:bg-blue-50 hover:border-blue-200 transition-colors"
            >
              <component :is="prompt.icon" :size="16" class="text-blue-500 mt-0.5 shrink-0" />
              <span class="text-[13px] text-gray-700">{{ prompt.text }}</span>
            </button>
          </div>
        </div>

        <!-- 消息列表 -->
        <div v-else class="max-w-[768px] mx-auto px-4 py-4">
          <div
            v-for="msg in activeConversation.messages"
            :key="msg.id"
            class="mb-4"
          >
            <!-- 用户消息 -->
            <div v-if="msg.role === 'user'" class="flex justify-end">
              <div class="max-w-[80%] bg-blue-500 text-white px-4 py-2.5 rounded-2xl rounded-br-md text-[14px] leading-relaxed whitespace-pre-wrap">
                {{ msg.content }}
              </div>
            </div>

            <!-- 助手消息 -->
            <div v-else class="flex justify-start">
              <div class="max-w-[85%] flex gap-2.5">
                <div class="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center shrink-0 mt-0.5">
                  <Sparkles :size="14" class="text-white" />
                </div>
                <div class="flex-1 min-w-0">
                  <div class="bg-white px-4 py-2.5 rounded-2xl rounded-bl-md border border-gray-100 text-[14px] leading-relaxed text-gray-800 prose-chat">
                    <div v-html="renderMarkdown(msg.content)"></div>
                  </div>
                  <!-- 导入行程按钮 -->
                  <div v-if="msg.content && msg.content.length > 50 && !isGenerating" class="mt-1.5 flex items-center gap-2">
                    <button
                      @click="handleImportTrip(msg)"
                      class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium text-blue-600 bg-blue-50 border border-blue-200 hover:bg-blue-100 active:bg-blue-200 transition-colors"
                    >
                      <Download :size="13" />
                      导入个人行程
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 生成中的流式内容 -->
          <div v-if="isGenerating && generatingContent" class="mb-4 flex justify-start">
            <div class="max-w-[85%] flex gap-2.5">
              <div class="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center shrink-0 mt-0.5">
                <Sparkles :size="14" class="text-white" />
              </div>
              <div class="bg-white px-4 py-2.5 rounded-2xl rounded-bl-md border border-gray-100 text-[14px] leading-relaxed text-gray-800 prose-chat">
                <div v-html="renderMarkdown(generatingContent)"></div>
                <span class="inline-block w-1.5 h-4 bg-blue-500 animate-pulse ml-0.5 align-text-bottom"></span>
              </div>
            </div>
          </div>

          <!-- 生成中但还没内容 -->
          <div v-if="isGenerating && !generatingContent" class="mb-4 flex justify-start">
            <div class="flex gap-2.5">
              <div class="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center shrink-0 mt-0.5">
                <Sparkles :size="14" class="text-white" />
              </div>
              <div class="bg-white px-4 py-3 rounded-2xl rounded-bl-md border border-gray-100">
                <div class="flex gap-1.5">
                  <span class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0ms"></span>
                  <span class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 150ms"></span>
                  <span class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 300ms"></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 输入区域 -->
      <div class="bg-white border-t border-gray-200 px-4 py-3 shrink-0">
        <div class="max-w-[768px] mx-auto">
          <!-- 连接错误提示 -->
          <div v-if="!ollamaConnected && ollamaChecked" class="mb-2 px-3 py-2 rounded-lg bg-red-50 border border-red-200 text-[12px] text-red-600">
            Ollama 服务未连接，AI 功能暂不可用。请确认已启动 Ollama 并加载模型。
          </div>

          <!-- 当前对话画像状态提示 -->
          <div v-if="activeConversation && activeConversation.useProfile && activeConversation.messages.length > 0" class="mb-2 px-3 py-1.5 rounded-lg bg-purple-50 border border-purple-200 text-[12px] text-purple-600 flex items-center gap-1.5">
            <UserCircle :size="13" />
            当前对话已启用个性化画像（{{ profileSummaryText }}）
          </div>

          <div class="flex items-end gap-2">
            <div class="flex-1 relative">
              <textarea
                ref="inputRef"
                v-model="inputText"
                @keydown="handleKeydown"
                @input="autoResize"
                placeholder="输入你的旅行问题..."
                rows="1"
                class="w-full resize-none rounded-xl border border-gray-300 px-4 py-2.5 text-[14px] leading-relaxed focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-colors bg-white"
                :disabled="isGenerating"
                style="max-height: 120px; min-height: 42px;"
              ></textarea>
            </div>
            <button
              @click="handleSend"
              :disabled="!canSend"
              class="shrink-0 w-[42px] h-[42px] rounded-xl flex items-center justify-center transition-colors"
              :class="canSend ? 'bg-blue-500 hover:bg-blue-600 text-white' : 'bg-gray-100 text-gray-400 cursor-not-allowed'"
            >
              <SendHorizontal :size="18" />
            </button>
          </div>
          <p class="text-[11px] text-gray-400 mt-1.5 text-center">
            AI 生成内容仅供参考，请注意甄别准确性
          </p>
        </div>
      </div>
    </main>

    <!-- 画像询问对话框 -->
    <div
      v-if="showProfileDialog"
      class="fixed inset-0 z-[70] flex items-center justify-center bg-black/40"
      @click.self="showProfileDialog = false"
    >
      <div class="bg-white rounded-2xl shadow-xl w-[90%] max-w-[400px] overflow-hidden animate-dialog-in">
        <div class="px-5 pt-5 pb-3">
          <div class="flex items-center gap-3 mb-3">
            <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
              <UserCircle :size="22" class="text-white" />
            </div>
            <div>
              <h3 class="text-[16px] font-semibold text-gray-800">个性化旅行规划</h3>
              <p class="text-[12px] text-gray-500">是否调用你的个人画像与MBTI信息？</p>
            </div>
          </div>
        </div>

        <div v-if="hasProfileData" class="px-5 pb-3">
          <div class="rounded-xl bg-gray-50 border border-gray-200 p-3 text-[13px]">
            <div v-if="mbtiResult" class="flex items-center gap-2 mb-2">
              <span class="px-2 py-0.5 rounded-md bg-purple-100 text-purple-700 text-[12px] font-medium">
                {{ mbtiResult.mbtiType }}
              </span>
              <span class="text-gray-600">{{ mbtiResult.mbtiTypeName }}</span>
            </div>
            <div v-if="personaResult" class="text-gray-600">
              <span class="px-2 py-0.5 rounded-md bg-blue-100 text-blue-700 text-[12px] font-medium">
                {{ personaResult.profileTitle }}
              </span>
            </div>
            <div v-if="mbtiResult" class="mt-2 flex flex-wrap gap-1.5">
              <span class="text-[11px] text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">{{ mbtiResult.pace }}</span>
              <span class="text-[11px] text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">{{ mbtiResult.social }}</span>
              <span class="text-[11px] text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">{{ mbtiResult.planningStyle }}</span>
            </div>
          </div>
        </div>

        <div v-else class="px-5 pb-3">
          <div class="rounded-xl bg-amber-50 border border-amber-200 p-3 text-[13px] text-amber-700">
            你尚未完成人物画像或MBTI测试，选择"是"将以标准方式生成规划。
          </div>
        </div>

        <div class="px-5 pb-5 flex gap-3">
          <button
            @click="confirmProfileDialog(false)"
            class="flex-1 py-2.5 rounded-xl border border-gray-300 text-[14px] font-medium text-gray-700 hover:bg-gray-50 active:bg-gray-100 transition-colors"
          >
            否，标准规划
          </button>
          <button
            @click="confirmProfileDialog(true)"
            class="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 text-[14px] font-medium text-white hover:opacity-90 active:opacity-80 transition-opacity"
          >
            是，个性化规划
          </button>
        </div>
      </div>
    </div>

    <!-- 导入行程结果提示 -->
    <div
      v-if="importToast.show"
      class="fixed top-6 left-1/2 -translate-x-1/2 z-[70] px-4 py-2.5 rounded-xl shadow-lg text-[13px] font-medium flex items-center gap-2 transition-all"
      :class="importToast.success ? 'bg-green-500 text-white' : 'bg-amber-500 text-white'"
    >
      <CheckCircle v-if="importToast.success" :size="16" />
      <AlertCircle v-else :size="16" />
      {{ importToast.message }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, onMounted } from 'vue'
import {
  Plus, MessageSquare, Trash2, PanelLeft, Sparkles,
  SendHorizontal, MapPin, CalendarDays, Users, Wallet,
  Download, UserCircle, CheckCircle, AlertCircle
} from 'lucide-vue-next'
import {
  getAllConversations, getActiveConversation, setActiveConversation,
  createConversation, addMessage, updateLastAssistantMessage,
  finalizeAssistantMessage, deleteConversation, setGenerating,
  getConversationContext, setConversationUseProfile, chatState,
  consumePendingInput
} from '../stores/chat.js'
import { chatStream, checkOllamaStatus, importTripPlan } from '../services/ai.js'
import { mbtiState } from '../stores/mbti.js'
import { personaState } from '../stores/persona.js'
import { getCurrentUserId } from '../stores/user.js'

// ============================================================
// 状态
// ============================================================
const sidebarOpen = ref(false)
const inputText = ref('')
const messagesContainer = ref(null)
const inputRef = ref(null)
const ollamaConnected = ref(false)
const ollamaChecked = ref(false)
const currentController = ref(null)

const showProfileDialog = ref(false)
const pendingMessage = ref('')
const importToast = ref({ show: false, success: false, message: '' })

const quickPrompts = [
  { text: '帮我规划云南5日游', icon: MapPin },
  { text: '春节出国游推荐', icon: CalendarDays },
  { text: '带老人小孩去哪玩', icon: Users },
  { text: '预算3000去哪好', icon: Wallet },
]

// ============================================================
// 计算属性
// ============================================================
const conversations = computed(() => getAllConversations())
const activeId = computed(() => chatState.activeConversationId)
const activeConversation = computed(() => getActiveConversation())
const isGenerating = computed(() => chatState.isGenerating)
const generatingContent = computed(() => chatState.generatingContent)

const canSend = computed(() => inputText.value.trim() && !isGenerating.value)

const mbtiResult = computed(() => mbtiState.isCompleted ? mbtiState.result : null)
const personaResult = computed(() => personaState.isCompleted ? personaState.result : null)
const hasProfileData = computed(() => !!(mbtiResult.value || personaResult.value))

const profileSummaryText = computed(() => {
  const parts = []
  if (mbtiResult.value) parts.push(mbtiResult.value.mbtiType)
  if (personaResult.value) parts.push(personaResult.value.profileTitle)
  return parts.join(' + ') || '无数据'
})

// ============================================================
// 方法
// ============================================================

async function checkStatus() {
  const status = await checkOllamaStatus()
  ollamaConnected.value = status.connected && status.model_available
  ollamaChecked.value = true
}

function switchConversation(id) {
  setActiveConversation(id)
  sidebarOpen.value = false
  scrollToBottom()
}

function handleNewChat() {
  createConversation('新对话')
  sidebarOpen.value = false
  nextTick(() => inputRef.value?.focus())
}

function confirmDelete(id) {
  if (confirm('确定删除这个对话吗？')) deleteConversation(id)
}

function sendQuickPrompt(text) {
  inputText.value = text
  handleSend()
}

function handleSend() {
  const text = inputText.value.trim()
  if (!text || isGenerating.value) return

  let convId = chatState.activeConversationId
  let conv = convId ? chatState.conversations.find(c => c.id === convId) : null
  const isFirstMessage = !conv || conv.messages.length === 0

  if (isFirstMessage) {
    pendingMessage.value = text
    inputText.value = ''
    resetTextareaHeight()
    showProfileDialog.value = true
    return
  }

  doSend(text, conv.useProfile)
}

function confirmProfileDialog(useProfile) {
  showProfileDialog.value = false

  let convId = chatState.activeConversationId
  if (!convId) {
    createConversation('新对话')
    convId = chatState.activeConversationId
  }

  setConversationUseProfile(convId, useProfile)

  const text = pendingMessage.value
  pendingMessage.value = ''
  if (text) doSend(text, useProfile)
}

function doSend(text, useProfile) {
  let convId = chatState.activeConversationId
  if (!convId) {
    const conv = createConversation('新对话')
    convId = conv.id
  }

  addMessage(convId, { role: 'user', content: text })
  inputText.value = ''
  resetTextareaHeight()

  addMessage(convId, { role: 'assistant', content: '' })

  const context = getConversationContext(convId, 20)
  const messages = context.filter((m, i) => !(m.role === 'assistant' && i === context.length - 1 && !m.content))

  const profileData = useProfile ? buildProfileData() : null

  setGenerating(true, '')
  scrollToBottom()

  let fullContent = ''

  currentController.value = chatStream(messages, {
    useProfile,
    profileData,
    onToken(token) {
      fullContent += token
      setGenerating(true, fullContent)
      updateLastAssistantMessage(convId, fullContent)
      scrollToBottom()
    },
    onDone(content) {
      updateLastAssistantMessage(convId, content || fullContent)
      finalizeAssistantMessage(convId)
      setGenerating(false, '')
      currentController.value = null
    },
    onError(error) {
      const errorContent = fullContent || ''
      const finalContent = errorContent + (errorContent ? '\n\n' : '') + `⚠️ 生成失败: ${error}`
      updateLastAssistantMessage(convId, finalContent)
      finalizeAssistantMessage(convId)
      setGenerating(false, '')
      currentController.value = null
    }
  })
}

function buildProfileData() {
  const data = {}
  if (mbtiResult.value) data.mbti = mbtiResult.value
  if (personaResult.value) data.persona = personaResult.value
  return data
}

async function handleImportTrip(msg) {
  const convId = chatState.activeConversationId
  if (!convId) return

  const userId = getCurrentUserId()
  const conv = chatState.conversations.find(c => c.id === convId)
  const firstUserMsg = conv?.messages.find(m => m.role === 'user')
  const title = firstUserMsg ? firstUserMsg.content.slice(0, 20) : '未命名行程'

  try {
    const result = await importTripPlan({
      conversationId: convId,
      messageId: msg.id,
      planContent: msg.content,
      title: title + (title.length >= 20 ? '...' : ''),
      userId: userId || '',
    })

    if (result.success) {
      showToast(true, '行程导入成功！')
    } else {
      showToast(false, result.message || '行程导入功能暂未开放，敬请期待')
    }
  } catch (e) {
    showToast(false, '导入失败，请稍后再试')
  }
}

function showToast(success, message) {
  importToast.value = { show: true, success, message }
  setTimeout(() => { importToast.value.show = false }, 3000)
}

function handleKeydown(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    handleSend()
  }
}

function autoResize() {
  const el = inputRef.value
  if (!el) return
  el.style.height = 'auto'
  el.style.height = Math.min(el.scrollHeight, 120) + 'px'
}

function resetTextareaHeight() {
  const el = inputRef.value
  if (!el) return
  el.style.height = '42px'
}

function scrollToBottom() {
  nextTick(() => {
    const container = messagesContainer.value
    if (container) container.scrollTop = container.scrollHeight
  })
}

function renderMarkdown(text) {
  if (!text) return ''
  let html = text
  html = html.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
  html = html.replace(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g, '<em>$1</em>')
  html = html.replace(/`([^`]+)`/g, '<code class="bg-gray-100 text-red-600 px-1 py-0.5 rounded text-[13px]">$1</code>')
  html = html.replace(/^### (.+)$/gm, '<h3 class="text-[15px] font-semibold mt-3 mb-1 text-gray-800">$1</h3>')
  html = html.replace(/^## (.+)$/gm, '<h2 class="text-[16px] font-semibold mt-3 mb-1 text-gray-800">$1</h2>')
  html = html.replace(/^# (.+)$/gm, '<h1 class="text-[17px] font-bold mt-3 mb-1 text-gray-800">$1</h1>')
  html = html.replace(/^[\-\*] (.+)$/gm, '<li class="ml-4 list-disc text-gray-700">$1</li>')
  html = html.replace(/^\d+\. (.+)$/gm, '<li class="ml-4 list-decimal text-gray-700">$1</li>')
  html = html.replace(/^[\-\*]{3,}$/gm, '<hr class="my-3 border-gray-200">')
  html = html.replace(/\n/g, '<br>')
  return html
}

onMounted(() => {
  checkStatus()
  setInterval(checkStatus, 30000)

  // 消费首页卡片传入的待输入文本
  const pending = consumePendingInput()
  if (pending) {
    inputText.value = pending
    nextTick(() => {
      autoResize()
      inputRef.value?.focus()
    })
  }
})
</script>

<style scoped>
.prose-chat :deep(h1),
.prose-chat :deep(h2),
.prose-chat :deep(h3) {
  margin-top: 8px;
  margin-bottom: 4px;
}

.prose-chat :deep(li) {
  margin-bottom: 2px;
}

.prose-chat :deep(strong) {
  font-weight: 600;
  color: #1f2937;
}

.prose-chat :deep(hr) {
  border: none;
  border-top: 1px solid #e5e7eb;
  margin: 8px 0;
}

.overflow-y-auto::-webkit-scrollbar {
  width: 4px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: transparent;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background-color: #d1d5db;
  border-radius: 2px;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}

.animate-pulse {
  animation: blink 1s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes dialog-in {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(10px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.animate-dialog-in {
  animation: dialog-in 0.2s ease-out;
}
</style>
