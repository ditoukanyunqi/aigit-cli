# AIGit - AI驱动的Git Commit Message生成器

一个基于OpenAI的智能Git commit message生成工具，能够自动分析代码变更并生成清晰、规范的commit message。

## ✨ 特性

- 🤖 支持OpenAI和DeepSeek两种AI服务
- 🌍 支持多种语言（中文、英文等）
- 📝 支持多种commit message风格（Conventional Commits、简洁、详细）
- 🔍 **智能项目配置检测** - 自动检测项目commit规范并调整配置
- 🔍 **AI代码审查** - 智能分析代码变更并给出修改建议
- ⚙️ 灵活的配置选项
- 🔍 预览模式，不直接提交
- 🚀 支持自动提交
- 💡 智能提示和错误处理
- 🔑 交互式AI服务选择和API密钥配置

## 🚀 快速开始

### 1. 从npm安装（推荐）

```bash
# 全局安装
npm install -g aigit-cli

# 验证安装
aigit --version
```

### 2. 从源码安装

#### 方法1: 使用安装脚本
```bash
# 克隆项目
git clone <your-repo-url>
cd aigit

# 运行安装脚本
./install-global.sh
```

#### 方法2: 手动安装
```bash
# 克隆项目
git clone <your-repo-url>
cd aigit

# 安装依赖
npm install

# 创建全局链接
npm link
```

#### 方法3: 开发模式
```bash
# 安装依赖
npm install

# 运行CLI
npm start
# 或者
node bin/aigit.js
```

### 2. 配置AI服务提供商和API密钥

#### 方法1: 交互式配置（推荐）
首次运行时，CLI工具会提示你选择AI服务提供商并输入API密钥：
```bash
node bin/aigit.js
# 工具会提示选择OpenAI或DeepSeek
# 然后输入对应的API密钥
# 选择是否保存到配置文件
```

#### 方法2: 环境变量
```bash
# 选择OpenAI
export AI_PROVIDER="openai"
export OPENAI_API_KEY="your-openai-api-key-here"

# 或选择DeepSeek
export AI_PROVIDER="deepseek"
export DEEPSEEK_API_KEY="your-deepseek-api-key-here"
```

#### 方法3: 配置文件
在用户主目录创建 `~/.aigitrc` 文件：
```json
{
  "provider": "openai",
  "openaiApiKey": "your-openai-api-key-here",
  "openaiModel": "gpt-4",
  "deepseekApiKey": "your-deepseek-api-key-here",
  "deepseekModel": "deepseek-chat",
  "temperature": 0.8,
  "language": "中文",
  "style": "conventional"
}
```

#### 方法4: 查看配置帮助
```bash
node bin/aigit.js --config-help
```

### 3. 使用CLI工具

```bash
# 基本使用（全局安装后）- 自动add、提交、合并master
aigit

# 指定AI服务提供商
aigit -p openai

# 指定AI模型
aigit -m gpt-4

# 指定语言
aigit -l 中文

# 指定风格
aigit -s conventional

# 预览模式（不提交，不add）
aigit -d

# 禁用自动添加文件
aigit --no-auto-add

# 禁用自动合并master
aigit --no-auto-merge

# 查看帮助
aigit --help

# 查看配置帮助
aigit --config-help
```

## 📖 使用方法

### 基本工作流程

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
   - 使用 `--dry-run` 预览
   - 自动提交（默认行为）
   - 手动复制message进行提交

## 🚀 发布到npm

### 发布到官方npm (npmjs.com)

项目已配置为发布到官方npm registry。使用以下脚本：

```bash
# 发布到官方npm
./publish-npmjs.sh

# 或手动发布
npm publish --registry=https://registry.npmjs.org/
```

### 发布到私有npm

如果需要发布到私有npm registry：

```bash
# 发布到私有npm
./publish-npm.sh
```

## 🔍 智能项目配置检测

AIGit现在具备智能项目配置检测功能，能够自动分析项目结构并推荐最适合的commit配置：

### 自动检测的配置类型

1. **Commitlint配置**
   - 检测 `.commitlintrc*` 文件
   - 检测 `commitlint.config.js/ts` 文件
   - 自动推荐使用 `conventional` 风格

2. **Conventional Changelog配置**
   - 检测 `package.json` 中的相关依赖
   - 支持多种预设（angular、eslint、express等）
   - 自动推荐使用 `conventional` 风格

3. **Commitizen配置**
   - 检测 `package.json` 中的 `commitizen` 配置
   - 自动推荐使用 `conventional` 风格

4. **Git模板配置**
   - 检测 `.gitmessage` 文件
   - 检测全局和项目级commit模板
   - 自动推荐使用 `detailed` 风格

5. **Husky配置**
   - 检测 `.husky` 目录和配置
   - 识别git hooks配置

6. **项目类型推断**
   - 开源项目：推荐 `conventional` 风格
   - 应用项目：推荐 `simple` 风格
   - 库/框架项目：推荐 `conventional` 风格

### 使用方法

```bash
# 检测项目配置（不生成commit）
aigit --detect-project

# 自动使用检测到的配置生成commit
aigit

# 强制使用特定风格（覆盖自动检测）
aigit -s conventional
```

### 检测结果示例

```
🔍 项目配置检测结果:
──────────────────────────────────────────────────
📝 推荐Commit风格: conventional
🌍 推荐语言: 中文
💡 推荐原因: 检测到commitlint配置, 检测到.gitmessage模板文件, 检测到开源项目配置
✅ 检测到commitlint配置
✅ 检测到.gitmessage模板
──────────────────────────────────────────────────
```

