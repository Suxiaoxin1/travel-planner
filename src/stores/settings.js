/**
 * 全局设置模块
 * 管理语言、深色模式、字体大小等设置
 * 设置自动持久化到 localStorage
 */
import { reactive, computed } from 'vue'
import { setLocale as setI18nLocale, getCurrentLocale } from '../i18n/index.js'

// ===== 内部状态 =====
const state = reactive({
  // 语言设置
  locale: getCurrentLocale(),

  // 深色模式：null=跟随系统, true=深色, false=浅色
  darkMode: JSON.parse(localStorage.getItem('darkMode') || 'null'),

  // 字体大小级别：small | medium | large
  fontSizeLevel: localStorage.getItem('fontSizeLevel') || 'medium',

  // 缓存大小
  cacheSize: '23.5 MB',

  // 是否已初始化
  initialized: false,
})

// ===== 计算属性 =====

// 是否应使用深色模式（考虑跟随系统的情况）
const isDarkMode = computed(() => {
  if (state.darkMode !== null) {
    return state.darkMode
  }
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
})

// 字体大小映射
const fontSizeMap = {
  small: 14,
  medium: 16,
  large: 18,
}

// 当前字体大小值
const currentFontSize = computed(() => {
  return fontSizeMap[state.fontSizeLevel] || 16
})

// ===== 方法 =====

/**
 * 设置语言
 */
function setLanguage(lang) {
  state.locale = lang
  setI18nLocale(lang)
  localStorage.setItem('locale', lang)
  document.documentElement.lang = lang
}

/**
 * 设置深色模式
 * @param {boolean|null} mode - true=深色, false=浅色, null=跟随系统
 */
function setDarkMode(mode) {
  state.darkMode = mode
  localStorage.setItem('darkMode', JSON.stringify(mode))
  applyTheme()
}

/**
 * 切换深色模式
 */
function toggleDarkMode() {
  if (state.darkMode === true) {
    setDarkMode(false)
  } else if (state.darkMode === false) {
    setDarkMode(true)
  } else {
    setDarkMode(!isDarkMode.value)
  }
}

/**
 * 设置字体大小级别
 * @param {'small'|'medium'|'large'} level
 */
function setFontSize(level) {
  if (['small', 'medium', 'large'].includes(level)) {
    state.fontSizeLevel = level
    localStorage.setItem('fontSizeLevel', level)
    applyFontSize()
  }
}

/**
 * 获取字体大小级别
 */
function getFontSizeLevel() {
  return state.fontSizeLevel
}

/**
 * 清理缓存
 */
function clearCache() {
  const keysToKeep = ['locale', 'darkMode', 'fontSizeLevel', 'user-token']
  const keysToRemove = []

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key && !keysToKeep.includes(key)) {
      keysToRemove.push(key)
    }
  }

  keysToRemove.forEach(key => localStorage.removeItem(key))
  state.cacheSize = '0 MB'
  return true
}

// ===== 内部方法 =====

function applyTheme() {
  const html = document.documentElement
  if (isDarkMode.value) {
    html.classList.add('dark')
    html.setAttribute('data-theme', 'dark')
  } else {
    html.classList.remove('dark')
    html.setAttribute('data-theme', 'light')
  }
}

function applyFontSize() {
  document.documentElement.style.fontSize = `${currentFontSize.value}px`
}

// 监听系统主题变化（仅在跟随系统时）
if (window.matchMedia) {
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if (state.darkMode === null) {
      applyTheme()
    }
  })
}

// 初始化
function init() {
  if (state.initialized) return
  state.initialized = true

  applyTheme()
  applyFontSize()
  document.documentElement.lang = state.locale
}

// 默认导出
export function useSettingsStore() {
  // 首次调用时自动初始化
  init()

  return {
    state,
    isDarkMode,
    currentFontSize,
    setLanguage,
    setDarkMode,
    toggleDarkMode,
    setFontSize,
    getFontSizeLevel,
    clearCache,
    init,
  }
}

export default useSettingsStore
