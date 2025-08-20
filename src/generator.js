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
  
  const stylePrompts = {
    conventional: `请根据以下代码变更，生成一个符合Conventional Commits规范的commit message。

要求：
1. 使用${language}语言
2. 遵循Conventional Commits格式：<type>(<scope>): <description>
3. type应该是：feat, fix, docs, style, refactor, test, chore等
4. 描述要简洁明了，不超过50个字符
5. 如果有破坏性变更，在type后加!号

代码变更内容：
${diff}

请只返回commit message，不要包含其他内容。`,

    simple: `请根据以下代码变更，生成一个简洁的commit message。

要求：
1. 使用${language}语言
2. 简洁明了，不超过30个字符
3. 描述代码变更的主要内容

代码变更内容：
${diff}

请只返回commit message，不要包含其他内容。`,

    detailed: `请根据以下代码变更，生成一个详细的commit message。

要求：
1. 使用${language}语言
2. 第一行是简短摘要（不超过50字符）
3. 空一行后添加详细描述
4. 详细描述要说明变更的原因和影响

代码变更内容：
${diff}

请只返回commit message，不要包含其他内容。`
  };

  return stylePrompts[style] || stylePrompts.conventional;
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

    // 如果diff太长，截取重要部分
    const maxDiffLength = 4000;
    const truncatedDiff = diff.length > maxDiffLength 
      ? diff.substring(0, maxDiffLength) + '\n... (内容已截断)'
      : diff;

    const prompt = generatePrompt(truncatedDiff, finalOptions);

    const client = getAIClient(finalOptions.provider);
    const completion = await client.chat.completions.create({
      model: finalOptions.model,
      messages: [
        {
          role: 'system',
          content: '你是一个专业的软件开发工程师，擅长编写清晰、规范的git commit message。'
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
