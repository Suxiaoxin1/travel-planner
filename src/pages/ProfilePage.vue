<template>
  <div class="min-h-full bg-gray-50">
    <!-- 顶部标题栏 -->
    <header class="sticky top-0 z-10 bg-white px-4 py-3 shadow-sm">
      <h1 class="text-[20px] font-semibold text-gray-800 text-center">我的</h1>
    </header>

    <!-- 内容区域 - 垂直布局 -->
    <main class="max-w-[960px] mx-auto pb-4">
      <!-- 1. 账号信息区 -->
      <section class="bg-white mx-4 mt-4 rounded-2xl p-6 shadow-sm">
        <div class="flex items-center space-x-4">
          <!-- 头像 -->
          <div class="relative">
            <div
              class="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-md"
              :class="{ 'opacity-75': !userState.isLoggedIn }"
            >
              <User v-if="!userState.isLoggedIn || !userState.userInfo.avatar" class="w-8 h-8 text-white" />
              <img
                v-else
                :src="userState.userInfo.avatar"
                alt="头像"
                class="w-16 h-16 rounded-full object-cover"
              />
            </div>
          </div>

          <!-- 用户信息/登录按钮 -->
          <div class="flex-1">
            <template v-if="!userState.isLoggedIn">
              <h2 class="text-[18px] font-semibold text-gray-800 mb-1">未登录</h2>
              <p class="text-[14px] text-gray-500">点击登录以同步数据</p>
            </template>
            <template v-else>
              <h2 class="text-[18px] font-semibold text-gray-800 mb-1">{{ userState.userInfo.nickname || '用户' }}</h2>
              <p class="text-[14px] text-gray-500">{{ userState.userInfo.phone || userState.userInfo.bio || '' }}</p>
            </template>
          </div>

          <!-- 登录/退出按钮 -->
          <button
            v-if="!userState.isLoggedIn"
            @click="goToLogin"
            class="px-4 py-2 rounded-full text-[14px] font-medium transition-colors duration-200 bg-blue-500 text-white hover:bg-blue-600"
          >
            登录
          </button>
          <button
            v-else
            @click="handleLogout"
            class="px-4 py-2 rounded-full text-[14px] font-medium transition-colors duration-200 bg-red-500 text-white hover:bg-red-600"
          >
            退出登录
          </button>
        </div>

        <!-- 登录提示（未登录时显示） -->
        <div
          v-if="!userState.isLoggedIn"
          class="mt-4 p-3 bg-blue-50 rounded-xl flex items-center space-x-3 cursor-pointer hover:bg-blue-100 transition-colors duration-200"
          @click="goToLogin"
        >
          <div class="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
            <LogIn class="w-5 h-5 text-white" />
          </div>
          <div class="flex-1">
            <p class="text-[14px] font-medium text-gray-800">登录账号</p>
            <p class="text-[12px] text-gray-500 mt-0.5">登录后加载专属存档数据</p>
          </div>
          <ChevronRight class="w-5 h-5 text-gray-400" />
        </div>
      </section>

      <!-- 2. 人物画像测试入口 -->
      <section
        class="bg-white mx-4 mt-4 rounded-2xl p-5 shadow-sm cursor-pointer hover:shadow-md transition-shadow duration-200"
        @click="goToPortraitTest"
      >
        <div class="flex items-center space-x-4">
          <div class="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <UserCircle class="w-6 h-6 text-purple-600" />
          </div>
          <div class="flex-1">
            <h3 class="text-[16px] font-semibold text-gray-800">人物画像测试</h3>
            <p class="text-[13px] text-gray-500 mt-0.5">
              {{ personaState.isCompleted ? '已完成测试，点击查看结果' : '未测试' }}
            </p>
          </div>
          <div class="flex items-center space-x-2">
            <span
              v-if="personaState.isCompleted"
              class="text-[12px] text-green-600 bg-green-50 px-2 py-1 rounded-full"
            >
              已完成
            </span>
            <ChevronRight v-else class="w-5 h-5 text-gray-400" />
          </div>
        </div>

        <!-- 未测试状态提示 -->
        <div
          v-if="!personaState.isCompleted"
          class="mt-3 flex items-center justify-between bg-purple-50 rounded-xl px-4 py-3"
        >
          <div class="flex items-center space-x-2">
            <AlertCircle class="w-4 h-4 text-purple-600" />
            <span class="text-[13px] text-purple-700">未测试，点击开始测试</span>
          </div>
          <span class="text-[12px] text-purple-600 font-medium">去测试 →</span>
        </div>
      </section>

      <!-- 3. MBTI测试入口 -->
      <section
        class="bg-white mx-4 mt-4 rounded-2xl p-5 shadow-sm cursor-pointer hover:shadow-md transition-shadow duration-200"
        @click="goToMBTITest"
      >
        <div class="flex items-center space-x-4">
          <div class="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <Brain class="w-6 h-6 text-blue-600" />
          </div>
          <div class="flex-1">
            <h3 class="text-[16px] font-semibold text-gray-800">MBTI 测试</h3>
            <p class="text-[13px] text-gray-500 mt-0.5">
              {{ mbtiTestStatus ? `你的类型是 ${mbtiTestStatus}` : '未测试' }}
            </p>
          </div>
          <div class="flex items-center space-x-2">
            <span
              v-if="mbtiTestStatus"
              class="text-[12px] text-blue-600 bg-blue-50 px-2 py-1 rounded-full"
            >
              {{ mbtiTestStatus }}
            </span>
            <ChevronRight v-else class="w-5 h-5 text-gray-400" />
          </div>
        </div>

        <!-- 未测试状态提示 -->
        <div
          v-if="!mbtiTestStatus"
          class="mt-3 flex items-center justify-between bg-blue-50 rounded-xl px-4 py-3"
        >
          <div class="flex items-center space-x-2">
            <AlertCircle class="w-4 h-4 text-blue-600" />
            <span class="text-[13px] text-blue-700">未测试，点击开始测试</span>
          </div>
          <span class="text-[12px] text-blue-600 font-medium">去测试 →</span>
        </div>
      </section>

      <!-- 4. 行程规划入口 -->
      <section
        class="bg-white mx-4 mt-4 rounded-2xl p-5 shadow-sm cursor-pointer hover:shadow-md transition-shadow duration-200"
        @click="goToPage('/trip-manage')"
      >
        <div class="flex items-center space-x-4">
          <div class="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <MapPin class="w-6 h-6 text-green-600" />
          </div>
          <div class="flex-1">
            <h3 class="text-[16px] font-semibold text-gray-800">行程规划</h3>
            <p class="text-[13px] text-gray-500 mt-0.5">
              {{ tripCount > 0 ? `共 ${tripCount} 个行程` : '暂无行程' }}
            </p>
          </div>
          <div class="flex items-center space-x-2">
            <span
              v-if="tripCount > 0"
              class="text-[12px] text-green-600 bg-green-50 px-2 py-1 rounded-full"
            >
              {{ tripCount }} 个
            </span>
            <ChevronRight v-else class="w-5 h-5 text-gray-400" />
          </div>
        </div>
      </section>

      <!-- 5. AI对话入口 -->
      <section
        class="bg-white mx-4 mt-4 rounded-2xl p-5 shadow-sm cursor-pointer hover:shadow-md transition-shadow duration-200"
        @click="goToPage('/ai-plan')"
      >
        <div class="flex items-center space-x-4">
          <div class="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <MessageSquare class="w-6 h-6 text-orange-600" />
          </div>
          <div class="flex-1">
            <h3 class="text-[16px] font-semibold text-gray-800">AI 对话</h3>
            <p class="text-[13px] text-gray-500 mt-0.5">
              {{ chatCount > 0 ? `共 ${chatCount} 条对话记录` : '暂无对话' }}
            </p>
          </div>
          <div class="flex items-center space-x-2">
            <span
              v-if="chatCount > 0"
              class="text-[12px] text-orange-600 bg-orange-50 px-2 py-1 rounded-full"
            >
              {{ chatCount }} 条
            </span>
            <ChevronRight v-else class="w-5 h-5 text-gray-400" />
          </div>
        </div>
      </section>

      <!-- 6. 功能入口 -->
      <section class="mx-4 mt-4 space-y-3">
        <!-- 设置 -->
        <div
          class="bg-white rounded-2xl p-5 shadow-sm cursor-pointer hover:shadow-md transition-shadow duration-200 flex items-center justify-between"
          @click="goToPage('/settings')"
        >
          <div class="flex items-center space-x-4">
            <div class="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Settings class="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 class="text-[16px] font-semibold text-gray-800">设置</h3>
              <p class="text-[13px] text-gray-500 mt-0.5">通知、语言、隐私等</p>
            </div>
          </div>
          <ChevronRight class="w-5 h-5 text-gray-400" />
        </div>

        <!-- 用户反馈 -->
        <div
          class="bg-white rounded-2xl p-5 shadow-sm cursor-pointer hover:shadow-md transition-shadow duration-200 flex items-center justify-between"
          @click="goToPage('/feedback')"
        >
          <div class="flex items-center space-x-4">
            <div class="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
              <MessageCircle class="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <h3 class="text-[16px] font-semibold text-gray-800">用户反馈</h3>
              <p class="text-[13px] text-gray-500 mt-0.5">问题反馈、功能建议</p>
            </div>
          </div>
          <ChevronRight class="w-5 h-5 text-gray-400" />
        </div>

        <!-- 帮助中心 -->
        <div
          class="bg-white rounded-2xl p-5 shadow-sm cursor-pointer hover:shadow-md transition-shadow duration-200 flex items-center justify-between"
          @click="goToPage('/help')"
        >
          <div class="flex items-center space-x-4">
            <div class="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <HelpCircle class="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 class="text-[16px] font-semibold text-gray-800">帮助中心</h3>
              <p class="text-[13px] text-gray-500 mt-0.5">常见问题、联系我们</p>
            </div>
          </div>
          <ChevronRight class="w-5 h-5 text-gray-400" />
        </div>
      </section>

      <!-- 7. 数据同步状态 -->
      <section v-if="userState.isLoggedIn" class="bg-white mx-4 mt-4 rounded-2xl p-5 shadow-sm">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <div class="w-10 h-10 rounded-full flex items-center justify-center"
              :class="syncStatus.isSyncing ? 'bg-yellow-100' : syncStatus.lastError ? 'bg-red-100' : 'bg-green-100'"
            >
              <RefreshCw v-if="syncStatus.isSyncing" class="w-5 h-5 text-yellow-600 animate-spin" />
              <CloudOff v-else-if="syncStatus.lastError" class="w-5 h-5 text-red-600" />
              <Cloud v-else class="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p class="text-[14px] font-medium text-gray-800">
                {{ syncStatus.isSyncing ? '正在同步...' : syncStatus.lastError ? '同步失败' : '数据已同步' }}
              </p>
              <p class="text-[12px] text-gray-400 mt-0.5">
                {{ syncStatus.lastSyncTime ? `上次同步: ${formatSyncTime(syncStatus.lastSyncTime)}` : '暂无同步记录' }}
              </p>
            </div>
          </div>
          <button
            @click="handleManualSync"
            :disabled="syncStatus.isSyncing"
            class="px-3 py-1.5 rounded-lg text-[13px] font-medium transition-colors"
            :class="syncStatus.isSyncing ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'"
          >
            {{ syncStatus.isSyncing ? '同步中' : '立即同步' }}
          </button>
        </div>
        <p v-if="syncStatus.hasPendingChanges && !syncStatus.isSyncing" class="text-[12px] text-amber-600 mt-2">
          有未同步的变更，将自动推送...
        </p>
      </section>

      <!-- 底部版本信息 -->
      <div class="text-center py-6">
        <p class="text-[12px] text-gray-400">版本 1.0.0</p>
      </div>
    </main>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import {
  User,
  ChevronRight,
  UserCircle,
  Brain,
  AlertCircle,
  Settings,
  MessageSquare,
  RefreshCw,
  Cloud,
  CloudOff,
  MessageCircle,
  HelpCircle,
  MapPin,
  LogIn
} from 'lucide-vue-next'
import { userState, performLogout } from '../stores/user.js'
import { personaState } from '../stores/persona.js'
import { mbtiState } from '../stores/mbti.js'
import { tripState } from '../stores/trip.js'
import { chatState } from '../stores/chat.js'
import { getSyncState, fullSync } from '../services/dataSync.js'

