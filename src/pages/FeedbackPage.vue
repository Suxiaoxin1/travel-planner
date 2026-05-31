<template>
  <div class="min-h-full bg-gray-50">
    <!-- 顶部导航栏 -->
    <header class="sticky top-0 z-10 bg-white px-4 py-3 shadow-sm flex items-center">
      <button @click="goBack" class="mr-3 p-1 rounded-full hover:bg-gray-100 transition-colors">
        <ChevronLeft class="w-6 h-6 text-gray-700" />
      </button>
      <h1 class="text-[18px] font-semibold text-gray-800 flex-1">用户反馈</h1>
      <button
        @click="submitFeedback"
        class="text-[15px] font-medium text-blue-500 hover:text-blue-600 transition-colors"
      >
        提交
      </button>
    </header>

    <main class="max-w-[960px] mx-auto pb-8">
      <!-- 反馈类型 -->
      <section class="mt-4 mx-4">
        <div class="bg-white rounded-2xl shadow-sm p-5">
          <h2 class="text-[15px] font-semibold text-gray-800 mb-4">反馈类型</h2>
          <div class="grid grid-cols-2 gap-3">
            <div
              v-for="type in feedbackTypes"
              :key="type.value"
              class="flex items-center justify-center px-4 py-3 rounded-xl border-2 cursor-pointer transition-all duration-200"
              :class="feedback.type === type.value
                ? 'border-blue-500 bg-blue-50 text-blue-600'
                : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'"
              @click="feedback.type = type.value"
            >
              <component :is="type.icon" class="w-5 h-5 mr-2" />
              <span class="text-[14px] font-medium">{{ type.label }}</span>
            </div>
          </div>
        </div>
      </section>

      <!-- 问题描述 -->
      <section class="mt-4 mx-4">
        <div class="bg-white rounded-2xl shadow-sm p-5">
          <h2 class="text-[15px] font-semibold text-gray-800 mb-4">问题描述</h2>
          <textarea
            v-model="feedback.description"
            placeholder="请详细描述您遇到的问题或建议..."
            class="w-full h-32 px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all text-[14px] text-gray-800 placeholder-gray-400 resize-none"
          ></textarea>
          <div class="flex justify-between mt-2">
            <span class="text-[12px] text-gray-400">至少10个字符</span>
            <span class="text-[12px]" :class="feedback.description.length >= 10 ? 'text-green-500' : 'text-gray-400'">
              {{ feedback.description.length }}/500
            </span>
          </div>
        </div>
      </section>

      <!-- 联系方式（可选） -->
      <section class="mt-4 mx-4">
        <div class="bg-white rounded-2xl shadow-sm p-5">
          <h2 class="text-[15px] font-semibold text-gray-800 mb-4">联系方式（可选）</h2>
          <input
            v-model="feedback.contact"
            type="text"
            placeholder="邮箱或手机号，方便我们联系您"
            class="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all text-[14px] text-gray-800 placeholder-gray-400"
          />
        </div>
      </section>

      <!-- 附件上传 -->
      <section class="mt-4 mx-4">
        <div class="bg-white rounded-2xl shadow-sm p-5">
          <h2 class="text-[15px] font-semibold text-gray-800 mb-4">附件上传（可选）</h2>

          <!-- 上传区域 -->
          <div
            class="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all duration-200"
            @click="triggerFileUpload"
            @dragover.prevent
            @drop.prevent="handleFileDrop"
          >
            <Upload class="w-10 h-10 text-gray-400 mx-auto mb-3" />
            <p class="text-[14px] text-gray-600 font-medium">点击或拖拽文件到此处</p>
            <p class="text-[12px] text-gray-400 mt-1">支持 JPG、PNG、GIF、PDF，单个文件不超过10MB</p>
          </div>

          <input
            ref="fileInput"
            type="file"
            multiple
            accept="image/*,.pdf"
            class="hidden"
            @change="handleFileSelect"
          />

          <!-- 已上传文件列表 -->
          <div v-if="feedback.files.length > 0" class="mt-4 space-y-2">
            <div
              v-for="(file, index) in feedback.files"
              :key="index"
              class="flex items-center justify-between px-4 py-3 bg-gray-50 rounded-xl"
            >
              <div class="flex items-center space-x-3 flex-1 min-w-0">
                <FileText class="w-5 h-5 text-blue-500 flex-shrink-0" />
                <div class="flex-1 min-w-0">
                  <p class="text-[14px] text-gray-800 truncate">{{ file.name }}</p>
                  <p class="text-[12px] text-gray-500">{{ formatFileSize(file.size) }}</p>
                </div>
              </div>
              <button @click="removeFile(index)" class="p-1 hover:bg-gray-200 rounded-full transition-colors">
                <X class="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- 提交按钮（移动端底部固定） -->
      <div class="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 max-w-[960px] mx-auto hidden md:hidden">
        <button
          @click="submitFeedback"
          class="w-full py-3 bg-blue-500 text-white rounded-xl text-[16px] font-medium hover:bg-blue-600 transition-colors"
          :disabled="!isFormValid"
          :class="{ 'opacity-50 cursor-not-allowed': !isFormValid }"
        >
          提交反馈
        </button>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ChevronLeft, Upload, FileText, X, AlertCircle, Lightbulb, Bug, MessageSquare } from 'lucide-vue-next'

const router = useRouter()

// 反馈数据
const feedback = reactive({
  type: '',
  description: '',
  contact: '',
  files: []
})

// 文件输入引用
const fileInput = ref(null)

// 反馈类型
const feedbackTypes = [
  { label: '问题反馈', value: 'bug', icon: Bug },
  { label: '功能建议', value: 'suggestion', icon: Lightbulb },
  { label: '使用咨询', value: 'question', icon: MessageSquare },
  { label: '其他', value: 'other', icon: AlertCircle }
]

// 表单验证
const isFormValid = computed(() => {
  return feedback.type && feedback.description.length >= 10
})

// 返回上一页
const goBack = () => {
  router.back()
}

// 触发文件上传
const triggerFileUpload = () => {
  fileInput.value.click()
}

// 处理文件选择
const handleFileSelect = (event) => {
  const files = Array.from(event.target.files)
  addFiles(files)
}

// 处理文件拖拽
const handleFileDrop = (event) => {
  const files = Array.from(event.dataTransfer.files)
  addFiles(files)
}

// 添加文件
const addFiles = (files) => {
  files.forEach(file => {
    if (file.size > 10 * 1024 * 1024) {
      alert(`文件 ${file.name} 超过10MB限制`)
      return
    }
    feedback.files.push(file)
  })
}

// 移除文件
const removeFile = (index) => {
  feedback.files.splice(index, 1)
}

// 格式化文件大小
const formatFileSize = (bytes) => {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

// 提交反馈
const submitFeedback = () => {
  if (!isFormValid.value) {
    alert('请完成必填项')
    return
  }

  console.log('提交反馈:', feedback)
  alert('感谢您的反馈！我们会尽快处理。')
  router.push('/profile')
}
</script>
