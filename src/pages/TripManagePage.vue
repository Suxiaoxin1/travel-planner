<template>
  <div class="min-h-full bg-gradient-to-b from-slate-100 to-gray-200">
    <!-- 顶部标题栏 -->
    <header class="fixed top-0 left-0 right-0 z-30 bg-white/75 backdrop-blur-xl border-b border-gray-100 p-4">
      <div class="flex items-center justify-between max-w-6xl mx-auto">
        <h1 class="text-[20px] font-semibold text-gray-900 tracking-tight">我的行程</h1>
        <button
          @click="$router.push('/ai-plan')"
          class="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-500 text-white text-[13px] font-medium hover:bg-blue-600 transition-all shadow-md shadow-blue-500/25 hover:shadow-lg hover:shadow-blue-500/30"
        >
          <Plus :size="14" />
          新建行程
        </button>
      </div>
    </header>

    <!-- 3D 轮播区域 -->
    <main class="h-screen w-full overflow-hidden pt-20 pb-4 relative">
      <!-- 3D 透视容器 -->
      <div class="carousel-container h-full" ref="carouselRef">
        <div class="carousel-track" :style="{ transform: `translateX(${offsetX}px)` }">
          <!-- 行程卡片 -->
          <div
            v-for="(trip, index) in tripState.trips"
            :key="trip.id"
            class="carousel-card"
            :class="{ active: activeIndex === index }"
            @click="viewTripDetail(trip)"
          >
            <!-- 卡片外框 - 立体框架 -->
            <div class="card-frame">
              <!-- 内部边框高光 -->
              <div class="card-inner-border"></div>

              <!-- 照片 -->
              <img
                :src="trip.coverImage || getDefaultImage(trip.destination)"
                :alt="trip.name"
                class="card-image"
                @error="onImageError($event, trip.destination)"
              />

              <!-- 渐变遮罩 -->
              <div class="card-overlay"></div>

              <!-- 光线反射效果 -->
              <div class="card-reflection"></div>

              <!-- 信息层 -->
              <div class="card-content">
                <span class="status-badge" :class="'status-' + trip.status">{{ statusLabel(trip.status) }}</span>
                <h2 class="destination-name">{{ trip.destination || trip.name }}</h2>
                <div class="info-row">
                  <Calendar :size="13" />
                  <span>{{ formatDateRange(trip.startDate, trip.endDate) }}</span>
                </div>
                <div class="meta-row">
                  <div class="meta-item">
                    <MapPin :size="12" />
                    <span>{{ trip.days?.length || 0 }} 天</span>
                  </div>
                  <div v-if="trip.budget?.total" class="meta-item">
                    <span>¥{{ trip.budget.total.toLocaleString() }}</span>
                  </div>
                </div>
                <button class="action-btn" @click.stop="viewTripDetail(trip)">
                  <span>查看详情</span>
                  <ChevronRight :size="14" />
                </button>
              </div>

              <!-- 底部阴影层 -->
              <div class="card-shadow-layer"></div>
            </div>
          </div>
        </div>

        <!-- 空状态 -->
        <div v-if="tripState.trips.length === 0" class="empty-state">
          <div class="empty-icon-wrap">
            <MapPin :size="32" class="text-gray-300" />
          </div>
          <h3>暂无行程</h3>
          <p>让 AI 帮你规划一段精彩的旅行吧</p>
          <button class="empty-btn" @click="$router.push('/ai-plan')">
            开始 AI 规划
          </button>
        </div>
      </div>

      <!-- 导航控制 - 左右箭头 -->
      <template v-if="tripState.trips.length > 0">
        <!-- 左箭头 -->
        <button
          class="nav-arrow nav-left"
          :class="{ disabled: activeIndex === 0 }"
          @click="prevSlide()"
        >
          <ChevronLeft :size="22" />
        </button>
        <!-- 右箭头 -->
        <button
          class="nav-arrow nav-right"
          :class="{ disabled: activeIndex === tripState.trips.length - 1 }"
          @click="nextSlide()"
        >
          <ChevronRight :size="22" />
        </button>

        <!-- 页码指示器 -->
        <div class="page-dots">
          <button
            v-for="(trip, index) in tripState.trips"
            :key="index"
            class="dot"
            :class="{ active: activeIndex === index }"
            @click="goToSlide(index)"
          ></button>
        </div>
      </template>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, triggerRef } from 'vue'
