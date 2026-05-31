<template>
  <div class="min-h-full bg-gray-50">
    <!-- 顶部导航栏 -->
    <header class="sticky top-0 z-10 bg-white shadow-sm">
      <div class="flex items-center justify-between px-4 py-3">
        <button @click="goBack" class="p-1 -ml-1 text-gray-600 hover:text-gray-800">
          <ChevronLeft class="w-6 h-6" />
        </button>
        <h1 class="text-[18px] font-semibold text-gray-800">MBTI 分析</h1>
        <button @click="goToTest" class="p-1 text-blue-500 hover:text-blue-600">
          <RotateCw class="w-5 h-5" />
        </button>
      </div>
    </header>

    <!-- 未完成测试提示 -->
    <div v-if="!result" class="flex flex-col items-center justify-center py-20 px-6">
      <div class="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-4">
        <Brain class="w-10 h-10 text-blue-400" />
      </div>
      <p class="text-[16px] font-medium text-gray-700 mb-2">尚未完成MBTI测试</p>
      <p class="text-[14px] text-gray-500 mb-6 text-center">完成问卷测试或直接输入类型，即可获取旅行偏好分析</p>
      <button
        @click="goToTest"
        class="px-6 py-2.5 rounded-xl bg-blue-500 text-white text-[15px] font-medium hover:bg-blue-600 transition-colors"
      >
        去测试
      </button>
    </div>

    <!-- 结果展示 -->
    <main v-else class="max-w-[960px] mx-auto pb-6">
      <!-- 1. MBTI类型标题卡 -->
      <section class="mx-4 mt-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-6 text-white shadow-lg">
        <div class="text-center">
          <p class="text-[13px] text-blue-200 mb-1">你的MBTI旅行人格</p>
          <h2 class="text-[32px] font-bold mb-1">{{ result.mbtiType }}</h2>
          <p class="text-[18px] font-medium text-blue-100 mb-3">{{ result.mbtiTypeName }}</p>
          <div class="flex items-center justify-center gap-2 mb-3">
            <span class="text-[12px] bg-white/20 px-2 py-1 rounded-full backdrop-blur-sm">
              置信度 {{ result.mbtiConfidence ? ((result.mbtiConfidence * 100).toFixed(0)) : '-' }}%
            </span>
            <span v-if="result.answerCount > 0" class="text-[12px] bg-white/20 px-2 py-1 rounded-full backdrop-blur-sm">
              基于{{ result.answerCount }}题
            </span>
            <span v-else class="text-[12px] bg-white/20 px-2 py-1 rounded-full backdrop-blur-sm">
              直接输入
            </span>
          </div>
        </div>
        <p class="text-[14px] text-blue-100 leading-relaxed text-center">{{ (result.travelStyle || '').split('—')[1] || result.travelStyle || '' }}</p>
      </section>

      <!-- 2. 四维度得分 -->
      <section class="mx-4 mt-4 bg-white rounded-2xl p-5 shadow-sm">
        <h3 class="text-[16px] font-semibold text-gray-800 mb-4">性格维度</h3>
        <div class="space-y-5">
          <div v-for="dim in dimensionData" :key="dim.code">
            <div class="flex items-center justify-between mb-2">
              <span class="text-[13px] font-medium" :style="{ color: dim.leftColor }">{{ dim.leftLabel }} {{ dim.leftPercent }}%</span>
              <span class="text-[12px] text-gray-400">{{ dim.dimName }}</span>
              <span class="text-[13px] font-medium" :style="{ color: dim.rightColor }">{{ dim.rightPercent }}% {{ dim.rightLabel }}</span>
            </div>
            <div class="h-4 bg-gray-100 rounded-full overflow-hidden relative">
              <div
                class="absolute left-0 top-0 h-full rounded-full transition-all duration-700 ease-out"
                :style="{ width: dim.leftPercent + '%', background: `linear-gradient(to right, ${dim.leftColor}, ${dim.leftColor}88)` }"
              ></div>
            </div>
            <div class="flex justify-center mt-1">
              <span class="text-[12px] font-bold px-2 py-0.5 rounded-full" :style="{ backgroundColor: dim.dominantColor + '20', color: dim.dominantColor }">
                偏好: {{ dim.dominantLabel }}
              </span>
            </div>
          </div>
        </div>
      </section>

      <!-- 3. 旅行偏好概览 -->
      <section class="mx-4 mt-4 bg-white rounded-2xl p-5 shadow-sm">
        <h3 class="text-[16px] font-semibold text-gray-800 mb-3">旅行偏好</h3>
        <div class="grid grid-cols-2 gap-3">
          <div class="bg-blue-50 rounded-xl p-3">
            <p class="text-[12px] text-blue-500 mb-1">行程节奏</p>
            <p class="text-[14px] font-semibold text-gray-800">{{ result.pace || '-' }}</p>
          </div>
          <div class="bg-purple-50 rounded-xl p-3">
            <p class="text-[12px] text-purple-500 mb-1">社交偏好</p>
            <p class="text-[14px] font-semibold text-gray-800">{{ result.social || '-' }}</p>
          </div>
          <div class="bg-orange-50 rounded-xl p-3">
            <p class="text-[12px] text-orange-500 mb-1">规划风格</p>
            <p class="text-[14px] font-semibold text-gray-800">{{ result.planningStyle || '-' }}</p>
          </div>
          <div class="bg-green-50 rounded-xl p-3">
            <p class="text-[12px] text-green-500 mb-1">旅行风格</p>
            <p class="text-[14px] font-semibold text-gray-800">{{ (result.travelStyle || '').split('—')[0].trim() || '-' }}</p>
          </div>
        </div>
      </section>

      <!-- 4. 目的地偏好 -->
      <section class="mx-4 mt-4 bg-white rounded-2xl p-5 shadow-sm">
        <h3 class="text-[16px] font-semibold text-gray-800 mb-3">偏好目的地类型</h3>
          <div class="flex flex-wrap gap-2">
            <span
              v-for="(dest, idx) in (result.destinationTypes || [])"
              :key="idx"
              class="px-3 py-1.5 rounded-full text-[13px] font-medium"
              :class="destTagClass(idx)"
            >
              {{ dest }}
            </span>
          </div>
      </section>

      <!-- 5. 活动与住宿 -->
      <section class="mx-4 mt-4 bg-white rounded-2xl p-5 shadow-sm">
        <h3 class="text-[16px] font-semibold text-gray-800 mb-3">活动与住宿</h3>
        <!-- 偏好活动 -->
        <div class="mb-4">
          <p class="text-[13px] text-gray-500 mb-2">偏好活动</p>
          <div class="flex flex-wrap gap-2">
            <span v-for="(act, idx) in (result.activities || [])" :key="idx"
              class="px-2.5 py-1 rounded-lg text-[12px] font-medium bg-blue-50 text-blue-700">
              {{ act }}
            </span>
          </div>
        </div>
        <!-- 住宿偏好 -->
        <div class="mb-4">
          <p class="text-[13px] text-gray-500 mb-2">住宿偏好</p>
          <div class="flex flex-wrap gap-2">
            <span v-for="(acc, idx) in (result.accommodation || [])" :key="idx"
              class="px-2.5 py-1 rounded-lg text-[12px] font-medium bg-purple-50 text-purple-700">
              {{ acc }}
            </span>
          </div>
        </div>
        <!-- 决策因素 -->
        <div class="mb-4">
          <p class="text-[13px] text-gray-500 mb-2">决策因素</p>
          <div class="flex flex-wrap gap-2">
            <span v-for="(factor, idx) in (result.decisionFactors || [])" :key="idx"
              class="px-2.5 py-1 rounded-lg text-[12px] font-medium bg-green-50 text-green-700">
              {{ factor }}
            </span>
          </div>
        </div>
        <!-- 排斥项 -->
        <div>
          <p class="text-[13px] text-gray-500 mb-2">排斥项</p>
          <div class="flex flex-wrap gap-2">
            <span v-for="(av, idx) in (result.aversion || [])" :key="idx"
              class="px-2.5 py-1 rounded-lg text-[12px] font-medium bg-red-50 text-red-600">
              {{ av }}
            </span>
          </div>
        </div>
      </section>

      <!-- 6. 维度详细描述 -->
      <section class="mx-4 mt-4 bg-white rounded-2xl p-5 shadow-sm">
        <h3 class="text-[16px] font-semibold text-gray-800 mb-3">维度解读</h3>
        <div class="space-y-3">
          <div v-for="dim in dimensionDetailData" :key="dim.code"
            class="p-3 rounded-xl border-l-4" :style="{ borderColor: dim.color, backgroundColor: dim.color + '08' }">
            <div class="flex items-center gap-2 mb-1.5">
              <span class="text-[14px] font-semibold" :style="{ color: dim.color }">{{ dim.name }}</span>
            </div>
            <p class="text-[13px] text-gray-700 leading-relaxed">{{ dim.desc }}</p>
          </div>
        </div>
      </section>

      <!-- 7. 旅行建议 -->
      <section class="mx-4 mt-4 bg-white rounded-2xl p-5 shadow-sm">
        <h3 class="text-[16px] font-semibold text-gray-800 mb-3">旅行建议</h3>
        <div class="flex items-start gap-3">
          <div class="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
            <Lightbulb class="w-5 h-5 text-indigo-600" />
          </div>
          <p class="text-[14px] text-gray-600 leading-relaxed">{{ result.tips || '暂无建议' }}</p>
        </div>
      </section>

      <!-- 底部操作 -->
      <div class="mx-4 mt-4 flex gap-3">
        <button
          @click="goToTest"
          class="flex-1 py-3 rounded-xl text-[15px] font-medium bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
        >
          重新测试
        </button>
        <button
          @click="goBack"
          class="flex-1 py-3 rounded-xl text-[15px] font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
        >
          返回个人中心
        </button>
      </div>
    </main>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ChevronLeft, RotateCw, Brain, Lightbulb } from 'lucide-vue-next'
