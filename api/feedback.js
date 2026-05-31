/**
 * 用户反馈 API
 * 接收用户反馈并通过邮件发送到指定邮箱
 */

const nodemailer = require('nodemailer')
const express = require('express')

const router = express.Router()

// 配置目标邮箱
const FEEDBACK_EMAIL = '748987578@qq.com'

/**
 * POST /api/feedback/submit
 * 提交用户反馈
 * Body: { type, description, contact, files? }
 */
router.post('/submit', async (req, res) => {
  try {
    const { type, description, contact, files } = req.body
    
    // 验证必填字段
    if (!type || !description) {
      return res.status(400).json({
        success: false,
        error: '请填写完整的反馈信息',
        code: 'MISSING_FIELDS'
      })
    }
    
    if (description.length < 10) {
      return res.status(400).json({
        success: false,
        error: '问题描述至少需要10个字符',
        code: 'DESCRIPTION_TOO_SHORT'
      })
    }
    
    // 构建邮件内容
    const typeLabels = {
      bug: '🐛 问题反馈',
      suggestion: '💡 功能建议',
      question: '❓ 使用咨询',
      other: '📝 其他'
    }
    
    const emailContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
    .body { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
    .field { margin-bottom: 15px; }
    .label { font-weight: bold; color: #555; }
    .value { background: white; padding: 12px; border-radius: 6px; margin-top: 5px; }
    pre { white-space: pre-wrap; word-break: break-word; margin: 0; font-family: inherit; }
    .footer { text-align: center; margin-top: 20px; color: #999; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2 style="margin: 0;">📬 新的用户反馈</h2>
    </div>
    <div class="body">
      <div class="field">
        <div class="label">反馈类型：</div>
        <div class="value">${typeLabels[type] || type}</div>
      </div>
      
      ${contact ? `
      <div class="field">
        <div class="label">联系方式：</div>
        <div class="value">${escapeHtml(contact)}</div>
      </div>
      ` : ''}
      
      <div class="field">
        <div class="label">问题描述：</div>
        <div class="value"><pre>${escapeHtml(description)}</pre></div>
      </div>
      
      <div class="field">
        <div class="label">提交时间：</div>
        <div class="value">${new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })}</div>
      </div>
      
      <div class="field">
        <div class="label">客户端信息：</div>
        <div class="value">
          IP: ${req.ip || '未知'}<br>
          User-Agent: ${req.headers['user-agent']?.substring(0, 200) || '未知'}
        </div>
      </div>
    </div>
    <div class="footer">
      <p>此邮件由旅行规划应用自动发送，请勿直接回复。</p>
    </div>
  </div>
</body>
</html>`
    
    // 尝试发送邮件（如果配置了邮件服务）
    let emailSent = false
    let emailError = null
    
    // 检查是否配置了邮件服务
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      try {
        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: parseInt(process.env.SMTP_PORT) || 465,
          secure: true,
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
        })
        
        await transporter.sendMail({
          from: `"旅行规划应用" <${process.env.SMTP_USER}>`,
          to: FEEDBACK_EMAIL,
          subject: `[用户反馈] ${typeLabels[type] || type} - ${new Date().toLocaleDateString('zh-CN')}`,
          html: emailContent,
        })
        
        emailSent = true
        console.log(`[Feedback] 邮件发送成功 -> ${FEEDBACK_EMAIL}`)
      } catch (err) {
        emailError = err.message
        console.error('[Feedback] 邮件发送失败:', err)
      }
    } else {
      console.log('[Feedback] 未配置SMTP服务，跳过邮件发送')
      console.log('[Feedback] 反馈内容:', { type, description, contact })
    }
    
    // 返回成功响应
    res.json({
      success: true,
      message: '感谢您的反馈！我们会尽快处理。',
      data: {
        id: `FB_${Date.now()}`,
        type,
        descriptionLength: description.length,
        emailSent,
        submittedAt: new Date().toISOString(),
        ...(emailError ? { warning: `邮件发送失败: ${emailError}`.substring(0, 100) } : {})
      }
    })
    
  } catch (error) {
    console.error('[Feedback] 处理失败:', error)
    res.status(500).json({
      success: false,
      error: '服务器内部错误，请稍后重试',
      code: 'INTERNAL_ERROR'
    })
  }
})

/**
 * HTML 转义，防止 XSS
 */
function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  }
  return String(text).replace(/[&<>"']/g, m => map[m])
}

module.exports = router
