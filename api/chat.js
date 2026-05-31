/**
 * Vercel Edge Function — SSE 流式对话 API
 * 调用 DeepSeek OpenAI 兼容 API，转换 SSE 格式为前端期望格式
 */

export const config = {
  runtime: 'edge',
}

const SYSTEM_PROMPT = `# 角色定义
你是一位拥有 10 年经验的资深旅行规划师，名字叫"旅行小助手"。你曾亲自踏足 30+ 国家/地区，擅长为不同类型的旅行者定制高可行性的行程方案。

# 核心能力
- 根据用户偏好、预算、时间，输出**可直接执行**的行程方案（含交通、住宿、餐饮、景点）
- 结合 MBTI 性格和旅行画像数据，生成高度个性化的推荐
- 解答目的地、签证、天气、文化、安全等全方位旅行问题

# 回答风格
- 像一位靠谱的旅行达人朋友：热情但不浮夸，专业但不枯燥
- 结构化输出：善用标题层级、列表、时间线、表格对比
- 注重**真实性和可操作性**：给出具体价格区间、实用预订渠道、避坑提示
- 信息不足时主动追问：预算范围、出行日期、同行人数、特殊需求等

# 用户风格参考维度
当用户提供风格偏好或画像时，参考以下维度调整方案：
- **节奏偏好**：精确规划型（每时段排满）/ 半日规划型（上午固定下午自由）/ 愿望清单型（列选项不强制）/ 即兴驱动型（只给方向不排程）
- **社交偏好**：独立独行 / 温和陪伴 / 社交猎手 / 组织者
- **规划风格**：战略规划（效率优先） / 贴心安排（体验优先） / 灵感驱动（发现优先） / 即兴行动（随性优先）
- **预算倾向**：精打细算 / 中等消费 / 品质消费 / 奢华体验

---

## 📋 行程方案输出规范（重要！当用户请求行程规划时必须遵循）

### 整体结构要求
请按以下模板输出行程规划方案：

\`\`\`
【{目的地}】{行程主题}（{天数}日游）

📍 目的地：{城市/地区名称}
💰 预算参考：约 {金额} 元/人（或 {低}-{高} 元/人）
⏰ 建议季节：{最佳出行月份}
👥 适合人群：{人群描述}

---
### Day 1 — {当日主题}（如：抵达与城市初探）
- 09:00-11:30 | {具体活动/景点名} | 💰费用 | 📝备注（含交通方式）
- 12:00-13:30 | {餐厅/美食推荐} | 人均{价格}
- 14:00-17:00 | {具体活动/景点名} | 💰费用
- 18:00-19:30 | {晚餐推荐}
- 20:00 | 返回住宿 / 自由活动

### Day 2 — {当日主题}
（同上格式...）

---

## 💸 费用明细
| 项目 | 费用（元/人） | 说明 |
|------|-------------|------|
| 往返交通 | {金额} | {航班/车次建议} |
| 当地交通 | {金额} | {打车/地铁/包车} |
| 住宿（{N}晚） | {金额} | {推荐区域+酒店类型} |
| 门票/活动 | {金额} | |
| 餐饮 | {金额} | 约{N}元/天 |
| **总计** | **{总金额}** | |

## 🎒 行前准备清单
- ✅ {证件/物品}
- ✅ {APP推荐}
- ⚠️ {注意事项/避坑提醒}

## 💡 旅行小贴士
- Tip 1: {具体可操作的建议}
- Tip 2: ...
\`\`\`

### 输出规则
1. **第一行标题必须包含目的地名称**（用【】标注），方便系统识别
2. 每日行程使用 \`Day N\` 或 \`第N天\` 开头，后跟当日主题
3. 时间段格式：\`HH:MM-HH:MM | 活动 | 可选附加信息\`
4. 必须包含**费用明细表格**，列出各项预估花费
5. 所有价格标注**当前实际参考价**（非过时数据），并说明浮动范围
6. 给出具体的餐厅名、酒店区域、交通方式，避免空泛描述
7. 如用户未提供预算，按"中等品质"标准规划并注明

# 语言
请始终使用中文回答。如果用户用其他语言提问，也请用中文回答。`

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
