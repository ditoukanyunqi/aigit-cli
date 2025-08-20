#!/usr/bin/env node

import { program } from 'commander';
import chalk from 'chalk';
import { generateCommitMessage } from '../src/generator.js';
import { getGitDiff } from '../src/git.js';
import { config, isConfigValid, showConfigHelp, saveApiKey, saveProvider } from '../src/config.js';
import inquirer from 'inquirer';

// 显示当前配置（不包含敏感信息）
function showCurrentConfig() {
  console.log(chalk.blue('⚙️  当前配置信息'));
  console.log(chalk.white('─'.repeat(50)));
  
  console.log(chalk.cyan(`AI服务提供商: ${config.provider || '未设置'}`));
  console.log(chalk.cyan(`OpenAI模型: ${config.openaiModel || '未设置'}`));
  console.log(chalk.cyan(`DeepSeek模型: ${config.deepseekModel || '未设置'}`));
  console.log(chalk.cyan(`生成温度: ${config.temperature || '未设置'}`));
  console.log(chalk.cyan(`输出语言: ${config.language || '未设置'}`));
  console.log(chalk.cyan(`Commit风格: ${config.style || '未设置'}`));
  console.log(chalk.cyan(`最大Token数: ${config.maxTokens || '未设置'}`));
  
  console.log(chalk.white('─'.repeat(50)));
  console.log(chalk.blue('💡 使用 --show-keys 查看API密钥状态'));
  console.log(chalk.blue('💡 使用 --config-help 查看配置帮助'));
}

// 显示API密钥状态（脱敏）
function showApiKeys() {
  console.log(chalk.blue('🔑 API密钥状态'));
  console.log(chalk.white('─'.repeat(50)));
  
  const openaiStatus = config.openaiApiKey ? '已配置' : '未配置';
  const deepseekStatus = config.deepseekApiKey ? '已配置' : '未配置';
  
  console.log(chalk.cyan(`OpenAI API密钥: ${openaiStatus}`));
  if (config.openaiApiKey) {
    const maskedKey = maskApiKey(config.openaiApiKey);
    console.log(chalk.gray(`   密钥: ${maskedKey}`));
  }
  
  console.log(chalk.cyan(`DeepSeek API密钥: ${deepseekStatus}`));
  if (config.deepseekApiKey) {
    const maskedKey = maskApiKey(config.deepseekApiKey);
    console.log(chalk.gray(`   密钥: ${maskedKey}`));
  }
  
  console.log(chalk.white('─'.repeat(50)));
  console.log(chalk.blue('💡 使用 --show-config 查看完整配置'));
  console.log(chalk.blue('💡 使用 --config-help 查看配置帮助'));
}

// 脱敏API密钥
function maskApiKey(apiKey) {
  if (!apiKey || apiKey.length < 8) return apiKey;
  const prefix = apiKey.substring(0, 4);
  const suffix = apiKey.substring(apiKey.length - 4);
  const middle = '*'.repeat(Math.min(apiKey.length - 8, 8));
  return `${prefix}${middle}${suffix}`;
}

// 自动合并master分支
async function autoMergeMaster() {
  try {
    const { execSync } = await import('child_process');
    
    // 获取当前分支名
    const currentBranch = execSync('git branch --show-current', { encoding: 'utf8' }).trim();
    
    // 如果不是master分支，尝试合并
    if (currentBranch !== 'master' && currentBranch !== 'main') {
      console.log(chalk.gray(`🔄 正在尝试合并master分支到当前分支 ${currentBranch}...`));
      
      try {
        // 获取远程master分支的最新内容
        execSync('git fetch origin master', { stdio: 'inherit' });
        
        // 尝试合并
        execSync('git merge origin/master', { stdio: 'inherit' });
        console.log(chalk.green('✅ 成功合并master分支'));
        
      } catch (mergeError) {
        console.log(chalk.yellow('⚠️  合并master分支失败，可能需要手动解决冲突'));
        console.log(chalk.blue('💡 提示: 手动执行 git merge origin/master 解决冲突'));
      }
    } else {
      console.log(chalk.blue('ℹ️  当前在master分支，无需合并'));
    }
    
  } catch (error) {
    console.log(chalk.yellow('⚠️  自动合并功能出现问题，跳过合并'));
  }
}

program
  .name('aigit')
  .description('AI-powered git commit message generator using OpenAI or DeepSeek')
  .version('1.0.0')
  .option('-p, --provider <provider>', 'AI service provider (openai or deepseek)', 'openai')
  .option('-m, --model <model>', 'AI model to use', 'gpt-3.5-turbo')
  .option('-t, --temperature <number>', 'Temperature for AI generation', '0.7')
  .option('-l, --language <language>', 'Language for commit message', '中文')
  .option('-s, --style <style>', 'Commit message style (conventional, simple, detailed)', 'conventional')
  .option('-d, --dry-run', 'Show generated message without committing')
  .option('--no-auto-add', 'Disable automatic git add .')
  .option('--no-auto-merge', 'Disable automatic master branch merge')
  .option('--config-help', 'Show configuration help')
  .option('--show-config', 'Show current configuration (without sensitive data)')
  .option('--show-keys', 'Show API keys (masked for security)')
  .parse();

const options = program.opts();

