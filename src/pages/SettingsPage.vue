<template>
  <div class="min-h-full bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
    <!-- 顶部导航栏 -->
    <header class="sticky top-0 z-10 bg-white dark:bg-gray-800 px-4 py-3 shadow-sm flex items-center transition-colors duration-300">
      <button @click="goBack" class="mr-3 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
        <ChevronLeft class="w-6 h-6 text-gray-700 dark:text-gray-200" />
      </button>
      <h1 class="text-[18px] font-semibold text-gray-800 dark:text-gray-100 flex-1">{{ t('settings.title') }}</h1>
    </header>

    <main class="max-w-[960px] mx-auto pb-8">
      <!-- 通知设置 -->
      <section class="mt-4 mx-4">
        <h2 class="px-2 py-2 text-[14px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          {{ t('settings.notificationSettings') }}
        </h2>
        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden transition-colors duration-300">
          <div class="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-700">
            <div class="flex-1">
              <h3 class="text-[15px] text-gray-800 dark:text-gray-100">{{ t('settings.pushNotification') }}</h3>
              <p class="text-[12px] text-gray-500 dark:text-gray-400 mt-0.5">{{ t('settings.pushNotificationDesc') }}</p>
            </div>
            <ToggleSwitch v-model="notifications.push" />
          </div>
          <div class="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-700">
            <div class="flex-1">
              <h3 class="text-[15px] text-gray-800 dark:text-gray-100">{{ t('settings.emailNotification') }}</h3>
              <p class="text-[12px] text-gray-500 dark:text-gray-400 mt-0.5">{{ t('settings.emailNotificationDesc') }}</p>
            </div>
            <ToggleSwitch v-model="notifications.email" />
          </div>
          <div class="flex items-center justify-between px-5 py-4">
            <div class="flex-1">
              <h3 class="text-[15px] text-gray-800 dark:text-gray-100">{{ t('settings.smsNotification') }}</h3>
              <p class="text-[12px] text-gray-500 dark:text-gray-400 mt-0.5">{{ t('settings.smsNotificationDesc') }}</p>
            </div>
            <ToggleSwitch v-model="notifications.sms" />
          </div>
        </div>
      </section>

      <!-- 通用设置 -->
      <section class="mt-4 mx-4">
        <h2 class="px-2 py-2 text-[14px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          {{ t('settings.generalSettings') }}
        </h2>
        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden transition-colors duration-300">
          <!-- 语言选择 -->
          <div
            class="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
            @click="showLanguagePicker = true"
          >
            <div class="flex-1">
              <h3 class="text-[15px] text-gray-800 dark:text-gray-100">{{ t('settings.language') }}</h3>
            </div>
            <div class="flex items-center space-x-2">
              <span class="text-[14px] text-gray-500 dark:text-gray-400">{{ currentLanguageName }}</span>
              <ChevronRight class="w-5 h-5 text-gray-400 dark:text-gray-500" />
            </div>
          </div>

          <!-- 深色模式 -->
          <div class="px-5 py-4 border-b border-gray-100 dark:border-gray-700">
            <div class="flex items-center justify-between mb-3">
              <div class="flex-1">
                <h3 class="text-[15px] text-gray-800 dark:text-gray-100">{{ t('settings.darkMode') }}</h3>
                <p class="text-[12px] text-gray-500 dark:text-gray-400 mt-0.5">{{ t('settings.darkModeDesc') }}</p>
              </div>
            </div>
            <div class="flex bg-gray-100 dark:bg-gray-700 rounded-xl p-1">
              <button
                v-for="mode in darkModeOptions"
                :key="mode.value"
                @click="store.setDarkMode(mode.value)"
                class="flex-1 py-2 rounded-lg text-[13px] font-medium transition-all duration-200"
                :class="store.state.darkMode === mode.value
                  ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'"
              >
                {{ mode.label }}
              </button>
            </div>
          </div>

          <!-- 字体大小 -->
          <div class="px-5 py-4 border-b border-gray-100 dark:border-gray-700">
            <div class="flex items-center justify-between mb-3">
              <h3 class="text-[15px] text-gray-800 dark:text-gray-100">{{ t('settings.fontSize') }}</h3>
              <span class="text-[13px] px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full font-medium">
                {{ fontSizeLabel }}
              </span>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-[12px] text-gray-400 dark:text-gray-500 flex-shrink-0">{{ t('settings.fontSmall') }}</span>
              <input
                type="range"
                :value="fontSizeIndex"
                @input="onFontSizeChange"
                min="0"
                max="2"
                step="1"
                class="flex-1 h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
              <span class="text-[12px] text-gray-400 dark:text-gray-500 flex-shrink-0">{{ t('settings.fontLarge') }}</span>
            </div>
            <div class="flex justify-between mt-2">
              <span
                v-for="(label, i) in fontSizes"
                :key="i"
                class="text-[11px] cursor-pointer transition-colors"
                :class="i === fontSizeIndex ? 'text-blue-600 dark:text-blue-400 font-medium' : 'text-gray-400 dark:text-gray-500'"
                @click="store.setFontSize(label.value)"
              >
                {{ label.label }}
              </span>
            </div>
            <!-- 预览区 -->
            <div class="mt-3 p-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50">
              <p class="text-center transition-all duration-200" :style="{ fontSize: store.currentFontSize + 'px' }">
                {{ locale === 'zh-CN' ? '字体大小预览示例文字' : 'Font size preview sample text' }}
              </p>
            </div>
          </div>

          <!-- 缓存清理 -->
          <div
            class="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
            @click="handleClearCache"
          >
            <div class="flex-1">
              <h3 class="text-[15px] text-gray-800 dark:text-gray-100">{{ t('settings.clearCache') }}</h3>
              <p class="text-[12px] text-gray-500 dark:text-gray-400 mt-0.5">{{ t('settings.currentCache') }} {{ store.state.cacheSize }}</p>
            </div>
            <ChevronRight class="w-5 h-5 text-gray-400 dark:text-gray-500" />
          </div>
        </div>
      </section>

      <!-- 隐私设置 -->
      <section class="mt-4 mx-4">
        <h2 class="px-2 py-2 text-[14px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          {{ t('settings.privacySettings') }}
        </h2>
        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden transition-colors duration-300">
          <div class="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-700">
            <div class="flex-1">
              <h3 class="text-[15px] text-gray-800 dark:text-gray-100">{{ t('settings.personalizedRecommend') }}</h3>
              <p class="text-[12px] text-gray-500 dark:text-gray-400 mt-0.5">{{ t('settings.personalizedRecommendDesc') }}</p>
            </div>
            <ToggleSwitch v-model="privacy.personalized" />
          </div>
          <div class="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-700">
            <div class="flex-1">
              <h3 class="text-[15px] text-gray-800 dark:text-gray-100">{{ t('settings.locationService') }}</h3>
              <p class="text-[12px] text-gray-500 dark:text-gray-400 mt-0.5">{{ t('settings.locationServiceDesc') }}</p>
            </div>
            <ToggleSwitch v-model="privacy.location" />
          </div>
          <div
            class="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
            @click="showToast(locale === 'zh-CN' ? '隐私政策页面即将上线' : 'Privacy policy coming soon')"
          >
            <div class="flex-1">
              <h3 class="text-[15px] text-gray-800 dark:text-gray-100">{{ t('settings.privacyPolicy') }}</h3>
            </div>
            <ChevronRight class="w-5 h-5 text-gray-400 dark:text-gray-500" />
          </div>
        </div>
      </section>

      <!-- 账号操作 -->
      <section class="mt-4 mx-4">
        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden transition-colors duration-300">
          <div
            class="flex items-center justify-center px-5 py-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
            @click="handleLogout"
          >
            <span class="text-[15px] text-red-500 font-medium">{{ t('settings.logout') }}</span>
          </div>
        </div>
      </section>

      <div class="text-center py-6">
        <p class="text-[12px] text-gray-400 dark:text-gray-500">{{ t('settings.version') }} 1.0.0</p>
      </div>
    </main>

    <!-- Toast 提示 -->
    <Transition name="toast">
      <div
        v-if="toastVisible"
        class="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-6 py-3 bg-gray-800 dark:bg-gray-200 text-white dark:text-gray-800 rounded-xl shadow-lg text-[14px] font-medium"
      >
        {{ toastMessage }}
      </div>
    </Transition>

    <!-- 语言选择弹窗 -->
    <Teleport to="body">
      <Transition name="modal">
        <div
          v-if="showLanguagePicker"
          class="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm"
          @click.self="showLanguagePicker = false"
        >
          <div class="bg-white dark:bg-gray-800 rounded-t-2xl w-full max-w-[960px] p-6 pb-8 transition-colors duration-300">
            <div class="w-10 h-1 bg-gray-300 dark:bg-gray-600 rounded-full mx-auto mb-4"></div>
            <h3 class="text-[18px] font-semibold text-gray-800 dark:text-gray-100 text-center mb-4">{{ t('settings.selectLanguage') }}</h3>
            <div class="space-y-1">
              <div
                v-for="lang in supportedLocales"
                :key="lang.code"
                class="flex items-center justify-between px-4 py-3 rounded-xl cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
                :class="{ 'bg-blue-50 dark:bg-blue-900/20': store.state.locale === lang.code }"
                @click="selectLanguage(lang.code)"
              >
                <div>
                  <span
                    class="text-[15px]"
                    :class="store.state.locale === lang.code ? 'text-blue-600 dark:text-blue-400 font-medium' : 'text-gray-800 dark:text-gray-200'"
                  >{{ lang.nativeName }}</span>
                  <span class="text-[13px] text-gray-400 dark:text-gray-500 ml-2">{{ lang.name }}</span>
                </div>
                <Check
                  v-if="store.state.locale === lang.code"
                  class="w-5 h-5 text-blue-600 dark:text-blue-400"
                />
              </div>
            </div>
            <button
              @click="showLanguagePicker = false"
              class="mt-4 w-full py-3 bg-gray-100 dark:bg-gray-700 rounded-xl text-[15px] font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              {{ t('common.cancel') }}
            </button>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ChevronLeft, ChevronRight, Check } from 'lucide-vue-next'
