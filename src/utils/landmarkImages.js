/**
 * 目的地标志性景点高清图片工具
 * 根据行程目的地返回对应的热门标志性景点照片
 */

// 已验证的高质量 Unsplash 标志性景点照片
const VERIFIED_IMAGES = {
  '北京': 'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=800&q=80',
  '上海': 'https://images.unsplash.com/photo-1472311764777-65253a7cf343?w=800&q=80',
  '东京': 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&q=80',
  '巴黎': 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=80',
  '纽约': 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&q=80',
}

// 目的地 → 标志性景点搜索关键词映射
// 用于通过 loremflickr 获取对应景点的高清照片
const LANDMARK_KEYWORDS = {
  // 中国城市
  '广州': 'canton-tower-guangzhou',
  '深圳': 'shenzhen-skyline',
  '成都': 'chengdu-giant-panda',
  '杭州': 'west-lake-hangzhou',
  '西安': 'terracotta-warriors-xian',
  '南京': 'confucius-temple-nanjing',
  '重庆': 'hongyadong-chongqing',
  '武汉': 'yellow-crane-tower-wuhan',
  '厦门': 'gulangyu-xiamen',
  '昆明': 'stone-forest-kunming',
  '大理': 'three-pagodas-dali',
  '丽江': 'jade-dragon-snow-mountain-lijiang',
  '三亚': 'sanya-beach-tropical',
  '青岛': 'zhanqiao-pier-qingdao',
  '大连': 'xinghai-square-dalian',
  '哈尔滨': 'saint-sophia-cathedral-harbin',
  '拉萨': 'potala-palace-lhasa',
  '苏州': 'humble-administrator-garden-suzhou',
  '桂林': 'li-river-guilin',
  '黄山': 'mount-huangshan',
  '张家界': 'zhangjiajie-mountains',
  '九寨沟': 'jiuzhaigou-valley',
  '敦煌': 'mogao-caves-dunhuang',
  '澳门': 'ruins-st-paul-macau',
  '香港': 'victoria-harbour-hongkong',

  // 亚洲
  '大阪': 'osaka-castle-japan',
  '京都': 'fushimi-inari-kyoto',
  '首尔': 'gyeongbokgung-palace-seoul',
  '曼谷': 'grand-palace-bangkok',
  '新加坡': 'marina-bay-sands-singapore',
  '吉隆坡': 'petronas-towers-kuala-lumpur',
  '巴厘岛': 'tanah-lot-bali-temple',
  '马尔代夫': 'maldives-overwater-villa',
  '柬埔寨': 'angkor-wat-cambodia',
  '越南': 'ha-long-bay-vietnam',
  '印度': 'taj-mahal-india',
  '泰国': 'wat-arun-bangkok',
  '迪拜': 'burj-khalifa-dubai',
  '尼泊尔': 'himalayas-nepal',
  '斯里兰卡': 'sigiriya-sri-lanka',
  '清迈': 'doi-suthep-chiang-mai',

  // 欧美
  '伦敦': 'big-ben-london',
  '罗马': 'colosseum-rome',
  '巴塞罗那': 'sagrada-familia-barcelona',
  '悉尼': 'sydney-opera-house',
  '洛杉矶': 'hollywood-sign-los-angeles',
  '华盛顿': 'white-house-washington',
  '旧金山': 'golden-gate-bridge-san-francisco',
  '莫斯科': 'saint-basils-cathedral-moscow',
  '柏林': 'brandenburg-gate-berlin',
  '阿姆斯特丹': 'amsterdam-canals',
  '布拉格': 'prague-old-town',
  '维也纳': 'schoenbrunn-palace-vienna',
  '雅典': 'parthenon-athens',
  '伊斯坦布尔': 'hagia-sophia-istanbul',
  '里约': 'christ-redeemer-rio',
  '开罗': 'pyramids-giza-cairo',

  // 自然/特殊
  '冰岛': 'northern-lights-iceland',
  '新西兰': 'milford-sound-new-zealand',
  '瑞士': 'matterhorn-switzerland',
  '挪威': 'fjords-norway',
  '芬兰': 'helsinki-cathedral-finland',
  '夏威夷': 'waikiki-beach-hawaii',
  '澳大利亚': 'sydney-opera-house-australia',
  '法国': 'eiffel-tower-paris',
  '英国': 'tower-bridge-london',
  '美国': 'statue-liberty-new-york',
  '日本': 'mount-fuji-japan',
  '韩国': 'gyeongbokgung-seoul-korea',
  '意大利': 'colosseum-rome-italy',
  '西班牙': 'sagrada-familia-spain',
  '德国': 'neuschwanstein-castle-germany',
  '俄罗斯': 'saint-basils-moscow-russia',
  '埃及': 'pyramids-egypt',
  '土耳其': 'cappadocia-turkey',
  '摩洛哥': 'chefchaouen-morocco',
  '肯尼亚': 'masai-mara-kenya',
}

