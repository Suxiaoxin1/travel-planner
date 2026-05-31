<template>
  <div class="min-h-screen bg-gray-50">
    <!-- 顶部导航 -->
    <header class="sticky top-0 z-20 bg-white border-b border-gray-200">
      <div class="max-w-3xl mx-auto flex items-center justify-between px-4 py-3">
        <button @click="goBack" class="flex items-center gap-1 text-gray-600 hover:text-gray-900 text-sm">
          <ArrowLeft :size="18" />
          <span>返回</span>
        </button>
        <h1 class="text-base font-semibold text-gray-900">{{ isEditing ? '编辑行程' : '行程详情' }}</h1>
        <button
          v-if="!isEditing"
          @click="isEditing = true"
          class="text-sm text-blue-500 font-medium hover:text-blue-600"
        >
          编辑
        </button>
        <button
          v-else
          @click="saveChanges"
          class="px-3 py-1 rounded-lg bg-blue-500 text-white text-sm font-medium hover:bg-blue-600"
        >
          保存
        </button>
      </div>
    </header>

    <!-- 内容 -->
    <main v-if="trip" class="max-w-3xl mx-auto px-4 py-6 space-y-6">
      <!-- 封面图 -->
      <div class="relative rounded-xl overflow-hidden h-48 bg-gray-200">
        <img
          v-if="trip.coverImage || getDefaultImage(trip.destination)"
          :src="trip.coverImage || getDefaultImage(trip.destination)"
          class="w-full h-full object-cover"
          @error="onImageError($event, trip.destination)"
        />
        <div class="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
        <div class="absolute bottom-4 left-4 right-4">
          <input
            v-if="isEditing"
            v-model="editData.name"
            class="w-full bg-white/20 backdrop-blur-sm text-white text-xl font-bold px-3 py-2 rounded-lg border border-white/30 placeholder-white/60"
            placeholder="行程名称"
          />
          <h2 v-else class="text-xl font-bold text-white drop-shadow">{{ cleanTripName || trip.name }}</h2>
        </div>
      </div>

      <!-- 基本信息 -->
      <section class="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <h3 class="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">基本信息</h3>
        <div class="space-y-4">
          <div class="flex items-center gap-3">
            <MapPin :size="18" class="text-gray-400 flex-shrink-0" />
            <div class="flex-1">
              <label class="text-xs text-gray-400">目的地</label>
              <input v-if="isEditing" v-model="editData.destination" class="w-full text-sm text-gray-900 border-b border-gray-200 focus:border-blue-400 focus:outline-none py-1" />
              <p v-else class="text-sm text-gray-900">{{ extractCleanTitle(trip.destination) || trip.destination || '未设置' }}</p>
            </div>
          </div>
          <div class="flex items-center gap-3">
            <Calendar :size="18" class="text-gray-400 flex-shrink-0" />
            <div class="flex-1">
              <label class="text-xs text-gray-400">出行日期</label>
              <div v-if="isEditing" class="flex items-center gap-2">
                <input v-model="editData.startDate" type="date" class="text-sm text-gray-900 border-b border-gray-200 focus:border-blue-400 focus:outline-none py-1" />
                <span class="text-gray-400">至</span>
                <input v-model="editData.endDate" type="date" class="text-sm text-gray-900 border-b border-gray-200 focus:border-blue-400 focus:outline-none py-1" />
              </div>
              <p v-else class="text-sm text-gray-900">{{ formatDateRange(trip.startDate, trip.endDate) }}</p>
            </div>
          </div>
          <div class="flex items-center gap-3">
            <Tag :size="18" class="text-gray-400 flex-shrink-0" />
            <div class="flex-1">
              <label class="text-xs text-gray-400">状态</label>
              <select v-if="isEditing" v-model="editData.status" class="w-full text-sm text-gray-900 border-b border-gray-200 focus:border-blue-400 focus:outline-none py-1 bg-transparent">
                <option value="planned">计划中</option>
                <option value="draft">草稿</option>
                <option value="ongoing">进行中</option>
                <option value="completed">已完成</option>
              </select>
              <p v-else class="text-sm text-gray-900">
                <span class="inline-block px-2 py-0.5 rounded-full text-xs font-medium" :class="statusStyle(trip.status)">{{ statusLabel(trip.status) }}</span>
              </p>
            </div>
          </div>
          <div class="flex items-center gap-3">
            <Wallet :size="18" class="text-gray-400 flex-shrink-0" />
            <div class="flex-1">
              <label class="text-xs text-gray-400">预算</label>
              <input v-if="isEditing" v-model.number="editData.budget.total" type="number" class="w-full text-sm text-gray-900 border-b border-gray-200 focus:border-blue-400 focus:outline-none py-1" placeholder="输入预算金额" />
              <p v-else class="text-sm text-gray-900">{{ trip.budget?.total ? `¥${trip.budget.total.toLocaleString()}` : '未设置' }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- 每日行程 -->
      <section class="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-sm font-semibold text-gray-500 uppercase tracking-wide">每日行程</h3>
          <button v-if="isEditing" @click="addDay" class="text-xs text-blue-500 font-medium hover:text-blue-600 flex items-center gap-1">
            <Plus :size="14" />
            添加一天
          </button>
        </div>

        <div v-if="editData.days && editData.days.length > 0" class="space-y-4">
          <div v-for="(day, dayIdx) in editData.days" :key="dayIdx" class="border border-gray-100 rounded-lg overflow-hidden">
            <!-- 日期标题 -->
            <div class="flex items-center justify-between px-4 py-2.5 bg-gray-50 border-b border-gray-100">
              <div class="flex items-center gap-2">
                <span class="w-6 h-6 rounded-full bg-blue-500 text-white text-xs font-bold flex items-center justify-center">{{ dayIdx + 1 }}</span>
                <template v-if="isEditing">
                  <input v-model="day.date" type="date" class="text-sm text-gray-700 border-b border-gray-200 focus:border-blue-400 focus:outline-none bg-transparent" />
                  <input v-model="day.title" class="text-sm text-gray-700 border-b border-gray-200 focus:border-blue-400 focus:outline-none bg-transparent flex-1" placeholder="今日主题" />
                </template>
                <template v-else>
                  <span class="text-sm font-medium text-gray-700">{{ day.date || `第${dayIdx + 1}天` }}</span>
                  <span v-if="day.title" class="text-sm text-gray-400">· {{ day.title }}</span>
                </template>
              </div>
              <button v-if="isEditing" @click="removeDay(dayIdx)" class="text-gray-400 hover:text-red-500 transition-colors">
                <Trash2 :size="14" />
              </button>
            </div>

            <!-- 活动列表 -->
            <div class="px-4 py-3 space-y-3">
              <div v-for="(activity, actIdx) in day.activities" :key="actIdx" class="flex gap-3 items-start">
                <div class="flex flex-col items-center pt-1">
                  <div class="w-2 h-2 rounded-full" :class="activityColor(activity.type)"></div>
                  <div v-if="actIdx < day.activities.length - 1" class="w-0.5 h-8 bg-gray-200 mt-1"></div>
                </div>
                <div class="flex-1 min-w-0">
                  <template v-if="isEditing">
                    <div class="space-y-1.5">
                      <div class="flex gap-2">
                        <input v-model="activity.time" class="text-xs text-gray-500 border-b border-gray-200 focus:border-blue-400 focus:outline-none w-20 bg-transparent" placeholder="时间" />
                        <select v-model="activity.type" class="text-xs text-gray-500 border-b border-gray-200 focus:border-blue-400 focus:outline-none bg-transparent">
                          <option value="sightseeing">景点</option>
                          <option value="food">美食</option>
                          <option value="transport">交通</option>
                          <option value="hotel">住宿</option>
                          <option value="shopping">购物</option>
                          <option value="other">其他</option>
                        </select>
                      </div>
                      <input v-model="activity.name" class="w-full text-sm text-gray-900 border-b border-gray-200 focus:border-blue-400 focus:outline-none bg-transparent" placeholder="活动描述" />
                      <input v-model="activity.note" class="text-xs text-gray-500 border-b border-gray-200 focus:border-blue-400 focus:outline-none w-full bg-transparent" placeholder="备注/地点" />
                    </div>
                  </template>
                  <template v-else>
                    <div class="flex items-center gap-2">
                      <span v-if="activity.time" class="text-xs text-blue-500 font-medium">{{ activity.time }}</span>
                      <span class="text-sm text-gray-900">{{ activity.name || activity.description }}</span>
                    </div>
                    <p v-if="activity.note || activity.location" class="text-xs text-gray-400 mt-0.5">{{ activity.note || activity.location }}</p>
                  </template>
                </div>
                <button v-if="isEditing" @click="removeActivity(dayIdx, actIdx)" class="text-gray-300 hover:text-red-400 transition-colors mt-1">
                  <X :size="12" />
                </button>
              </div>
              <button v-if="isEditing" @click="addActivity(dayIdx)" class="text-xs text-blue-500 font-medium hover:text-blue-600 flex items-center gap-1 py-1">
                <Plus :size="12" />
                添加活动
              </button>
            </div>
          </div>
        </div>

        <div v-else class="text-center py-8 text-gray-400 text-sm">
          <p>暂无每日行程安排</p>
          <button v-if="isEditing" @click="addDay" class="mt-2 text-blue-500 hover:text-blue-600 text-sm font-medium">添加第一天</button>
        </div>
      </section>

      <!-- AI 原始方案 -->
      <section v-if="trip.aiPlanContent" class="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <div class="flex items-center justify-between mb-3">
          <h3 class="text-sm font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-2">
            <Sparkles :size="14" class="text-purple-400" />
            AI 生成方案
          </h3>
          <button @click="showAiPlan = !showAiPlan" class="text-xs text-blue-500 font-medium hover:text-blue-600">
            {{ showAiPlan ? '收起' : '展开' }}
          </button>
        </div>
        <div v-if="showAiPlan" class="ai-content text-gray-700 bg-gray-50 rounded-lg p-4 text-[13px] leading-relaxed">{{ cleanedAiContent }}</div>
      </section>

      <!-- 备注 -->
      <section class="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <h3 class="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">备注</h3>
        <textarea v-if="isEditing" v-model="editData.notes" rows="3" class="w-full text-sm text-gray-900 border border-gray-200 rounded-lg p-3 focus:border-blue-400 focus:outline-none resize-none" placeholder="添加备注..."></textarea>
        <p v-else class="text-sm text-gray-700 whitespace-pre-wrap">{{ trip.notes || '无备注' }}</p>
      </section>

      <!-- 删除按钮 -->
      <section v-if="isEditing" class="pb-8">
        <button @click="handleDelete" class="w-full py-3 rounded-xl border border-red-200 text-red-500 text-sm font-medium hover:bg-red-50 transition-colors">删除此行程</button>
      </section>
    </main>

    <div v-else class="flex items-center justify-center h-96 text-gray-400">
      <p>行程不存在或已删除</p>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { getTripById, updateTrip, deleteTrip } from '../stores/trip.js'
import { ArrowLeft, MapPin, Calendar, Tag, Wallet, Plus, Trash2, X, Sparkles } from 'lucide-vue-next'
import { getLandmarkImageUrl, handleImageError } from '../utils/landmarkImages.js'
import { cleanAiContent, extractCleanTitle } from '../services/ai.js'

const router = useRouter()
const route = useRoute()

const trip = ref(null)
const isEditing = ref(false)
const showAiPlan = ref(true)

// 清理后的 AI 内容（自动去除多余符号）
const cleanedAiContent = computed(() => {
  if (!trip.value?.aiPlanContent) return ''
  // 如果内容已经是清理过的（没有多余符号），直接返回；否则清理
  const content = trip.value.aiPlanContent
  // 检测是否有需要清理的符号
  if (/【\*】|^\s*[-*_]{3,}|\|\|.*\|\|/m.test(content)) {
    return cleanAiContent(content)
  }
  return content
})

// 清理后的行程名称
const cleanTripName = computed(() => {
  if (!trip.value?.name) return ''
  return extractCleanTitle(trip.value.name)
})

const editData = reactive({
  name: '',
  destination: '',
  startDate: '',
  endDate: '',
  status: 'planned',
  budget: { total: null },
  days: [],
  notes: ''
})

const getDefaultImage = (destination) => {
  return getLandmarkImageUrl(destination)
}

const onImageError = (event, destination) => {
  handleImageError(event, destination)
}

const statusLabel = (status) => {
  const map = { planned: '计划中', draft: '草稿', ongoing: '进行中', completed: '已完成' }
  return map[status] || status
}

const statusStyle = (status) => {
  const map = {
    planned: 'bg-blue-100 text-blue-700',
    draft: 'bg-gray-100 text-gray-600',
    ongoing: 'bg-green-100 text-green-700',
    completed: 'bg-amber-100 text-amber-700',
  }
  return map[status] || 'bg-gray-100 text-gray-600'
}

const activityColor = (type) => {
  const map = {
    sightseeing: 'bg-blue-400',
    food: 'bg-orange-400',
    transport: 'bg-green-400',
    hotel: 'bg-purple-400',
    shopping: 'bg-pink-400',
    other: 'bg-gray-400',
  }
  return map[type] || 'bg-blue-400'
}

const formatDateRange = (start, end) => {
  if (!start) return '未设置日期'
  if (!end) return start
  return `${start} ~ ${end}`
}

/**
 * 规范化行程数据：兼容后端 name/note 和前端 description/location 两种字段名
 */
const normalizeDays = (days) => {
  if (!days || !Array.isArray(days)) return []
  return days.map(day => ({
    date: day.date || '',
    title: day.title || '',
    activities: (day.activities || []).map(act => ({
      time: act.time || '',
      name: act.name || act.description || '',
      type: act.type || 'sightseeing',
      note: act.note || act.location || '',
      // 保留旧字段名防止数据丢失
      description: act.description || act.name || '',
      location: act.location || act.note || '',
    }))
  }))
}

// 加载行程数据
onMounted(() => {
  const tripId = route.params.id
  const found = getTripById(tripId)
  if (found) {
    trip.value = found
    Object.assign(editData, {
      name: found.name || '',
      destination: found.destination || '',
      startDate: found.startDate || '',
      endDate: found.endDate || '',
      status: found.status || 'planned',
      budget: { total: found.budget?.total || null },
      days: normalizeDays(found.days),
      notes: found.notes || ''
    })
  }
})

// 保存修改
const saveChanges = () => {
  updateTrip(route.params.id, {
    name: editData.name,
    destination: editData.destination,
    startDate: editData.startDate,
    endDate: editData.endDate,
    status: editData.status,
    budget: editData.budget,
    days: editData.days,
    notes: editData.notes
  })
  trip.value = getTripById(route.params.id)
  isEditing.value = false
}

// 添加一天
const addDay = () => {
  editData.days.push({
    date: '',
    title: '',
    activities: []
  })
}

// 删除一天
const removeDay = (dayIdx) => {
  editData.days.splice(dayIdx, 1)
}

// 添加活动
const addActivity = (dayIdx) => {
  editData.days[dayIdx].activities.push({
    time: '',
    name: '',
    type: 'sightseeing',
    note: ''
  })
}

// 删除活动
const removeActivity = (dayIdx, actIdx) => {
  editData.days[dayIdx].activities.splice(actIdx, 1)
}

// 删除行程
const handleDelete = () => {
  if (confirm('确定要删除此行程吗？删除后无法恢复。')) {
    deleteTrip(route.params.id)
    router.replace('/trip-manage')
  }
}

// 返回
const goBack = () => {
  if (isEditing.value) {
    if (confirm('有未保存的修改，确定要离开吗？')) {
      router.back()
    }
  } else {
    router.back()
  }
}
</script>

<style scoped>
/* AI 生成内容渲染样式 */
.ai-content {
  white-space: pre-wrap;
  word-break: break-word;
  line-height: 1.8;
}

/* 标题层级 */
.ai-content :deep(strong) {
  color: #1f2937;
  font-weight: 600;
}

/* 列表项美化 */
.ai-content::v-deep(*) {
  margin: 0.25em 0;
}
</style>
