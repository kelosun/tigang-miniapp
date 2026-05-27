#!/bin/bash
echo "🔍 验证项目编译..."
echo ""

# 检查编译目录
if [ -d "dist/dev/mp-weixin" ]; then
    echo "✅ 编译目录存在"
else
    echo "❌ 编译目录不存在"
    exit 1
fi

# 检查关键文件
files=("app.json" "app.js" "app.wxss" "pages/index/index.js" "pages/train/train.js" "pages/profile/profile.js")
all_ok=true

for file in "${files[@]}"; do
    if [ -f "dist/dev/mp-weixin/$file" ]; then
        echo "✅ $file"
    else
        echo "❌ $file 缺失"
        all_ok=false
    fi
done

echo ""
if [ "$all_ok" = true ]; then
    echo "🎉 编译成功！所有文件已生成"
    echo ""
    echo "📱 下一步操作："
    echo "   1. 打开微信开发者工具"
    echo "   2. 导入目录：$(pwd)/dist/dev/mp-weixin"
    echo "   3. 开始调试和开发"
    echo ""
    echo "☁️ 上传云函数："
    echo "   方式一：微信开发者工具中右键 src/cloudfunctions/login → 上传并部署"
    echo "   方式二：通过云开发控制台上传"
    echo ""
else
    echo "❌ 编译失败，请检查错误日志"
    exit 1
fi
