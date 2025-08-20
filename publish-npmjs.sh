#!/bin/bash

echo "🚀 准备发布到官方 npm (npmjs.com)..."

# 检查git状态
if [[ -n $(git status --porcelain) ]]; then
    echo "❌ 工作目录不干净，请先提交所有更改"
    git status
    exit 1
fi

echo "✅ Git工作目录干净"

# 检查是否登录官方npm
echo "🔐 检查npm登录状态..."
if ! npm whoami --registry=https://registry.npmjs.org/ 2>/dev/null; then
    echo "❌ 未登录官方npm，请先登录"
    echo "运行: npm login --registry=https://registry.npmjs.org/"
    exit 1
fi

echo "✅ 已登录官方npm"

# 运行测试
echo "🧪 运行测试..."
npm test

# 确认发布
echo ""
echo "📦 准备发布包: aigit-cli"
echo "📋 当前版本: $(node -p "require('./package.json').version")"
echo "🌐 目标registry: https://registry.npmjs.org/"
echo ""
read -p "确认发布到官方npm? (y/N): " -n 1 -r
echo

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🚀 开始发布..."
    npm publish --registry=https://registry.npmjs.org/
    
    if [ $? -eq 0 ]; then
        echo "✅ 发布成功！"
        echo "📦 包地址: https://www.npmjs.com/package/aigit-cli"
    else
        echo "❌ 发布失败"
        exit 1
    fi
else
    echo "❌ 取消发布"
    exit 0
fi
