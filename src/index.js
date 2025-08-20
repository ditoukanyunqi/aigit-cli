/**
 * AIGit CLI - AI-powered git commit message generator
 * 
 * This is the main entry point for the npm package.
 * The actual CLI logic is in bin/aigit.js
 */

export { generateCommitMessage } from './generator.js';
export { getGitDiff, executeGitCommit, getGitStatus, getCurrentBranch } from './git.js';
export { config, isConfigValid, saveApiKey, saveProvider, showConfigHelp } from './config.js';

// Package information
export const packageInfo = {
  name: 'aigit-cli',
  version: '1.0.0',
  description: 'AI-powered git commit message generator using OpenAI or DeepSeek'
};
