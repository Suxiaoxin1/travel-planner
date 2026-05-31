/**
 * AI 对话服务
 * 封装与后端 /api/chat 的交互，支持流式 SSE 和非流式两种模式
 * 支持传入用户画像/MBTI 数据以生成个性化旅行规划
 */

const API_BASE = '/api'

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

/**
 * 客户端行程解析（当后端服务不可用时的兜底方案）
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
    aiPlanContent: planContent,  // 保留AI原始内容
  }

  // 提取目的地
  const destPatterns = [
    /目的地[：:]\s*([^\n]+)/,
    /去\s*([^\n]{2,10}?)\s*(旅行|旅游|游玩|玩)/,
    /([\u4e00-\u9fa5]{2,10})\s*(行程|旅行|旅游|攻略)/,
  ]
  for (const pattern of destPatterns) {
    const match = planContent.match(pattern)
    if (match) {
      result.destination = match[1].trim()
      break
    }
  }

  // 常见目的地匹配
  if (!result.destination) {
    const commonDests = ['北京','上海','广州','深圳','成都','杭州','西安','南京','重庆','武汉','厦门','昆明','大理','丽江','三亚','青岛','大连','哈尔滨','拉萨','东京','大阪','京都','首尔','巴黎','伦敦','纽约','洛杉矶','悉尼','曼谷','新加坡','吉隆坡']
    for (const dest of commonDests) {
      if (planContent.substring(0, 500).includes(dest)) {
        result.destination = dest
        break
      }
    }
  }

  // 提取预算
  const budgetPatterns = [
    /预算[：:]\s*([0-9]+)/,
    /总预算[：:]\s*([0-9]+)/,
    /约\s*([0-9]+)\s*元/,
    /¥\s*([0-9]+)/,
  ]
  for (const pattern of budgetPatterns) {
    const match = planContent.match(pattern)
    if (match) {
      result.budget.total = parseInt(match[1])
      break
    }
  }

  // 解析每日行程
  const lines = planContent.split('\n')
  let currentDay = null
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
      } else if (/^[-*•]/.test(line)) {
        const activityName = line.replace(/^[-*•\s]+/, '').trim()
        if (activityName) {
          activities.push({ time: '', name: activityName, type: 'sightseeing', note: '' })
        }
      }
    }
  }

  if (currentDay !== null) {
    result.days.push({ day: currentDay, title: currentTitle, date: '', activities })
  }

  // 估算日期
  if (result.days.length > 0) {
    const now = new Date()
    const start = new Date(now)
    const end = new Date(now)
    end.setDate(end.getDate() + result.days.length - 1)
    result.startDate = start.toISOString().slice(0, 10)
    result.endDate = end.toISOString().slice(0, 10)

    result.days.forEach((dayData, i) => {
      if (!dayData.date) {
        const d = new Date(now)
        d.setDate(d.getDate() + i)
        dayData.date = d.toISOString().slice(0, 10)
      }
    })
  }

  return result
}

/**
 * 将 AI 旅行规划导入个人行程
 * 优先调用后端解析服务，服务不可用时使用客户端解析兜底
 */
export async function importTripPlan({ conversationId, messageId, planContent, title, userId }) {
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

  // 保存到前端行程列表
  const { addTrip } = await import('../stores/trip.js')
  addTrip(tripData)

  return {
    success: true,
    message: '行程导入成功！',
    data: tripData
  }
}
