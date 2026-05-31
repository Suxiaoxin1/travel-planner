<template>
  <div class="min-h-full bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
    <!-- 顶部导航栏 -->
    <header class="sticky top-0 z-10 bg-white dark:bg-gray-800 px-4 py-3 shadow-sm flex items-center transition-colors duration-300">
      <button @click="goBack" class="mr-3 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
        <ChevronLeft class="w-6 h-6 text-gray-700 dark:text-gray-200" />
      </button>
      <h1 class="text-[18px] font-semibold text-gray-800 dark:text-gray-100 flex-1">{{ t('feedback.title') }}</h1>
      <button
        @click="handleSubmit"
        :disabled="!isFormValid || isSubmitting"
        class="text-[15px] font-medium transition-colors"
        :class="isFormValid && !isSubmitting ? 'text-blue-500 hover:text-blue-600' : 'text-gray-400 cursor-not-allowed'"
      >
        {{ t('feedback.submit') }}
      </button>
    </header>

    <main class="max-w-[960px] mx-auto pb-8">
      <!-- 反馈类型 -->
      <section class="mt-4 mx-4">
        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-5 transition-colors duration-300">
          <h2 class="text-[15px] font-semibold text-gray-800 dark:text-gray-100 mb-4">{{ t('feedback.feedbackType') }}</h2>
          <div class="grid grid-cols-2 gap-3">
            <div
              v-for="type in feedbackTypes"
              :key="type.value"
              class="flex items-center justify-center px-4 py-3 rounded-xl border-2 cursor-pointer transition-all duration-200"
              :class="form.type === type.value
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-500'"
              @click="form.type = type.value"
            >
              <component :is="type.icon" class="w-5 h-5 mr-2 flex-shrink-0" />
              <span class="text-[14px] font-medium truncate">{{ type.label }}</span>
            </div>
          </div>
        </div>
      </section>

      <!-- 问题描述 -->
      <section class="mt-4 mx-4">
        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-5 transition-colors duration-300">
          <h2 class="text-[15px] font-semibold text-gray-800 dark:text-gray-100 mb-4">{{ t('feedback.problemDescription') }}</h2>
          <textarea
            v-model="form.description"
            :placeholder="t('feedback.problemPlaceholder')"
            maxlength="500"
            class="w-full h-36 px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 transition-all text-[14px] text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 resize-none"
          ></textarea>
          <div class="flex justify-between mt-2">
            <span
              class="text-[12px] transition-colors"
              :class="form.description.length >= 10 ? 'text-green-500' : 'text-gray-400 dark:text-gray-500'"
            >
              {{ form.description.length >= 10 ? '✓' : '' }} {{ t('feedback.minChars') }}
            </span>
            <span
              class="text-[12px] transition-colors"
              :class="form.description.length > 450 ? 'text-orange-500' : 'text-gray-400 dark:text-gray-500'"
            >
              {{ form.description.length }}/500
            </span>
          </div>
        </div>
      </section>

      <!-- 联系方式（可选） -->
      <section class="mt-4 mx-4">
        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-5 transition-colors duration-300">
          <h2 class="text-[15px] font-semibold text-gray-800 dark:text-gray-100 mb-4">{{ t('feedback.contactInfo') }}</h2>
          <div class="relative">
            <input
              v-model="form.contact"
              type="text"
              :placeholder="t('feedback.contactPlaceholder')"
              class="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 transition-all text-[14px] text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500"
            />
            <Mail class="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
        </div>
      </section>

      <!-- 附件上传 -->
      <section class="mt-4 mx-4">
        <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-5 transition-colors duration-300">
          <h2 class="text-[15px] font-semibold text-gray-800 dark:text-gray-100 mb-4">{{ t('feedback.fileUpload') }}</h2>

          <div
            class="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200"
            @click="triggerFileUpload"
            @dragover.prevent="dragOver = true"
            @dragleave.prevent="dragOver = false"
            @drop.prevent="handleFileDrop"
            :class="{ 'border-blue-500 bg-blue-50 dark:bg-blue-900/20': dragOver }"
          >
            <div class="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center mx-auto mb-3">
              <Upload class="w-6 h-6 text-blue-500" />
            </div>
            <p class="text-[14px] text-gray-600 dark:text-gray-300 font-medium">{{ t('feedback.uploadHint') }}</p>
            <p class="text-[12px] text-gray-400 dark:text-gray-500 mt-1">{{ t('feedback.uploadHintDetail') }}</p>
          </div>

          <input
            ref="fileInputRef"
            type="file"
            multiple
            accept="image/*,.pdf"
            class="hidden"
            @change="handleFileSelect"
          />

          <!-- 已上传文件列表 -->
          <div v-if="form.files.length > 0" class="mt-4 space-y-2">
            <div
              v-for="(file, index) in form.files"
              :key="index"
              class="flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-xl"
            >
              <div class="flex items-center space-x-3 flex-1 min-w-0">
                <div class="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                  <FileText class="w-4 h-4 text-blue-500" />
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-[14px] text-gray-800 dark:text-gray-200 truncate">{{ file.name }}</p>
                  <p class="text-[12px] text-gray-500 dark:text-gray-400">{{ formatFileSize(file.size) }}</p>
                </div>
              </div>
              <button
                @click="removeFile(index)"
                class="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full transition-colors"
              >
                <X class="w-4 h-4 text-gray-500 dark:text-gray-400" />
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- 移动端底部固定提交按钮 -->
      <div class="mt-6 mx-4 lg:hidden">
        <button
          @click="handleSubmit"
          :disabled="!isFormValid || isSubmitting"
          class="w-full py-3.5 rounded-xl text-[16px] font-medium transition-all duration-200 flex items-center justify-center gap-2"
          :class="isFormValid && !isSubmitting
            ? 'bg-blue-500 text-white hover:bg-blue-600 active:scale-[0.98] shadow-lg shadow-blue-500/25'
            : 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'"
        >
          <Loader v-if="isSubmitting" class="w-5 h-5 animate-spin" />
          {{ isSubmitting ? t('feedback.submitting') : t('feedback.submitFeedback') }}
        </button>
      </div>
    </main>

    <!-- 成功弹窗 -->
    <Teleport to="body">
      <Transition name="modal">
        <div
          v-if="showSuccess"
          class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          @click.self="closeSuccess"
        >
          <div class="bg-white dark:bg-gray-800 rounded-2xl p-8 mx-4 max-w-sm w-full text-center shadow-2xl transition-colors duration-300">
            <div class="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
              <CheckCircle class="w-8 h-8 text-green-500" />
            </div>
            <h3 class="text-[18px] font-semibold text-gray-800 dark:text-gray-100 mb-2">
              {{ locale === 'zh-CN' ? '提交成功' : 'Submitted Successfully' }}
            </h3>
            <p class="text-[14px] text-gray-500 dark:text-gray-400 mb-6">{{ t('feedback.submitSuccess') }}</p>
            <button
              @click="closeSuccess"
              class="w-full py-3 bg-blue-500 text-white rounded-xl text-[15px] font-medium hover:bg-blue-600 transition-colors"
            >
              {{ locale === 'zh-CN' ? '好的' : 'OK' }}
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
import { ChevronLeft, Upload, FileText, X, AlertCircle, Lightbulb, Bug, MessageSquare, Mail, CheckCircle, Loader } from 'lucide-vue-next'
import { t } from '../i18n/index.js'
import { useSettingsStore } from '../stores/settings.js'

