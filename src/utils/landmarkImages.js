/**
 * 目的地标志性景点高清图片工具
 * 根据行程目的地返回对应的热门标志性景点照片
 */

// 已验证的高质量 Unsplash 标志性景点照片（优先使用）
const VERIFIED_IMAGES = {
  '北京': 'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=800&q=80',
  '上海': 'https://images.unsplash.com/photo-1472311764777-65253a7cf343?w=800&q=80',
  '东京': 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&q=80',
  '巴黎': 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=80',
  '纽约': 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&q=80',
  // 新增验证图片
  '云南': 'https://images.unsplash.com/photo-1528164344705-47542687000d?w=800&q=80',      // 云南梯田/元阳
  '大理': 'https://images.unsplash.com/photo-1583386789487-15bde04cc018?w=800&q=80',     // 大理古城
  '丽江': 'https://images.unsplash.com/photo-1594478531815-8a36e6b0ae74?w=800&q=80',     // 玉龙雪山
  '成都': 'https://images.unsplash.com/photo-1569163139599-0f9aa6b4d6a5?w=800&q=80',     // 大熊猫基地
  '三亚': 'https://images.unsplash.com/photo-1540202404-d0c7fe46a087?w=800&q=80',       // 三亚海滩
  '西安': 'https://images.unsplash.com/photo-1532510865115-0db66184c7dd?w=800&q=80',     // 兵马俑
  '桂林': 'https://images.unsplash.com/photo-1537531383495-f955501621d2?w=800&q=80',     // 漓江山水
  '杭州': 'https://images.unsplash.com/photo-1528164344705-47542687000d?w=800&q=80',    // 西湖
  '西藏': 'https://images.unsplash.com/photo-1604941509296-5be7b0b5f460?w=800&q=80',     // 布达拉宫
  '拉萨': 'https://images.unsplash.com/photo-1604941509296-5be7b0b5f460?w=800&q=80',
  '重庆': 'https://images.unsplash.com/photo-1548919973-5cef591c2b61?w=800&q=80',       // 洪崖洞夜景
  '厦门': 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=800&q=80',   // 鼓浪屿
  '青岛': 'https://images.unsplash.com/photo-1558507652-b201ea53887b?w=800&q=80',     // 海边栈桥
  '香港': 'https://images.unsplash.com/photo-1536599018642-9fd61f6a7f2d?w=800&q=80',   // 维港
  '台湾': 'https://images.unsplash.com/photo-1517639418971-e90439c71977?w=800&q=80',   // 台湾风景
}

