# 🗺️ 旅行助手 (Travel Planner)

<div align="center">

**基于 AI 的智能旅行规划全栈应用**

[![Demo](https://img.shields.io/badge/在线演示-Vercel-blue)](https://travel-planner-two-sigma.vercel.app)
[![License](https://img.shields.io/badge/license-MIT-green)](./LICENSE)
[![Vue 3](https://img.shields.io/badge/Vue-3.4-42b883)](https://vuejs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4-646cff)](https://vitejs.dev/)
[![Python](https://img.shields.io/badge/Python-3.8+-3776ab)](https://python.org/)
[![Flask](https://img.shields.io/badge/Flask-3.0-black)](https://flask.palletsprojects.com/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-06b6d4)](https://tailwindcss.com/)

</div>

---

## 📖 项目简介

旅行助手是一款 AI 驱动的智能旅行规划平台。通过接入本地大语言模型（Ollama），用户可以与 AI 对话生成个性化旅行方案，一键导入行程管理。同时集成 MBTI 性格测试和人物画像分析，为旅行推荐提供科学依据。

---

## ✨ 核心功能

### 🤖 AI 智能旅行规划
- 接入 **Ollama** 本地大模型，支持流式对话
- AI 生成结构化旅行方案（日程、预算、清单）
- 一键将 AI 规划导入个人行程管理
- 智能目的地图片匹配与文本清理

### 🗓️ 行程管理
- 创建、查看、编辑、删除旅行行程
- 行程详情展示（路线、住宿、餐饮、景点）
- 支持从 AI 对话批量导入行程
- 时间段可视化展示

### 🎯 人物画像分析
- 多道性格题目，生成用户画像报告
- 基于大模型的个性化旅游偏好分析
- 为旅行推荐提供数据支撑

### 🧠 MBTI 性格测试
- 标准 MBTI 测试流程（16 型人格）
- 详细的性格分析报告
- 结合性格特征推荐旅行风格

### 🌍 国际化支持
| 语言 | 状态 |
|------|------|
| 简体中文 (zh-CN) | ✅ 完成 |
| English (en) | ✅ 完成 |
| 日本語 (ja) | 🔧 可扩展 |
| 한국어 (ko) | 🔧 可扩展 |

### 🎨 个性化设置
- **深色模式**：跟随系统 / 浅色 / 深色 三档切换
- **字体大小**：小(14px) / 中(16px) / 大(18px) 三档滑动调节
- **通知开关**：推送 / 邮件 / 短信
- **隐私设置**：个性化推荐 / 位置服务

### 📬 用户反馈
- 问题反馈、功能建议、使用咨询、其他
- 表单提交自动发送至指定邮箱
- 支持附件上传（JPG/PNG/GIF/PDF）

### 🔗 微信集成
- 微信 OAuth 授权登录
- 微信内快捷访问

---

## 🛠️ 技术栈

| 层级 | 技术 | 说明 |
|------|------|------|
| **前端框架** | Vue 3.4 | Composition API + 响应式 Store |
| **构建工具** | Vite 5.4 | 极速开发与构建 |
| **CSS 框架** | TailwindCSS 3.4 | 实用优先的原子化 CSS |
| **图标库** | lucide-vue-next | 现代 SVG 图标 |
| **路由** | Vue Router 4.3 | 含路由守卫与懒加载 |
| **国际化** | 自研 i18n 模块 | 动态切换，支持参数替换 |
| **后端框架** | Flask 3.0 | Python 轻量 API 服务 |
| **跨域** | Flask-CORS 4.0 | 前后端分离跨域支持 |
| **AI 模型** | Ollama | 本地部署，默认 deepseek-r7:7b |

---

## 📁 项目结构

```
travel-planner/
├── api/                        # Node.js API 路由
│   └── feedback.js             #   用户反馈接口
├── src/
│   ├── assets/                 # 静态资源
│   ├── layouts/                # 布局组件
│   │   └── MainLayout.vue      #   主布局（侧边栏 + 内容区）
│   ├── pages/                  # 页面组件（14个）
│   │   ├── HomePage.vue        #   首页仪表盘
│   │   ├── AIPlanPage.vue      #   AI 对话规划
│   │   ├── TripManagePage.vue  #   行程管理列表
│   │   ├── TripDetailPage.vue  #   行程详情
│   │   ├── LoginPage.vue       #   用户登录
│   │   ├── ProfilePage.vue     #   个人资料
│   │   ├── SettingsPage.vue    #   通用设置
│   │   ├── FeedbackPage.vue    #   用户反馈
│   │   ├── HelpPage.vue        #   帮助中心
│   │   ├── PersonaTestPage.vue #   人物画像测试
│   │   ├── PersonaResultPage.vue # 画像分析结果
│   │   ├── MbtiTestPage.vue    #   MBTI 测试
│   │   ├── MbtiResultPage.vue  #   MBTI 结果
│   │   └── WechatCallback.vue  #   微信回调
│   ├── stores/                 # 状态管理
│   │   ├── user.js             #   用户认证
│   │   ├── trip.js             #   行程数据
│   │   ├── settings.js         #   全局设置
│   │   ├── chat.js             #   AI 对话
│   │   ├── persona.js          #   人物画像
│   │   └── mbti.js             #   MBTI 测试
│   ├── services/               # 业务服务
│   │   ├── ai.js               #   AI 对话服务
│   │   ├── auth.js             #   认证服务
│   │   ├── dataSync.js         #   数据同步
│   │   ├── persona.js          #   画像服务
│   │   ├── mbti.js             #   MBTI 服务
│   │   └── wechat.js           #   微信集成
│   ├── utils/                  # 工具函数
│   │   └── landmarkImages.js   #   目的地图片匹配
│   ├── i18n/                   # 国际化
│   │   └── index.js            #   翻译配置
│   ├── router/index.js         # 路由配置
│   ├── App.vue                 # 根组件
│   └── main.js                 # 入口文件
├── api_server.py               # Flask 后端主服务
├── trip_import.py              # 行程导入 API
├── mbti_service.py             # MBTI 分析服务
├── persona_service.py          # 人物画像服务
├── profile_calculator.py       # 画像计算引擎
├── travel_planner_service.py   # 旅行规划服务
├── dev-server.mjs              # 前端开发服务器
├── start_all_services.bat      # 一键启动（全部服务）
├── start_persona.ps1           # 启动人物画像模块
├── package.json                # 前端依赖配置
├── requirements.txt            # Python 依赖
└── README.md                   # 项目说明
```

---

## 🚀 快速开始

### 环境要求

| 工具 | 版本 |
|------|------|
| **Node.js** | >= 16 |
| **Python** | >= 3.8 |
| **Ollama** | 最新版（可选，AI 功能需要） |

### 安装 Ollama（AI 功能依赖）

```bash
# macOS / Linux
curl -fsSL https://ollama.com/install.sh | sh

# Windows
# 下载安装：https://ollama.com/download/windows

# 拉取模型
ollama pull deepseek-r1:7b
```

### 一键启动（Windows）

```bat
# 启动全部服务（API + 导入 + 前端）
start_all_services.bat

# 或单独启动人物画像模块
start_persona.ps1
```

### 手动启动

```bash
# 1. 安装前端依赖
npm install

# 2. 安装 Python 依赖
pip install -r requirements.txt

# 3. 启动后端 API（端口 5000）
python api_server.py

# 4. 启动行程导入 API（端口 5001）
python trip_import.py

# 5. 启动前端开发服务器（端口 3000）
node dev-server.mjs

# 或使用 Vite 开发服务器（端口 5173）
npm run dev
```

### 访问地址

| 服务 | 地址 |
|------|------|
| 🌐 前端页面 | http://localhost:3000 |
| 🔌 后端 API | http://localhost:5000 |
| 📥 导入 API | http://localhost:5001 |

---

## 📚 页面导航

| 页面 | 路径 | 说明 |
|------|------|------|
| 登录 | `/login` | 用户登录入口 |
| 首页 | `/home` | 功能导航仪表盘 |
| AI 规划 | `/ai-plan` | AI 对话生成旅行方案 |
| 行程管理 | `/trip-manage` | 查看管理全部行程 |
| 行程详情 | `/trip-detail/:id` | 单条行程详细信息 |
| 个人资料 | `/profile` | 用户个人信息页 |
| 通用设置 | `/settings` | 语言/主题/字体设置 |
| 用户反馈 | `/feedback` | 提交反馈与建议 |
| 帮助中心 | `/help` | 使用帮助与 FAQ |
| 人物画像 | `/persona-test` | 画像分析测试 |
| 画像结果 | `/persona-result` | 画像分析报告 |
| MBTI 测试 | `/mbti-test` | 性格测试答题 |
| MBTI 结果 | `/mbti-result` | 性格分析报告 |

---

## 🔧 后端 API

### AI 对话

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/ollama/status` | 检查 Ollama 服务状态 |
| POST | `/api/chat` | 流式对话（SSE） |
| POST | `/api/chat/non-stream` | 非流式对话 |
| GET | `/api/models` | 获取可用模型列表 |

### 行程导入

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/trip/import` | 导入行程到管理列表 |

### 用户反馈

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/feedback/submit` | 提交用户反馈 |

---

## 🎨 功能截图

> 在线体验：https://travel-planner-two-sigma.vercel.app

---

## 📦 构建部署

```bash
# 生产构建
npm run build

# 输出目录：dist/
# 可部署至 Vercel / Netlify / Nginx 等任意静态服务
```

### Vercel 部署

项目已配置 `vercel.json`，可直接导入 Vercel 部署。

---

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

1. Fork 本仓库
2. 创建功能分支：`git checkout -b feature/amazing-feature`
3. 提交更改：`git commit -m 'feat: add amazing feature'`
4. 推送分支：`git push origin feature/amazing-feature`
5. 提交 Pull Request

---

## 📄 许可证

MIT License

---

<div align="center">

**👨‍💻 作者**：[Suxiaoxin1](https://github.com/Suxiaoxin1)

</div>
