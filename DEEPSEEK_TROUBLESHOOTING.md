# DeepSeek API 故障排除指南

## 🔍 常见问题诊断

### 1. 402 Insufficient Balance (余额不足)
**错误信息**: `402 Insufficient Balance`
**原因**: DeepSeek账户余额不足
**解决方案**:
- 登录 [DeepSeek控制台](https://platform.deepseek.com/)
- 检查账户余额
- 充值账户

### 2. Model Not Exist (模型不存在)
**错误信息**: `400 Model Not Exist`
**原因**: 模型名称不正确
**解决方案**: 使用以下支持的模型名称：
- `deepseek-chat` (推荐)
- `deepseek-coder`
- `deepseek-coder-33b-instruct`
- `deepseek-coder-6.7b-instruct`
- `deepseek-coder-1.3b-instruct`

### 3. Invalid API Key (API密钥无效)
**错误信息**: `401 Unauthorized`
**原因**: API密钥错误或已过期
**解决方案**:
- 检查API密钥是否正确
- 确认密钥是否已过期
- 重新生成API密钥

### 4. Rate Limit Exceeded (请求频率超限)
**错误信息**: `429 Too Many Requests`
**原因**: 请求频率过高
**解决方案**:
- 降低请求频率
- 等待一段时间后重试
- 检查API使用限制

## 🛠️ 测试和诊断

### 运行诊断脚本
```bash
node test-deepseek.js
```

### 检查配置
```bash
node test-providers.js
```

### 查看配置帮助
```bash
node bin/aigit.js --config-help
```

## 📋 正确的配置示例

### 配置文件 (~/.aigitrc)
```json
{
  "provider": "deepseek",
  "deepseekApiKey": "sk-your-deepseek-api-key",
  "deepseekModel": "deepseek-chat",
  "temperature": 0.7,
  "language": "中文",
  "style": "conventional"
}
```

### 环境变量
```bash
export AI_PROVIDER="deepseek"
export DEEPSEEK_API_KEY="sk-your-deepseek-api-key"
```

## 🔄 切换到其他AI服务

如果DeepSeek遇到问题，可以切换到OpenAI：

### 方法1: 交互式配置
```bash
node bin/aigit.js
# 选择OpenAI作为提供商
```

### 方法2: 命令行指定
```bash
node bin/aigit.js -p openai
```

### 方法3: 环境变量
```bash
export AI_PROVIDER="openai"
export OPENAI_API_KEY="sk-your-openai-api-key"
```

## 💡 最佳实践

1. **先测试API连接**: 使用 `test-deepseek.js` 脚本
2. **检查账户余额**: 确保有足够的余额
3. **使用推荐模型**: `deepseek-chat` 是最稳定的选择
4. **保存配置**: 使用配置文件保存设置
5. **备用方案**: 准备OpenAI作为备用选择

## 📞 获取帮助

- DeepSeek官方文档: [https://platform.deepseek.com/docs](https://platform.deepseek.com/docs)
- DeepSeek控制台: [https://platform.deepseek.com/](https://platform.deepseek.com/)
- 项目Issues: 提交问题到项目仓库
