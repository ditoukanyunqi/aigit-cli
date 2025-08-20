# AIGit 使用说明

## 🚀 快速开始

### 1. 安装依赖
```bash
npm install
```

### 2. 运行CLI工具
```bash
node bin/aigit.js
```

首次运行时会提示选择AI服务提供商（OpenAI或DeepSeek）并输入对应的API密钥，你可以选择：
- 保存到配置文件（推荐）
- 仅在此次会话中使用

### 3. 基本使用流程

1. **准备代码变更**
   ```bash
   git add .  # 添加文件到暂存区
   ```

2. **生成commit message**
   ```bash
   node bin/aigit.js
   ```

3. **查看生成的message**
   工具会显示AI生成的commit message

4. **选择操作**
   - 手动复制message进行提交
   - 使用 `--commit` 参数自动提交

## 📋 常用命令

```bash
# 基本使用
node bin/aigit.js

# 预览模式（不提交，不add）
aigit -d

# 禁用自动添加文件
aigit --no-auto-add

# 禁用自动合并master
aigit --no-auto-merge

# 指定AI服务提供商
node bin/aigit.js -p openai

# 指定语言
node bin/aigit.js -l 中文

# 指定风格
node bin/aigit.js -s conventional

# 查看帮助
node bin/aigit.js --help

# 查看配置帮助
node bin/aigit.js --config-help
```

## 🔑 配置API密钥

### 方法1: 交互式配置（推荐）
首次运行时按提示选择AI服务提供商并输入API密钥

### 方法2: 环境变量
```bash
# 选择OpenAI
export AI_PROVIDER="openai"
export OPENAI_API_KEY="your-api-key"

# 或选择DeepSeek
export AI_PROVIDER="deepseek"
export DEEPSEEK_API_KEY="your-api-key"
```

### 方法3: 配置文件
创建 `~/.aigitrc` 文件：
```json
{
  "provider": "openai",
  "openaiApiKey": "your-openai-api-key",
  "deepseekApiKey": "your-deepseek-api-key"
}
```

## 💡 提示

- 确保在git仓库目录中运行
- 默认自动执行 `git add .` 和提交
- 使用 `-d` 预览生成的message（不提交，不add）
- 自动尝试合并master分支
- 支持禁用自动功能（--no-auto-add, --no-auto-merge）
