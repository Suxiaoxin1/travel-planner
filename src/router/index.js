import { createRouter, createWebHistory } from 'vue-router'
import MainLayout from '../layouts/MainLayout.vue'
import { userState } from '../stores/user.js'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../pages/LoginPage.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/',
    component: MainLayout,
    children: [
      {
        path: '',
        redirect: '/home'
      },
      {
        path: 'home',
        name: 'Home',
        component: () => import('../pages/HomePage.vue')
      },
      {
        path: 'ai-plan',
        name: 'AIPlan',
        component: () => import('../pages/AIPlanPage.vue')
      },
      {
        path: 'trip-manage',
        name: 'TripManage',
        component: () => import('../pages/TripManagePage.vue')
      },
      {
        path: 'trip-detail/:id',
        name: 'TripDetail',
        component: () => import('../pages/TripDetailPage.vue')
      },
      {
        path: 'profile',
        name: 'Profile',
        component: () => import('../pages/ProfilePage.vue')
      },
      {
        path: 'settings',
        name: 'Settings',
        component: () => import('../pages/SettingsPage.vue')
      },
      {
        path: 'feedback',
        name: 'Feedback',
        component: () => import('../pages/FeedbackPage.vue')
      },
      {
        path: 'help',
        name: 'Help',
        component: () => import('../pages/HelpPage.vue')
      },
      {
        path: 'wechat-callback',
        name: 'WechatCallback',
        component: () => import('../pages/WechatCallback.vue'),
        meta: { requiresAuth: false }
      },
      {
        path: 'persona-test',
        name: 'PersonaTest',
        component: () => import('../pages/PersonaTestPage.vue')
      },
      {
        path: 'persona-result',
        name: 'PersonaResult',
        component: () => import('../pages/PersonaResultPage.vue')
      },
      {
        path: 'mbti-test',
        name: 'MbtiTest',
        component: () => import('../pages/MbtiTestPage.vue')
      },
      {
        path: 'mbti-result',
        name: 'MbtiResult',
        component: () => import('../pages/MbtiResultPage.vue')
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/home'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  }
})

// 路由守卫
router.beforeEach((to) => {
  const isLoggedIn = userState.isLoggedIn

  // 判断目标路由是否需要认证
  // 如果 ANY matched route 明确标记了 requiresAuth: false，则不需要认证
  const requiresAuth = !to.matched.some(record => record.meta.requiresAuth === false)

  if (!requiresAuth) {
    // 不需要认证的页面
    // 已登录用户访问登录页，重定向到首页
    if (isLoggedIn && to.path === '/login') {
      return { path: '/home', replace: true }
    }
    return true
  }

  // 需要认证的页面
  if (!isLoggedIn) {
    // 保存目标路径，登录后可以跳回
    return { path: '/login', query: { redirect: to.fullPath }, replace: true }
  }

  return true
})

export default router
