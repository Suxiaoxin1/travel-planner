@echo off
chcp 65001 >nul
echo ===================================
echo  旅行规划助手 - 启动所有服务
echo ===================================

REM 检查 Python 环境
python --version >nul 2>&1
if errorlevel 1 (
    echo [错误] 未找到 Python，请先安装 Python 3.8+
    pause
    exit /b 1
)

REM 检查 Node.js 环境
node --version >nul 2>&1
if errorlevel 1 (
    echo [错误] 未找到 Node.js，请先安装 Node.js 16+
    pause
    exit /b 1
)

echo.
echo [1/4] 检查依赖...
if not exist "node_modules\" (
    echo   安装前端依赖中...
    call npm install
)
echo   依赖检查完成

echo.
echo [2/4] 启动后端 API 服务（端口 5000）...
start "API Server (5000)" cmd /k "python api_server.py"
timeout /t 3 >nul

echo.
echo [3/4] 启动行程导入 API 服务（端口 5001）...
start "Trip Import API (5001)" cmd /k "python trip_import.py"
timeout /t 3 >nul

echo.
echo [4/4] 启动前端开发服务器（端口 3000）...
start "Frontend Dev Server (3000)" cmd /k "node dev-server.mjs"
timeout /t 5 >nul

echo.
echo ===================================
echo  所有服务已启动！
echo ===================================
echo.
echo 服务地址：
echo   - 前端页面：http://localhost:3000
echo   - 后端 API：http://localhost:5000
echo   - 导入 API：http://localhost:5001
echo.
echo 页面导航：
echo   - 首页：http://localhost:3000/home
echo   - AI 规划：http://localhost:3000/ai-plan
echo   - 行程管理：http://localhost:3000/trip-manage
echo.
echo 使用说明：
echo   1. 在 AI 规划页面与 AI 对话生成行程
echo   2. AI 回复后，点击"导入个人行程"按钮
echo   3. 系统会自动解析行程并保存到"行程管理"页面
echo.
echo 提示：关闭此窗口不会停止服务，请手动关闭各服务窗口
echo ===================================
echo.
pause