const router = useRouter()

// 页面跳转
const goToPage = (path) => {
  router.push(path)
}

// 跳转到登录页
const goToLogin = () => {
  router.replace('/login')
}

// 退出登录
const handleLogout = () => {
  if (confirm('确定要退出登录吗？\n您的所有数据（行程、对话、画像、MBTI）已同步保存，下次登录可自动恢复。')) {
    performLogout()
    router.replace('/login').catch(() => {})
  }
}

// 跳转到人物画像测试/结果
const goToPortraitTest = () => {
  if (personaState.isCompleted && personaState.result) {
    router.push('/persona-result')
  } else {
    router.push('/persona-test')
  }
}

// MBTI测试状态
const mbtiTestStatus = computed(() => {
  if (mbtiState.isCompleted && mbtiState.result) {
    return mbtiState.result.mbtiType
  }
  return ''
})

// 跳转到 MBTI 测试
const goToMBTITest = () => {
  if (mbtiState.isCompleted && mbtiState.result) {
    router.push('/mbti-result')
  } else {
    router.push('/mbti-test')
  }
}

// 行程数量
const tripCount = computed(() => tripState.trips.length)

// 对话数量
const chatCount = computed(() => chatState.conversations.length)

// 数据同步状态
const syncStatus = computed(() => getSyncState())

// 格式化同步时间
const formatSyncTime = (isoStr) => {
  if (!isoStr) return ''
  try {
    const d = new Date(isoStr)
    const now = new Date()
    const diff = now - d
    if (diff < 60000) return '刚刚'
    if (diff < 3600000) return `${Math.floor(diff / 60000)} 分钟前`
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} 小时前`
    return `${d.getMonth() + 1}/${d.getDate()} ${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`
  } catch {
    return ''
  }
}

// 手动同步
const handleManualSync = async () => {
  await fullSync()
}
</script>

<style scoped>
/* 确保页面在移动端正确显示 */
@media (max-width: 640px) {
  section {
    margin-left: 12px;
    margin-right: 12px;
  }
}
</style>