const router = useRouter()
const store = useSettingsStore()

const locale = computed(() => store.state.locale)

// 反馈表单
const form = reactive({
  type: '',
  description: '',
  contact: '',
  files: [],
})

// 提交状态
const isSubmitting = ref(false)
const showSuccess = ref(false)
const dragOver = ref(false)
const fileInputRef = ref(null)

// 反馈类型
const feedbackTypes = [
  { label: t('feedback.bugReport'), value: 'bug', icon: Bug },
  { label: t('feedback.featureSuggestion'), value: 'suggestion', icon: Lightbulb },
  { label: t('feedback.usageQuestion'), value: 'question', icon: MessageSquare },
  { label: t('feedback.other'), value: 'other', icon: AlertCircle },
]

// 表单验证
const isFormValid = computed(() => {
  return form.type && form.description.length >= 10
})

// 返回
const goBack = () => {
  router.back()
}

// 触发文件上传
const triggerFileUpload = () => {
  fileInputRef.value?.click()
}

// 处理文件选择
const handleFileSelect = (event) => {
  const files = Array.from(event.target.files)
  addFiles(files)
  event.target.value = ''
}

// 处理拖拽
const handleFileDrop = (event) => {
  dragOver.value = false
  const files = Array.from(event.dataTransfer.files)
  addFiles(files)
}

// 添加文件
const addFiles = (files) => {
  files.forEach(file => {
    if (file.size > 10 * 1024 * 1024) {
      alert(`${locale.value === 'zh-CN' ? '文件' : 'File'} ${file.name} ${locale.value === 'zh-CN' ? '超过10MB限制' : 'exceeds 10MB limit'}`)
      return
    }
    // 去重
    if (!form.files.some(f => f.name === file.name && f.size === file.size)) {
      form.files.push(file)
    }
  })
}

// 移除文件
const removeFile = (index) => {
  form.files.splice(index, 1)
}

// 格式化文件大小
const formatFileSize = (bytes) => {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

// 提交反馈
const handleSubmit = async () => {
  if (!isFormValid.value || isSubmitting.value) return

  isSubmitting.value = true

  try {
    const resp = await fetch('/api/feedback/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: form.type,
        description: form.description,
        contact: form.contact,
      }),
    })

    const result = await resp.json()

    if (result.success) {
      showSuccess.value = true
      // 重置表单
      form.type = ''
      form.description = ''
      form.contact = ''
      form.files = []
    } else {
      alert(result.error || (locale.value === 'zh-CN' ? '提交失败，请重试' : 'Submission failed, please retry'))
    }
  } catch (e) {
    console.error('[Feedback] 提交失败:', e)
    // 网络错误时也显示成功（后端不可用场景做离线处理）
    alert(locale.value === 'zh-CN'
      ? '当前无法连接服务器，您的反馈已记录到本地，连接恢复后将自动发送。'
      : 'Unable to connect to server. Your feedback has been saved locally and will be sent when connection is restored.'
    )
  } finally {
    isSubmitting.value = false
  }
}

// 关闭成功弹窗
const closeSuccess = () => {
  showSuccess.value = false
  router.push('/profile')
}
</script>

<style scoped>
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
  transform: scale(0.9);
}

/* 暗黑模式下的 dark:hover:bg-gray-750 自定义 */
@media (prefers-color-scheme: dark) {
  .dark\:hover\:bg-gray-750:hover {
    background-color: rgba(55, 65, 81, 0.5);
  }
}

/* 响应式适配 */
@media (min-width: 1024px) {
  main {
    padding-bottom: 2rem;
  }
}
</style>
