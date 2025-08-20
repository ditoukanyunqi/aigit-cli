#!/bin/bash

echo "🚀 AIGit CLI NPM发布脚本"
echo "========================="
echo ""

# 检查是否在git仓库中
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo "❌ 错误: 当前目录不是git仓库"
    exit 1
fi

# 检查是否有未提交的更改
if [[ -n $(git status --porcelain) ]]; then
    echo "⚠️  警告: 有未提交的更改"
    echo "建议先提交所有更改再发布"
    read -p "是否继续发布？(y/N): " continue_publish
    if [[ ! $continue_publish =~ ^[Yy]$ ]]; then
        echo "❌ 发布已取消"
        exit 1
    fi
fi

# 检查是否已登录npm
echo "🔐 检查npm登录状态..."
if ! npm whoami > /dev/null 2>&1; then
    echo "❌ 未登录npm，请先登录"
    echo "运行: npm login"
    exit 1
fi

echo "✅ 已登录npm: $(npm whoami)"
echo "🌐 当前registry: $(npm config get registry)"
echo ""

# 显示当前包信息
echo "📦 当前包信息:"
echo "名称: $(node -p "require('./package.json').name")"
echo "版本: $(node -p "require('./package.json').version")"
echo "描述: $(node -p "require('./package.json').description")"
echo ""

# 确认发布
read -p "确认发布到npm？(y/N): " confirm_publish
if [[ ! $confirm_publish =~ ^[Yy]$ ]]; then
    echo "❌ 发布已取消"
    exit 1
fi

# 运行测试
echo "🧪 运行测试..."
npm test

if [ $? -ne 0 ]; then
    echo "❌ 测试失败，发布已取消"
    exit 1
fi

echo "✅ 测试通过"
echo ""

# 检查包大小
echo "📏 检查包大小..."
npm pack --dry-run

echo ""
echo "📤 正在发布到npm..."

# 发布到npm
npm publish

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 发布成功！"
    echo ""
    echo "📋 安装说明:"
    echo "npm install -g aigit-cli"
    echo ""
    echo "🚀 使用说明:"
    echo "aigit --help"
    echo ""
    echo "📖 文档: https://www.npmjs.com/package/aigit-cli"
else
    echo "❌ 发布失败"
    exit 1
fi
