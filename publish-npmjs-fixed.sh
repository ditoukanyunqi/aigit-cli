#!/bin/bash

echo "🚀 准备发布到官方 npm (npmjs.com) - 修复版..."

# 检查git状态
if [[ -n $(git status --porcelain) ]]; then
    echo "❌ 工作目录不干净，请先提交所有更改"
    git status
    exit 1
fi

echo "✅ Git工作目录干净"

# 检查必要文件
echo "📋 检查必要文件..."
required_files=("README.md" "LICENSE" "package.json" "bin/aigit.js")
for file in "${required_files[@]}"; do
    if [[ ! -f "$file" ]]; then
        echo "❌ 缺少必要文件: $file"
        exit 1
    fi
    echo "✅ $file"
done

# 检查package.json配置
echo "⚙️ 检查package.json配置..."
if ! grep -q '"files"' package.json; then
    echo "❌ package.json缺少files字段"
    exit 1
fi

if ! grep -q '"readme"' package.json; then
    echo "❌ package.json缺少readme字段"
    exit 1
fi

echo "✅ package.json配置正确"

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

# 显示包内容预览
echo "📦 包内容预览..."
npm pack --dry-run

# 确认发布
echo ""
echo "📦 准备发布包: aigit-cli"
echo "📋 当前版本: $(node -p "require('./package.json').version")"
echo "🌐 目标registry: https://registry.npmjs.org/"
echo "📄 包含文件: $(node -p "require('./package.json').files.join(', ')")"
echo ""
read -p "确认发布到官方npm? (y/N): " -n 1 -r
echo

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🚀 开始发布..."
    npm publish --registry=https://registry.npmjs.org/
    
    if [ $? -eq 0 ]; then
        echo "✅ 发布成功！"
        echo "📦 包地址: https://www.npmjs.com/package/aigit-cli"
        echo "📖 README应该会在几分钟内显示在npm首页"
    else
        echo "❌ 发布失败"
        exit 1
    fi
else
    echo "❌ 取消发布"
    exit 0
fi
