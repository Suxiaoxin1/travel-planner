/**
 * Vercel Edge Function — SSE 流式对话 API
 * 调用 DeepSeek OpenAI 兼容 API，转换 SSE 格式为前端期望格式
 */

export const config = {
  runtime: 'edge',
}

const SYSTEM_PROMPT = `你是一位专业的旅行规划顾问 AI，你的名字叫"旅行小助手"。

你擅长：
- 根据用户的偏好、预算、时间等需求，提供个性化的旅行建议
- 规划详细的行程安排（包括交通、住宿、餐饮、景点推荐）
- 结合用户的 MBTI 性格和旅行画像，给出最适合的旅行方案
- 回答关于目的地、签证、天气、文化等各种旅行相关问题

你的风格：
- 热情友好，像一位旅行达人朋友
- 回答结构清晰，善于使用列表和分段
- 注重实用性和可行性
- 会主动追问关键信息（如预算、出行时间、同行人数等）以给出更好的建议

当用户提到自己的旅行风格偏好时，你会参考以下维度：
- 节奏偏好：精确规划型 / 半日规划型 / 愿望清单型 / 即兴驱动型
- 社交偏好：独立独行型 / 温和陪伴型 / 社交猎手型 / 组织者型
- 规划风格：战略规划 / 贴心安排 / 灵感驱动 / 即兴行动 等
- 预算倾向：精打细算 / 中等消费 / 品质消费 / 奢华体验

请始终用中文回答。`

function buildProfilePrompt(personaData, mbtiData) {
  if (!personaData && !mbtiData) return ''

  const parts = ['\n\n## 当前用户的个性化信息（请务必结合这些信息生成旅行规划）\n']

  if (mbtiData) {
    const mbtiType = mbtiData.mbtiType || ''
    const mbtiName = mbtiData.mbtiTypeName || ''
    if (mbtiType) {
      parts.push(`### MBTI 性格类型：${mbtiType}（${mbtiName}）\n`)
    }

    const dimensions = mbtiData.dimensions || {}
    if (Object.keys(dimensions).length > 0) {
      parts.push('**维度分析：**\n')
      const dimNames = {
        EI: ['外向E', '内向I'],
        SN: ['感觉S', '直觉N'],
        TF: ['思维T', '情感F'],
        JP: ['判断J', '知觉P'],
      }
      for (const [dimKey, dimVal] of Object.entries(dimensions)) {
        const [lName, rName] = dimNames[dimKey] || ['', '']
        const leftPct = dimVal.leftPercent || 0
        const rightPct = dimVal.rightPercent || 0
        const dominant = dimVal.dominant || ''
        parts.push(`- ${dimKey}: ${lName} ${leftPct}% / ${rName} ${rightPct}%（偏好：${dominant}）\n`)
      }
    }

    const travelFields = [
      ['pace', '节奏偏好'], ['social', '社交偏好'], ['planningStyle', '规划风格'],
      ['travelStyle', '旅行风格'], ['destinationTypes', '偏好目的地类型'],
      ['activities', '偏好活动'], ['accommodation', '偏好住宿'],
      ['decisionFactors', '决策因素'], ['aversion', '反感事项'],
      ['tips', '旅行建议'],
    ]
    for (const [field, label] of travelFields) {
      const val = mbtiData[field]
      if (val) {
        parts.push(`- ${label}：${Array.isArray(val) ? val.join(', ') : val}\n`)
      }
    }
  }

  if (personaData) {
    const profileTitle = personaData.profileTitle || ''
    const profileDesc = personaData.profileDesc || ''
    if (profileTitle) parts.push(`\n### 人物画像：${profileTitle}\n`)
    if (profileDesc) parts.push(`${profileDesc}\n`)

    const personaFields = [
      ['adventureLabel', '冒险倾向'], ['socialLabel', '社交倾向'],
      ['budgetLabel', '消费倾向'], ['travelStyle', '旅行风格'],
      ['destinations', '推荐目的地'], ['tips', '旅行建议'],
    ]
    for (const [field, label] of personaFields) {
      const val = personaData[field]
      if (val) {
        parts.push(`- ${label}：${Array.isArray(val) ? val.join(', ') : val}\n`)
      }
    }
  }

  parts.push('\n**重要**：请紧密围绕以上用户的性格特征和偏好来推荐目的地、活动、住宿和行程节奏，让规划真正贴合用户个性。\n')

  return parts.join('')
}

function cleanThinkingTags(text) {
  return text.replace(/<think\s*.*?<\/think\s*>/gs, '').trim()
}

export default async function handler(request) {
  // CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    })
  }

  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const apiKey = process.env.DEEPSEEK_API_KEY
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'DEEPSEEK_API_KEY 未配置' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const baseUrl = process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com'
  const model = process.env.DEEPSEEK_MODEL || 'deepseek-chat'

  let body
  try {
    body = await request.json()
  } catch {
    return new Response(JSON.stringify({ error: '请求体解析失败' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const messages = body.messages || []
  const useProfile = body.use_profile || false
  const profileData = body.profile_data || {}

  if (messages.length === 0) {
    return new Response(JSON.stringify({ error: 'messages 不能为空' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // Build system prompt
  let systemContent = SYSTEM_PROMPT
  if (useProfile && profileData) {
    systemContent += buildProfilePrompt(profileData.persona, profileData.mbti)
  }

  const hasSystem = messages.some(m => m.role === 'system')
  const finalMessages = hasSystem ? messages : [{ role: 'system', content: systemContent }, ...messages]

  // Call DeepSeek API with SSE
  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder()

      function sendSSE(data) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))
      }

      try {
        const resp = await fetch(`${baseUrl}/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: body.model || model,
            messages: finalMessages,
            stream: true,
            temperature: 0.7,
            top_p: 0.9,
            max_tokens: 4096,
          }),
        })

        if (!resp.ok) {
          const errText = await resp.text().catch(() => '')
          sendSSE({ error: `DeepSeek API 返回 HTTP ${resp.status}: ${errText}` })
          controller.enqueue(encoder.encode('data: [DONE]\n\n'))
          controller.close()
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
            if (dataStr === '[DONE]') continue

            try {
              const data = JSON.parse(dataStr)
              const delta = data.choices?.[0]?.delta
              const finishReason = data.choices?.[0]?.finish_reason

              if (delta?.content) {
                fullContent += delta.content
                sendSSE({ token: delta.content })
              }

              if (finishReason === 'stop') {
                const cleaned = cleanThinkingTags(fullContent)
                sendSSE({ done: true, full_content: cleaned })
              }
            } catch {
              // JSON parse error, skip
            }
          }
        }

        // If stream ended without finish_reason
        if (fullContent) {
          const cleaned = cleanThinkingTags(fullContent)
          sendSSE({ done: true, full_content: cleaned })
        }

        controller.enqueue(encoder.encode('data: [DONE]\n\n'))
        controller.close()
      } catch (e) {
        sendSSE({ error: e.message || 'DeepSeek API 调用异常' })
        controller.enqueue(encoder.encode('data: [DONE]\n\n'))
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
    },
  })
}
