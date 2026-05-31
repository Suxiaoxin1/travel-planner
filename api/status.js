/**
 * Vercel Edge Function — 服务状态检查 API
 * 替代 /api/ollama/status，返回 DeepSeek API 连接状态
 */

export const config = {
  runtime: 'edge',
}

export default async function handler(request) {
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    })
  }

  const apiKey = process.env.DEEPSEEK_API_KEY
  const baseUrl = process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com'
  const model = process.env.DEEPSEEK_MODEL || 'deepseek-chat'

  if (!apiKey) {
    return new Response(
      JSON.stringify({
        connected: false,
        provider: 'deepseek',
        error: 'DEEPSEEK_API_KEY 未配置',
      }),
      { headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
    )
  }

  try {
    // Quick check: list models to verify API key is valid
    const resp = await fetch(`${baseUrl}/models`, {
      headers: { 'Authorization': `Bearer ${apiKey}` },
    })

    if (resp.ok) {
      const data = await resp.json()
      const models = (data.data || []).map(m => m.id)
      return new Response(
        JSON.stringify({
          connected: true,
          provider: 'deepseek',
          model_available: true,
          available_models: models,
          current_model: model,
        }),
        { headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
      )
    }

    return new Response(
      JSON.stringify({
        connected: false,
        provider: 'deepseek',
        error: `API 返回 HTTP ${resp.status}`,
      }),
      { headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
    )
  } catch (e) {
    return new Response(
      JSON.stringify({
        connected: false,
        provider: 'deepseek',
        error: e.message || '无法连接 DeepSeek API',
      }),
      { headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
    )
  }
}
