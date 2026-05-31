import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './assets/main.css'

// 初始化数据同步服务（确保 onLoginLoad 回调在用户登录前注册）
import './services/dataSync.js'

const app = createApp(App)

// 全局错误处理
app.config.errorHandler = (err, instance, info) => {
  console.error('[Vue Error]', info, err)
}

// 处理未捕获的 Promise 错误
window.addEventListener('unhandledrejection', (event) => {
  console.error('[Unhandled Promise]', event.reason)
  event.preventDefault()
})

app.use(router)

app.mount('#app')
