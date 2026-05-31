#!/usr/bin/env node
// -*- coding: utf-8 -*-
/**
 * 本地开发服务器启动脚本
 *
 * 功能：
 *   1. 启动 Vite 开发服务器，监听指定端口（默认 3000）
 *   2. 启动成功后自动打开默认浏览器访问指定页面
 *   3. 端口被占用时输出明确错误提示并自动尝试下一个可用端口
 *   4. 页面加载失败时通过健康检查输出错误提示
 *   5. 优雅退出（Ctrl+C 时关闭服务器）
 *
 * 用法：
 *   node dev-server.mjs                        # 默认端口 3000，打开 /home
 *   node dev-server.mjs --port 8080            # 指定端口
 *   node dev-server.mjs --page /ai-plan        # 指定打开页面
 *   node dev-server.mjs --no-open              # 不自动打开浏览器
 */

import { createServer } from 'vite'
import { createRequire } from 'module'
import http from 'node:http'
import { exec } from 'node:child_process'
import { platform } from 'node:os'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

// ─── 常量 ─────────────────────────────────────────────
const __dirname = dirname(fileURLToPath(import.meta.url))
const DEFAULT_PORT = 3000
const DEFAULT_PAGE = '/home'
const MAX_PORT_ATTEMPTS = 10      // 端口被占用时最多尝试 10 个连续端口
const HEALTH_CHECK_TIMEOUT = 8000 // 健康检查超时（ms）

// ─── 颜色输出工具 ─────────────────────────────────────
const color = {
  red: (s) => `\x1b[31m${s}\x1b[0m`,
  green: (s) => `\x1b[32m${s}\x1b[0m`,
  yellow: (s) => `\x1b[33m${s}\x1b[0m`,
  cyan: (s) => `\x1b[36m${s}\x1b[0m`,
  bold: (s) => `\x1b[1m${s}\x1b[0m`,
}

// ─── 解析命令行参数 ───────────────────────────────────
function parseArgs() {
  const args = process.argv.slice(2)
  const options = {
    port: DEFAULT_PORT,
    page: DEFAULT_PAGE,
    openBrowser: true,
  }

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--port':
      case '-p':
        options.port = parseInt(args[++i], 10) || DEFAULT_PORT
        break
      case '--page':
        options.page = args[++i] || DEFAULT_PAGE
        break
      case '--no-open':
        options.openBrowser = false
        break
      case '--help':
      case '-h':
        printHelp()
        process.exit(0)
    }
  }
  return options
}

function printHelp() {
  console.log(`
${color.bold('本地开发服务器启动脚本')}

用法: node dev-server.mjs [选项]

选项:
  -p, --port <number>   指定监听端口 (默认: ${DEFAULT_PORT})
  --page <path>         启动后打开的页面路径 (默认: ${DEFAULT_PAGE})
  --no-open             不自动打开浏览器
  -h, --help            显示帮助信息

示例:
  node dev-server.mjs
  node dev-server.mjs --port 8080
  node dev-server.mjs --page /ai-plan
  node dev-server.mjs --port 3000 --page /profile --no-open
`)
}

// ─── 检查端口是否可用 ─────────────────────────────────
function checkPort(port) {
  return new Promise((resolve) => {
    const tester = http.createServer()
    tester.once('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        resolve({ available: false, port })
      } else {
        resolve({ available: false, port, error: err })
      }
    })
    tester.once('listening', () => {
      tester.close()
      resolve({ available: true, port })
    })
    tester.listen(port, '127.0.0.1')
  })
}

/**
 * 从指定端口开始，寻找第一个可用端口
 */
async function findAvailablePort(startPort) {
  for (let offset = 0; offset < MAX_PORT_ATTEMPTS; offset++) {
    const port = startPort + offset
    const result = await checkPort(port)
    if (result.available) {
      return { port, attempted: offset > 0 }
    }
    if (offset === 0) {
      console.log(color.yellow(`⚠ 端口 ${port} 已被占用，正在寻找可用端口...`))
    }
  }
  return null
}

// ─── 打开浏览器 ───────────────────────────────────────
function openBrowser(url) {
  const os = platform()
  let command

  switch (os) {
    case 'win32':
      command = `start "" "${url}"`
      break
    case 'darwin':
      command = `open "${url}"`
      break
    default:
      command = `xdg-open "${url}"`
  }

  exec(command, (error) => {
    if (error) {
      console.error(color.red(`✗ 自动打开浏览器失败: ${error.message}`))
      console.log(color.cyan(`  请手动访问: ${url}`))
    } else {
      console.log(color.green(`✓ 已在默认浏览器中打开: ${url}`))
    }
  })
}

// ─── 健康检查（验证页面是否可访问） ────────────────────
function healthCheck(url) {
  return new Promise((resolve) => {
    const timer = setTimeout(() => {
      resolve({ ok: false, message: `健康检查超时 (${HEALTH_CHECK_TIMEOUT}ms)` })
    }, HEALTH_CHECK_TIMEOUT)

    const req = http.get(url, (res) => {
      clearTimeout(timer)
      if (res.statusCode >= 200 && res.statusCode < 400) {
        resolve({ ok: true, statusCode: res.statusCode })
      } else {
        resolve({ ok: false, statusCode: res.statusCode, message: `HTTP ${res.statusCode}` })
      }
    })

    req.on('error', (err) => {
      clearTimeout(timer)
      resolve({ ok: false, message: err.message })
    })
  })
}

