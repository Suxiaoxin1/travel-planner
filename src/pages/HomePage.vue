<template>
  <div class="min-h-full bg-gray-50">
    <!-- 顶部标题栏 -->
    <header class="sticky top-0 z-10 bg-white/95 backdrop-blur-md shadow-sm">
      <div class="px-4 pt-3 pb-2">
        <div class="flex items-center justify-between">
          <h1 class="text-[22px] font-bold text-gray-900 tracking-tight">
            行！行！<span class="text-blue-500">好！！！</span>
          </h1>
          <span class="text-[12px] text-gray-400">{{ filteredVlogs.length }} 个景点</span>
        </div>
        <p class="text-[13px] text-gray-400 mt-0.5">发现世界的每一处精彩</p>
      </div>

      <!-- 分类导航栏 -->
      <nav class="px-2 pb-2">
        <div class="flex overflow-x-auto scrollbar-hide gap-1">
          <button
            v-for="cat in categories"
            :key="cat.key"
            @click="activeCategory = cat.key"
            class="flex-shrink-0 px-3 py-1.5 rounded-full text-[13px] font-medium transition-all duration-200 whitespace-nowrap"
            :class="activeCategory === cat.key
              ? 'bg-blue-500 text-white shadow-md shadow-blue-200'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
          >
            {{ cat.icon }} {{ cat.label }}
          </button>
        </div>
      </nav>
    </header>

    <!-- 主体区域 -->
    <main class="px-3 pt-3 pb-4">
      <!-- 加载骨架屏 -->
      <div v-if="isLoading" class="grid grid-cols-2 gap-3">
        <div
          v-for="i in 6"
          :key="'skeleton-' + i"
          class="bg-white rounded-2xl overflow-hidden shadow-sm animate-pulse"
        >
          <div class="aspect-[4/3] bg-gray-200"></div>
          <div class="p-3 space-y-2">
            <div class="h-4 bg-gray-200 rounded w-3/4"></div>
            <div class="h-3 bg-gray-100 rounded w-1/2"></div>
          </div>
        </div>
      </div>

      <!-- Vlog卡片网格 -->
      <div v-else class="grid grid-cols-2 gap-3">
        <div
          v-for="item in filteredVlogs"
          :key="item.id"
          class="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer group active:scale-[0.97]"
          @click="openVideo(item)"
        >
          <!-- 图片展示区 -->
          <div class="relative aspect-[4/3] overflow-hidden bg-gray-100">
            <!-- 加载中/失败占位（底层，始终渲染） -->
            <div
              class="absolute inset-0 flex flex-col items-center justify-center transition-opacity duration-300"
              :class="[
                imageStates[item.id]?.loaded ? 'opacity-0' : 'opacity-100',
                getPlaceholderBg(item.tag)
              ]"
            >
              <!-- 加载中动画 -->
              <div v-if="imageStates[item.id]?.loading" class="flex flex-col items-center">
                <div class="w-6 h-6 border-2 border-white/40 border-t-white rounded-full animate-spin mb-1.5"></div>
                <span class="text-[10px] text-white/60">加载中</span>
              </div>
              <!-- 加载失败占位 -->
              <template v-else-if="imageStates[item.id]?.failed">
                <span class="text-[28px] mb-1">{{ getTagIcon(item.tag) }}</span>
                <span class="text-[11px] text-white/80 font-medium">{{ item.name }}</span>
              </template>
              <!-- 初始占位（带模糊预览效果） -->
              <template v-else>
                <span class="text-[28px] mb-1 opacity-60">{{ getTagIcon(item.tag) }}</span>
                <span class="text-[11px] text-white/70 font-medium">{{ item.name }}</span>
              </template>
            </div>
            <!-- 实际图片（带渐进加载） -->
            <img
              v-if="item.image"
              :src="getImageSrc(item)"
              :alt="item.name"
              class="w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
              :class="imageStates[item.id]?.loaded ? 'opacity-100' : 'opacity-0'"
              loading="lazy"
              decoding="async"
              @load="onImageLoad(item.id)"
              @error="onImageError($event, item)"
            />
            <!-- 标签 -->
            <span
              class="absolute top-2 left-2 px-1.5 py-0.5 rounded text-[10px] font-bold tracking-wide"
              :class="tagBadgeClass(item.tag)"
            >
              {{ tagLabel(item.tag) }}
            </span>
            <!-- 视频数量 -->
            <span
              v-if="item.videos && item.videos.length > 1"
              class="absolute top-2 right-2 px-1.5 py-0.5 rounded text-[10px] font-medium bg-black/50 text-white"
            >
              {{ item.videos.length }} 视频
            </span>
            <!-- 播放按钮遮罩 -->
            <div class="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center">
              <div class="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-lg">
                <Play class="w-5 h-5 text-blue-500 ml-0.5" />
              </div>
            </div>
          </div>

          <!-- 文字区域 -->
          <div class="p-2.5">
            <h3 class="text-[13px] font-semibold text-gray-800 leading-tight line-clamp-2 group-hover:text-blue-600 transition-colors">
              {{ item.name }}
            </h3>
            <p class="text-[11px] text-gray-400 mt-1 line-clamp-1">{{ item.description }}</p>
            <div class="flex items-center justify-between mt-1.5">
              <span class="text-[11px] text-gray-400 flex items-center">
                <MapPin class="w-3 h-3 mr-0.5 flex-shrink-0" />
                <span class="truncate max-w-[80px]">{{ item.regionLabel }}</span>
              </span>
              <button
                @click.stop="sendToAI(item)"
                class="flex items-center gap-0.5 px-2 py-1 rounded-lg text-[10px] font-medium bg-blue-50 text-blue-500 hover:bg-blue-100 active:bg-blue-200 transition-colors"
              >
                <Sparkles class="w-3 h-3" />
                <span>AI规划</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div
        v-if="!isLoading && filteredVlogs.length === 0"
        class="flex flex-col items-center justify-center py-20"
      >
        <div class="text-[48px] mb-3">🎬</div>
        <p class="text-[15px] text-gray-400 font-medium">该分类暂无景点</p>
        <p class="text-[12px] text-gray-300 mt-1">换个分类看看吧</p>
      </div>
    </main>

    <!-- 视频选择弹窗（多视频时） -->
    <Teleport to="body">
      <Transition name="fade">
        <div
          v-if="showVideoModal"
          class="fixed inset-0 z-[100] flex items-end justify-center"
          @click.self="showVideoModal = false"
        >
          <div class="absolute inset-0 bg-black/50" @click="showVideoModal = false"></div>
          <div class="relative w-full max-w-[960px] bg-white rounded-t-2xl p-5 pb-8 animate-slide-up">
            <div class="w-10 h-1 bg-gray-300 rounded-full mx-auto mb-4"></div>
            <h3 class="text-[16px] font-semibold text-gray-800 mb-3">
              {{ modalItem?.name }} - 选择视频
            </h3>
            <div class="space-y-2">
              <a
                v-for="(video, idx) in modalItem?.videos"
                :key="idx"
                :href="video.url"
                target="_blank"
                rel="noopener noreferrer"
                class="flex items-center space-x-3 p-3 rounded-xl bg-gray-50 hover:bg-blue-50 transition-colors"
              >
                <div class="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                  <Play class="w-4 h-4 text-white ml-0.5" />
                </div>
                <span class="text-[14px] text-gray-700 flex-1">{{ video.title }}</span>
                <ExternalLink class="w-4 h-4 text-gray-400" />
              </a>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, reactive } from 'vue'
