/**
 * AI 对话服务
 * 封装与后端 /api/chat 的交互，支持流式 SSE 和非流式两种模式
 * 支持传入用户画像/MBTI 数据以生成个性化旅行规划
 */

const API_BASE = '/api'

// 导入封面图工具
import { getLandmarkImageUrl } from '../utils/landmarkImages.js'

/**
 * 发送流式对话请求
 * @param {Array} messages - 消息列表 [{role: 'user'|'assistant', content: '...'}]
 * @param {Object} options - 选项
 * @param {Function} options.onToken - 收到 token 时的回调
 * @param {Function} options.onDone - 生成完成的回调
 * @param {Function} options.onError - 错误回调
 * @param {string} options.model - 可选，指定模型
 * @param {boolean} options.useProfile - 是否使用用户画像数据
 * @param {Object} options.profileData - 用户画像数据 { persona: {...}, mbti: {...} }
 * @returns {AbortController} 可用于取消请求
 */
export function chatStream(messages, { onToken, onDone, onError, model, useProfile, profileData } = {}) {
  const controller = new AbortController()

  const body = {
    messages,
    model,
    use_profile: !!useProfile,
    profile_data: useProfile ? (profileData || {}) : {},
  }

  ;(async () => {
    try {
      const resp = await fetch(`${API_BASE}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: controller.signal,
      })

      if (!resp.ok) {
        const errText = await resp.text().catch(() => '')
        onError?.(`请求失败: ${resp.status} ${errText}`)
        return
      }

      const reader = resp.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''
      let fullContent = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })

        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          const trimmed = line.trim()
          if (!trimmed || !trimmed.startsWith('data: ')) continue

          const dataStr = trimmed.slice(6)
          if (dataStr === '[DONE]') {
            onDone?.(fullContent)
            return
          }

          try {
            const data = JSON.parse(dataStr)

            if (data.error) {
              onError?.(data.error)
              return
            }

            if (data.token) {
              fullContent += data.token
              onToken?.(data.token)
            }

            if (data.done) {
              if (data.full_content) {
                fullContent = data.full_content
              }
              onDone?.(fullContent)
              return
            }
          } catch (e) {
            // JSON 解析失败，忽略
          }
        }
      }

      if (fullContent) {
        onDone?.(fullContent)
      }
    } catch (e) {
      if (e.name === 'AbortError') return
      onError?.(e.message || '请求异常')
    }
  })()

  return controller
}

/**
 * 发送非流式对话请求
 */
export async function chatNonStream(messages, model, useProfile = false, profileData = null) {
  try {
    const body = {
      messages,
      model,
      use_profile: !!useProfile,
      profile_data: useProfile ? (profileData || {}) : {},
    }

    const resp = await fetch(`${API_BASE}/chat/non-stream`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    if (!resp.ok) {
      return { success: false, error: `请求失败: ${resp.status}` }
    }

    const data = await resp.json()
    if (data.success) {
      return { success: true, content: data.data.content }
    }
    return { success: false, error: data.error || '生成失败' }
  } catch (e) {
    return { success: false, error: e.message || '网络异常' }
  }
}

/**
 * 检查 Ollama 服务状态
 */
export async function checkOllamaStatus() {
  try {
    const resp = await fetch(`${API_BASE}/ollama/status`)
    if (!resp.ok) return { connected: false, error: `HTTP ${resp.status}` }
    return await resp.json()
  } catch (e) {
    return { connected: false, error: '无法连接后端服务' }
  }
}

/**
 * 获取可用模型列表
 */
export async function getAvailableModels() {
  try {
    const resp = await fetch(`${API_BASE}/models`)
    if (!resp.ok) return { success: false }
    return await resp.json()
  } catch {
    return { success: false }
  }
}

// 需要跳过的非目的地词汇（问候语、代词等）
const SKIP_WORDS = new Set([
  '亲爱的', '您好', '朋友', '旅行者', '用户', '游客', '您', '我', '我们',
  '大家', '你好', '这位', '亲爱', '小众', '秘境', '深度', '考察',
])

// 扩展的目的地词库（包含常见城市、景区、山脉等）
const DESTINATION_KEYWORDS = [
  // 热门城市
  '北京','上海','广州','深圳','成都','杭州','西安','南京','重庆','武汉',
  '厦门','昆明','大理','丽江','三亚','青岛','大连','哈尔滨','拉萨','苏州',
  '桂林','黄山','张家界','九寨沟','敦煌','澳门','香港','台北','贵阳','兰州',
  // 山川/自然景区
  '格聂神山','稻城亚丁','四姑娘山','贡嘎雪山','峨眉山','泰山','华山','嵩山',
  '衡山','恒山','武当山','青城山','峨眉','乐山大佛','黄龙','玉龙雪山',
  '梅里雪山','南迦巴瓦','珠峰','冈仁波齐','喀纳斯','赛里木湖','天池',
  '千岛湖','西湖','洱海','泸沽湖','茶卡盐湖','青海湖','纳木错',
  // 海外
  '东京','大阪','京都','首尔','曼谷','新加坡','吉隆坡','巴厘岛',
  '马尔代夫','清迈','普吉','伦敦','巴黎','罗马','巴塞罗那','悉尼',
  '纽约','洛杉矶','旧金山','迪拜','开罗','布拉格','维也纳',
]

/**
 * 智能提取目的地（优先级：标题/表头 > 明确标注 > 内容关键词）
 */
function extractDestination(planContent) {
  const lines = planContent.split('\n').map(l => l.trim()).filter(Boolean)

  // 1. 从第一行标题提取（如 "格聂神山·川西藏地深度考察方案"）
  if (lines.length > 0) {
    const titleLine = lines[0]
    for (const dest of DESTINATION_KEYWORDS) {
      if (titleLine.includes(dest) && !SKIP_WORDS.has(dest)) return dest
    }
    // 标题中找【】括起来的地点
    const bracketMatch = titleLine.match(/【([^】]+)】/)
    if (bracketMatch && !SKIP_WORDS.has(bracketMatch[1])) {
      return bracketMatch[1].trim()
    }
  }

  // 2. 明确的"目的地"标注
  const explicitMatch = planContent.match(/目的地[：:]*\s*([^\n\r，,。]+)/i)
  if (explicitMatch) {
    const d = explicitMatch[1].trim().replace(/[（(][^）)]*[）)]$/, '')
    if (!SKIP_WORDS.has(d)) return d
  }

  // 3. "去 XX 旅行"模式
  const goPattern = planContent.match(/(?:前往|去|到)\s*([^\n\r]{2,8}?)(?:旅行|旅游|游玩|出行|探秘|考察)/)
  if (goPattern) {
    const d = goPattern[1].trim().replace(/[（(][^）)]*[）)]$/, '')
    if (!SKIP_WORDS.has(d)) return d
  }

  // 4. 全文关键词搜索（排除前100字符的问候语区域）
  const bodyText = planContent.slice(Math.min(150, Math.floor(planContent.length * 0.1)))
  for (const dest of DESTINATION_KEYWORDS) {
    if (bodyText.includes(dest)) return dest
  }

  // 5. 兜底：从标题中提取2-6字的地名（排除 SKIP_WORDS）
  if (lines.length > 0) {
    const titleWords = lines[0].match(/[\u4e00-\u9fa5]{2,6}/g) || []
    for (const w of titleWords) {
      if (!SKIP_WORDS.has(w) && !/^(方案|推荐|攻略|规划|计划|详情|介绍)$/.test(w)) {
        return w
      }
    }
  }

  return ''
}

/**
 * 智能计算预算（支持范围、人均、多维度综合计算）
 */
function calculateBudget(planContent, dayCount) {
  // 尝试匹配范围预算（如 "3000-5000元" → 取中值 4000）
  const rangeMatch = planContent.match(/(?:预算参考|总预算|费用|花费)[^0-9]*(\d+)\s*[-~～]\s*(\d+)/)
  if (rangeMatch) {
    return Math.round((parseInt(rangeMatch[1]) + parseInt(rangeMatch[2])) / 2)
  }

  // 单一数值预算
  const singlePatterns = [
    /(?:预算参考|总预算|预计花费|大概费用|约)[^0-9]*([0-9]+)\s*元/,
    /¥\s*([0-9]+)\s*(?:左右)?$/,
    /([0-9]{3,5})\s*元.*?(?:预算|花费|费用)/,
  ]
  for (const p of singlePatterns) {
    const m = planContent.match(p)
    if (m) return parseInt(m[1])
  }

  // 人均预算转总计（如 "人均1000元" × 天数或人数估算）
  const perPersonMatch = planContent.match(/人均[^0-9]*(\d+)\s*元/)
  if (perPersonMatch) {
    const perPerson = parseInt(perPersonMatch[1])
    // 假设 2 人出行
    return perPerson * 2 * Math.max(dayCount, 3)
  }

  // 无明确预算时按天数+难度智能估算
  if (dayCount > 0) {
    const difficultyMap = {
      '休闲': 800, '舒适': 1200, '中等': 2000, '深度': 3000, '极限': 4500,
      '穷游': 600, '品质': 2500, '奢华': 6000,
    }
    let basePerDay = 1500 // 默认中等消费
    for (const [keyword, cost] of Object.entries(difficultyMap)) {
      if (planContent.includes(keyword)) {
        basePerDay = cost
        break
      }
    }
    // 考虑往返交通 + 住宿天数
    return basePerDay * (dayCount + 1)
  }

  return 0
}

/**
 * 客户端行程解析（当后端服务不可用时的兜底方案）
 * 改进：更准确的目的地识别、智能预算计算、封面图生成
 */
function parseTripPlanClient(planContent, title) {
  const result = {
    name: title || 'AI生成行程',
    destination: '',
    startDate: '',
    endDate: '',
    budget: { total: 0, spent: 0 },
    days: [],
    status: 'planned',
    aiPlanContent: planContent,
  }

  // 1. 提取目的地（使用改进算法）
  result.destination = extractDestination(planContent)

  // 2. 提取预算（先解析天数用于预算计算）
  const tempDays = [] // 先临时解析天数
  const lines = planContent.split('\n')
  let currentDay = null

  for (const rawLine of lines) {
    const line = rawLine.trim()
    if (!line) continue
    const dayMatch = line.match(/(?:Day|天|第)\s*(\d+)/i)
    if (dayMatch) {
      currentDay = parseInt(dayMatch[1])
      tempDays.push(currentDay)
    }
  }

  const dayCount = tempDays.length > 0 ? Math.max(...tempDays) : 0

  // 3. 计算预算（传入天数信息）
  result.budget.total = calculateBudget(planContent, dayCount)

  // 解析每日行程（复用上面已解析的 lines）
  currentDay = null
  let currentTitle = ''
  let activities = []

  for (const rawLine of lines) {
    const line = rawLine.trim()
    if (!line) continue

    const dayMatch = line.match(/(?:Day|天|第)\s*(\d+)/i)
    if (dayMatch) {
      if (currentDay !== null) {
        result.days.push({ day: currentDay, title: currentTitle, date: '', activities })
      }
      currentDay = parseInt(dayMatch[1])
      const titleMatch = line.match(/(?:Day|天|第)\s*\d+\s*[：:]\s*(.+)/i)
      currentTitle = titleMatch ? titleMatch[1].trim() : `第 ${currentDay} 天`
      activities = []
    } else if (currentDay !== null) {
      const timeMatch = line.match(/(\d{1,2}:\d{2})\s*[-~]\s*(\d{1,2}:\d{2})?\s*(.+)/)
      if (timeMatch) {
        activities.push({ time: timeMatch[1], name: timeMatch[3].trim(), type: 'sightseeing', note: '' })
      } else if (/^[*-•]/.test(line)) {
        const activityName = line.replace(/^[*-•\s]+/, '').trim()
        if (activityName) {
          activities.push({ time: '', name: activityName, type: 'sightseeing', note: '' })
        }
      }
    }
  }

  if (currentDay !== null) {
    result.days.push({ day: currentDay, title: currentTitle, date: '', activities })
  }

  // 4. 自动生成封面图（基于目的地）
  result.coverImage = getLandmarkImageUrl(result.destination)

  return result
}

/**
 * 将 AI 旅行规划导入个人行程
 * 优先调用后端解析服务，服务不可用时使用客户端解析兜底
 *
 * @param {Object} params - 导入参数
 * @param {string} params.startDate - 用户确认的出行开始日期（可选，不传则自动计算）
 * @param {string} params.endDate - 用户确认的出行结束日期（可选）
 */
export async function importTripPlan({ conversationId, messageId, planContent, title, userId, startDate, endDate }) {
  let tripData = null

  try {
    // 优先调用后端解析服务
    const resp = await fetch(`${API_BASE}/trip/import`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        conversation_id: conversationId,
        message_id: messageId,
        plan_content: planContent,
        title: title || '未命名行程',
        user_id: userId || 'demo',
      }),
    })

    const result = await resp.json()

    if (result.success && result.data) {
      tripData = result.data
    }
  } catch (e) {
    console.warn('后端解析服务不可用，使用客户端兜底解析:', e.message)
  }

  // 后端不可用时，客户端兜底解析
  if (!tripData) {
    tripData = parseTripPlanClient(planContent, title)
    tripData.id = `trip_${Date.now()}`
    tripData.userId = userId || 'demo'
  }

  // 确保 AI 原始方案内容被保留
  if (!tripData.aiPlanContent) {
    tripData.aiPlanContent = planContent
  }

  // 应用用户确认的日期（如果提供了）
  if (startDate && endDate && tripData.days.length > 0) {
    tripData.startDate = startDate
    tripData.endDate = endDate
    const start = new Date(startDate)
    tripData.days.forEach((dayData, i) => {
      const d = new Date(start)
      d.setDate(d.getDate() + i)
      dayData.date = d.toISOString().slice(0, 10)
    })
  } else if (!tripData.startDate || !tripData.endDate) {
    // 无日期且未提供时自动计算
    const now = new Date()
    const start = new Date(now)
    const end = new Date(now)
    if (tripData.days.length > 0) {
      end.setDate(end.getDate() + tripData.days.length - 1)
    }
    tripData.startDate = start.toISOString().slice(0, 10)
    tripData.endDate = end.toISOString().slice(0, 10)

    tripData.days.forEach((dayData, i) => {
      if (!dayData.date) {
        const d = new Date(now)
        d.setDate(d.getDate() + i)
        dayData.date = d.toISOString().slice(0, 10)
      }
    })
  }

  // 保存到前端行程列表
  const { addTrip } = await import('../stores/trip.js')
  addTrip(tripData)

  return {
    success: true,
    message: '行程导入成功！',
    data: tripData
  }
}

/**
 * 清理 AI 生成内容中的多余符号和格式
 * @param {string} content - AI 生成的原始内容
 * @returns {string} 清理后的内容
 */
export function cleanAiContent(content) {
  if (!content || typeof content !== 'string') return ''

  let cleaned = content

  // 1. 移除多余的星号、破折号、圆点等列表符号（保留换行）
  cleaned = cleaned.replace(/^[*\-•]\s+/gm, '')

  // 2. 移除多余的表格分隔符（如 |---|---|）
  cleaned = cleaned.replace(/^[\|\s:-]+$/gm, '')

  // 3. 移除 HTML 注释
  cleaned = cleaned.replace(/<!--[\s\S]*?-->/g, '')

  // 4. 清理多余的空行（最多保留一个空行）
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n')

  // 5. 移除行首行尾的空格
  cleaned = cleaned.split('\n').map(line => line.trim()).join('\n')

  // 6. 移除结尾多余空行
  cleaned = cleaned.trim()

  return cleaned
}

/**
 * 从 AI 生成内容中提取干净的标题
 * @param {string} content - AI 生成的原始内容或标题
 * @returns {string} 清理后的标题
 */
export function extractCleanTitle(content) {
  if (!content || typeof content !== 'string') return 'AI生成行程'

  let title = content.trim()

  // 1. 如果是完整内容，取第一行作为标题
  if (title.includes('\n')) {
    title = title.split('\n')[0].trim()
  }

  // 2. 移除 Markdown 标题符号（# ## ###）
  title = title.replace(/^#+\s*/, '')

  // 3. 移除多余的标点符号和格式符号
  title = title.replace(/^[*\-•\s]+/, '')
  title = title.replace(/[*\-•\s]+$/, '')

  // 4. 移除【】等括号（保留括号内的内容）
  title = title.replace(/【([^】]+)】/g, '$1')

  // 5. 如果标题太长，截断
  if (title.length > 50) {
    title = title.slice(0, 47) + '...'
  }

  return title || 'AI生成行程'
}