import { useSettingsStore } from '../stores/settings.js'
import { t, getSupportedLocales } from '../i18n/index.js'

const router = useRouter()
const store = useSettingsStore()

// 当前语言代码
const locale = computed(() => store.state.locale)
const supportedLocales = getSupportedLocales()

// 当前语言名称
const currentLanguageName = computed(() => {
  const current = supportedLocales.find(l => l.code === store.state.locale)
  return current ? current.nativeName : '简体中文'
})

// 通知设置
const notifications = reactive({
  push: true,
  email: false,
  sms: true,
})

// 隐私设置
const privacy = reactive({
  personalized: true,
  location: false,
})

// 深色模式选项
const darkModeOptions = [
  { value: null, label: locale.value === 'zh-CN' ? '跟随系统' : 'Follow System' },
  { value: false, label: locale.value === 'zh-CN' ? '浅色' : 'Light' },
  { value: true, label: locale.value === 'zh-CN' ? '深色' : 'Dark' },
]

// 字体大小设置
const fontSizes = [
  { value: 'small', label: t('settings.fontSmall') },
  { value: 'medium', label: t('settings.fontMedium') },
  { value: 'large', label: t('settings.fontLarge') },
]

const fontSizeIndex = computed(() => {
  const idx = fontSizes.findIndex(f => f.value === store.state.fontSizeLevel)
  return idx >= 0 ? idx : 1
})