async function main() {
  try {
    // 显示配置帮助
    if (options.configHelp) {
      showConfigHelp();
      return;
    }

    // 显示当前配置
    if (options.showConfig) {
      showCurrentConfig();
      return;
    }

    // 显示API密钥（脱敏）
    if (options.showKeys) {
      showApiKeys();
      return;
    }

    // 检查配置
    if (!isConfigValid()) {
      console.log(chalk.yellow('🔑 需要配置AI服务提供商和API密钥'));
      
      // 选择AI服务提供商
      const providerAnswer = await inquirer.prompt([
        {
          type: 'list',
          name: 'provider',
          message: '请选择AI服务提供商:',
          choices: [
            { name: 'OpenAI (GPT系列)', value: 'openai' },
            { name: 'DeepSeek', value: 'deepseek' }
          ],
          default: 'openai'
        }
      ]);

      const provider = providerAnswer.provider;
      const providerName = provider === 'openai' ? 'OpenAI' : 'DeepSeek';
      const keyPrefix = provider === 'openai' ? 'sk-' : 'sk-';
      
      // 输入API密钥
      const apiKeyAnswer = await inquirer.prompt([
        {
          type: 'input',
          name: 'apiKey',
          message: `请输入你的${providerName} API密钥:`,
          validate: (input) => {
            if (!input.trim()) {
              return 'API密钥不能为空';
            }
            if (!input.startsWith(keyPrefix)) {
              return `${providerName} API密钥应该以${keyPrefix}开头`;
            }
            return true;
          }
        },
        {
          type: 'confirm',
          name: 'saveKey',
          message: '是否保存配置到配置文件？(推荐)',
          default: true
        }
      ]);

      if (apiKeyAnswer.saveKey) {
        await saveProvider(provider);
        await saveApiKey(apiKeyAnswer.apiKey, provider);
        console.log(chalk.green(`✅ ${providerName}配置已保存到配置文件`));
      } else {
        // 临时设置环境变量
        if (provider === 'openai') {
          process.env.OPENAI_API_KEY = apiKeyAnswer.apiKey;
        } else {
          process.env.DEEPSEEK_API_KEY = apiKeyAnswer.apiKey;
        }
        process.env.AI_PROVIDER = provider;
        console.log(chalk.blue(`ℹ️  ${providerName}配置仅在此次会话中有效`));
      }
    }

    console.log(chalk.blue('🚀 AI Git Commit Message Generator'));
    
    // 自动执行 git add .
    if (!options.noAutoAdd) {
      console.log(chalk.gray('📁 正在添加所有文件到暂存区...'));
      try {
        const { execSync } = await import('child_process');
        execSync('git add .', { stdio: 'inherit' });
        console.log(chalk.green('✅ 文件已添加到暂存区'));
      } catch (addError) {
        console.log(chalk.yellow('⚠️  自动添加文件失败，继续使用当前暂存区'));
      }
    }

    console.log(chalk.gray('正在分析代码变更...\n'));

    // 获取git diff
    const diff = await getGitDiff();
    
    if (!diff) {
      console.log(chalk.yellow('⚠️  没有检测到代码变更'));
      process.exit(1);
    }

    console.log(chalk.green('✅ 检测到代码变更'));
    console.log(chalk.gray('正在调用AI生成commit message...\n'));

    // 生成commit message
    const commitMessage = await generateCommitMessage(diff, options);

    console.log(chalk.blue('📝 生成的Commit Message:'));
    console.log(chalk.white('─'.repeat(50)));
    console.log(chalk.cyan(commitMessage));
    console.log(chalk.white('─'.repeat(50)));

    if (options.dryRun) {
      console.log(chalk.yellow('\n🔍 这是预览模式，不会执行commit'));
      console.log(chalk.blue('\n💡 提示: 手动复制上面的commit message进行提交'));
      return;
    }

    // 默认自动提交
    console.log(chalk.green('\n✅ 正在自动提交...'));
    
    try {
      // 询问用户是否确认提交
      const confirmAnswer = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'confirm',
          message: `确认使用以下commit message提交？\n"${commitMessage}"`,
          default: true
        }
      ]);

      if (confirmAnswer.confirm) {
        // 执行git commit
        const { execSync } = await import('child_process');
        
        // 清理commit message，移除换行符和特殊字符
        const cleanMessage = commitMessage.replace(/\n/g, ' ').trim();
        
        execSync(`git commit -m "${cleanMessage}"`, { stdio: 'inherit' });
        
        console.log(chalk.green('🎉 提交成功！'));
        
        // 自动合并master分支
        if (!options.noAutoMerge) {
          await autoMergeMaster();
        }
        
        // 显示git状态
        try {
          const status = execSync('git status --porcelain', { encoding: 'utf8' });
          if (status.trim()) {
            console.log(chalk.blue('\n📊 当前git状态:'));
            console.log(chalk.gray(status));
          } else {
            console.log(chalk.green('\n✨ 工作区干净，所有更改已提交'));
          }
        } catch (statusError) {
          console.log(chalk.yellow('\n⚠️  无法获取git状态'));
        }
      } else {
        console.log(chalk.yellow('❌ 用户取消提交'));
      }
    } catch (commitError) {
      console.error(chalk.red('❌ 自动提交失败:'), commitError.message);
      console.log(chalk.blue('\n💡 你可以手动执行:'));
      console.log(chalk.cyan(`git commit -m "${commitMessage}"`));
    }

  } catch (error) {
    console.error(chalk.red('❌ 错误:'), error.message);
    process.exit(1);
  }
}

main();
