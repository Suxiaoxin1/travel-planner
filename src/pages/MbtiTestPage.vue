<template>
  <div class="min-h-full bg-gray-50 flex flex-col">
    <!-- 顶部导航栏 -->
    <header class="sticky top-0 z-10 bg-white shadow-sm">
      <div class="flex items-center justify-between px-4 py-3">
        <button @click="goBack" class="p-1 -ml-1 text-gray-600 hover:text-gray-800">
          <ChevronLeft class="w-6 h-6" />
        </button>
        <h1 class="text-[18px] font-semibold text-gray-800">MBTI 测试</h1>
        <div class="w-8"></div>
      </div>
      <!-- 模式切换标签 -->
      <div class="flex px-4 pb-3 gap-2">
        <button
          @click="switchMode('questionnaire')"
          class="flex-1 py-2 rounded-xl text-[14px] font-medium transition-all duration-200"
          :class="currentMode === 'questionnaire' ? 'bg-blue-500 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
        >
          问卷测试
        </button>
        <button
          @click="switchMode('direct')"
          class="flex-1 py-2 rounded-xl text-[14px] font-medium transition-all duration-200"
          :class="currentMode === 'direct' ? 'bg-blue-500 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
        >
          直接输入类型
        </button>
      </div>
    </header>

    <!-- 问卷测试模式 -->
    <template v-if="currentMode === 'questionnaire'">
      <!-- 进度条 -->
      <div class="bg-white px-4 pb-3 border-b border-gray-100">
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
          <span class="text-[11px] text-gray-400">建议答完全部28题</span>
          <span class="text-[11px]" :class="answeredCount >= 7 ? 'text-green-500' : 'text-gray-400'">
            {{ answeredCount >= 7 ? '✓ 已达最低要求' : `至少7题` }}
          </span>
        </div>
      </div>

      <!-- 维度筛选 -->
      <div class="bg-white border-b border-gray-100 px-4 py-2 flex gap-2 overflow-x-auto no-scrollbar">
        <button
          v-for="dim in dimensionList"
          :key="dim"
          @click="activeDimension = dim"
          class="flex-shrink-0 px-3 py-1.5 rounded-full text-[13px] font-medium transition-colors duration-200"
          :class="activeDimension === dim ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
        >
          {{ dim }}
        </button>
      </div>

      <!-- 题目列表 -->
      <main class="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        <div
          v-for="question in filteredQuestions"
          :key="question.id"
          class="bg-white rounded-2xl p-4 shadow-sm transition-all duration-200"
          :class="{ 'ring-2 ring-blue-200': answers[question.id] }"
        >
          <!-- 题号和维度 -->
          <div class="flex items-center gap-2 mb-2">
            <span class="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-[12px] font-bold">
              {{ question.id }}
            </span>
            <span class="text-[11px] text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full">{{ dimensionLabel(question.dimension) }}</span>
          </div>

          <!-- 题目文本 -->
          <p class="text-[15px] text-gray-800 font-medium leading-relaxed mb-3">{{ question.text }}</p>

          <!-- 选项 (A/B) -->
          <div class="space-y-2">
            <button
              v-for="opt in question.options"
              :key="opt.label"
              @click="selectOption(question.id, opt.label)"
              class="w-full text-left px-4 py-3 rounded-xl border-2 transition-all duration-200 flex items-start gap-3"
              :class="answers[question.id] === opt.label ? 'border-blue-400 bg-blue-50' : 'border-gray-100 bg-gray-50 hover:border-gray-200 hover:bg-gray-100'"
            >
              <span
                class="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[13px] font-bold mt-0.5"
                :class="answers[question.id] === opt.label ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'"
              >
                {{ opt.label }}
              </span>
              <span
                class="text-[14px] leading-relaxed pt-0.5"
                :class="answers[question.id] === opt.label ? 'text-blue-800 font-medium' : 'text-gray-700'"
              >
                {{ opt.text }}
              </span>
            </button>
          </div>
        </div>

        <div v-if="filteredQuestions.length === 0" class="text-center py-10">
          <p class="text-gray-400 text-[14px]">该维度下暂无题目</p>
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
          :disabled="answeredCount < 7"
          class="flex-1 py-2.5 rounded-xl text-[15px] font-semibold text-white transition-all duration-200"
          :class="answeredCount >= 7 ? 'bg-blue-500 hover:bg-blue-600 active:scale-[0.98]' : 'bg-gray-300 cursor-not-allowed'"
        >
          {{ answeredCount < 7 ? `还需${7 - answeredCount}题` : '生成分析' }}
        </button>
      </footer>
    </template>

    <!-- 直接输入类型模式 -->
    <template v-else>
      <main class="flex-1 overflow-y-auto px-4 py-4">
        <div class="bg-white rounded-2xl p-5 shadow-sm mb-4">
          <h3 class="text-[16px] font-semibold text-gray-800 mb-2">选择你的MBTI类型</h3>
          <p class="text-[13px] text-gray-500 mb-4">如果你已经知道自己的MBTI类型，可以直接选择</p>

          <!-- 类型网格 -->
          <div class="grid grid-cols-4 gap-2">
            <button
              v-for="type in allTypes"
              :key="type"
              @click="selectType(type)"
              class="py-3 rounded-xl text-[14px] font-bold transition-all duration-200 border-2"
              :class="selectedType === type
                ? 'border-blue-500 bg-blue-500 text-white shadow-md scale-[1.02]'
                : 'border-gray-200 bg-gray-50 text-gray-700 hover:border-blue-300 hover:bg-blue-50'"
            >
              {{ type }}
            </button>
          </div>
        </div>

        <!-- 类型说明 -->
        <div v-if="selectedType" class="bg-white rounded-2xl p-5 shadow-sm mb-4">
          <div class="flex items-center gap-3 mb-3">
            <div class="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Brain class="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h4 class="text-[18px] font-bold text-gray-800">{{ selectedType }} · {{ getTypeName(selectedType) }}</h4>
              <p class="text-[13px] text-gray-500">{{ getTypeStyle(selectedType) }}</p>
            </div>
          </div>
        </div>

        <!-- 底部操作 -->
        <div class="flex gap-3">
          <button
            @click="resetTest"
            class="px-4 py-2.5 rounded-xl text-[14px] font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            重置
          </button>
          <button
            @click="submitDirect"
            :disabled="!selectedType"
            class="flex-1 py-2.5 rounded-xl text-[15px] font-semibold text-white transition-all duration-200"
            :class="selectedType ? 'bg-blue-500 hover:bg-blue-600 active:scale-[0.98]' : 'bg-gray-300 cursor-not-allowed'"
          >
            {{ selectedType ? '生成分析' : '请选择类型' }}
          </button>
        </div>
      </main>
    </template>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ChevronLeft, Brain } from 'lucide-vue-next'
