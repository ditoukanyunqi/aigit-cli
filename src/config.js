import { config as dotenvConfig } from 'dotenv';
import { homedir } from 'os';
import { join } from 'path';
import { readFileSync, existsSync, writeFileSync } from 'fs';

// 加载环境变量
dotenvConfig();

// 配置文件路径
const CONFIG_FILE = join(homedir(), '.aigitrc');

// 默认配置
const DEFAULT_CONFIG = {
  provider: process.env.AI_PROVIDER || 'openai', // 'openai' 或 'deepseek'
  openaiApiKey: process.env.OPENAI_API_KEY,
  openaiModel: 'gpt-3.5-turbo',
  deepseekApiKey: process.env.DEEPSEEK_API_KEY,
  deepseekModel: 'deepseek-chat',
  temperature: 0.7,
  language: '中文',
  style: 'conventional',
  maxTokens: 150
};

// DeepSeek支持的模型列表
export const DEEPSEEK_MODELS = [
  'deepseek-chat',
  'deepseek-coder',
  'deepseek-coder-33b-instruct',
  'deepseek-coder-6.7b-instruct',
  'deepseek-coder-1.3b-instruct'
];

// OpenAI支持的模型列表
export const OPENAI_MODELS = [
  'gpt-4',
  'gpt-4-turbo-preview',
  'gpt-3.5-turbo',
  'gpt-3.5-turbo-16k'
];

// 读取配置文件
function loadConfig() {
  if (existsSync(CONFIG_FILE)) {
    try {
      const configContent = readFileSync(CONFIG_FILE, 'utf8');
      const userConfig = JSON.parse(configContent);
      return { ...DEFAULT_CONFIG, ...userConfig };
    } catch (error) {
      console.warn('警告: 配置文件格式错误，使用默认配置');
    }
  }
  return DEFAULT_CONFIG;
}

// 验证配置
function validateConfig(config) {
  return config;
}

// 导出配置
export const config = loadConfig();

// 检查配置是否有效
export function isConfigValid() {
  if (config.provider === 'openai') {
    return !!config.openaiApiKey;
  } else if (config.provider === 'deepseek') {
    return !!config.deepseekApiKey;
  }
  return false;
}

// 获取当前提供商的API密钥
export function getCurrentApiKey() {
  if (config.provider === 'openai') {
    return config.openaiApiKey;
  } else if (config.provider === 'deepseek') {
    return config.deepseekApiKey;
  }
  return null;
}

// 获取当前提供商的模型
export function getCurrentModel() {
  if (config.provider === 'openai') {
    return config.openaiModel;
  } else if (config.provider === 'deepseek') {
    // 确保DeepSeek使用正确的模型名称
    return config.deepseekModel || 'deepseek-chat';
  }
  return 'gpt-3.5-turbo';
}

// 验证模型名称
export function validateModel(provider, model) {
  if (provider === 'openai') {
    return OPENAI_MODELS.includes(model) ? model : 'gpt-3.5-turbo';
  } else if (provider === 'deepseek') {
    return DEEPSEEK_MODELS.includes(model) ? model : 'deepseek-chat';
  }
  return 'gpt-3.5-turbo';
}

// 保存API密钥到配置文件
export async function saveApiKey(apiKey, provider) {
  try {
    const configData = {
      ...loadConfig(),
      provider: provider
    };
    
    if (provider === 'openai') {
      configData.openaiApiKey = apiKey;
    } else if (provider === 'deepseek') {
      configData.deepseekApiKey = apiKey;
    }
    
    writeFileSync(CONFIG_FILE, JSON.stringify(configData, null, 2));
    
    // 更新内存中的配置
    Object.assign(config, configData);
    
    return true;
  } catch (error) {
    throw new Error(`保存配置文件失败: ${error.message}`);
  }
}

// 保存提供商选择
export async function saveProvider(provider) {
  try {
    const configData = {
      ...loadConfig(),
      provider: provider
    };
    
    writeFileSync(CONFIG_FILE, JSON.stringify(configData, null, 2));
    
    // 更新内存中的配置
    Object.assign(config, configData);
    
    return true;
  } catch (error) {
    throw new Error(`保存配置文件失败: ${error.message}`);
  }
}

// 配置帮助信息
export function showConfigHelp() {
  console.log(`
配置说明:
1. 环境变量: 设置 OPENAI_API_KEY 或 DEEPSEEK_API_KEY
2. 配置文件: 在 ~/.aigitrc 中添加配置
3. 命令行参数: 使用 -m, -t, -l, -s 等参数

配置文件示例 (~/.aigitrc):
{
  "provider": "openai",
  "openaiApiKey": "your-openai-api-key",
  "openaiModel": "gpt-4",
  "deepseekApiKey": "your-deepseek-api-key",
  "deepseekModel": "deepseek-chat",
  "temperature": 0.8,
  "language": "中文",
  "style": "conventional"
}

支持的服务提供商:
- OpenAI: 需要 OPENAI_API_KEY
- DeepSeek: 需要 DEEPSEEK_API_KEY
  `);
}
