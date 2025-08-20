#!/bin/bash

echo "🗑️  AIGit CLI 全局卸载脚本"
echo "============================="
echo ""

# 检查是否已安装
if ! command -v aigit &> /dev/null; then
    echo "ℹ️  AIGit CLI 未在全局安装"
    exit 0
fi

echo "📍 当前安装位置: $(which aigit)"
echo ""

# 询问是否保留配置文件
read -p "是否保留配置文件 ~/.aigitrc？(y/N): " keep_config

# 卸载全局链接
echo "🔗 正在卸载全局链接..."
npm unlink aigit

if [ $? -eq 0 ]; then
    echo "✅ 全局链接卸载成功"
else
    echo "❌ 全局链接卸载失败"
fi

# 删除配置文件（如果用户选择不保留）
if [[ $keep_config =~ ^[Yy]$ ]]; then
    echo "📁 保留配置文件 ~/.aigitrc"
else
    echo "🗑️  删除配置文件 ~/.aigitrc"
    rm -f ~/.aigitrc
fi

echo ""
echo "🎉 AIGit CLI 已成功卸载！"
echo ""
echo "💡 提示:"
echo "- 如果将来需要重新安装，可以运行:"
echo "  cd /path/to/aigit && npm link"
echo "- 或者运行安装脚本: ./install-global.sh"