import { useRouter } from 'vue-router'
import { tripState } from '../stores/trip.js'
import { Calendar, MapPin, ChevronLeft, ChevronRight, Plus } from 'lucide-vue-next'
import { getLandmarkImageUrl, handleImageError } from '../utils/landmarkImages.js'

const router = useRouter()
const carouselRef = ref(null)
const activeIndex = ref(0)

// 卡片尺寸配置（与 CSS 一致）
const CARD_WIDTH = 340
const CARD_GAP = 28
const STEP = CARD_WIDTH + CARD_GAP // 每张卡片占据的总宽度 = 368

// 计算平移量 — 让活跃卡片精确居中于视口水平正中央
const offsetX = computed(() => {
  void viewportWidth.value // 响应窗口变化
  const vw = typeof window !== 'undefined' ? window.innerWidth : viewportWidth.value
  const centerOfViewport = vw / 2           // 视口中心坐标
  const centerOfCard = activeIndex.value * STEP + CARD_WIDTH / 2 // 卡片中心坐标
  return -(centerOfCard - centerOfViewport)  // 平移使两者对齐
})

// 导航方法
const prevSlide = () => {
  if (activeIndex.value > 0) activeIndex.value--
}
const nextSlide = () => {
  if (activeIndex.value < tripState.trips.length - 1) activeIndex.value++
}
const goToSlide = (index) => {
  activeIndex.value = index
}

// 触摸/鼠标拖拽支持
const isDragging = ref(false)
const startX = ref(0)
const currentX = ref(0)

// 窗口尺寸变化时强制刷新偏移计算
const viewportWidth = ref(typeof window !== 'undefined' ? window.innerWidth : 400)

const handleDragStart = (e) => {
  isDragging.value = true
  startX.value = e.type.includes('touch') ? e.touches[0].clientX : e.clientX
}

const handleDragMove = (e) => {
  if (!isDragging.value) return
  currentX.value = e.type.includes('touch') ? e.touches[0].clientX : e.clientX
}

const handleDragEnd = () => {
  if (!isDragging.value) return
  const diff = startX.value - currentX.value
  if (Math.abs(diff) > 50) {
    if (diff > 0 && activeIndex.value < tripState.trips.length - 1) nextSlide()
    else if (diff < 0 && activeIndex.value > 0) prevSlide()
  }
  isDragging.value = false
}

// 键盘支持
const handleKeydown = (e) => {
  if (e.key === 'ArrowLeft') prevSlide()
  else if (e.key === 'ArrowRight') nextSlide()
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
  window.addEventListener('resize', () => { viewportWidth.value = window.innerWidth })
  const el = carouselRef.value
  if (el) {
    el.addEventListener('mousedown', handleDragStart)
    el.addEventListener('mousemove', handleDragMove)
    el.addEventListener('mouseup', handleDragEnd)
    el.addEventListener('mouseleave', handleDragEnd)
    el.addEventListener('touchstart', handleDragStart, { passive: true })
    el.addEventListener('touchmove', handleDragMove, { passive: true })
    el.addEventListener('touchend', handleDragEnd)
  }
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})

// 获取目的地标志性景点照片
const getDefaultImage = (destination) => {
  return getLandmarkImageUrl(destination)
}

// 图片加载失败降级处理
const onImageError = (event, destination) => {
  handleImageError(event, destination)
}

const statusLabel = (status) => {
  const map = { planned: '计划中', draft: '草稿', ongoing: '进行中', completed: '已完成' }
  return map[status] || status
}

const statusStyle = (status) => {
  const map = {
    planned: 'bg-blue-500/90 text-white',
    draft: 'bg-gray-400/80 text-white',
    ongoing: 'bg-emerald-500/90 text-white',
    completed: 'bg-amber-500/85 text-white',
  }
  return map[status] || 'bg-gray-400/80 text-white'
}

const formatDateRange = (start, end) => {
  if (!start) return '未设置日期'
  if (!end) return start
  return `${start} ~ ${end}`
}

