<template>
  <div class="flex flex-col h-screen w-full max-w-[960px] mx-auto bg-background-card overflow-hidden">
    <!-- 主内容区域 -->
    <div class="flex-1 overflow-y-auto pb-[60px]">
      <router-view v-slot="{ Component, route }">
        <component :is="Component" :key="route.path" />
      </router-view>
    </div>

    <!-- 底部导航栏 -->
    <nav class="fixed bottom-0 left-0 right-0 h-[60px] bg-white border-t border-gray-200 flex items-center justify-around max-w-[960px] mx-auto z-50">
      <router-link
        v-for="item in navItems"
        :key="item.path"
        :to="item.path"
        class="flex flex-col items-center justify-center flex-1 h-full no-underline transition-colors duration-200"
        :class="isActive(item.path) ? 'text-primary' : 'text-text-tertiary hover:text-text-secondary'"
      >
        <component
          :is="item.icon"
          :size="24"
          :stroke-width="isActive(item.path) ? 2.5 : 1.5"
        />
        <span class="text-[12px] mt-1 font-medium">{{ item.label }}</span>
      </router-link>
    </nav>
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router'
import { Home, Sparkles, ListTodo, User } from 'lucide-vue-next'

const route = useRoute()

const navItems = [
  { path: '/home', label: '首页', icon: Home },
  { path: '/ai-plan', label: 'AI规划', icon: Sparkles },
  { path: '/trip-manage', label: '行程', icon: ListTodo },
  { path: '/profile', label: '我的', icon: User }
]

const isActive = (path) => {
  return route.path === path
}
</script>

<style scoped>
nav {
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.router-link-active {
  color: #1890FF;
}
</style>
