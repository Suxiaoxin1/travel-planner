<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex flex-col items-center justify-center px-6">
    <!-- Logo区域 -->
    <div class="mb-8 text-center">
      <div class="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
        <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h1 class="text-2xl font-bold text-gray-800">旅行助手</h1>
      <p class="text-sm text-gray-500 mt-1">登录以同步您的旅行数据</p>
    </div>

    <!-- 登录表单 -->
    <div class="w-full max-w-sm">
      <div class="bg-white rounded-2xl shadow-xl p-6 space-y-5">
        <!-- 用户名 -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1.5">账号</label>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <input
              v-model="username"
              type="text"
              placeholder="请输入账号"
              class="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              @keyup.enter="handleLogin"
              :disabled="isLoading"
            />
          </div>
        </div>

        <!-- 密码 -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1.5">密码</label>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <input
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="请输入密码"
              class="w-full pl-10 pr-10 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              @keyup.enter="handleLogin"
              :disabled="isLoading"
            />
            <button
              type="button"
              class="absolute inset-y-0 right-0 pr-3 flex items-center"
              @click="showPassword = !showPassword"
            >
              <svg v-if="showPassword" class="w-5 h-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <svg v-else class="w-5 h-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              </svg>
            </button>
          </div>
        </div>

        <!-- 错误提示 -->
        <div v-if="errorMessage" class="flex items-center space-x-2 text-red-500 text-sm bg-red-50 px-3 py-2 rounded-lg">
          <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{{ errorMessage }}</span>
        </div>

        <!-- 登录按钮 -->
        <button
          @click="handleLogin"
          :disabled="isLoading || !username || !password"
          class="w-full py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-medium rounded-xl shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-md"
        >
          <span v-if="isLoading" class="flex items-center justify-center space-x-2">
            <svg class="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>登录中...</span>
          </span>
          <span v-else>登 录</span>
        </button>
      </div>

      <!-- 预设账号提示 -->
      <div class="mt-5 bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-gray-100">
        <p class="text-xs font-medium text-gray-500 mb-2">体验账号</p>
        <div class="space-y-2">
          <div
            class="flex items-center justify-between bg-white rounded-lg px-3 py-2 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
            @click="fillAccount('demo', '123456')"
          >
            <div>
              <span class="text-sm font-medium text-gray-700">旅行者小D</span>
              <span class="text-xs text-gray-400 ml-2">（含完整存档）</span>
            </div>
            <span class="text-xs text-blue-500 font-medium">一键填入</span>
          </div>
          <div
            class="flex items-center justify-between bg-white rounded-lg px-3 py-2 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
            @click="fillAccount('test', 'test123')"
          >
            <div>
              <span class="text-sm font-medium text-gray-700">测试用户</span>
              <span class="text-xs text-gray-400 ml-2">（空白存档）</span>
            </div>
            <span class="text-xs text-blue-500 font-medium">一键填入</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { performLogin } from '../stores/user.js'

const router = useRouter()
const route = useRoute()

const username = ref('')
const password = ref('')
const showPassword = ref(false)
const isLoading = ref(false)
const errorMessage = ref('')

const handleLogin = async () => {
  if (isLoading.value) return
  if (!username.value || !password.value) {
    errorMessage.value = '请输入账号和密码'
    return
  }

  isLoading.value = true
  errorMessage.value = ''

  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 500))

  try {
    const result = performLogin(username.value, password.value)

    if (result.success) {
      // 使用 setTimeout 确保所有同步回调都执行完毕后再跳转
      // 这比 nextTick 更可靠，因为 onLoginLoad 回调是同步的
      const redirect = route.query.redirect || '/home'
      setTimeout(() => {
        router.replace(redirect).catch(() => {
          // 导航失败（如重复导航）可忽略
        })
      }, 0)
    } else {
      errorMessage.value = result.error || '登录失败'
    }
  } catch (e) {
    console.error('登录异常:', e)
    errorMessage.value = '登录出现异常，请重试'
  } finally {
    isLoading.value = false
  }
}

const fillAccount = (user, pwd) => {
  username.value = user
  password.value = pwd
  errorMessage.value = ''
}
</script>

<style scoped>
</style>
