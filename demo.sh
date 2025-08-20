#!/bin/bash

echo "🚀 AIGit CLI 工具演示"
echo "========================"
echo ""

echo "1. 查看帮助信息:"
echo "   node bin/aigit.js --help"
echo ""

echo "2. 查看配置帮助:"
echo "   node bin/aigit.js --config-help"
echo ""

echo "3. 基本使用（需要AI API密钥）:"
echo "   node bin/aigit.js"
echo ""

echo "4. 预览模式（不提交，不add）:"
echo "   aigit -d"
echo ""

echo "5. 指定参数:"
echo "   aigit -p openai -m gpt-4 -l 中文 -s conventional"
echo ""

echo "📝 使用前准备:"
echo "1. 确保在git仓库目录中"
echo "2. 使用 git add 添加文件到暂存区"
echo "3. 配置OpenAI API密钥（首次运行时会提示）"
echo ""

echo "🔑 配置AI服务的方法:"
echo "1. 交互式配置（推荐）: 首次运行时按提示选择提供商并输入API密钥"
echo "2. 环境变量: export AI_PROVIDER='openai' && export OPENAI_API_KEY='your-key'"
echo "3. 配置文件: 创建 ~/.aigitrc 文件"
echo ""

echo "💡 提示:"
echo "- 使用 -d 预览生成的commit message（不提交，不add）"
echo "- 默认自动执行 git add . 和提交"
echo "- 自动尝试合并master分支"
echo "- 支持多种commit message风格"
echo "- 支持中英文等多种语言"
echo "- 支持OpenAI和DeepSeek两种AI服务"
