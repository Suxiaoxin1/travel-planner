<template>
  <div class="min-h-full bg-gray-50">
    <!-- 顶部导航栏 -->
    <header class="sticky top-0 z-10 bg-white px-4 py-3 shadow-sm flex items-center">
      <button @click="goBack" class="mr-3 p-1 rounded-full hover:bg-gray-100 transition-colors">
        <ChevronLeft class="w-6 h-6 text-gray-700" />
      </button>
      <h1 class="text-[18px] font-semibold text-gray-800 flex-1">帮助中心</h1>
    </header>

    <main class="max-w-[960px] mx-auto pb-8">
      <!-- 搜索栏 -->
      <section class="mt-4 mx-4">
        <div class="relative">
          <Search class="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="搜索问题..."
            class="w-full pl-12 pr-4 py-3 bg-white rounded-2xl shadow-sm border-none focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all text-[14px] text-gray-800 placeholder-gray-400"
          />
        </div>
      </section>

      <!-- 问题分类导航 -->
      <section class="mt-4 mx-4">
        <div class="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide">
          <button
            v-for="category in categories"
            :key="category.value"
            @click="activeCategory = category.value"
            class="px-4 py-2 rounded-full whitespace-nowrap text-[14px] font-medium transition-all duration-200"
            :class="activeCategory === category.value
              ? 'bg-blue-500 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-100'"
          >
            {{ category.label }}
          </button>
        </div>
      </section>

      <!-- FAQ 折叠面板 -->
      <section class="mt-4 mx-4">
        <div class="bg-white rounded-2xl shadow-sm overflow-hidden">
          <!-- 过滤后的问题 -->
          <div v-if="filteredFaqs.length > 0">
            <div
              v-for="(faq, index) in filteredFaqs"
              :key="faq.id"
              class="border-b border-gray-100 last:border-b-0"
            >
              <!-- 问题标题 -->
              <button
                @click="toggleFaq(faq.id)"
                class="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors text-left"
              >
                <div class="flex items-center space-x-3 flex-1">
                  <HelpCircle class="w-5 h-5 text-blue-500 flex-shrink-0" />
                  <span class="text-[15px] text-gray-800 font-medium">{{ faq.question }}</span>
                </div>
                <ChevronDown
                  class="w-5 h-5 text-gray-400 flex-shrink-0 transition-transform duration-200"
                  :class="{ 'transform rotate-180': expandedFaqs.includes(faq.id) }"
                />
              </button>

              <!-- 答案内容 -->
              <div
                v-if="expandedFaqs.includes(faq.id)"
                class="px-5 pb-4 pt-0"
              >
                <div class="pl-8 pr-4 py-3 bg-blue-50 rounded-xl">
                  <p class="text-[14px] text-gray-700 leading-relaxed">{{ faq.answer }}</p>
                  <div v-if="faq.link" class="mt-3">
                    <button
                      @click="handleLinkClick(faq.link)"
                      class="text-[14px] text-blue-500 font-medium hover:text-blue-600 transition-colors"
                    >
                      {{ faq.linkText || '了解更多 →' }}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 无结果 -->
          <div v-else class="px-5 py-12 text-center">
            <Search class="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p class="text-[14px] text-gray-500">未找到相关问题</p>
            <p class="text-[12px] text-gray-400 mt-1">请尝试其他关键词或联系客服</p>
          </div>
        </div>
      </section>

      <!-- 联系客服 -->
      <section class="mt-4 mx-4">
        <div class="bg-white rounded-2xl shadow-sm overflow-hidden">
          <h3 class="px-5 py-3 text-[14px] font-semibold text-gray-500 uppercase tracking-wider">
            联系我们
          </h3>
          <div class="divide-y divide-gray-100">
            <div
              class="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-gray-50 transition-colors"
              @click="contactService('phone')"
            >
              <div class="flex items-center space-x-3">
                <div class="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                  <Phone class="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p class="text-[15px] text-gray-800 font-medium">客服电话</p>
                  <p class="text-[12px] text-gray-500 mt-0.5">400-123-4567</p>
                </div>
              </div>
              <ChevronRight class="w-5 h-5 text-gray-400" />
            </div>

            <div
              class="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-gray-50 transition-colors"
              @click="contactService('chat')"
            >
              <div class="flex items-center space-x-3">
                <div class="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <MessageSquare class="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p class="text-[15px] text-gray-800 font-medium">在线客服</p>
                  <p class="text-[12px] text-gray-500 mt-0.5">工作时间 9:00-18:00</p>
                </div>
              </div>
              <ChevronRight class="w-5 h-5 text-gray-400" />
            </div>

            <div
              class="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-gray-50 transition-colors"
              @click="contactService('email')"
            >
              <div class="flex items-center space-x-3">
                <div class="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Mail class="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p class="text-[15px] text-gray-800 font-medium">邮件支持</p>
                  <p class="text-[12px] text-gray-500 mt-0.5">support@travel-app.com</p>
                </div>
              </div>
              <ChevronRight class="w-5 h-5 text-gray-400" />
            </div>
          </div>
        </div>
      </section>

      <!-- 常见问题快捷入口 -->
      <section class="mt-4 mx-4">
        <div class="bg-white rounded-2xl shadow-sm p-5">
          <h3 class="text-[15px] font-semibold text-gray-800 mb-3">常见问题</h3>
          <div class="space-y-2">
            <div
              v-for="(item, index) in quickLinks"
              :key="index"
              class="flex items-center justify-between py-2 cursor-pointer hover:text-blue-500 transition-colors"
              @click="searchQuery = item"
            >
              <span class="text-[14px] text-gray-700">{{ item }}</span>
              <ChevronRight class="w-4 h-4 text-gray-400" />
            </div>
          </div>
        </div>
      </section>

      <div class="text-center py-6">
        <p class="text-[12px] text-gray-400">旅行助手 v1.0.0</p>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import {
  ChevronLeft,
  Search,
  HelpCircle,
  ChevronDown,
  Phone,
  MessageSquare,
  Mail,
  ChevronRight
} from 'lucide-vue-next'

