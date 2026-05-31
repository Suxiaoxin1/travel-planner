# 人物画像分析模块 - 快速启动脚本

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  人物画像分析模块 - 启动脚本" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 检查Python是否安装
Write-Host "[1/4] 检查Python环境..." -ForegroundColor Yellow
try {
    $pythonVersion = python --version 2>&1
    Write-Host "  ✓ Python已安装: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "  ✗ Python未安装，请先安装Python 3.8+" -ForegroundColor Red
    exit 1
}

# 检查Node.js是否安装
Write-Host "[2/4] 检查Node.js环境..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version 2>&1
    Write-Host "  ✓ Node.js已安装: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "  ✗ Node.js未安装，请先安装Node.js 16+" -ForegroundColor Red
    exit 1
}

# 安装后端依赖
Write-Host "[3/4] 安装后端依赖..." -ForegroundColor Yellow
if (-not (Test-Path "venv")) {
    Write-Host "  创建虚拟环境..." -ForegroundColor Gray
    python -m venv venv
}

# 激活虚拟环境并安装依赖
Write-Host "  安装Python依赖包..." -ForegroundColor Gray
& "venv\Scripts\pip" install -r requirements.txt

if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✓ 后端依赖安装完成" -ForegroundColor Green
} else {
    Write-Host "  ✗ 后端依赖安装失败" -ForegroundColor Red
    exit 1
}

# 安装前端依赖
Write-Host "[4/4] 安装前端依赖..." -ForegroundColor Yellow
if (-not (Test-Path "node_modules")) {
    Write-Host "  安装npm依赖包..." -ForegroundColor Gray
    npm install
}

if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✓ 前端依赖安装完成" -ForegroundColor Green
} else {
    Write-Host "  ✗ 前端依赖安装失败" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  安装完成！现在启动服务..." -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 启动后端服务（新窗口）
Write-Host "[启动] 后端API服务 (http://localhost:5000)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "venv\Scripts\python api_server.py"

# 等待3秒让后端启动
Start-Sleep -Seconds 3

# 启动前端服务（新窗口）
Write-Host "[启动] 前端开发服务器 (http://localhost:5173)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run dev"

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  服务启动成功！" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "后端API服务: http://localhost:5000" -ForegroundColor Cyan
Write-Host "前端开发服务器: http://localhost:5173" -ForegroundColor Cyan
Write-Host ""
Write-Host "测试流程：" -ForegroundColor Yellow
Write-Host "  1. 打开浏览器访问: http://localhost:5173/persona-test" -ForegroundColor White
Write-Host "  2. 回答至少15道题目" -ForegroundColor White
Write-Host "  3. 点击'生成画像'按钮" -ForegroundColor White
Write-Host "  4. 查看分析结果页面" -ForegroundColor White
Write-Host ""
Write-Host "API测试（可选）：" -ForegroundColor Yellow
Write-Host "  curl http://localhost:5000/api/health" -ForegroundColor White
Write-Host ""
Write-Host "按任意键退出..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
