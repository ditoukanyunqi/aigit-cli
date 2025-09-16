import { config } from './config.js';

// 代码审查器
export class CodeReviewer {
  constructor(provider = config.provider) {
    this.provider = provider;
  }

  // 获取AI客户端
  async getAIClient() {
    if (this.provider === 'openai') {
      const { OpenAI } = await import('openai');
      return new OpenAI({
        apiKey: config.openaiApiKey,
      });
    } else if (this.provider === 'deepseek') {
      const { DeepSeek } = await import('deepseek');
      return new DeepSeek({
        apiKey: config.deepseekApiKey,
      });
    }
    throw new Error('不支持的AI提供商');
  }

  // 生成代码审查prompt
  generateReviewPrompt(diff, options = {}) {
    const { language = '中文', reviewType = 'comprehensive' } = options;
    
    const reviewTypes = {
      comprehensive: `作为资深代码审查专家，请对以下代码变更进行全面审查，给出详细的修改建议。

审查要点：
1. 代码质量和最佳实践
2. 潜在的安全问题
3. 性能优化建议
4. 代码可读性和维护性
5. 测试覆盖建议
6. 文档完善建议

请用${language}回答，格式如下：

## 🔍 代码审查结果

### ✅ 优点
- 列出代码的优点

### ⚠️ 需要注意的问题
- 列出需要注意的问题

### 🚨 严重问题
- 列出需要立即修复的严重问题

### 💡 改进建议
- 具体的改进建议

### 📝 代码示例
\`\`\`代码语言
// 改进后的代码示例
\`\`\`

### 🧪 测试建议
- 建议添加的测试用例

### 📚 文档建议
- 建议完善的文档内容`,

      security: `作为安全专家，请对以下代码变更进行安全审查，重点关注潜在的安全风险。

安全审查要点：
1. 输入验证和清理
2. 权限控制
3. 数据泄露风险
4. 注入攻击风险
5. 认证和授权
6. 加密和哈希
7. 日志和监控

请用${language}回答，格式如下：

## 🔒 安全审查结果

### 🚨 高危安全问题
- 列出高危安全问题

### ⚠️ 中危安全问题
- 列出中危安全问题

### 💡 安全改进建议
- 具体的安全改进建议

### 🛡️ 防护措施
- 建议的防护措施`,

      performance: `作为性能优化专家，请对以下代码变更进行性能审查，找出性能瓶颈和优化机会。

性能审查要点：
1. 算法复杂度
2. 内存使用
3. 数据库查询优化
4. 缓存策略
5. 异步处理
6. 资源管理
7. 监控和指标

请用${language}回答，格式如下：

## ⚡ 性能审查结果

### 🐌 性能瓶颈
- 识别性能瓶颈

### 💡 优化建议
- 具体的性能优化建议

### 📊 性能指标
- 建议监控的性能指标

### 🔧 优化工具
- 推荐的性能优化工具`,

      maintainability: `作为软件架构师，请对以下代码变更进行可维护性审查，评估代码的长期维护成本。

可维护性审查要点：
1. 代码结构设计
2. 模块化程度
3. 依赖关系
4. 代码重复
5. 命名规范
6. 错误处理
7. 扩展性

请用${language}回答，格式如下：

## 🏗️ 可维护性审查结果

### ✅ 良好的设计
- 列出良好的设计决策

### ⚠️ 维护风险
- 识别维护风险

### 💡 重构建议
- 具体的重构建议

### 📋 代码规范
- 建议遵循的代码规范`
    };

    return `${reviewTypes[reviewType] || reviewTypes.comprehensive}

## 📄 代码变更内容

\`\`\`diff
${diff}
\`\`\`

请基于以上代码变更进行审查。`;
  }