const fontSizeLabel = computed(() => {
  const current = fontSizes.find(f => f.value === store.state.fontSizeLevel)
  return current ? current.label : t('settings.fontMedium')
})

function onFontSizeChange(e) {
  const idx = parseInt(e.target.value)
  if (fontSizes[idx]) {
    store.setFontSize(fontSizes[idx].value)
  }
}

// 语言选择器
const showLanguagePicker = ref(false)

function selectLanguage(lang) {
  store.setLanguage(lang)
  showLanguagePicker.value = false
  showToast(lang === 'zh-CN' ? '语言已切换为中文' : 'Language switched to English')
}

// Toast 提示
const toastVisible = ref(false)
const toastMessage = ref('')

function showToast(message, duration = 2000) {
  toastMessage.value = message
  toastVisible.value = true
  setTimeout(() => {
    toastVisible.value = false
  }, duration)
}

// 清理缓存
function handleClearCache() {
  if (confirm(locale.value === 'zh-CN' ? '确定要清理缓存吗？' : 'Are you sure you want to clear cache?')) {
    store.clearCache()
    showToast(t('settings.cacheCleared'))
  }
}

// 退出登录
function handleLogout() {
  if (confirm(t('settings.logoutConfirm'))) {
    showToast(t('settings.loggedOut'))
    setTimeout(() => {
      router.push('/profile')
    }, 500)
  }
}

// 返回
function goBack() {
  router.back()
}
</script>

<script>
// 普通 script 块用于定义 ToggleSwitch 组件
import { h } from 'vue'

const ToggleSwitch = {
  props: {
    modelValue: Boolean
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    return () => h('label', { class: 'relative inline-flex items-center cursor-pointer' }, [
      h('input', {
        type: 'checkbox',
        checked: props.modelValue,
        class: 'sr-only peer',
        onChange: (e) => emit('update:modelValue', e.target.checked),
      }),
      h('div', {
        class: [
          'w-11 h-6 rounded-full transition-colors duration-200',
          'after:content-[\'\'] after:absolute after:top-[2px] after:left-[2px]',
          'after:bg-white after:border-gray-300 after:border after:rounded-full',
          'after:h-5 after:w-5 after:transition-all',
          props.modelValue
            ? 'bg-blue-500 after:translate-x-full after:border-white'
            : 'bg-gray-200 dark:bg-gray-600'
        ].join(' ')
      })
    ])
  }
}
</script>

<style scoped>
input[type="range"]::-webkit-slider-thumb {
  appearance: none;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #3b82f6;
  cursor: pointer;
  border: 3px solid white;
  box-shadow: 0 1px 3px rgba(0,0,0,0.2);
}

input[type="range"]::-moz-range-thumb {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #3b82f6;
  cursor: pointer;
  border: 3px solid white;
  box-shadow: 0 1px 3px rgba(0,0,0,0.2);
}

/* Toast 动画 */
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translate(-50%, -10px);
}

/* Modal 动画 */
.modal-enter-active {
  transition: all 0.3s ease-out;
}
.modal-leave-active {
  transition: all 0.2s ease-in;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
.modal-enter-from > div,
.modal-leave-to > div {
  transform: translateY(100%);
}
</style>
