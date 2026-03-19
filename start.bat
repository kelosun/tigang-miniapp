@echo off
echo 🍑 提肛了 - 健康提肛训练小程序
echo ================================
echo.

REM 检查 Node.js
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ 未检测到 Node.js，请先安装 Node.js
    pause
    exit /b 1
)

echo ✅ Node.js 版本:
node -v
echo.

REM 检查依赖
if not exist "node_modules" (
    echo 📦 首次运行，正在安装依赖...
    call npm install
    
    if %ERRORLEVEL% NEQ 0 (
        echo ❌ 依赖安装失败，请检查网络或手动运行 npm install
        pause
        exit /b 1
    )
    echo ✅ 依赖安装完成
    echo.
)

REM 启动开发服务器
echo 🚀 启动开发服务器...
echo.
call npm run dev:mp-weixin

echo.
echo ✅ 开发服务器已启动
echo.
echo 📱 下一步：
echo    1. 打开微信开发者工具
echo    2. 导入项目目录：%cd%\dist\dev\mp-weixin
echo    3. 开始调试和开发
echo.
echo 💡 提示：配置云开发环境后，记得上传云函数
echo.
pause