const viewTripDetail = (trip) => {
  router.push(`/trip-detail/${trip.id}`)
}
</script>

<style scoped>
/* ========== 轮播容器 ========= */
.carousel-container {
  perspective: 1200px;
  position: relative;
  display: flex;
  align-items: center;
  /* 不设 justify-content，由 JS translateX 完全控制水平位置 */
}

.carousel-track {
  display: flex;
  gap: 28px;
  align-items: center;
  transition: transform 0.55s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  will-change: transform;
  /* padding 由 JS 居中计算控制，此处设为 0 */
}

/* ========== 立体卡片 ========= */
.carousel-card {
  flex-shrink: 0;
  width: 340px;
  height: 480px;
  transition: all 0.55s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  cursor: pointer;
}

/* 非激活卡片的3D效果：缩小 + 旋转 + 降低透明度 */
.carousel-card:not(.active) {
  transform: scale(0.82) rotateY(6deg);
  filter: brightness(0.75) saturate(0.85);
  opacity: 0.65;
}

.carousel-card:not(.active):nth-child(n) {
  /* 左侧卡片向左倾斜 */
}
.carousel-card.active ~ .carousel-card {
  transform: scale(0.82) rotateY(-6deg);
}

/* 激活卡片：正对、放大、高亮 */
.carousel-card.active {
  z-index: 10;
}

.carousel-card:hover {
  filter: brightness(1.02);
}

/* ========== 卡片框架 - 立体外框 ========== */
.card-frame {
  width: 100%;
  height: 100%;
  border-radius: 24px;
  overflow: hidden;
  position: relative;
  box-shadow:
    0 4px 6px rgba(0, 0, 0, 0.04),
    0 12px 28px rgba(0, 0, 0, 0.12),
    0 32px 56px rgba(0, 0, 0, 0.08);
  transition: all 0.4s ease;
  background: #1a1a2e;
}

.card-frame::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 24px;
  padding: 2px;
  background: linear-gradient(
    135deg,
    rgba(255,255,255,0.35),
    rgba(255,255,255,0.05) 30%,
    transparent 50%,
    rgba(255,255,255,0.08) 100%
  );
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  pointer-events: none;
  z-index: 8;
}

.carousel-card.active .card-frame {
  box-shadow:
    0 8px 16px rgba(0, 0, 0, 0.08),
    0 24px 48px rgba(0, 0, 0, 0.18),
    0 48px 80px rgba(0, 0, 0, 0.12),
    0 0 0 1px rgba(255,255,255,0.15);
  transform: translateY(-4px);
}

.carousel-card.active:hover .card-frame {
  box-shadow:
    0 12px 24px rgba(0, 0, 0, 0.12),
    0 32px 64px rgba(0, 0, 0, 0.22),
    0 64px 96px rgba(0, 0, 0, 0.15),
    0 0 0 1px rgba(255,255,255,0.25);
  transform: translateY(-8px);
}

/* 内部边框高光 */
.card-inner-border {
  position: absolute;
  inset: 3px;
  border-radius: 21px;
  pointer-events: none;
  z-index: 7;
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.2), inset 0 -1px 0 rgba(0,0,0,0.15);
}

/* ========== 图片 ========== */
.card-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.carousel-card.active:hover .card-image {
  transform: scale(1.04);
}

/* ========== 渐变遮罩 ========== */
.card-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to top,
    rgba(10, 10, 30, 0.92) 0%,
    rgba(10, 10, 30, 0.55) 28%,
    rgba(10, 10, 30, 0.08) 55%,
    transparent 100%
  );
  z-index: 1;
  border-radius: 24px;
}

/* ========== 光线反射效果 ========== */
.card-reflection {
  position: absolute;
  top: 0;
  left: -60%;
  width: 200%;
  height: 70%;
  background: linear-gradient(
    105deg,
    transparent 38%,
    rgba(255,255,255,0.06) 41%,
    rgba(255,255,255,0.12) 44%,
    rgba(255,255,255,0.06) 47%,
    transparent 50%
  );
  transform: skewX(-14deg);
  pointer-events: none;
  z-index: 2;
  opacity: 0;
  transition: opacity 0.4s ease;
}