const router = useRouter()

// 搜索关键词
const searchQuery = ref('')

// 当前选中的分类
const activeCategory = ref('all')

// 展开的FAQ ID列表
const expandedFaqs = ref([])

// 问题分类
const categories = [
  { label: '全部', value: 'all' },
  { label: '账号问题', value: 'account' },
  { label: '行程规划', value: 'trip' },
  { label: '支付问题', value: 'payment' },
  { label: '功能使用', value: 'feature' },
  { label: '其他', value: 'other' }
]

// FAQ 数据
const faqs = [
  {
    id: 1,
    category: 'account',
    question: '如何注册账号？',
    answer: '您可以使用手机号或微信账号快速注册。点击首页的"登录"按钮，选择注册方式，按照提示完成注册即可。'
  },
  {
    id: 2,
    category: 'account',
    question: '如何修改个人信息？',
    answer: '登录后，进入"我的"页面，点击头像或昵称区域，即可进入个人信息编辑页面，修改头像、昵称、手机号等信息。'
  },
  {
    id: 3,
    category: 'trip',
    question: '如何创建新的行程？',
    answer: '在首页点击"新建行程"按钮，或进入"行程管理"页面，点击右上角的"+"号，按照提示填写行程信息即可。'
  },
  {
    id: 4,
    category: 'trip',
    question: '如何分享行程给朋友？',
    answer: '在行程详情页面，点击右上角的"分享"按钮，可以选择生成分享链接或二维码，发送给微信好友或朋友圈。'
  },
  {
    id: 5,
    category: 'payment',
    question: '支持哪些支付方式？',
    answer: '目前支持微信支付、支付宝、银行卡支付。部分服务可能支持Apple Pay和Google Pay。'
  },
  {
    id: 6,
    category: 'payment',
    question: '如何申请退款？',
    answer: '进入"我的订单"页面，找到需要退款的订单，点击"申请退款"按钮，按照提示填写退款原因，提交后等待审核。一般情况下，退款会在3-7个工作日内到账。'
  },
  {
    id: 7,
    category: 'feature',
    question: '如何使用AI规划行程功能？',
    answer: '进入"AI规划行程"页面，输入您的出行目的地、时间、预算、人数等信息，AI将自动为您生成最优行程方案。您可以根据需要调整行程安排。'
  },
  {
    id: 8,
    category: 'feature',
    question: 'MBTI测试结果有什么用？',
    answer: 'MBTI测试结果将帮助AI更好地了解您的性格特点和旅行偏好，从而为您推荐更适合的旅行目的地和活动类型。测试结果会保存在您的账号中，随时可以查看。'
  },
  {
    id: 9,
    category: 'other',
    question: '如何联系客服？',
    answer: '您可以通过以下方式联系客服：1. 拨打客服电话 400-123-4567；2. 在帮助中心点击"在线客服"；3. 发送邮件至 support@travel-app.com。我们的工作时间是周一至周五 9:00-18:00。'
  }
]

// 快捷链接
const quickLinks = [
  '如何注册账号',
  '如何创建行程',
  '支持哪些支付方式',
  '如何使用AI规划'
]

// 过滤FAQ（根据搜索关键词和分类）
const filteredFaqs = computed(() => {
  let result = faqs

  // 按分类过滤
  if (activeCategory.value !== 'all') {
    result = result.filter(faq => faq.category === activeCategory.value)
  }

  // 按搜索关键词过滤
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(faq =>
      faq.question.toLowerCase().includes(query) ||
      faq.answer.toLowerCase().includes(query)
    )
  }

  return result
})

// 返回上一页
const goBack = () => {
  router.back()
}

// 切换FAQ展开/收起
const toggleFaq = (id) => {
  const index = expandedFaqs.value.indexOf(id)
  if (index > -1) {
    expandedFaqs.value.splice(index, 1)
  } else {
    expandedFaqs.value.push(id)
  }
}

// 处理链接点击
const handleLinkClick = (link) => {
  console.log('点击链接:', link)
  alert('即将跳转到相关页面')
}

// 联系客服
const contactService = (type) => {
  switch (type) {
    case 'phone':
      if (confirm('是否拨打客服电话 400-123-4567？')) {
        window.location.href = 'tel:400-123-4567'
      }
      break
    case 'chat':
      alert('在线客服功能即将上线，敬请期待！')
      break
    case 'email':
      window.location.href = 'mailto:support@travel-app.com'
      break
  }
}
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
</style>