import { DIMENSION_DESCRIPTIONS } from '../services/mbti.js'
import { mbtiState, executeAnalysis } from '../stores/mbti.js'

const router = useRouter()

// 页面加载时，如果有数据但还没执行分析，自动执行
onMounted(() => {
  if (!mbtiState.result) {
    const hasAnswers = Object.keys(mbtiState.answers).length >= 7
    const hasDirectType = !!mbtiState.directType
    if (hasAnswers || hasDirectType) {
      executeAnalysis()
    }
  }
})

const result = computed(() => mbtiState.result)

// 四维度进度条数据
const dimensionData = computed(() => {
  if (!result.value?.dimensions) return []
  const dims = result.value.dimensions
  const configs = [
    { code: 'EI', dimName: '外向-内向', leftLabel: 'E 外向', rightLabel: '内向 I', leftColor: '#f59e0b', rightColor: '#6366f1' },
    { code: 'SN', dimName: '实感-直觉', leftLabel: 'S 实感', rightLabel: '直觉 N', leftColor: '#10b981', rightColor: '#8b5cf6' },
    { code: 'TF', dimName: '思维-情感', leftLabel: 'T 思维', rightLabel: '情感 F', leftColor: '#3b82f6', rightColor: '#ec4899' },
    { code: 'JP', dimName: '判断-感知', leftLabel: 'J 判断', rightLabel: '感知 P', leftColor: '#f97316', rightColor: '#14b8a6' },
  ]
  return configs.map(cfg => {
    const d = dims[cfg.code]
    return {
      ...cfg,
      leftPercent: d?.leftPercent ?? 50,
      rightPercent: d?.rightPercent ?? 50,
      dominantLabel: d?.dominant === cfg.leftLabel.charAt(0) ? cfg.leftLabel : cfg.rightLabel,
      dominantColor: d?.dominant === cfg.leftLabel.charAt(0) ? cfg.leftColor : cfg.rightColor,
    }
  })
})

// 维度详细描述
const dimensionDetailData = computed(() => {
  if (!result.value?.dimensions) return []
  const dims = result.value.dimensions
  const data = []
  for (const [code, desc] of Object.entries(DIMENSION_DESCRIPTIONS)) {
    const d = dims[code]
    if (!d) continue
    const side = d.dominant
    const sideDesc = desc[side]
    if (sideDesc) {
      data.push({ code, name: sideDesc.name, desc: sideDesc.desc, color: sideDesc.color })
    }
  }
  return data
})

function destTagClass(idx) {
  const classes = [
    'bg-blue-100 text-blue-700',
    'bg-purple-100 text-purple-700',
    'bg-green-100 text-green-700',
    'bg-orange-100 text-orange-700',
    'bg-pink-100 text-pink-700',
  ]
  return classes[idx % classes.length]
}

function goToTest() {
  router.push('/mbti-test')
}

function goBack() {
  router.push('/profile')
}
</script>