.carousel-card.active .card-reflection {
  opacity: 1;
}

/* ========== 内容层 ========== */
.card-content {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 3;
  padding: 24px;
  color: white;
}

/* 状态标签 */
.status-badge {
  display: inline-block;
  padding: 5px 13px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.03em;
  backdrop-filter: blur(12px);
  margin-bottom: 14px;
  text-transform: uppercase;
}

.status-planned { background: rgba(59,130,246,0.85); color: white; }
.status-draft { background: rgba(156,163,175,0.85); color: white; }
.status-ongoing { background: rgba(16,185,129,0.88); color: white; }
.status-completed { background: rgba(245,158,11,0.85); color: white; }

/* 目的地名称 */
.destination-name {
  font-size: 26px;
  font-weight: 800;
  line-height: 1.2;
  margin-bottom: 10px;
  letter-spacing: -0.01em;
  text-shadow: 0 2px 12px rgba(0,0,0,0.35);
}

/* 信息行 */
.info-row {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13.5px;
  color: rgba(255,255,255,0.88);
  margin-bottom: 14px;
}

/* 元数据行 */
.meta-row {
  display: flex;
  gap: 16px;
  margin-bottom: 20px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12.5px;
  color: rgba(255,255,255,0.62);
}

/* 操作按钮 */
.action-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 9px 20px;
  border-radius: 999px;
  background: rgba(255,255,255,0.95);
  color: #1e293b;
  font-size: 13px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  box-shadow: 0 4px 14px rgba(0,0,0,0.18), 0 0 0 1px rgba(255,255,255,0.3);
  transition: all 0.3s ease;
}

.action-btn:hover {
  background: white;
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.22), 0 0 0 1px rgba(255,255,255,0.5);
}

/* ========== 底部阴影层（立体感） ========== */
.card-shadow-layer {
  position: absolute;
  bottom: -20px;
  left: 10%;
  right: 10%;
  height: 30px;
  border-radius: 50%;
  background: radial-gradient(ellipse at center, rgba(0,0,0,0.25) 0%, transparent 70%);
  filter: blur(8px);
  z-index: 0;
  transition: opacity 0.4s ease;
}

.carousel-card.active .card-shadow-layer {
  opacity: 1;
}

/* ========== 导航箭头 ========== */
.nav-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 20;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: rgba(255,255,255,0.92);
  border: 1px solid rgba(0,0,0,0.06);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #374151;
  box-shadow: 0 4px 16px rgba(0,0,0,0.1), 0 1px 3px rgba(0,0,0,0.06);
  transition: all 0.25s ease;
  backdrop-filter: blur(8px);
}

.nav-arrow:hover {
  background: white;
  transform: translateY(-50%) scale(1.08);
  box-shadow: 0 6px 20px rgba(0,0,0,0.14);
}

.nav-arrow.disabled {
  opacity: 0.3;
  cursor: not-allowed;
  pointer-events: none;
}

.nav-left { left: 16px; }
.nav-right { right: 16px; }

/* ========== 页码指示器 ========== */
.page-dots {
  position: absolute;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 8px;
  z-index: 20;
}

.dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: rgba(107,114,128,0.35);
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  padding: 0;
}

.dot.active {
  width: 24px;
  border-radius: 4px;
  background: linear-gradient(90deg, #3b82f6, #6366f1);
  box-shadow: 0 2px 8px rgba(59,130,246,0.35);
}

.dot:hover:not(.active) {
  background: rgba(107,114,128,0.6);
}

/* ========== 空状态 ========== */
.empty-state {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: #64748b;
}

.empty-icon-wrap {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: rgba(148,163,184,0.12);
  border: 2px dashed rgba(148,163,184,0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;
}

.empty-state h3 {
  font-size: 22px;
  font-weight: 700;
  color: #334155;
  margin: 0;
}

.empty-state p {
  font-size: 15px;
  color: #94a3b8;
  margin: 0 0 16px;
}

.empty-btn {
  padding: 12px 28px;
  border-radius: 999px;
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: white;
  font-size: 15px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  box-shadow: 0 4px 16px rgba(59,130,246,0.3);
  transition: all 0.25s ease;
}

.empty-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(59,130,246,0.4);
}
</style>
