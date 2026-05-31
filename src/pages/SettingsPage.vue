<template>
  <div class="min-h-full bg-gray-50">
    <!-- 顶部导航栏 -->
    <header class="sticky top-0 z-10 bg-white px-4 py-3 shadow-sm flex items-center">
      <button @click="goBack" class="mr-3 p-1 rounded-full hover:bg-gray-100 transition-colors">
        <ChevronLeft class="w-6 h-6 text-gray-700" />
      </button>
      <h1 class="text-[18px] font-semibold text-gray-800 flex-1">设置</h1>
    </header>

    <main class="max-w-[960px] mx-auto pb-8">
      <!-- 通知设置 -->
      <section class="mt-4 mx-4">
        <h2 class="px-2 py-2 text-[14px] font-semibold text-gray-500 uppercase tracking-wider">
          通知设置
        </h2>
        <div class="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div class="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <div class="flex-1">
              <h3 class="text-[15px] text-gray-800">推送通知</h3>
              <p class="text-[12px] text-gray-500 mt-0.5">接收行程提醒和推荐</p>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" v-model="settings.pushNotification" class="sr-only peer" />
              <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
            </label>
          </div>
          <div class="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <div class="flex-1">
              <h3 class="text-[15px] text-gray-800">邮件通知</h3>
              <p class="text-[12px] text-gray-500 mt-0.5">接收邮件提醒</p>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" v-model="settings.emailNotification" class="sr-only peer" />
              <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
            </label>
          </div>
          <div class="flex items-center justify-between px-5 py-4">
            <div class="flex-1">
              <h3 class="text-[15px] text-gray-800">短信通知</h3>
              <p class="text-[12px] text-gray-500 mt-0.5">接收短信提醒</p>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" v-model="settings.smsNotification" class="sr-only peer" />
              <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
            </label>
          </div>
        </div>
      </section>

      <!-- 通用设置 -->
      <section class="mt-4 mx-4">
        <h2 class="px-2 py-2 text-[14px] font-semibold text-gray-500 uppercase tracking-wider">
          通用设置
        </h2>
        <div class="bg-white rounded-2xl shadow-sm overflow-hidden">
          <!-- 语言选择 -->
          <div class="flex items-center justify-between px-5 py-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors" @click="showLanguagePicker = true">
            <div class="flex-1">
              <h3 class="text-[15px] text-gray-800">语言</h3>
            </div>
            <div class="flex items-center space-x-2">
              <span class="text-[14px] text-gray-500">{{ settings.language }}</span>
              <ChevronRight class="w-5 h-5 text-gray-400" />
            </div>
          </div>

          <!-- 深色模式 -->
          <div class="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <div class="flex-1">
              <h3 class="text-[15px] text-gray-800">深色模式</h3>
              <p class="text-[12px] text-gray-500 mt-0.5">降低屏幕亮度</p>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" v-model="settings.darkMode" class="sr-only peer" />
              <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
            </label>
          </div>

          <!-- 字体大小 -->
          <div class="px-5 py-4 border-b border-gray-100">
            <div class="flex items-center justify-between mb-3">
              <h3 class="text-[15px] text-gray-800">字体大小</h3>
              <span class="text-[14px] text-blue-600 font-medium">{{ settings.fontSize }}</span>
            </div>
            <input
              type="range"
              v-model="settings.fontSizeValue"
              min="12"
              max="20"
              step="1"
              class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
            <div class="flex justify-between mt-1">
              <span class="text-[12px] text-gray-400">小</span>
              <span class="text-[12px] text-gray-400">中</span>
              <span class="text-[12px] text-gray-400">大</span>
            </div>
          </div>

          <!-- 缓存清理 -->
          <div class="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-gray-50 transition-colors" @click="clearCache">
            <div class="flex-1">
              <h3 class="text-[15px] text-gray-800">清理缓存</h3>
              <p class="text-[12px] text-gray-500 mt-0.5">当前缓存 {{ cacheSize }}</p>
            </div>
            <ChevronRight class="w-5 h-5 text-gray-400" />
          </div>
        </div>
      </section>

      <!-- 隐私设置 -->
      <section class="mt-4 mx-4">
        <h2 class="px-2 py-2 text-[14px] font-semibold text-gray-500 uppercase tracking-wider">
          隐私设置
        </h2>
        <div class="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div class="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <div class="flex-1">
              <h3 class="text-[15px] text-gray-800">个性化推荐</h3>
              <p class="text-[12px] text-gray-500 mt-0.5">根据偏好推荐内容</p>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" v-model="settings.personalizedRecommend" class="sr-only peer" />
              <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
            </label>
          </div>
          <div class="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <div class="flex-1">
              <h3 class="text-[15px] text-gray-800">位置服务</h3>
              <p class="text-[12px] text-gray-500 mt-0.5">允许访问位置信息</p>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" v-model="settings.locationService" class="sr-only peer" />
              <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
            </label>
          </div>
          <div class="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-gray-50 transition-colors" @click="showPrivacyPolicy">
            <div class="flex-1">
              <h3 class="text-[15px] text-gray-800">隐私政策</h3>
            </div>
            <ChevronRight class="w-5 h-5 text-gray-400" />
          </div>
        </div>
      </section>

      <!-- 账号操作 -->
      <section class="mt-4 mx-4">
        <div class="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div class="flex items-center justify-center px-5 py-4 cursor-pointer hover:bg-gray-50 transition-colors" @click="logout">
            <span class="text-[15px] text-red-500 font-medium">退出登录</span>
          </div>
        </div>
      </section>

      <div class="text-center py-6">
        <p class="text-[12px] text-gray-400">版本 1.0.0</p>
      </div>
    </main>

    <!-- 语言选择弹窗 -->
    <div
      v-if="showLanguagePicker"
      class="fixed inset-0 z-50 flex items-end justify-center bg-black bg-opacity-50"
      @click.self="showLanguagePicker = false"
    >
      <div class="bg-white rounded-t-2xl w-full max-w-[960px] p-6 pb-8">
        <h3 class="text-[18px] font-semibold text-gray-800 text-center mb-4">选择语言</h3>
        <div class="space-y-2">
          <div
            v-for="lang in languages"
            :key="lang"
            class="flex items-center justify-between px-4 py-3 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors"
            :class="{ 'bg-blue-50': settings.language === lang }"
            @click="selectLanguage(lang)"
          >
            <span class="text-[15px]" :class="settings.language === lang ? 'text-blue-600 font-medium' : 'text-gray-800'">{{ lang }}</span>
            <Check v-if="settings.language === lang" class="w-5 h-5 text-blue-600" />
          </div>
        </div>
        <button
          @click="showLanguagePicker = false"
          class="mt-4 w-full py-3 bg-gray-100 rounded-xl text-[15px] font-medium text-gray-700 hover:bg-gray-200 transition-colors"
        >
          取消
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ChevronLeft, ChevronRight, Check } from 'lucide-vue-next'

