import OpenAI from 'openai';
import { config, getCurrentApiKey, getCurrentModel, validateModel } from './config.js';
import chalk from 'chalk';

// 延迟初始化AI客户端
let openaiClient = null;
let deepseekClient = null;

function getOpenAIClient(apiKey) {
  if (!openaiClient) {
    openaiClient = new OpenAI({
      apiKey: apiKey || getCurrentApiKey(),
    });
  }
  return openaiClient;
}

function getDeepSeekClient(apiKey) {
  if (!deepseekClient) {
    deepseekClient = new OpenAI({
      apiKey: apiKey || getCurrentApiKey(),
      baseURL: 'https://api.deepseek.com/v1',
    });
  }
  return deepseekClient;
}

// 获取DeepSeek的默认模型
function getDeepSeekDefaultModel() {
  return 'deepseek-chat';
}

function getAIClient(provider, apiKey) {
  if (provider === 'openai') {
    return getOpenAIClient(apiKey);
  } else if (provider === 'deepseek') {
    return getDeepSeekClient(apiKey);
  }
  return getOpenAIClient(apiKey); // 默认使用OpenAI
}

// 根据风格生成不同的prompt
function generatePrompt(diff, options) {
  const { language, style } = options;
  
  // 简化prompt模板，减少token消耗
  const stylePrompts = {
    conventional: `用${language}生成Conventional Commits格式的commit message。

格式：<type>(<scope>): <description>
类型：feat, fix, docs, style, refactor, test, chore
要求：简洁，不超过50字符

代码变更：
${diff}`,

    simple: `用${language}生成简洁的commit message。

要求：简洁明了，不超过30字符

代码变更：
${diff}`,

    detailed: `用${language}生成详细的commit message。

第一行：简短摘要（不超过50字符）
空行后：详细描述

代码变更：
${diff}`
  };

  return stylePrompts[style] || stylePrompts.conventional;
}

// 智能处理diff内容，减少token消耗
function optimizeDiff(diff) {
  if (!diff) return '';
  
  // 移除不必要的上下文信息
  let optimized = diff
    // 移除文件路径前缀（如果太长）
    .replace(/^diff --git a\/(.+?) b\/(.+?)$/gm, '')
    // 移除index行
    .replace(/^index [a-f0-9]+\.\.[0-9]+ [0-9]+$/gm, '')
    // 移除---和+++行
    .replace(/^--- a\/(.+)$/gm, '')
    .replace(/^\+\+\+ b\/(.+)$/gm, '')
    // 移除@@行（但保留行号信息）
    .replace(/^@@ -[0-9,]+ \+[0-9,]+ @@.*$/gm, '')
    // 移除空行
    .replace(/^\s*$/gm, '')
    // 限制每行长度
    .split('\n')
    .map(line => line.length > 100 ? line.substring(0, 100) + '...' : line)
    .join('\n');

  // 进一步限制总长度
  const maxLength = config.maxDiffLength || 2000;
  if (optimized.length > maxLength) {
    // 智能截断：保留开头和结尾，中间截断
    const start = Math.floor(maxLength * 0.6);
    const end = Math.floor(maxLength * 0.4);
    optimized = optimized.substring(0, start) + '\n... (内容已截断) ...\n' + optimized.substring(optimized.length - end);
  }

  return optimized;
}

// 生成commit message
export async function generateCommitMessage(diff, options = {}) {
  try {
    // 合并配置选项
    const finalOptions = {
      provider: config.provider,
      model: validateModel(config.provider, options.model || getCurrentModel()),
      temperature: parseFloat(options.temperature) || config.temperature,
      language: options.language || config.language,
      style: options.style || config.style,
      maxTokens: config.maxTokens
    };

    // 优化diff内容，减少token消耗
    const optimizedDiff = optimizeDiff(diff);
    
    if (!optimizedDiff.trim()) {
      throw new Error('没有有效的代码变更内容');
    }

    const prompt = generatePrompt(optimizedDiff, finalOptions);

    const client = getAIClient(finalOptions.provider);
    const completion = await client.chat.completions.create({
      model: finalOptions.model,
      messages: [
        {
          role: 'system',
          content: '你是专业的软件开发工程师，擅长编写git commit message。'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: finalOptions.temperature,
      max_tokens: finalOptions.maxTokens,
    });

    const commitMessage = completion.choices[0]?.message?.content?.trim();
    
    if (!commitMessage) {
      throw new Error('AI未能生成有效的commit message');
    }

    return commitMessage;

  } catch (error) {
    const providerName = config.provider === 'openai' ? 'OpenAI' : 'DeepSeek';
    
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

// 验证commit message格式
export function validateCommitMessage(message, style = 'conventional') {
  if (!message || message.trim().length === 0) {
    return { valid: false, error: 'Commit message不能为空' };
  }

  if (style === 'conventional') {
    // 检查Conventional Commits格式
    const conventionalRegex = /^(feat|fix|docs|style|refactor|test|chore|perf|ci|build|revert)(\(.+\))?(!)?: .+/;
    if (!conventionalRegex.test(message.split('\n')[0])) {
      return { 
        valid: false, 
        error: '不符合Conventional Commits格式，应为: <type>(<scope>): <description>' 
      };
    }
  }

  return { valid: true };
}
