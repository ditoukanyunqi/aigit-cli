#!/usr/bin/env node

import { getGitDiff } from './src/git.js';
import { generateCommitMessage } from './src/generator.js';
import { config } from './src/config.js';

async function testTokenOptimization() {
  console.log('🧪 测试Token优化效果\n');
  
  try {
    // 获取git diff
    console.log('📋 获取Git diff...');
    const diff = await getGitDiff();
    
    if (!diff) {
      console.log('❌ 没有找到Git变更');
      return;
    }
    
    console.log(`📏 原始diff长度: ${diff.length} 字符`);
    console.log(`🔢 预估token数量: ${Math.ceil(diff.length / 4)} tokens\n`);
    
    // 显示diff预览
    console.log('📄 Diff预览 (前200字符):');
    console.log('─'.repeat(50));
    console.log(diff.substring(0, 200) + (diff.length > 200 ? '...' : ''));
    console.log('─'.repeat(50));
    
    // 测试生成commit message
    console.log('\n🤖 生成commit message...');
    const startTime = Date.now();
    
    const commitMessage = await generateCommitMessage(diff, {
      style: 'conventional',
      language: '中文'
    });
    
    const endTime = Date.now();
    
    console.log(`✅ 生成完成，耗时: ${endTime - startTime}ms`);
    console.log(`📝 Commit message: ${commitMessage}`);
    
    // 显示配置信息
    console.log('\n⚙️ 当前配置:');
    console.log(`- 使用简化diff: ${config.useSimplifiedDiff}`);
    console.log(`- 最大diff长度: ${config.maxDiffLength}`);
    console.log(`- AI提供商: ${config.provider}`);
    console.log(`- 模型: ${config.provider === 'openai' ? config.openaiModel : config.deepseekModel}`);
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  }
}

// 运行测试
testTokenOptimization();