const router = useRouter()

// 设置数据
const settings = reactive({
  pushNotification: true,
  emailNotification: false,
  smsNotification: true,
  language: '简体中文',
  darkMode: false,
  fontSize: '中',
  fontSizeValue: 16,
  personalizedRecommend: true,
  locationService: false
})

// 缓存大小
const cacheSize = ref('23.5 MB')

// 语言列表
const languages = ['简体中文', 'English', '日本語', '한국어']

// 显示语言选择器
const showLanguagePicker = ref(false)

// 返回上一页
const goBack = () => {
  router.back()
}

// 选择语言
const selectLanguage = (lang) => {
  settings.language = lang
  showLanguagePicker.value = false
}

// 清理缓存
const clearCache = () => {
  if (confirm('确定要清理缓存吗？')) {
    cacheSize.value = '0 MB'
    alert('缓存清理成功！')
  }
}

// 查看隐私政策
const showPrivacyPolicy = () => {
  alert('隐私政策页面即将上线')
}

// 退出登录
const logout = () => {
  if (confirm('确定要退出登录吗？')) {
    alert('已退出登录')
    router.push('/profile')
  }
}

// 监听字体大小变化
const updateFontSize = (value) => {
  const sizeMap = {
    12: '小',
    14: '较小',
    16: '中',
    18: '较大',
    20: '大'
  }
  settings.fontSize = sizeMap[value] || '中'
}
</script>

<style scoped>
/* 自定义滑块样式 */
input[type="range"]::-webkit-slider-thumb {
  appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #3b82f6;
  cursor: pointer;
}

input[type="range"]::-moz-range-thumb {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #3b82f6;
  cursor: pointer;
  border: none;
}
</style>
