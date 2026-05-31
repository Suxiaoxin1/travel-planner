@echo off
chcp 65001 >nul
echo ========================================
echo   人物画像分析模块 - 一键启动
echo ========================================
echo.

REM 检查Python是否安装
echo [1/5] 检查Python环境...
python --version >nul 2>&1
if errorlevel 1 (
    echo ✗ Python未安装，请先安装Python 3.8+
    pause
    exit /b 1
)
echo ✓ Python已安装
echo.

REM 检查Node.js是否安装
echo [2/5] 检查Node.js环境...
node --version >nul 2>&1
if errorlevel 1 (
    echo ✗ Node.js未安装，请先安装Node.js 16+
    pause
    exit /b 1
)
echo ✓ Node.js已安装
echo.

REM 创建Python虚拟环境并安装依赖
echo [3/5] 准备后端环境...
if not exist venv (
    echo   创建虚拟环境...
    python -m venv venv
)
echo   安装Python依赖...
call venv\Scripts\pip install -r requirements.txt -q
if errorlevel 1 (
    echo ✗ 后端依赖安装失败
    pause
    exit /b 1
)
echo ✓ 后端依赖安装完成
echo.

REM 安装前端依赖
echo [4/5] 准备前端环境...
if not exist node_modules (
    echo   安装npm依赖...
    call npm install -q
)
if errorlevel 1 (
    echo ✗ 前端依赖安装失败
    pause
    exit /b 1
)
echo ✓ 前端依赖安装完成
echo.

REM 启动服务
echo [5/5] 启动服务...
echo.
echo ========================================
echo   启动后端API服务...
echo   地址: <ADDRESS_REDACTED>
echo ========================================
start "后端API服务" cmd /k "venv\Scripts\python api_server.py"

REM 等待后端启动
timeout /t 3 /nobreak >nul

echo.
echo ========================================
echo   启动前端开发服务器...
echo   地址: <ADDRESS_REDACTED>
echo ========================================
start "前端开发服务器" cmd /k "npm run dev"

echo.
echo ========================================
echo   服务启动成功！
echo ========================================
echo.
echo 后端API: http://localhost:5000
echo 前端应用: http://localhost:5173
echo.
echo 测试步骤：
echo   1. 等待两个窗口都显示启动成功
echo   2. 打开浏览器访问: http://localhost:5173/persona-test
echo   3. 回答至少15道题目
echo   4. 点击"生成画像"按钮
echo   5. 查看分析结果
echo.
echo API测试（可选）：
echo   curl http://localhost:5000/api/health
echo.
echo 按任意键关闭此窗口...
pause >nul