import { QUESTIONS, VALID_MBTI_TYPES, MBTI_PROFILES, getDimensionList } from '../services/mbti.js'
import { mbtiState, setAnswer, resetMbti, getAnsweredCount, setDirectType, setInputMode, executeAnalysisByResponses, executeAnalysisByType } from '../stores/mbti.js'

const router = useRouter()

const currentMode = ref(mbtiState.inputMode || 'questionnaire')
const dimensionList = getDimensionList()
const activeDimension = ref('全部')
const selectedType = ref(mbtiState.directType || '')

const answers = computed(() => mbtiState.answers)
const totalQuestions = QUESTIONS.length
const answeredCount = computed(() => getAnsweredCount())
const allTypes = VALID_MBTI_TYPES

const filteredQuestions = computed(() => {
  if (activeDimension.value === '全部') return QUESTIONS
  const dimMap = { '外向-内向': 'EI', '实感-直觉': 'SN', '思维-情感': 'TF', '判断-感知': 'JP' }
  const dimCode = dimMap[activeDimension.value]
  if (!dimCode) return QUESTIONS
  return QUESTIONS.filter(q => q.dimension === dimCode)
})

const progressPercent = computed(() => Math.round((answeredCount.value / totalQuestions) * 100))

const progressColor = computed(() => {
  if (answeredCount.value < 7) return 'text-gray-500'
  if (answeredCount.value < 20) return 'text-blue-500'
  return 'text-green-500'
})

const progressBarColor = computed(() => {
  if (answeredCount.value < 7) return 'bg-gray-400'
  if (answeredCount.value < 20) return 'bg-blue-500'
  return 'bg-green-500'
})

function dimensionLabel(dim) {
  const map = { EI: 'E-I', SN: 'S-N', TF: 'T-F', JP: 'J-P' }
  return map[dim] || dim
}

function selectOption(questionId, label) {
  setAnswer(questionId, label)
}

function selectType(type) {
  selectedType.value = type
  setDirectType(type)
}

function switchMode(mode) {
  currentMode.value = mode
  setInputMode(mode)
}

function getTypeName(type) {
  return MBTI_PROFILES[type]?.mbti_type_name || ''
}

function getTypeStyle(type) {
  const p = MBTI_PROFILES[type]
  if (!p) return ''
  return p.travel_style.split('—')[0].trim()
}

function resetTest() {
  if (confirm('确定要重置所有测试记录吗？')) {
    resetMbti()
    selectedType.value = ''
  }
}

function submitTest() {
  const result = executeAnalysisByResponses()
  if (result.success) {
    router.push('/mbti-result')
  } else {
    alert(result.error || '分析失败，请重试')
  }
}

function submitDirect() {
  if (!selectedType.value) return
  const result = executeAnalysisByType()
  if (result.success) {
    router.push('/mbti-result')
  } else {
    alert(result.error || '分析失败，请重试')
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
