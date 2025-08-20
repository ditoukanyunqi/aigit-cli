# 🚀 AIGit CLI NPM发布检查清单

## 📋 发布前检查

### 1. 代码质量检查
- [ ] 所有功能正常工作
- [ ] 错误处理完善
- [ ] 代码注释清晰
- [ ] 无敏感信息泄露

### 2. 配置检查
- [ ] package.json 信息完整
- [ ] 包名称唯一 (aigit-cli)
- [ ] 版本号正确
- [ ] 依赖版本合理
- [ ] bin字段配置正确

### 3. 文件检查
- [ ] .npmignore 配置正确
- [ ] 排除开发文件
- [ ] 包含必要源码
- [ ] 无测试文件泄露

### 4. 测试检查
- [ ] 本地安装测试
- [ ] 全局安装测试
- [ ] 基本功能测试
- [ ] 错误情况测试

### 5. 文档检查
- [ ] README.md 完整
- [ ] 安装说明清晰
- [ ] 使用示例正确
- [ ] 故障排除指南

## 🚀 发布步骤

### 1. 准备发布
```bash
# 检查git状态
git status

# 提交所有更改
git add .
git commit -m "chore: prepare for npm publish"

# 检查包配置
npm pack --dry-run
```

### 2. 发布到npm
```bash
# 方法1: 使用发布脚本
./publish-npm.sh

# 方法2: 手动发布
npm publish
```

### 3. 验证发布
```bash
# 检查npm包信息
npm view aigit-cli

# 测试全局安装
npm install -g aigit-cli
aigit --version
```

## 📦 包信息

- **包名**: aigit-cli
- **版本**: 1.0.0
- **描述**: AI-powered git commit message generator
- **关键词**: git, commit, openai, deepseek, ai, cli
- **许可证**: MIT
- **作者**: 张万里

## 🔧 发布后操作

### 1. 创建Git Tag
```bash
git tag v1.0.0
git push origin v1.0.0
```

### 2. 更新文档
- 更新GitHub README
- 添加npm安装说明
- 更新使用示例

### 3. 推广
- 在相关社区分享
- 添加项目到Awesome列表
- 写博客介绍功能

## 🚨 注意事项

1. **包名称唯一性**: 确保 `aigit-cli` 在npm上唯一
2. **版本管理**: 遵循语义化版本规范
3. **依赖管理**: 避免包含不必要的依赖
4. **安全考虑**: 确保不泄露API密钥等敏感信息
5. **向后兼容**: 新版本尽量保持向后兼容

## 📞 获取帮助

- npm官方文档: https://docs.npmjs.com/
- 包发布指南: https://docs.npmjs.com/packages-and-modules/contributing-packages-to-the-registry
- 故障排除: https://docs.npmjs.com/troubleshooting
