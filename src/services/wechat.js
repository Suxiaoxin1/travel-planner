/**
 * 微信登录服务模块
 * 
 * 实现微信 OAuth2.0 网页授权登录流程
 * 文档: https://developers.weixin.qq.com/doc/oplatform/Website_App/WeChat_Login/WeChat_Login.html
 */

// 微信开放平台配置（需替换为实际值）
const WECHAT_CONFIG = {
  // 微信开放平台 AppID（需在微信开放平台注册网站应用后获取）
  appId: import.meta.env.VITE_WECHAT_APP_ID || '',
  // 授权回调地址（需在微信开放平台配置）
  redirectUri: import.meta.env.VITE_WECHAT_REDIRECT_URI || `${window.location.origin}/wechat-callback`,
  // 授权作用域：snsapi_login（网页授权）
  scope: 'snsapi_login',
  // 状态参数（防 CSRF 攻击）
  state: '',
  // 是否使用弹窗方式
  isPopup: false
}

/**
 * 生成随机状态参数（防 CSRF 攻击）
 */
function generateState() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

/**
 * 生成微信登录授权 URL
 * 用户点击后跳转到此 URL 进行微信扫码授权
 */
export function getWechatAuthUrl() {
  const state = generateState()
  // 保存 state 到 localStorage 用于回调验证
  localStorage.setItem('wechat_auth_state', state)

  const params = new URLSearchParams({
    appid: WECHAT_CONFIG.appId,
    redirect_uri: encodeURIComponent(WECHAT_CONFIG.redirectUri),
    response_type: 'code',
    scope: WECHAT_CONFIG.scope,
    state: state,
    // style 可选: black/white（二维码样式）
    // lang 可选: cn/en（语言）
  })

  return `https://open.weixin.qq.com/connect/qrconnect?${params.toString()}#wechat_redirect`
}

/**
 * 生成微信内网页授权 URL（适用于在微信浏览器内打开）
 * scope: snsapi_base（静默授权）或 snsapi_userinfo（需用户确认）
 */
export function getWechatOAuthUrl(scope = 'snsapi_userinfo') {
  const state = generateState()
  localStorage.setItem('wechat_auth_state', state)

  const params = new URLSearchParams({
    appid: WECHAT_CONFIG.appId,
    redirect_uri: encodeURIComponent(WECHAT_CONFIG.redirectUri),
    response_type: 'code',
    scope: scope,
    state: state
  })

  return `https://open.weixin.qq.com/connect/oauth2/authorize?${params.toString()}#wechat_redirect`
}

/**
 * 验证回调中的 state 参数（防 CSRF 攻击）
 */
export function validateState(state) {
  const savedState = localStorage.getItem('wechat_auth_state')
  localStorage.removeItem('wechat_auth_state')
  return savedState && savedState === state
}

/**
 * 发起微信登录
 * 判断当前环境，选择合适的授权方式
 */
export function startWechatLogin() {
  // 检查是否配置了 AppID
  if (!WECHAT_CONFIG.appId) {
    console.warn('微信登录未配置 AppID，使用模拟登录')
    return simulateWechatLogin()
  }

  // 判断是否在微信浏览器内
  const isWechatBrowser = /MicroMessenger/i.test(navigator.userAgent)

  if (isWechatBrowser) {
    // 微信内使用网页授权
    const authUrl = getWechatOAuthUrl()
    window.location.href = authUrl
  } else {
    // 非微信环境使用扫码登录
    const authUrl = getWechatAuthUrl()
    window.location.href = authUrl
  }
}

/**
 * 模拟微信登录（开发环境使用）
 * 当没有配置真实的 AppID 时，使用模拟数据
 */
export function simulateWechatLogin() {
  return new Promise((resolve) => {
    setTimeout(() => {
      const mockUser = {
        openid: 'mock_openid_' + Date.now(),
        nickname: '微信用户',
        avatar: '',
        sex: 0,
        province: '',
        city: '',
        country: '',
        loginType: 'wechat',
        loginTime: new Date().toISOString()
      }
      resolve(mockUser)
    }, 800)
  })
}

/**
 * 处理微信登录回调
 * 接收授权码 code，用于换取 access_token
 * 注意：实际项目中应由后端完成 code 换 token 的操作
 */
export async function handleWechatCallback(code, state) {
  // 验证 state
  if (!validateState(state)) {
    throw new Error('无效的 state 参数，可能遭受 CSRF 攻击')
  }

  // 检查是否配置了 AppID
  if (!WECHAT_CONFIG.appId) {
    console.warn('微信登录未配置 AppID，使用模拟登录')
    return simulateWechatLogin()
  }

  // 实际项目中，应该将 code 发送到后端，由后端完成以下操作：
  // 1. 使用 code 换取 access_token
  //    POST https://api.weixin.qq.com/sns/oauth2/access_token
  //    参数: appid, secret, code, grant_type=authorization_code
  // 
  // 2. 使用 access_token 获取用户信息
  //    GET https://api.weixin.qq.com/sns/userinfo
  //    参数: access_token, openid
  //
  // 安全提示：AppSecret 必须保存在后端，绝不能暴露在前端代码中

  try {
    // 这里应该调用后端 API
    // const response = await fetch(`/api/wechat/login?code=${code}`)
    // const data = await response.json()
    // return data

    // 模拟后端响应
    return simulateWechatLogin()
  } catch (error) {
    console.error('微信登录回调处理失败:', error)
    throw error
  }
}

/**
 * 微信登录二维码嵌入页面方式
 * 使用微信 JS-SDK 在页面内嵌入二维码
 */
export function initWechatQR(containerId, onSuccess, onError) {
  if (!WECHAT_CONFIG.appId) {
    console.warn('微信登录未配置 AppID')
    return
  }

  // 创建微信登录二维码
  const state = generateState()
  localStorage.setItem('wechat_auth_state', state)

  // 使用微信开放平台提供的 JS-SDK
  // 需要在 index.html 中引入: http://res.wx.qq.com/connect/zh_CN/htmledition/js/wxLogin.js
  if (typeof WxLogin !== 'undefined') {
    new WxLogin({
      self_redirect: false,
      id: containerId,
      appid: WECHAT_CONFIG.appId,
      scope: WECHAT_CONFIG.scope,
      redirect_uri: encodeURIComponent(WECHAT_CONFIG.redirectUri),
      state: state,
      style: 'black',
      href: ''
    })
  } else {
    console.warn('微信登录 JS-SDK 未加载')
  }
}

export default {
  getWechatAuthUrl,
  getWechatOAuthUrl,
  validateState,
  startWechatLogin,
  simulateWechatLogin,
  handleWechatCallback,
  initWechatQR
}