import { Play, MapPin, ExternalLink, Sparkles } from 'lucide-vue-next'
import { categories, vlogList, getVlogsByCategory, getPrimaryVideoUrl } from '../data/vlogData.js'
import { getWikimediaThumb } from '../utils/imageUtils.js'
import { setPendingInput } from '../stores/chat.js'
import { useRouter } from 'vue-router'

const router = useRouter()
const activeCategory = ref('all')
const isLoading = ref(true)
const showVideoModal = ref(false)
const modalItem = ref(null)

// 图片加载状态追踪：{ id: { loading, loaded, failed, retryCount } }
const imageStates = reactive({})

// 初始化图片状态
function initImageState(itemId) {
  if (!imageStates[itemId]) {
    imageStates[itemId] = { loading: true, loaded: false, failed: false, retryCount: 0 }
  }
}

// 获取图片src（优先使用缩略图）
function getImageSrc(item) {
  initImageState(item.id)
  if (imageStates[item.id].retryCount > 0) {
    // 重试时使用原图
    return item.image
  }
  return getWikimediaThumb(item.image, 400)
}

// 筛选后的列表
const filteredVlogs = computed(() => {
  return getVlogsByCategory(activeCategory.value)
})

// 标签样式
const tagBadgeClass = (tag) => {
  const map = {
    popular: 'bg-red-500/90 text-white',
    hidden: 'bg-purple-500/90 text-white',
    overseas: 'bg-blue-500/90 text-white'
  }
  return map[tag] || 'bg-gray-500/90 text-white'
}