## 💰 Token优化

为了减少API调用成本，工具内置了智能的token优化功能：

### 自动优化策略

1. **智能diff处理**
   - 自动移除不必要的git diff信息
   - 限制上下文行数（--unified=1）
   - 移除文件路径前缀

2. **内容截断**
   - 当文件数量 > 10时，自动使用统计模式
   - 限制diff最大长度为2000字符
   - 智能保留重要信息

3. **Prompt优化**
   - 简化prompt模板
   - 减少系统消息长度
   - 优化指令描述

### 配置选项

在 `~/.aigitrc` 中可以配置：

```json
{
  "useSimplifiedDiff": true,    // 启用简化diff模式
  "maxDiffLength": 2000         // 最大diff长度
}
```

### 测试优化效果

```bash
# 测试token优化
node test-token-optimization.js
```

### 命令行参数

| 参数 | 简写 | 说明 | 默认值 |
|------|------|------|--------|
| `--provider` | `-p` | AI服务提供商 (openai/deepseek) | `openai` |
| `--model` | `-m` | AI模型 | `gpt-3.5-turbo` |
| `--temperature` | `-t` | AI生成温度 | `0.7` |
| `--language` | `-l` | 输出语言 | `中文` |
| `--style` | `-s` | Commit风格 | `conventional` |
| `--dry-run` | `-d` | 预览模式（不提交，不add） | `false` |
| `--no-auto-add` | | 禁用自动git add . | `false` |
| `--no-auto-merge` | | 禁用自动合并master分支 | `false` |
| `--config-help` | | 显示配置帮助 | `false` |
| `--detect-project` | | 检测并显示项目配置 | `false` |

### Commit Message风格

#### 1. Conventional Commits (`conventional`)
```
feat(auth): 添加用户登录功能
fix(api): 修复用户数据获取错误
docs(readme): 更新安装说明
```

#### 2. 简洁风格 (`simple`)
```
添加用户登录功能
修复API错误
更新文档
```

#### 3. 详细风格 (`detailed`)
```
feat: 实现用户认证系统

- 添加JWT token支持
- 实现密码加密
- 添加用户会话管理
- 支持记住登录状态
```

## ⚙️ 配置选项

### 环境变量
- `AI_PROVIDER`: AI服务提供商 (`openai` 或 `deepseek`)
- `OPENAI_API_KEY`: OpenAI API密钥（当provider为openai时必需）
- `DEEPSEEK_API_KEY`: DeepSeek API密钥（当provider为deepseek时必需）

### 配置文件 (~/.aigitrc)
```json
{
  "openaiApiKey": "your-api-key",
  "openaiModel": "gpt-4",
  "temperature": 0.8,
  "language": "中文",
  "style": "conventional",
  "maxTokens": 150
}
```

### 配置优先级
1. 命令行参数（最高）
2. 配置文件
3. 环境变量
4. 默认值（最低）

## 🔧 开发

### 项目结构
```
aigit/
├── bin/
│   └── aigit.js          # CLI入口文件
├── src/
│   ├── config.js         # 配置管理
│   ├── generator.js      # AI生成器
│   └── git.js           # Git操作
├── package.json
├── example-config.json   # 示例配置文件
└── README.md
```

### 本地开发
```bash
# 安装依赖
npm install

# 运行CLI
npm start

# 或者直接运行
node bin/aigit.js

# 全局安装
npm link

# 卸载全局链接
npm unlink aigit
```

### 添加新功能
1. 在相应模块中添加功能
2. 更新CLI参数解析
3. 添加测试用例
4. 更新文档

## 🐛 故障排除

### 常见问题

#### 1. "缺少AI服务提供商配置"错误
- 首次运行时会提示选择AI服务提供商并输入API密钥
- 检查环境变量 `AI_PROVIDER` 是否设置
- 检查对应的API密钥环境变量是否设置
- 检查配置文件 `~/.aigitrc` 是否正确
- 确保API密钥有效且未过期

#### 2. "当前目录不是git仓库"错误
- 确保在git仓库目录中运行命令
- 运行 `git init` 初始化仓库

#### 3. "没有检测到代码变更"错误
- 使用 `git add` 添加文件到暂存区
- 检查是否有未保存的修改

#### 4. AI API错误
- 检查网络连接
- 验证API密钥和配额
- 检查模型名称是否正确
- 确认选择的AI服务提供商是否正确

### 调试模式
```bash
# 启用详细日志
DEBUG=* node bin/aigit.js
```

## 📝 许可证

MIT License

## 🤝 贡献

欢迎提交Issue和Pull Request！

## 📞 支持

如果遇到问题，请：
1. 查看故障排除部分
2. 搜索现有Issue
3. 创建新的Issue并提供详细信息

## 🌍 全局安装

### 安装到全局
```bash
# 在项目目录下运行
npm link

# 验证安装
aigit --version
```

### 从全局卸载
```bash
# 卸载全局链接
npm unlink aigit

# 或者运行卸载脚本
./uninstall-global.sh
```

### 在任何目录使用
全局安装后，你可以在任何目录下使用 `aigit` 命令：

```bash
cd /path/to/your/project
aigit                    # 生成commit message
aigit -p openai        # 使用OpenAI
aigit -p deepseek      # 使用DeepSeek
aigit --detect-project # 检测项目配置
aigit --help           # 查看帮助
```

---

**注意**: 使用此工具需要有效的OpenAI或DeepSeek API密钥，会产生相应的API调用费用。