// ─── 主流程 ───────────────────────────────────────────
async function main() {
  const options = parseArgs()
  const projectRoot = __dirname

  console.log('')
  console.log(color.bold('══════════════════════════════════════════════'))
  console.log(color.bold('  旅行规划 AI - 本地开发服务器'))
  console.log(color.bold('══════════════════════════════════════════════'))
  console.log('')

  // 1. 检查端口可用性
  console.log(color.cyan('[1/4] 检查端口可用性...'))
  const portResult = await findAvailablePort(options.port)

  if (!portResult) {
    console.error(color.red(`✗ 端口 ${options.port} ~ ${options.port + MAX_PORT_ATTEMPTS - 1} 均被占用，无法启动服务器。`))
    console.log(color.yellow('  请尝试以下操作：'))
    console.log(color.yellow('    1. 使用 --port 指定其他端口'))
    console.log(color.yellow('    2. 关闭占用端口的程序'))
    console.log(color.yellow(`    3. Windows: netstat -ano | findstr :${options.port}`))
    process.exit(1)
  }

  const finalPort = portResult.port
  if (portResult.attempted) {
    console.log(color.yellow(`⚠ 端口 ${options.port} 被占用，已自动切换到端口 ${finalPort}`))
  } else {
    console.log(color.green(`✓ 端口 ${finalPort} 可用`))
  }

  // 2. 启动 Vite 开发服务器（带端口冲突重试）
  console.log(color.cyan('[2/4] 启动 Vite 开发服务器...'))

  let server
  let actualPort = finalPort

  for (let attempt = 0; attempt < MAX_PORT_ATTEMPTS; attempt++) {
    try {
      server = await createServer({
        root: projectRoot,
        server: {
          port: actualPort,
          strictPort: true, // 端口不可用时直接报错，由我们的逻辑自动寻找下一个可用端口
          host: '0.0.0.0',
          open: false, // 我们自己控制打开浏览器
          allowedHosts: true,
          proxy: {
            '/api': {
              target: 'http://localhost:5000',
              changeOrigin: true,
            },
          },
        },
      })

      await server.listen()
      break // 启动成功，跳出循环
    } catch (err) {
      if (err.message && err.message.includes('already in use')) {
        console.log(color.yellow(`⚠ 端口 ${actualPort} 被占用，尝试端口 ${actualPort + 1}...`))
        actualPort++
        if (attempt === MAX_PORT_ATTEMPTS - 1) {
          console.error(color.red(`✗ 端口 ${finalPort} ~ ${actualPort} 均被占用，无法启动服务器。`))
          console.log(color.yellow('  请尝试以下操作：'))
          console.log(color.yellow('    1. 使用 --port 指定其他端口'))
          console.log(color.yellow('    2. 关闭占用端口的程序'))
          console.log(color.yellow(`    3. Windows: netstat -ano | findstr :${finalPort}`))
          process.exit(1)
        }
      } else {
        console.error(color.red(`✗ 启动 Vite 服务器失败: ${err.message}`))
        process.exit(1)
      }
    }
  }

  if (actualPort !== options.port) {
    console.log(color.yellow(`⚠ 端口 ${options.port} 不可用，已自动切换到端口 ${actualPort}`))
  }

  const serverUrl = `http://localhost:${actualPort}`
  console.log(color.green(`✓ Vite 开发服务器已启动`))
  console.log(`  本地访问: ${color.cyan(serverUrl)}`)
  console.log(`  局域网:   ${color.cyan(`http://0.0.0.0:${actualPort}`)}`)

  // 3. 健康检查
  console.log(color.cyan('[3/4] 执行健康检查...'))
  const targetUrl = `${serverUrl}${options.page}`
  const health = await healthCheck(targetUrl)

  if (health.ok) {
    console.log(color.green(`✓ 页面 ${options.page} 可访问 (HTTP ${health.statusCode})`))
  } else {
    console.error(color.red(`✗ 页面 ${options.page} 加载失败: ${health.message}`))
    console.log(color.yellow('  服务器已启动，但页面可能无法正常显示。'))
    console.log(color.yellow('  请检查：'))
    console.log(color.yellow('    1. 前端代码是否存在语法错误'))
    console.log(color.yellow('    2. 后端 API 服务是否已启动 (python api_server.py)'))
    console.log(color.yellow(`    3. 手动访问 ${serverUrl} 确认`))
  }

  // 4. 打开浏览器
  console.log(color.cyan('[4/4] 打开浏览器...'))
  if (options.openBrowser) {
    openBrowser(targetUrl)
  } else {
    console.log(color.yellow('⊘ 已跳过自动打开浏览器 (--no-open)'))
    console.log(`  请手动访问: ${color.cyan(targetUrl)}`)
  }

  // 输出汇总
  console.log('')
  console.log(color.bold('══════════════════════════════════════════════'))
  console.log(color.green('  服务器启动成功！'))
  console.log(color.bold('══════════════════════════════════════════════'))
  console.log(`  前端地址: ${color.cyan(serverUrl)}`)
  console.log(`  打开页面: ${color.cyan(targetUrl)}`)
  console.log(`  根目录:   ${color.cyan(projectRoot)}`)
  console.log('')
  console.log(color.yellow('  按 Ctrl+C 停止服务器'))
  console.log('')

  // 优雅退出
  const shutdown = async () => {
    console.log('')
    console.log(color.cyan('正在关闭服务器...'))
    try {
      await server.close()
      console.log(color.green('✓ 服务器已关闭'))
    } catch (err) {
      console.error(color.red(`✗ 关闭服务器时出错: ${err.message}`))
    }
    process.exit(0)
  }

  process.on('SIGINT', shutdown)
  process.on('SIGTERM', shutdown)

  // Windows 下 Ctrl+C 处理
  if (platform() === 'win32') {
    process.on('SIGHUP', shutdown)
  }
}

main().catch((err) => {
  console.error(color.red(`✗ 未知错误: ${err.message}`))
  process.exit(1)
})
