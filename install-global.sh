#!/bin/bash

echo "🚀 AIGit CLI 全局安装脚本"
echo "============================="
echo ""

# 检查Node.js是否安装
if ! command -v node &> /dev/null; then
    echo "❌ 错误: 未找到Node.js，请先安装Node.js"
    echo "   下载地址: https://nodejs.org/"
    exit 1
fi

# 检查npm是否安装
if ! command -v npm &> /dev/null; then
    echo "❌ 错误: 未找到npm，请先安装npm"
    exit 1
fi

echo "✅ 检查到Node.js $(node --version) 和 npm $(npm --version)"
echo ""

# 安装依赖
echo "📦 正在安装依赖..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ 依赖安装失败"
    exit 1
fi

echo "✅ 依赖安装成功"
echo ""

# 创建全局链接
echo "🔗 正在创建全局链接..."
npm link

if [ $? -ne 0 ]; then
    echo "❌ 全局链接创建失败"
    exit 1
fi

echo "✅ 全局链接创建成功"
echo ""

# 验证安装
echo "🧪 验证安装..."
if command -v aigit &> /dev/null; then
    echo "✅ AIGit CLI 已成功安装到全局"
    echo "   命令路径: $(which aigit)"
    echo "   版本: $(aigit --version)"
    echo ""
    echo "🎉 现在你可以在任何目录下使用 'aigit' 命令了！"
    echo ""
    echo "📖 使用示例:"
    echo "   aigit --help              # 查看帮助"
    echo "   aigit --config-help       # 查看配置帮助"
    echo "   aigit                     # 生成commit message"
    echo "   aigit -p openai          # 使用OpenAI"
    echo "   aigit -p deepseek        # 使用DeepSeek"
else
    echo "❌ 安装验证失败"
    exit 1
fi

echo ""
echo "💡 提示:"
echo "- 配置文件保存在 ~/.aigitrc"
echo "- 首次运行会提示配置AI服务提供商和API密钥"
echo "- 使用 'npm unlink aigit' 可以卸载全局链接"
