import { execSync } from 'child_process';
import { existsSync } from 'fs';

// 检查是否在git仓库中
function isGitRepository() {
  try {
    execSync('git rev-parse --git-dir', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

// 获取暂存区的文件列表
function getStagedFiles() {
  try {
    const output = execSync('git diff --cached --name-only', { encoding: 'utf8' });
    return output.trim().split('\n').filter(Boolean);
  } catch {
    return [];
  }
}

// 获取暂存区的diff内容
function getStagedDiff() {
  try {
    return execSync('git diff --cached', { encoding: 'utf8' });
  } catch {
    return '';
  }
}

// 获取未暂存但已修改的文件diff
function getUnstagedDiff() {
  try {
    return execSync('git diff', { encoding: 'utf8' });
  } catch {
    return '';
  }
}

// 获取所有变更的diff
export async function getGitDiff() {
  if (!isGitRepository()) {
    throw new Error('当前目录不是git仓库');
  }

  const stagedFiles = getStagedFiles();
  const unstagedDiff = getUnstagedDiff();
  
  // 如果有暂存的文件，优先使用暂存区的diff
  if (stagedFiles.length > 0) {
    const stagedDiff = getStagedDiff();
    if (stagedDiff.trim()) {
      return stagedDiff;
    }
  }
  
  // 如果没有暂存的文件，检查是否有未暂存的修改
  if (unstagedDiff.trim()) {
    return unstagedDiff;
  }
  
  return null;
}

// 执行git commit
export async function executeGitCommit(message) {
  try {
    // 清理commit message，移除换行符和特殊字符
    const cleanMessage = message.replace(/\n/g, ' ').trim();
    
    execSync(`git commit -m "${cleanMessage}"`, { stdio: 'inherit' });
    return true;
  } catch (error) {
    throw new Error(`Git commit 失败: ${error.message}`);
  }
}

// 获取git状态信息
export function getGitStatus() {
  try {
    const status = execSync('git status --porcelain', { encoding: 'utf8' });
    return status.trim().split('\n').filter(Boolean);
  } catch {
    return [];
  }
}

// 获取当前分支名
export function getCurrentBranch() {
  try {
    return execSync('git branch --show-current', { encoding: 'utf8' }).trim();
  } catch {
    return 'unknown';
  }
}