const tagLabel = (tag) => {
  const map = { popular: '热门', hidden: '小众', overseas: '国外' }
  return map[tag] || ''
}

const getTagIcon = (tag) => {
  const map = { popular: '🔥', hidden: '🔮', overseas: '✈️' }
  return map[tag] || '🌍'
}

// 分类占位背景色
const placeholderBgs = {
  popular: 'bg-gradient-to-br from-red-400 to-orange-500',
  hidden: 'bg-gradient-to-br from-purple-400 to-indigo-500',
  overseas: 'bg-gradient-to-br from-blue-400 to-cyan-500'
}

function getPlaceholderBg(tag) {
  return placeholderBgs[tag] || 'bg-gradient-to-br from-gray-400 to-gray-500'
}

// 图片加载成功
function onImageLoad(itemId) {
  if (imageStates[itemId]) {
    imageStates[itemId].loading = false
    imageStates[itemId].loaded = true
    imageStates[itemId].failed = false
  }
}

// 图片错误处理：自动重试一次（用原图），再失败则显示占位
function onImageError(event, item) {
  const state = imageStates[item.id]
  if (!state) return

  if (state.retryCount < 1) {
    // 重试：用原图URL
    state.retryCount++
    state.loading = true
    // 强制浏览器重新加载（加时间戳避免缓存）
    const originalUrl = item.image
    const separator = originalUrl.includes('?') ? '&' : '?'
    event.target.src = `${originalUrl}${separator}_retry=${Date.now()}`
  } else {
    // 重试也失败，显示占位
    state.loading = false
    state.loaded = false
    state.failed = true
    item.image = ''
  }
}

// 点击卡片
function openVideo(item) {
  if (!item.videos || item.videos.length === 0) return

  if (item.videos.length === 1) {
    // 单视频直接跳转
    window.open(item.videos[0].url, '_blank', 'noopener,noreferrer')
  } else {
    // 多视频弹出选择
    modalItem.value = item
    showVideoModal.value = true
  }
}

// AI规划：提取卡片文本 → 导入AI规划页输入框
function sendToAI(item) {
  const tagMap = { popular: '热门景点', hidden: '小众秘境', overseas: '国外景点' }
  const tagLabel = tagMap[item.tag] || ''
  const prompt = `我想去【${item.name}】旅行，这是${tagLabel}（${item.regionLabel}）。${item.description}。请帮我规划一份详细的旅行方案，包括交通、住宿、美食和游玩路线推荐。`
  setPendingInput(prompt)
  router.push('/ai-plan')
}

// 模拟加载
onMounted(() => {
  setTimeout(() => {
    isLoading.value = false
  }, 500)
})
</script>

<style scoped>
/* 隐藏滚动条 */
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

/* 多行文本截断 */
.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* 骨架屏脉冲 */
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

/* 加载旋转 */
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
.animate-spin {
  animation: spin 0.8s linear infinite;
}

/* 弹窗上滑动画 */
@keyframes slideUp {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}
.animate-slide-up {
  animation: slideUp 0.25s ease-out;
}

/* 弹窗淡入淡出 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 响应式 */
@media (min-width: 640px) {
  main > div {
    grid-template-columns: repeat(3, 1fr) !important;
  }
}
@media (min-width: 960px) {
  main > div {
    grid-template-columns: repeat(4, 1fr) !important;
  }
}
</style>