// 通用旅行照片（最终兜底）
const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1488085061387-422e29b40080?w=800&q=80'

// 本地缓存（避免重复请求 loremflickr 重定向）
const imageCache = {}

/**
 * 获取目的地标志性景点照片 URL
 * 优先使用已验证的 Unsplash 高清照片，其次通过关键词搜索获取
 *
 * @param {string} destination - 目的地名称（如 "北京"、"东京"、"巴黎"）
 * @returns {string} 图片 URL
 */
export function getLandmarkImageUrl(destination) {
  if (!destination) return FALLBACK_IMAGE

  // 1. 优先使用已验证的高清 Unsplash 照片
  if (VERIFIED_IMAGES[destination]) {
    return VERIFIED_IMAGES[destination]
  }

  // 2. 检查缓存
  if (imageCache[destination]) {
    return imageCache[destination]
  }

  // 3. 通过关键词获取标志性景点照片
  const keyword = LANDMARK_KEYWORDS[destination]
  if (keyword) {
    // 使用 Unsplash 搜索获取地标照片
    // 通过构造特定的搜索 URL 获取与目的地相关的标志性景点照片
    const url = `https://loremflickr.com/800/600/${keyword}?lock=1`
    imageCache[destination] = url
    return url
  }

  // 4. 模糊匹配：尝试在关键词映射中找到匹配项
  for (const [key, kw] of Object.entries(LANDMARK_KEYWORDS)) {
    if (destination.includes(key) || key.includes(destination)) {
      const url = `https://loremflickr.com/800/600/${kw}?lock=1`
      imageCache[destination] = url
      return url
    }
  }

  // 5. 最终兜底：使用目的地名称直接搜索
  const searchUrl = `https://loremflickr.com/800/600/${encodeURIComponent(destination + '-landmark')}?lock=1`
  imageCache[destination] = searchUrl
  return searchUrl
}

/**
 * 获取默认图片（兼容旧接口）
 */
export function getDefaultImage(destination) {
  return getLandmarkImageUrl(destination)
}

/**
 * 图片加载失败时的降级处理
 * 依次尝试：通用目的地搜索 → 通用旅行照片
 *
 * @param {Event} event - img 的 error 事件
 * @param {string} destination - 目的地名称
 */
export function handleImageError(event, destination) {
  const img = event.target
  const currentSrc = img.src

  // 防止无限循环
  if (img.dataset.fallbackLevel === '2') {
    img.src = FALLBACK_IMAGE
    return
  }

  if (img.dataset.fallbackLevel === '1') {
    // 第二次降级：使用通用旅行照片
    img.dataset.fallbackLevel = '2'
    img.src = FALLBACK_IMAGE
    return
  }

  // 第一次降级：使用目的地名称直接搜索
  img.dataset.fallbackLevel = '1'
  const searchUrl = `https://loremflickr.com/800/600/${encodeURIComponent(destination || 'travel-landmark')}?lock=2`
  img.src = searchUrl
}

export { FALLBACK_IMAGE, VERIFIED_IMAGES, LANDMARK_KEYWORDS }
