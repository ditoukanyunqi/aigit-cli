#!/usr/bin/env node

import OpenAI from 'openai';
import { config } from './src/config.js';

console.log('🧪 测试DeepSeek API连接');
console.log('========================\n');

console.log('当前配置:');
console.log(`- 提供商: ${config.provider}`);
console.log(`- DeepSeek API密钥: ${config.deepseekApiKey ? '已配置' : '未配置'}`);
console.log(`- DeepSeek模型: ${config.deepseekModel}`);

if (!config.deepseekApiKey) {
  console.log('\n❌ 错误: 未配置DeepSeek API密钥');
  process.exit(1);
}

// 测试DeepSeek API连接
async function testDeepSeekAPI() {
  try {
    console.log('\n🔗 正在测试DeepSeek API连接...');
    
    const deepseekClient = new OpenAI({
      apiKey: config.deepseekApiKey,
      baseURL: 'https://api.deepseek.com/v1',
    });

    // 测试简单对话
    const completion = await deepseekClient.chat.completions.create({
      model: 'deepseek-chat',
      messages: [
        {
          role: 'user',
          content: '你好，请简单回复一下'
        }
      ],
      max_tokens: 50,
      temperature: 0.7,
    });

    console.log('✅ DeepSeek API连接成功！');
    console.log(`回复: ${completion.choices[0]?.message?.content}`);
    
  } catch (error) {
    console.log('❌ DeepSeek API连接失败:');
    console.log(`错误代码: ${error.code || 'unknown'}`);
    console.log(`错误信息: ${error.message}`);
    
    if (error.code === 'model_not_found') {
      console.log('\n💡 建议: 检查模型名称是否正确');
      console.log('支持的模型: deepseek-chat, deepseek-coder');
    }
  }
}

testDeepSeekAPI();