// 省份/区域 → 代表城市 映射（用于省份级目的地回退）
const PROVINCE_TO_CITY = {
  '云南': ['昆明', '大理', '丽江'],
  '四川': ['成都', '九寨沟', '稻城亚丁'],
  '浙江': ['杭州', '宁波', '普陀山'],
  '江苏': ['南京', '苏州', '无锡'],
  '广东': ['广州', '深圳', '珠海'],
  '广西': ['桂林', '阳朔', '北海'],
  '贵州': ['贵阳', '黄果树', '西江苗寨'],
  '湖南': ['长沙', '张家界', '凤凰古城'],
  '湖北': ['武汉', '宜昌', '恩施'],
  '福建': ['厦门', '福州', '武夷山'],
  '山东': ['青岛', '济南', '泰山'],
  '山西': ['太原', '大同', '平遥'],
  '陕西': ['西安', '华山', '延安'],
  '甘肃': ['兰州', '敦煌', '张掖'],
  '新疆': ['乌鲁木齐', '喀纳斯', '吐鲁番'],
  '内蒙古': ['呼和浩特', '呼伦贝尔', '阿尔山'],
  '黑龙江': ['哈尔滨', '漠河', '雪乡'],
  '吉林': ['长春', '长白山', '吉林市'],
  '辽宁': ['大连', '沈阳', '丹东'],
  '河北': ['秦皇岛', '承德', '张家口'],
  '河南': ['洛阳', '开封', '少林寺'],
  '安徽': ['黄山', '九华山', '宏村'],
  '江西': ['庐山', '婺源', '景德镇'],
  '海南': ['三亚', '海口', '万宁'],
  '西藏': ['拉萨', '林芝', '日喀则'],
  '青海': ['西宁', '青海湖', '茶卡盐湖'],
  '宁夏': ['银川', '中卫', '沙坡头'],
  '台湾': ['台北', '高雄', '花莲'],
  '澳门': ['澳门'],
  '香港': ['香港'],
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
 * 优先级：已验证Unsplash → 精确关键词 → 省份回退到代表城市 → 模糊匹配 → 目的地名称搜索 → 兜底通用图
 *
 * @param {string} destination - 目的地名称（如 "北京"、"云南"、"巴黎"）
 * @returns {string} 图片 URL
 */
export function getLandmarkImageUrl(destination) {
  if (!destination) return FALLBACK_IMAGE

  // 0. 清理目的地字符串（去除引号、空格、特殊符号）
  const cleanDest = destination.replace(/["'`\s-]+/g, '').trim()
  if (!cleanDest || cleanDest === '---') return FALLBACK_IMAGE

  const lookupDest = cleanDest

  // 1. 优先使用已验证的高清 Unsplash 照片
  if (VERIFIED_IMAGES[lookupDest]) {
    return VERIFIED_IMAGES[lookupDest]
  }

  // 2. 检查缓存
  if (imageCache[lookupDest]) {
    return imageCache[lookupDest]
  }

  // 3. 通过关键词获取标志性景点照片（精确匹配）
  const keyword = LANDMARK_KEYWORDS[lookupDest]
  if (keyword) {
    const url = `https://loremflickr.com/800/600/${keyword}?lock=1`
    imageCache[lookupDest] = url
    return url
  }

  // 4. 省份/区域回退：如果是省份名，映射到其代表城市
  for (const [province, cities] of Object.entries(PROVINCE_TO_CITY)) {
    if (lookupDest.includes(province) || province.includes(lookupDest)) {
      // 尝试用第一个代表城市找图
      const city = cities[0]
      if (VERIFIED_IMAGES[city]) return VERIFIED_IMAGES[city]
      if (LANDMARK_KEYWORDS[city]) {
        const url = `https://loremflickr.com/800/600/${LANDMARK_KEYWORDS[city]}?lock=1`
        imageCache[lookupDest] = url
        return url
      }
      // 最终用省份名搜索
      const url = `https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&q=80` // 中国山水通用图
      imageCache[lookupDest] = url
      return url
    }
  }

  // 5. 模糊匹配：尝试在关键词映射中找到匹配项
  for (const [key, kw] of Object.entries(LANDMARK_KEYWORDS)) {
    if (lookupDest.includes(key) || key.includes(lookupDest)) {
      const url = `https://loremflickr.com/800/600/${kw}?lock=1`
      imageCache[lookupDest] = url
      return url
    }
  }

  // 6. 最终兜底：使用高质量旅行主题图片（不再用随机 loremflickr 避免不相关图片）
  const travelThemedImages = [
    'https://images.unsplash.com/photo-1488646953017-4f2a512e946a?w=800&q=80',   // 山水旅行
    'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800&q=80',   // 湖泊山脉
    'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&q=80',   // 自然风光
    'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&q=80',   // 山景
  ]
  // 根据目标地字符串的hash值选择一个稳定的图片
  let hash = 0
  for (let i = 0; i < lookupDest.length; i++) {
    hash = ((hash << 5) - hash) + lookupDest.charCodeAt(i)
    hash |= 0
  }
  const stableImage = travelThemedImages[Math.abs(hash) % travelThemedImages.length]
  imageCache[lookupDest] = stableImage
  return stableImage
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
