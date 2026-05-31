<template>
  <div class="min-h-full bg-gray-50">
    <!-- 顶部导航栏 -->
    <header class="sticky top-0 z-10 bg-white shadow-sm">
      <div class="flex items-center justify-between px-4 py-3">
        <button @click="goBack" class="p-1 -ml-1 text-gray-600 hover:text-gray-800">
          <ChevronLeft class="w-6 h-6" />
        </button>
        <h1 class="text-[18px] font-semibold text-gray-800">人物画像</h1>
        <button @click="goToTest" class="p-1 text-purple-500 hover:text-purple-600">
          <RotateCw class="w-5 h-5" />
        </button>
      </div>
    </header>

    <!-- 未完成测试提示 -->
    <div v-if="!result" class="flex flex-col items-center justify-center py-20 px-6">
      <div class="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mb-4">
        <UserCircle class="w-10 h-10 text-purple-400" />
      </div>
      <p class="text-[16px] font-medium text-gray-700 mb-2">尚未完成画像测试</p>
      <p class="text-[14px] text-gray-500 mb-6 text-center">完成至少15道题目，即可生成你的专属人物画像</p>
      <button
        @click="goToTest"
        class="px-6 py-2.5 rounded-xl bg-purple-500 text-white text-[15px] font-medium hover:bg-purple-600 transition-colors"
      >
        去测试
      </button>
    </div>

    <!-- 画像结果展示 -->
    <main v-else class="max-w-[960px] mx-auto pb-6">
      <!-- 1. 画像标题卡 -->
      <section class="mx-4 mt-4 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl p-6 text-white shadow-lg">
        <div class="text-center">
          <p class="text-[13px] text-purple-200 mb-1">你的旅行画像</p>
          <h2 class="text-[24px] font-bold mb-2">{{ result.profileTitle }}</h2>
          <div class="flex items-center justify-center gap-2 mb-3">
            <span class="text-[12px] bg-white/20 px-2 py-1 rounded-full backdrop-blur-sm">
              置信度 {{ result.confidence ? ((result.confidence * 100).toFixed(0)) : '-' }}%
            </span>
            <span class="text-[12px] bg-white/20 px-2 py-1 rounded-full backdrop-blur-sm">
              基于{{ result.answeredCount }}题
            </span>
          </div>
        </div>
        <p class="text-[14px] text-purple-100 leading-relaxed text-center">{{ result.profileDesc }}</p>
      </section>

      <!-- 2. 三维雷达图 -->
      <section class="mx-4 mt-4 bg-white rounded-2xl p-5 shadow-sm">
        <h3 class="text-[16px] font-semibold text-gray-800 mb-4">核心属性</h3>
        <div class="flex justify-center mb-4">
          <svg width="260" height="240" viewBox="0 0 260 240">
            <!-- 背景网格 -->
            <polygon
              v-for="level in [0.33, 0.66, 1]"
              :key="'grid-'+level"
              :points="radarGridPoints(level)"
              fill="none"
              stroke="#e5e7eb"
              stroke-width="1"
            />
            <!-- 轴线 -->
            <line v-for="i in 3" :key="'axis-'+i"
              :x1="130" :y1="120"
              :x2="radarVertex(i-1).x" :y2="radarVertex(i-1).y"
              stroke="#e5e7eb" stroke-width="1"
            />
            <!-- 数据区域 -->
            <polygon
              :points="radarDataPoints"
              fill="rgba(139, 92, 246, 0.2)"
              stroke="rgb(139, 92, 246)"
              stroke-width="2"
            />
            <!-- 数据点 -->
            <circle
              v-for="(point, idx) in radarDataPointArray"
              :key="'point-'+idx"
              :cx="point.x" :cy="point.y" r="5"
              fill="rgb(139, 92, 246)"
              stroke="white" stroke-width="2"
            />
            <!-- 标签 -->
            <text v-for="(label, idx) in dimensionLabels" :key="'label-'+idx"
              :x="labelPosition(idx).x" :y="labelPosition(idx).y"
              text-anchor="middle"
              class="text-[12px] fill-gray-700"
              font-weight="600"
            >{{ label.name }}</text>
            <text v-for="(label, idx) in dimensionLabels" :key="'value-'+idx"
              :x="labelPosition(idx).x" :y="labelPosition(idx).y + 16"
              text-anchor="middle"
              class="text-[11px]"
              :fill="label.color"
            >{{ label.value }}</text>
          </svg>
        </div>

        <!-- 三维度指标条 -->
        <div class="space-y-4">
          <!-- 冒险指数 -->
          <div>
            <div class="flex items-center justify-between mb-1.5">
              <div class="flex items-center gap-2">
                <span class="text-[13px] font-semibold text-gray-700">🏔️ 冒险指数</span>
                <span class="text-[12px] px-2 py-0.5 rounded-full font-medium"
                  :class="levelBadgeClass(result.adventureLevel)">
                  {{ result.adventureLabel }}
                </span>
              </div>
              <span class="text-[14px] font-bold text-gray-800">{{ result.adventureScore }}</span>
            </div>
            <div class="h-3 bg-gray-100 rounded-full overflow-hidden">
              <div class="h-full rounded-full transition-all duration-700 ease-out bg-gradient-to-r from-orange-400 to-red-500"
                :style="{ width: result.adventureScore + '%' }"></div>
            </div>
          </div>
          <!-- 社交指数 -->
          <div>
            <div class="flex items-center justify-between mb-1.5">
              <div class="flex items-center gap-2">
                <span class="text-[13px] font-semibold text-gray-700">🎉 社交指数</span>
                <span class="text-[12px] px-2 py-0.5 rounded-full font-medium"
                  :class="levelBadgeClass(result.socialLevel)">
                  {{ result.socialLabel }}
                </span>
              </div>
              <span class="text-[14px] font-bold text-gray-800">{{ result.socialScore }}</span>
            </div>
            <div class="h-3 bg-gray-100 rounded-full overflow-hidden">
              <div class="h-full rounded-full transition-all duration-700 ease-out bg-gradient-to-r from-blue-400 to-purple-500"
                :style="{ width: result.socialScore + '%' }"></div>
            </div>
          </div>
          <!-- 预算指数 -->
          <div>
            <div class="flex items-center justify-between mb-1.5">
              <div class="flex items-center gap-2">
                <span class="text-[13px] font-semibold text-gray-700">💰 预算指数</span>
                <span class="text-[12px] px-2 py-0.5 rounded-full font-medium"
                  :class="levelBadgeClass(result.budgetLevel)">
                  {{ result.budgetLabel }}
                </span>
              </div>
              <span class="text-[14px] font-bold text-gray-800">{{ result.budgetScore }}</span>
            </div>
            <div class="h-3 bg-gray-100 rounded-full overflow-hidden">
              <div class="h-full rounded-full transition-all duration-700 ease-out bg-gradient-to-r from-green-400 to-emerald-500"
                :style="{ width: result.budgetScore + '%' }"></div>
            </div>
          </div>
        </div>
      </section>

      <!-- 3. 旅行风格 -->
      <section class="mx-4 mt-4 bg-white rounded-2xl p-5 shadow-sm">
        <h3 class="text-[16px] font-semibold text-gray-800 mb-3">旅行风格</h3>
        <div class="flex items-center gap-3 mb-3">
          <div class="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <Compass class="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <p class="text-[15px] font-semibold text-gray-800">{{ result.travelStyle || '-' }}</p>
          </div>
        </div>
        <p class="text-[14px] text-gray-600 leading-relaxed">{{ result.tips || '暂无建议' }}</p>
      </section>

      <!-- 4. 推荐目的地 -->
      <section class="mx-4 mt-4 bg-white rounded-2xl p-5 shadow-sm">
        <h3 class="text-[16px] font-semibold text-gray-800 mb-3">推荐目的地</h3>
        <div class="grid grid-cols-2 gap-2.5">
          <div
            v-for="(dest, idx) in (result.destinations || [])"
            :key="idx"
            class="relative overflow-hidden rounded-xl bg-gradient-to-br h-24 flex items-end"
            :class="destGradient(idx)"
          >
            <div class="w-full p-3 bg-gradient-to-t from-black/40 to-transparent">
              <p class="text-[15px] font-bold text-white">{{ dest }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- 5. 维度详细描述 -->
      <section class="mx-4 mt-4 bg-white rounded-2xl p-5 shadow-sm">
        <h3 class="text-[16px] font-semibold text-gray-800 mb-3">详细分析</h3>
        <div class="space-y-4">
          <div v-for="dim in dimensionDetails" :key="dim.key"
            class="p-3 rounded-xl" :class="dim.bgClass">
            <div class="flex items-center gap-2 mb-1.5">
              <span class="text-[14px]">{{ dim.icon }}</span>
              <span class="text-[14px] font-semibold" :class="dim.textClass">{{ dim.name }}</span>
              <span class="text-[12px] px-2 py-0.5 rounded-full bg-white/60 font-medium" :class="dim.textClass">
                {{ dim.label }}
              </span>
            </div>
            <p class="text-[13px] text-gray-700 leading-relaxed">{{ dim.desc }}</p>
          </div>
        </div>
      </section>

      <!-- 底部操作 -->
      <div class="mx-4 mt-4 flex gap-3">
        <button
          @click="goToTest"
          class="flex-1 py-3 rounded-xl text-[15px] font-medium bg-purple-50 text-purple-600 hover:bg-purple-100 transition-colors"
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
import { ChevronLeft, RotateCw, UserCircle, Compass } from 'lucide-vue-next'
import { DIMENSION_DESCRIPTIONS } from '../services/persona.js'
import { personaState, executeAnalysis } from '../stores/persona.js'

const router = useRouter()

// 页面加载时，如果有答案但还没执行分析，自动执行
onMounted(() => {
  if (!personaState.result && Object.keys(personaState.answers).length >= 15) {
    executeAnalysis()
  }
})

const result = computed(() => personaState.result)

// 雷达图参数
const centerX = 130
const centerY = 120
const radius = 90

function radarVertex(index) {
  const angle = (Math.PI * 2 * index) / 3 - Math.PI / 2
  return {
    x: centerX + radius * Math.cos(angle),
    y: centerY + radius * Math.sin(angle)
  }
}

function radarGridPoints(level) {
  return [0, 1, 2].map(i => {
    const angle = (Math.PI * 2 * i) / 3 - Math.PI / 2
    return `${centerX + radius * level * Math.cos(angle)},${centerY + radius * level * Math.sin(angle)}`
  }).join(' ')
}

const radarDataPoints = computed(() => {
  if (!result.value) return ''
  const scores = [
    (result.value.adventureScore || 0) / 100,
    (result.value.socialScore || 0) / 100,
    (result.value.budgetScore || 0) / 100
  ]
  return scores.map((s, i) => {
    const angle = (Math.PI * 2 * i) / 3 - Math.PI / 2
    return `${centerX + radius * s * Math.cos(angle)},${centerY + radius * s * Math.sin(angle)}`
  }).join(' ')
})

const radarDataPointArray = computed(() => {
  if (!result.value) return []
  const scores = [
    (result.value.adventureScore || 0) / 100,
    (result.value.socialScore || 0) / 100,
    (result.value.budgetScore || 0) / 100
  ]
  return scores.map((s, i) => {
    const angle = (Math.PI * 2 * i) / 3 - Math.PI / 2
    return {
      x: centerX + radius * s * Math.cos(angle),
      y: centerY + radius * s * Math.sin(angle)
    }
  })
})

const dimensionLabels = computed(() => {
  if (!result.value) return []
  return [
    { name: '冒险', value: result.value.adventureLabel, color: '#ef4444' },
    { name: '社交', value: result.value.socialLabel, color: '#8b5cf6' },
    { name: '预算', value: result.value.budgetLabel, color: '#10b981' }
  ]
})

function labelPosition(index) {
  const angle = (Math.PI * 2 * index) / 3 - Math.PI / 2
  const labelRadius = radius + 28
  return {
    x: centerX + labelRadius * Math.cos(angle),
    y: centerY + labelRadius * Math.sin(angle)
  }
}

const dimensionDetails = computed(() => {
  if (!result.value) return []
  return [
    {
      key: 'adventure',
      name: '冒险指数',
      icon: '🏔️',
      label: result.value.adventureLabel,
      desc: DIMENSION_DESCRIPTIONS.adventure[result.value.adventureLevel],
      bgClass: 'bg-orange-50',
      textClass: 'text-orange-600'
    },
    {
      key: 'social',
      name: '社交指数',
      icon: '🎉',
      label: result.value.socialLabel,
      desc: DIMENSION_DESCRIPTIONS.social[result.value.socialLevel],
      bgClass: 'bg-purple-50',
      textClass: 'text-purple-600'
    },
    {
      key: 'budget',
      name: '预算指数',
      icon: '💰',
      label: result.value.budgetLabel,
      desc: DIMENSION_DESCRIPTIONS.budget[result.value.budgetLevel],
      bgClass: 'bg-green-50',
      textClass: 'text-green-600'
    }
  ]
})

function levelBadgeClass(level) {
  const map = {
    low: 'bg-blue-50 text-blue-600',
    mid: 'bg-yellow-50 text-yellow-600',
    high: 'bg-red-50 text-red-600'
  }
  return map[level] || ''
}

function destGradient(idx) {
  const gradients = [
    'from-purple-400 to-indigo-500',
    'from-blue-400 to-cyan-500',
    'from-emerald-400 to-teal-500',
    'from-orange-400 to-amber-500',
    'from-rose-400 to-pink-500',
    'from-violet-400 to-purple-500'
  ]
  return gradients[idx % gradients.length]
}

function goToTest() {
  router.push('/persona-test')
}

function goBack() {
  router.push('/profile')
}
</script>
