#!/bin/bash

echo "📦 AIGit CLI 版本管理脚本"
echo "=========================="
echo ""

# 获取当前版本
current_version=$(node -p "require('./package.json').version")
echo "当前版本: $current_version"

echo ""
echo "选择操作:"
echo "1. 补丁版本 (patch) - 修复bug"
echo "2. 次要版本 (minor) - 新功能"
echo "3. 主要版本 (major) - 破坏性更改"
echo "4. 自定义版本"
echo "5. 退出"
echo ""

read -p "请选择 (1-5): " choice

case $choice in
    1)
        echo "📈 升级补丁版本..."
        npm version patch --no-git-tag-version
        ;;
    2)
        echo "📈 升级次要版本..."
        npm version minor --no-git-tag-version
        ;;
    3)
        echo "📈 升级主要版本..."
        npm version major --no-git-tag-version
        ;;
    4)
        read -p "请输入新版本号 (格式: x.y.z): " custom_version
        if [[ $custom_version =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
            echo "📈 设置自定义版本: $custom_version"
            npm version $custom_version --no-git-tag-version
        else
            echo "❌ 版本号格式错误，应为 x.y.z"
            exit 1
        fi
        ;;
    5)
        echo "👋 退出"
        exit 0
        ;;
    *)
        echo "❌ 无效选择"
        exit 1
        ;;
esac

# 获取新版本
new_version=$(node -p "require('./package.json').version")
echo ""
echo "✅ 版本已更新: $current_version → $new_version"

# 显示git状态
echo ""
echo "📊 Git状态:"
git status --porcelain

# 询问是否提交版本更改
echo ""
read -p "是否提交版本更改？(Y/n): " commit_changes
if [[ ! $commit_changes =~ ^[Nn]$ ]]; then
    git add package.json
    git commit -m "chore: bump version to $new_version"
    echo "✅ 版本更改已提交"
fi

echo ""
echo "🎯 下一步操作:"
echo "1. 测试新版本: npm test"
echo "2. 发布到npm: ./publish-npm.sh"
echo "3. 创建git tag: git tag v$new_version"
