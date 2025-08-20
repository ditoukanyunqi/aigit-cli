#!/usr/bin/env node

import { config, isConfigValid, getCurrentApiKey, getCurrentModel } from './src/config.js';

console.log('🧪 测试双AI服务提供商配置功能');
console.log('=====================================\n');

console.log('当前配置:');
console.log(`- 提供商: ${config.provider}`);
console.log(`- OpenAI API密钥: ${config.openaiApiKey ? '已配置' : '未配置'}`);
console.log(`- DeepSeek API密钥: ${config.deepseekApiKey ? '已配置' : '未配置'}`);
console.log(`- 当前模型: ${getCurrentModel()}`);
console.log(`- 配置是否有效: ${isConfigValid() ? '是' : '否'}`);

console.log('\n支持的提供商:');
console.log('- openai: OpenAI GPT系列模型');
console.log('- deepseek: DeepSeek模型');

console.log('\n配置方法:');
console.log('1. 环境变量: AI_PROVIDER, OPENAI_API_KEY, DEEPSEEK_API_KEY');
console.log('2. 配置文件: ~/.aigitrc');
console.log('3. 交互式配置: 运行 node bin/aigit.js');

console.log('\n使用示例:');
console.log('node bin/aigit.js -p openai    # 使用OpenAI');
console.log('node bin/aigit.js -p deepseek # 使用DeepSeek');
console.log('node bin/aigit.js              # 使用默认提供商');
