/**
 * 国际化(i18n)配置
 * 支持中英文动态切换
 */

const translations = {
  'zh-CN': {
    // 通用
    common: {
      confirm: '确认',
      cancel: '取消',
      save: '保存',
      submit: '提交',
      loading: '加载中...',
      success: '操作成功',
      error: '操作失败',
      warning: '提示',
    },
    // 设置页面
    settings: {
      title: '设置',
      notificationSettings: '通知设置',
      generalSettings: '通用设置',
      privacySettings: '隐私设置',
      pushNotification: '推送通知',
      pushNotificationDesc: '接收行程提醒和推荐',
      emailNotification: '邮件通知',
      emailNotificationDesc: '接收邮件提醒',
      smsNotification: '短信通知',
      smsNotificationDesc: '接收短信提醒',
      language: '语言',
      darkMode: '深色模式',
      darkModeDesc: '降低屏幕亮度',
      followSystem: '跟随系统',
      fontSize: '字体大小',
      fontSmall: '小',
      fontMedium: '中',
      fontLarge: '大',
      clearCache: '清理缓存',
      currentCache: '当前缓存',
      personalizedRecommend: '个性化推荐',
      personalizedRecommendDesc: '根据偏好推荐内容',
      locationService: '位置服务',
      locationServiceDesc: '允许访问位置信息',
      privacyPolicy: '隐私政策',
      logout: '退出登录',
      version: '版本',
      selectLanguage: '选择语言',
      cacheCleared: '缓存清理成功！',
      logoutConfirm: '确定要退出登录吗？',
      loggedOut: '已退出登录',
    },
    // 反馈页面
    feedback: {
      title: '用户反馈',
      submit: '提交',
      feedbackType: '反馈类型',
      bugReport: '问题反馈',
      featureSuggestion: '功能建议',
      usageQuestion: '使用咨询',
      other: '其他',
      problemDescription: '问题描述',
      problemPlaceholder: '请详细描述您遇到的问题或建议...',
      minChars: '至少10个字符',
      contactInfo: '联系方式（可选）',
      contactPlaceholder: '邮箱或手机号，方便我们联系您',
      fileUpload: '附件上传（可选）',
      uploadHint: '点击或拖拽文件到此处',
      uploadHintDetail: '支持 JPG、PNG、GIF、PDF，单个文件不超过10MB',
      submitFeedback: '提交反馈',
      fillRequired: '请完成必填项',
      submitSuccess: '感谢您的反馈！我们会尽快处理。',
      submitting: '正在提交...',
    },
    // 主菜单
    menu: {
      settings: '设置',
      settingsDesc: '通知、语言、隐私等',
      feedback: '用户反馈',
      feedbackDesc: '问题反馈、功能建议',
      helpCenter: '帮助中心',
      helpCenterDesc: '常见问题、联系我们',
    }
  },
  
  en: {
    // Common
    common: {
      confirm: 'Confirm',
      cancel: 'Cancel',
      save: 'Save',
      submit: 'Submit',
      loading: 'Loading...',
      success: 'Success',
      error: 'Error',
      warning: 'Warning',
    },
    // Settings page
    settings: {
      title: 'Settings',
      notificationSettings: 'Notifications',
      generalSettings: 'General',
      privacySettings: 'Privacy',
      pushNotification: 'Push Notifications',
      pushNotificationDesc: 'Receive trip reminders and recommendations',
      emailNotification: 'Email Notifications',
      emailNotificationDesc: 'Receive email alerts',
      smsNotification: 'SMS Notifications',
      smsNotificationDesc: 'Receive SMS alerts',
      language: 'Language',
      darkMode: 'Dark Mode',
      darkModeDesc: 'Reduce screen brightness',
      followSystem: 'Follow System',
      fontSize: 'Font Size',
      fontSmall: 'Small',
      fontMedium: 'Medium',
      fontLarge: 'Large',
      clearCache: 'Clear Cache',
      currentCache: 'Current cache',
      personalizedRecommend: 'Personalized Recommendations',
      personalizedRecommendDesc: 'Recommend content based on preferences',
      locationService: 'Location Services',
      locationServiceDesc: 'Allow access to location information',
      privacyPolicy: 'Privacy Policy',
      logout: 'Log Out',
      version: 'Version',
      selectLanguage: 'Select Language',
      cacheCleared: 'Cache cleared successfully!',
      logoutConfirm: 'Are you sure you want to log out?',
      loggedOut: 'Logged out successfully',
    },
    // Feedback page
    feedback: {
      title: 'Feedback',
      submit: 'Submit',
      feedbackType: 'Feedback Type',
      bugReport: 'Bug Report',
      featureSuggestion: 'Feature Suggestion',
      usageQuestion: 'Question',
      other: 'Other',
      problemDescription: 'Description',
      problemPlaceholder: 'Please describe the issue or suggestion in detail...',
      minChars: 'Minimum 10 characters',
      contactInfo: 'Contact (Optional)',
      contactPlaceholder: 'Email or phone number for us to reach you',
      fileUpload: 'Attachments (Optional)',
      uploadHint: 'Click or drag files here',
      uploadHintDetail: 'Supports JPG, PNG, GIF, PDF, max 10MB per file',
      submitFeedback: 'Submit Feedback',
      fillRequired: 'Please complete required fields',
      submitSuccess: 'Thank you for your feedback! We will review it soon.',
      submitting: 'Submitting...',
    },
    // Main menu
    menu: {
      settings: 'Settings',
      settingsDesc: 'Notifications, language, privacy, etc.',
      feedback: 'Feedback',
      feedbackDesc: 'Bug reports, feature suggestions',
      helpCenter: 'Help Center',
      helpCenterDesc: 'FAQ, contact us',
    }
  }
}

// 当前语言
let currentLocale = localStorage.getItem('locale') || 'zh-CN'

/**
 * 获取当前语言代码
 */
export function getCurrentLocale() {
  return currentLocale
}

/**
 * 设置当前语言
 */
export function setLocale(locale) {
  if (translations[locale]) {
    currentLocale = locale
    localStorage.setItem('locale', locale)
  }
}

/**
 * 获取翻译文本
 * @param {string} key - 翻译键，如 'settings.title'
 * @param {Object} params - 可选的参数替换对象
 * @returns {string} 翻译后的文本
 */
export function t(key, params = {}) {
  const keys = key.split('.')
  let value = translations[currentLocale]
  
  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k]
    } else {
      // 回退到中文
      value = translations['zh-CN']
      for (const fallbackKey of keys) {
        if (value && typeof value === 'object' && fallbackKey in value) {
          value = value[fallbackKey]
        } else {
          return key // 最终回退到返回key本身
        }
      }
      break
    }
  }
  
  if (typeof value !== 'string') {
    return key
  }
  
  // 参数替换
  Object.entries(params).forEach(([paramKey, paramValue]) => {
    value = value.replace(`{${paramKey}}`, paramValue)
  })
  
  return value
}

/**
 * 获取支持的语言列表
 */
export function getSupportedLocales() {
  return [
    { code: 'zh-CN', name: '简体中文', nativeName: '简体中文' },
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'ja', name: '日本語', nativeName: '日本語' },
    { code: 'ko', name: '한국어', nativeName: '한국어' },
  ]
}

export default {
  getCurrentLocale,
  setLocale,
  t,
  getSupportedLocales,
}
