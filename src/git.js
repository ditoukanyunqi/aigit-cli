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
    // 使用--no-prefix减少路径前缀，--unified=1减少上下文行数
    return execSync('git diff --cached --no-prefix --unified=1', { encoding: 'utf8' });
  } catch {
    return '';
  }
}

// 获取未暂存但已修改的文件diff
function getUnstagedDiff() {
  try {
    // 使用--no-prefix减少路径前缀，--unified=1减少上下文行数
    return execSync('git diff --no-prefix --unified=1', { encoding: 'utf8' });
  } catch {
    return '';
  }
}

// 获取简化的diff内容（只包含变更的核心信息）
function getSimplifiedDiff() {
  try {
    // 获取文件列表
    const stagedFiles = getStagedFiles();
    const unstagedFiles = execSync('git diff --name-only', { encoding: 'utf8' }).trim().split('\n').filter(Boolean);
    
    let simplifiedDiff = '';
    
    // 处理暂存的文件
    if (stagedFiles.length > 0) {
      simplifiedDiff += '暂存文件:\n';
      stagedFiles.forEach(file => {
        // 只获取文件的基本变更统计
        try {
          const stats = execSync(`git diff --cached --stat ${file}`, { encoding: 'utf8' });
          simplifiedDiff += stats + '\n';
        } catch (e) {
          simplifiedDiff += `${file}\n`;
        }
      });
      simplifiedDiff += '\n';
    }
    
    // 处理未暂存的文件
    if (unstagedFiles.length > 0) {
      simplifiedDiff += '未暂存文件:\n';
      unstagedFiles.forEach(file => {
        // 只获取文件的基本变更统计
        try {
          const stats = execSync(`git diff --stat ${file}`, { encoding: 'utf8' });
          simplifiedDiff += stats + '\n';
        } catch (e) {
          simplifiedDiff += `${file}\n`;
        }
      });
    }
    
    return simplifiedDiff;
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
  const unstagedFiles = execSync('git diff --name-only', { encoding: 'utf8' }).trim().split('\n').filter(Boolean);
  
  // 如果文件数量很多，使用简化的diff
  if (stagedFiles.length + unstagedFiles.length > 10) {
    return getSimplifiedDiff();
  }
  
  // 如果有暂存的文件，优先使用暂存区的diff
  if (stagedFiles.length > 0) {
    const stagedDiff = getStagedDiff();
    if (stagedDiff.trim()) {
      return stagedDiff;
    }
  }
  
  // 如果没有暂存的文件，检查是否有未暂存的修改
  if (unstagedFiles.length > 0) {
    const unstagedDiff = getUnstagedDiff();
    if (unstagedDiff.trim()) {
      return unstagedDiff;
    }
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
