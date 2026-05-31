<template>
  <div class="min-h-full bg-gray-50 flex flex-col">
    <!-- 顶部导航栏 -->
    <header class="sticky top-0 z-10 bg-white shadow-sm">
      <div class="flex items-center justify-between px-4 py-3">
        <button @click="goBack" class="p-1 -ml-1 text-gray-600 hover:text-gray-800">
          <ChevronLeft class="w-6 h-6" />
        </button>
        <h1 class="text-[18px] font-semibold text-gray-800">人物画像测试</h1>
        <div class="w-8"></div>
      </div>
      <!-- 进度条 -->
      <div class="px-4 pb-3">
        <div class="flex items-center justify-between mb-1.5">
          <span class="text-[12px] text-gray-500">答题进度</span>
          <span class="text-[12px] font-medium" :class="progressColor">{{ answeredCount }} / {{ totalQuestions }}</span>
        </div>
        <div class="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            class="h-full rounded-full transition-all duration-300 ease-out"
            :class="progressBarColor"
            :style="{ width: progressPercent + '%' }"
          ></div>
        </div>
        <div class="flex items-center justify-between mt-1.5">
          <span class="text-[11px] text-gray-400">至少15题可生成画像</span>
          <span class="text-[11px]" :class="answeredCount >= 15 ? 'text-green-500' : 'text-gray-400'">
            {{ answeredCount >= 15 ? '✓ 已达最低要求' : `还需${15 - answeredCount}题` }}
          </span>
        </div>
      </div>
    </header>

    <!-- 分类筛选 -->
    <div class="bg-white border-b border-gray-100 px-4 py-2 flex gap-2 overflow-x-auto no-scrollbar">
      <button
        v-for="cat in categories"
        :key="cat"
        @click="activeCategory = cat"
        class="flex-shrink-0 px-3 py-1.5 rounded-full text-[13px] font-medium transition-colors duration-200"
        :class="activeCategory === cat
          ? 'bg-purple-500 text-white'
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
      >
        {{ cat }}
      </button>
    </div>

    <!-- 题目列表 -->
    <main class="flex-1 overflow-y-auto px-4 py-3 space-y-3">
      <div
        v-for="question in filteredQuestions"
        :key="question.id"
        class="bg-white rounded-2xl p-4 shadow-sm transition-all duration-200"
        :class="{ 'ring-2 ring-purple-200': answers[question.id] }"
      >
        <!-- 题号和分类 -->
        <div class="flex items-center gap-2 mb-2">
          <span class="inline-flex items-center justify-center w-6 h-6 rounded-full bg-purple-100 text-purple-600 text-[12px] font-bold">
            {{ question.id }}
          </span>
          <span class="text-[11px] text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full">{{ question.category }}</span>
        </div>

        <!-- 题目文本 -->
        <p class="text-[15px] text-gray-800 font-medium leading-relaxed mb-3">{{ question.text }}</p>

        <!-- 选项 -->
        <div class="space-y-2">
          <button
            v-for="opt in question.options"
            :key="opt.label"
            @click="selectOption(question.id, opt.label)"
            class="w-full text-left px-4 py-3 rounded-xl border-2 transition-all duration-200 flex items-start gap-3"
            :class="answers[question.id] === opt.label
              ? 'border-purple-400 bg-purple-50'
              : 'border-gray-100 bg-gray-50 hover:border-gray-200 hover:bg-gray-100'"
          >
            <span
              class="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[13px] font-bold mt-0.5"
              :class="answers[question.id] === opt.label
                ? 'bg-purple-500 text-white'
                : 'bg-gray-200 text-gray-600'"
            >
              {{ opt.label }}
            </span>
            <span
              class="text-[14px] leading-relaxed pt-0.5"
              :class="answers[question.id] === opt.label ? 'text-purple-800 font-medium' : 'text-gray-700'"
            >
              {{ opt.text }}
            </span>
          </button>
        </div>
      </div>

      <!-- 加载更多提示 -->
      <div v-if="filteredQuestions.length === 0" class="text-center py-10">
        <p class="text-gray-400 text-[14px]">该分类下暂无题目</p>
      </div>
    </main>

    <!-- 底部操作栏 -->
    <footer class="sticky bottom-0 bg-white border-t border-gray-200 px-4 py-3 flex items-center gap-3 z-10">
      <button
        @click="resetTest"
        class="px-4 py-2.5 rounded-xl text-[14px] font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
      >
        重置
      </button>
      <button
        @click="submitTest"
        :disabled="answeredCount < 15"
        class="flex-1 py-2.5 rounded-xl text-[15px] font-semibold text-white transition-all duration-200"
        :class="answeredCount >= 15 ? 'bg-purple-500 hover:bg-purple-600 active:scale-[0.98]' : 'bg-gray-300 cursor-not-allowed'"
      >
        {{ answeredCount < 15 ? `还需${15 - answeredCount}题` : '生成画像' }}
      </button>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ChevronLeft } from 'lucide-vue-next'
import { QUESTIONS, getCategories } from '../services/persona.js'
import { personaState, setAnswer, resetPersona, getAnsweredCount, executeAnalysis } from '../stores/persona.js'

const router = useRouter()
const categories = ['全部', ...getCategories()]
const activeCategory = ref('全部')

const answers = computed(() => personaState.answers)
const totalQuestions = QUESTIONS.length
const answeredCount = computed(() => getAnsweredCount())

const filteredQuestions = computed(() => {
  if (activeCategory.value === '全部') return QUESTIONS
  return QUESTIONS.filter(q => q.category === activeCategory.value)
})

const progressPercent = computed(() => {
  return Math.round((answeredCount.value / totalQuestions) * 100)
})

const progressColor = computed(() => {
  if (answeredCount.value < 15) return 'text-gray-500'
  if (answeredCount.value < 50) return 'text-blue-500'
  return 'text-purple-500'
})

const progressBarColor = computed(() => {
  if (answeredCount.value < 15) return 'bg-gray-400'
  if (answeredCount.value < 50) return 'bg-blue-500'
  return 'bg-purple-500'
})

function selectOption(questionId, label) {
  setAnswer(questionId, label)
}

function resetTest() {
  if (confirm('确定要重置所有答题记录吗？')) {
    resetPersona()
  }
}

function submitTest() {
  const result = executeAnalysis()
  if (result.success) {
    router.push('/persona-result')
  } else {
    alert(result.error || '分析失败，请至少答15题后重试')
  }
}

function goBack() {
  router.push('/profile')
}
</script>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
