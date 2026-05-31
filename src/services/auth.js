/**
 * 模拟登录认证服务
 * 包含预设账号、预设存档数据、登录验证逻辑
 */

// ============================================================
// 预设账号
// ============================================================
export const PRESET_ACCOUNTS = {
  'demo': {
    password: '123456',
    userInfo: {
      userId: 'demo',
      nickname: '旅行者小D',
      avatar: '',
      phone: '138****8888',
      sex: 1,
      province: '广东',
      city: '深圳',
      country: '中国',
      loginType: 'account',
      bio: '热爱探索世界的旅行者'
    }
  },
  'test': {
    password: 'test123',
    userInfo: {
      userId: 'test',
      nickname: '测试用户',
      avatar: '',
      phone: '139****9999',
      sex: 0,
      province: '北京',
      city: '北京',
      country: '中国',
      loginType: 'account',
      bio: '测试账号'
    }
  }
}

// ============================================================
// 预设存档数据 - demo账号的完整存档
// ============================================================
export const PRESET_ARCHIVE = {
  demo: {
    // 人物画像存档（格式与 analyze() 输出对齐，保留原有展示内容）
    persona: {
      answers: {
        '1': 'C', '2': 'B', '3': 'B', '4': 'B', '5': 'B',
        '6': 'B', '7': 'A', '8': 'C', '9': 'B', '10': 'C',
        '11': 'B', '12': 'B', '13': 'C', '14': 'B', '15': 'B'
      },
      result: {
        adventureScore: 65,
        socialScore: 72,
        budgetScore: 55,
        adventureLevel: 'high',
        socialLevel: 'high',
        budgetLevel: 'mid',
        adventureLabel: '冒险达人',
        socialLabel: '社交达人',
        budgetLabel: '品质消费',
        confidence: 0.67,
        answeredCount: 15,
        profileTitle: '探索型旅人',
        profileDesc: '你是一位充满好奇心和冒险精神的旅行者，喜欢深入体验当地文化，善于在旅途中结交朋友。你对旅行品质有要求，但也乐于接受不完美的惊喜。',
        destinations: ['成都', '大理', '东京', '巴塞罗那', '新西兰', '冰岛'],
        travelStyle: '探索体验型',
        tips: '你热爱挑战与冒险，对未知充满好奇。旅行对你来说是一场探索，你享受突破舒适区的刺激感。你善于与陌生人建立联系，旅行中的社交让你如鱼得水。你喜欢融入当地，与不同的人交流。你愿意为有价值的体验买单，但也会精打细算。追求性价比而非单纯省钱。'
      },
      isCompleted: true
    },
    // MBTI存档（INTJ 建筑师 — 与用户实际测试结果一致）
    mbti: {
      answers: {
        '1': 'B', '2': 'B', '3': 'B', '4': 'B', '5': 'B',
        '6': 'B', '7': 'A', '8': 'B', '9': 'B', '10': 'B',
        '11': 'B', '12': 'B', '13': 'B', '14': 'A', '15': 'A',
        '16': 'A', '17': 'A', '18': 'A', '19': 'A', '20': 'A'
      },
      directType: '',
      result: {
        mbtiType: 'INTJ',
        mbtiTypeName: '建筑师',
        mbtiConfidence: 0.80,
        answerCount: 20,
        dimensions: {
          EI: { dominant: 'I', leftPercent: 14, rightPercent: 86, confidence: 0.72, leftScore: 1, rightScore: 6, total: 7 },
          SN: { dominant: 'N', leftPercent: 14, rightPercent: 86, confidence: 0.72, leftScore: 1, rightScore: 6, total: 7 },
          TF: { dominant: 'T', leftPercent: 86, rightPercent: 14, confidence: 0.72, leftScore: 6, rightScore: 1, total: 7 },
          JP: { dominant: 'J', leftPercent: 83, rightPercent: 17, confidence: 0.67, leftScore: 5, rightScore: 1, total: 6 }
        },
        pace: '精确规划型',
        social: '独立独行型',
        planningStyle: '战略规划',
        travelStyle: '独自深度考察型 — 用战略眼光规划旅行，追求知识密度和独处思考空间',
        destinationTypes: ['深度研究地', '冷门遗址', '天文台'],
        activities: ['天文观测', '古建筑研究', '博物馆深度', '产业考察'],
        accommodation: ['设计感酒店', '带书房住宿', '安静高端'],
        decisionFactors: ['知识密度', '独处空间', '效率最优'],
        aversion: ['群体活动', '热门景点', '无意义社交'],
        tips: '选择人少可控的目的地，安排独立探索时间，住带书房的酒店，可进行商务与旅行结合。'
      },
      isCompleted: true,
      inputMode: 'questionnaire'
    },
    // 行程规划存档
    trips: [
      {
        id: 'trip_001',
        name: '云南7日深度游',
        destination: '云南',
        startDate: '2026-03-15',
        endDate: '2026-03-21',
        status: 'planned',
        days: [
          {
            day: 1,
            date: '2026-03-15',
            title: '昆明初印象',
            activities: [
              { time: '10:00', name: '抵达昆明长水机场', type: 'transport', note: '航班CA4175' },
              { time: '12:00', name: '翠湖公园漫步', type: 'sightseeing', note: '看红嘴鸥' },
              { time: '15:00', name: '云南大学参观', type: 'sightseeing', note: '感受学术氛围' },
              { time: '18:00', name: '南屏街美食探索', type: 'food', note: '过桥米线、汽锅鸡' }
            ]
          },
          {
            day: 2,
            date: '2026-03-16',
            title: '大理古城与洱海',
            activities: [
              { time: '07:30', name: '乘高铁前往大理', type: 'transport', note: '约2小时' },
              { time: '10:30', name: '大理古城漫步', type: 'sightseeing', note: '五华楼、洋人街' },
              { time: '14:00', name: '环洱海骑行', type: 'activity', note: '租电动车环湖' },
              { time: '18:00', name: '双廊古镇日落', type: 'sightseeing', note: '日落绝佳位置' }
            ]
          }
        ],
        budget: { total: 8000, spent: 0, currency: 'CNY' },
        createdAt: '2026-02-20T10:00:00Z',
        updatedAt: '2026-02-25T15:30:00Z'
      },
      {
        id: 'trip_002',
        name: '日本关西5日游',
        destination: '大阪·京都·奈良',
        startDate: '2026-05-01',
        endDate: '2026-05-05',
        status: 'draft',
        days: [
          {
            day: 1,
            date: '2026-05-01',
            title: '大阪美食之旅',
            activities: [
              { time: '11:00', name: '抵达关西机场', type: 'transport', note: '' },
              { time: '14:00', name: '道顿堀觅食', type: 'food', note: '章鱼烧、大阪烧' },
              { time: '17:00', name: '心斋桥购物', type: 'shopping', note: '' }
            ]
          }
        ],
        budget: { total: 12000, spent: 0, currency: 'CNY' },
        createdAt: '2026-03-01T08:00:00Z',
        updatedAt: '2026-03-01T08:00:00Z'
      }
    ],
    // AI对话记录存档
    chats: [
      {
        id: 'chat_001',
        title: '云南旅行规划',
        createdAt: '2026-02-20T09:30:00Z',
        updatedAt: '2026-02-20T10:00:00Z',
        messages: [
          { id: 'msg_001', role: 'user', content: '帮我规划一个云南7日游的行程，预算8000左右', timestamp: '2026-02-20T09:30:00Z' },
          { id: 'msg_002', role: 'assistant', content: '好的！根据你的预算和时间，我为你规划了一个云南7日深度游方案：\n\n**Day 1 昆明** - 翠湖公园、云南大学、南屏街美食\n**Day 2 大理** - 大理古城、环洱海骑行、双廊日落\n**Day 3 大理→丽江** - 喜洲古镇、丽江古城\n**Day 4 丽江** - 玉龙雪山、蓝月谷\n**Day 5 丽江→香格里拉** - 虎跳峡徒步、独克宗古城\n**Day 6 香格里拉** - 普达措国家公园、松赞林寺\n**Day 7 返程** - 从香格里拉飞回\n\n总预算约7500元，含交通、住宿、门票和餐饮。需要我详细展开某一天的安排吗？', timestamp: '2026-02-20T09:32:00Z' },
          { id: 'msg_003', role: 'user', content: '第一天详细说说，有什么推荐的美食？', timestamp: '2026-02-20T09:35:00Z' },
          { id: 'msg_004', role: 'assistant', content: '昆明第一天详细安排：\n\n**上午 10:00** 抵达昆明长水机场\n- 乘坐地铁6号线转2号线到翠湖附近酒店\n- 建议住宿：翠湖周边，方便游览\n\n**中午 12:00** 翠湖公园\n- 冬季可看红嘴鸥，四季都有美丽风景\n- 沿湖散步约1小时\n\n**下午 15:00** 云南大学\n- 银杏道、会泽院都是打卡点\n- 感受百年名校的文化氛围\n\n**傍晚 18:00** 南屏街美食探索\n🎯 **必吃推荐：**\n1. **过桥米线** - 桥香园或建新园，经典中的经典\n2. **汽锅鸡** - 福照楼，汤汁鲜美\n3. **鲜花饼** - 嘉华饼屋，伴手礼首选\n4. **烤豆腐** - 街边小摊，5元一份超满足\n\n预算：当天约300-400元（含住宿）', timestamp: '2026-02-20T09:38:00Z' }
        ]
      },
      {
        id: 'chat_002',
        title: '日本旅行咨询',
        createdAt: '2026-03-01T08:00:00Z',
        updatedAt: '2026-03-01T08:15:00Z',
        messages: [
          { id: 'msg_005', role: 'user', content: '五一去日本关西，有什么推荐？', timestamp: '2026-03-01T08:00:00Z' },
          { id: 'msg_006', role: 'assistant', content: '五一去关西是个不错的选择！推荐路线：大阪→京都→奈良\n\n**亮点：**\n- 大阪：美食天堂，道顿堀、黑门市场\n- 京都：古寺神社，金阁寺、伏见稻荷\n- 奈良：小鹿公园，东大寺\n\n五一期间可能人多，建议提前预订住宿。预算方面5天约10000-15000元。需要我帮你详细规划吗？', timestamp: '2026-03-01T08:05:00Z' }
        ]
      }
    ]
  },
  // test账号的存档（较简单）
  test: {
    persona: {
      answers: {},
      result: null,
      isCompleted: false
    },
    mbti: {
      answers: {},
      directType: '',
      result: null,
      isCompleted: false,
      inputMode: 'questionnaire'
    },
    trips: [],
    chats: []
  }
}

/**
 * 模拟登录验证
 * @param {string} username - 用户名
 * @param {string} password - 密码
 * @returns {{ success: boolean, userInfo?: object, error?: string }}
 */
export function login(username, password) {
  const account = PRESET_ACCOUNTS[username]
  if (!account) {
    return { success: false, error: '账号不存在' }
  }
  if (account.password !== password) {
    return { success: false, error: '密码错误' }
  }
  return { success: true, userInfo: { ...account.userInfo, loginTime: new Date().toISOString() } }
}

/**
 * 获取预设存档数据
 * @param {string} userId - 用户ID
 * @returns {object} 存档数据 { persona, mbti, trips, chats }
 */
export function getPresetArchive(userId) {
  return PRESET_ARCHIVE[userId] || { persona: null, mbti: null, trips: [], chats: [] }
}

/**
 * 生成用户专属的 localStorage key
 * @param {string} userId - 用户ID
 * @param {string} module - 模块名 (persona/mbti/trip/chat/user)
 * @returns {string}
 */
export function getUserStorageKey(userId, module) {
  return `travel_app_${userId}_${module}`
}
