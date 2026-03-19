#!/bin/bash

# 提肛了小程序 - 快速启动脚本

echo "🍑 提肛了 - 健康提肛训练小程序"
echo "================================"
echo ""

# 检查 Node.js
if ! command -v node &> /dev/null; then
    echo "❌ 未检测到 Node.js，请先安装 Node.js"
    exit 1
fi

echo "✅ Node.js 版本：$(node -v)"
echo ""

# 检查依赖
if [ ! -d "node_modules" ]; then
    echo "📦 首次运行，正在安装依赖..."
    npm install
    
    if [ $? -ne 0 ]; then
        echo "❌ 依赖安装失败，请检查网络或手动运行 npm install"
        exit 1
    fi
    echo "✅ 依赖安装完成"
    echo ""
fi

# 检查配置
if grep -q "__UNI__TIGANG_APP" src/manifest.json; then
    echo "⚠️  警告：manifest.json 中 AppID 未配置"
    echo "   请打开 src/manifest.json 并填入你的小程序 AppID"
    echo ""
fi

# 启动开发服务器
echo "🚀 启动开发服务器..."
echo ""
npm run dev:mp-weixin

echo ""
echo "✅ 开发服务器已启动"
echo ""
echo "📱 下一步："
echo "   1. 打开微信开发者工具"
echo "   2. 导入项目目录：$(pwd)/dist/dev/mp-weixin"
echo "   3. 开始调试和开发"
echo ""
echo "💡 提示：配置云开发环境后，记得上传云函数"
echo ""