  // 执行代码审查
  async reviewCode(diff, options = {}) {
    try {
      const finalOptions = {
        language: options.language || config.language,
        reviewType: options.reviewType || 'comprehensive',
        temperature: parseFloat(options.temperature) || 0.3, // 降低温度以获得更稳定的审查结果
        maxTokens: options.maxTokens || 2000
      };

      if (!diff || !diff.trim()) {
        throw new Error('没有有效的代码变更内容');
      }

      const prompt = this.generateReviewPrompt(diff, finalOptions);
      const client = await this.getAIClient();

      const completion = await client.chat.completions.create({
        model: options.model || (this.provider === 'openai' ? 'gpt-4' : 'deepseek-chat'),
        messages: [
          {
            role: 'system',
            content: '你是一位经验丰富的代码审查专家，具有深厚的软件工程背景。请提供专业、准确、实用的代码审查建议。'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: finalOptions.temperature,
        max_tokens: finalOptions.maxTokens,
      });

      const reviewResult = completion.choices[0]?.message?.content?.trim();
      
      if (!reviewResult) {
        throw new Error('AI未能生成有效的代码审查结果');
      }

      return {
        success: true,
        review: reviewResult,
        options: finalOptions,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      const providerName = this.provider === 'openai' ? 'OpenAI' : 'DeepSeek';
      
      if (error.code === 'insufficient_quota' || error.message.includes('Insufficient Balance')) {
        throw new Error(`${providerName} API余额不足，请充值账户`);
      } else if (error.code === 'invalid_api_key') {
        throw new Error(`${providerName} API密钥无效，请检查配置`);
      } else if (error.code === 'rate_limit_exceeded') {
        throw new Error(`${providerName} API请求频率超限，请稍后重试`);
      } else if (error.code === 'model_not_found' || error.message.includes('Model Not Exist')) {
        throw new Error(`${providerName} 模型不存在，请检查模型名称`);
      } else {
        throw new Error(`${providerName} API调用失败: ${error.message}`);
      }
    }
  }

  // 生成代码审查摘要
  async generateReviewSummary(diff, options = {}) {
    try {
      const summaryPrompt = `请对以下代码变更生成一个简洁的审查摘要，用${options.language || '中文'}回答。

摘要要求：
1. 总体评价（优秀/良好/一般/需要改进）
2. 主要问题数量
3. 关键改进建议
4. 优先级排序

代码变更：
\`\`\`diff
${diff}
\`\`\`

请用简洁的语言给出摘要。`;

      const client = await this.getAIClient();
      
      const completion = await client.chat.completions.create({
        model: options.model || (this.provider === 'openai' ? 'gpt-3.5-turbo' : 'deepseek-chat'),
        messages: [
          {
            role: 'system',
            content: '你是代码审查专家，请提供简洁明了的审查摘要。'
          },
          {
            role: 'user',
            content: summaryPrompt
          }
        ],
        temperature: 0.3,
        max_tokens: 500,
      });

      const summary = completion.choices[0]?.message?.content?.trim();
      
      if (!summary) {
        throw new Error('AI未能生成有效的审查摘要');
      }

      return summary;

    } catch (error) {
      throw new Error(`生成审查摘要失败: ${error.message}`);
    }
  }

  // 分析代码质量指标
  analyzeCodeQuality(diff) {
    const metrics = {
      linesChanged: 0,
      filesChanged: 0,
      additions: 0,
      deletions: 0,
      complexity: 'low',
      riskLevel: 'low'
    };

    if (!diff) return metrics;

    const lines = diff.split('\n');
    let currentFile = '';
    
    for (const line of lines) {
      if (line.startsWith('+++') || line.startsWith('---')) {
        if (line.includes('/')) {
          currentFile = line.split('/').pop();
          if (currentFile && !metrics.filesChanged.includes(currentFile)) {
            metrics.filesChanged++;
          }
        }
      } else if (line.startsWith('+') && !line.startsWith('+++')) {
        metrics.additions++;
        metrics.linesChanged++;
      } else if (line.startsWith('-') && !line.startsWith('---')) {
        metrics.deletions++;
        metrics.linesChanged++;
      }
    }

    // 评估复杂度
    if (metrics.linesChanged > 100) {
      metrics.complexity = 'high';
    } else if (metrics.linesChanged > 50) {
      metrics.complexity = 'medium';
    }

    // 评估风险等级
    if (metrics.complexity === 'high' || metrics.filesChanged > 5) {
      metrics.riskLevel = 'high';
    } else if (metrics.complexity === 'medium' || metrics.filesChanged > 2) {
      metrics.riskLevel = 'medium';
    }

    return metrics;
  }
}

// 导出默认实例
export const codeReviewer = new CodeReviewer();
