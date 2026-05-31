<template>
  <div class="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
    <!-- 登录中状态 -->
    <div v-if="loading" class="text-center">
      <div class="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p class="text-[16px] text-gray-700 font-medium">正在登录中...</p>
      <p class="text-[14px] text-gray-500 mt-2">请稍候，正在获取您的微信信息</p>
    </div>

    <!-- 登录成功状态 -->
    <div v-else-if="success" class="text-center">
      <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <Check class="w-8 h-8 text-green-600" />
      </div>
      <p class="text-[16px] text-gray-700 font-medium">登录成功！</p>
      <p class="text-[14px] text-gray-500 mt-2">正在跳转到首页...</p>
    </div>

    <!-- 登录失败状态 -->
    <div v-else class="text-center">
      <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <X class="w-8 h-8 text-red-600" />
      </div>
      <p class="text-[16px] text-gray-700 font-medium">登录失败</p>
      <p class="text-[14px] text-gray-500 mt-2">{{ errorMessage }}</p>
      <button
        @click="goBack"
        class="mt-6 px-6 py-2 bg-blue-500 text-white rounded-xl text-[15px] font-medium hover:bg-blue-600 transition-colors"
      >
        返回重试
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Check, X } from 'lucide-vue-next'
import { handleWechatCallback } from '../services/wechat.js'
import { loginWithUserInfo } from '../stores/user.js'

const router = useRouter()
const route = useRoute()

const loading = ref(true)
const success = ref(false)
const errorMessage = ref('')

onMounted(async () => {
  try {
    // 从 URL 参数中获取授权码和 state
    const code = route.query.code
    const state = route.query.state

    if (!code) {
      throw new Error('未获取到授权码')
    }

    // 处理微信登录回调
    const userInfo = await handleWechatCallback(code, state)

    if (userInfo) {
      // 登录成功，保存用户信息
      loginWithUserInfo(userInfo)
      success.value = true

      // 延迟跳转到首页
      setTimeout(() => {
        router.replace('/home').catch(() => {})
      }, 1500)
    } else {
      throw new Error('获取用户信息失败')
    }
  } catch (error) {
    console.error('微信登录回调处理失败:', error)
    loading.value = false
    success.value = false
    errorMessage.value = error.message || '登录过程中出现错误'
  } finally {
    loading.value = false
  }
})

const goBack = () => {
  router.replace('/login').catch(() => {})
}
</script>
