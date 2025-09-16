import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';

// 项目配置检测器
export class ProjectConfigDetector {
  constructor(projectPath = process.cwd()) {
    this.projectPath = projectPath;
    this.config = {};
  }

  // 检测项目配置
  async detectConfig() {
    this.config = {
      commitStyle: 'conventional', // 默认使用conventional
      language: '中文',
      conventionalConfig: null,
      packageJson: null,
      gitConfig: null,
      commitlintConfig: null,
      huskyConfig: null
    };

    // 检测各种配置文件
    await this.detectPackageJson();
    await this.detectGitConfig();
    await this.detectCommitlintConfig();
    await this.detectHuskyConfig();
    await this.detectConventionalConfig();
    
    // 智能推断commit风格
    this.inferCommitStyle();
    
    // 智能推断语言
    this.inferLanguage();

    return this.config;
  }

  // 检测package.json
  async detectPackageJson() {
    const packageJsonPath = join(this.projectPath, 'package.json');
    if (existsSync(packageJsonPath)) {
      try {
        const content = readFileSync(packageJsonPath, 'utf8');
        this.config.packageJson = JSON.parse(content);
        
        // 检查是否有commit相关的配置
        if (this.config.packageJson.commitizen) {
          this.config.commitizen = this.config.packageJson.commitizen;
        }
        
        // 检查是否有commitlint配置
        if (this.config.packageJson.commitlint) {
          this.config.commitlint = this.config.packageJson.commitlint;
        }
      } catch (error) {
        console.warn('警告: 无法解析package.json文件');
      }
    }
  }

  // 检测git配置
  async detectGitConfig() {
    try {
      // 检测项目级git配置
      const projectGitConfig = join(this.projectPath, '.git', 'config');
      if (existsSync(projectGitConfig)) {
        this.config.hasProjectGitConfig = true;
      }

      // 检测全局git配置中的commit模板
      try {
        const commitTemplate = execSync('git config --global commit.template', { encoding: 'utf8', stdio: 'pipe' }).trim();
        if (commitTemplate) {
          this.config.globalCommitTemplate = commitTemplate;
        }
      } catch (e) {
        // 没有全局commit模板
      }

      // 检测项目级commit模板
      try {
        const projectCommitTemplate = execSync('git config commit.template', { encoding: 'utf8', stdio: 'pipe' }).trim();
        if (projectCommitTemplate) {
          this.config.projectCommitTemplate = projectCommitTemplate;
        }
      } catch (e) {
        // 没有项目级commit模板
      }

      // 检测.gitmessage文件
      const gitmessagePath = join(this.projectPath, '.gitmessage');
      if (existsSync(gitmessagePath)) {
        this.config.gitmessage = readFileSync(gitmessagePath, 'utf8');
      }

    } catch (error) {
      console.warn('警告: 无法检测git配置');
    }
  }

  // 检测commitlint配置
  async detectCommitlintConfig() {
    const configFiles = [
      '.commitlintrc',
      '.commitlintrc.json',
      '.commitlintrc.js',
      '.commitlintrc.yaml',
      '.commitlintrc.yml',
      'commitlint.config.js',
      'commitlint.config.ts'
    ];

    for (const file of configFiles) {
      const filePath = join(this.projectPath, file);
      if (existsSync(filePath)) {
        try {
          let content;
          if (file.endsWith('.js') || file.endsWith('.ts')) {
            // 动态导入JS/TS配置文件
            const module = await import(`file://${filePath}`);
            this.config.commitlintConfig = module.default || module;
          } else {
            content = readFileSync(filePath, 'utf8');
            if (file.endsWith('.json')) {
              this.config.commitlintConfig = JSON.parse(content);
            } else {
              // 简单解析YAML格式（基础支持）
              this.config.commitlintConfig = this.parseYaml(content);
            }
          }
          break;
        } catch (error) {
          console.warn(`警告: 无法解析${file}文件`);
        }
      }
    }
  }

  // 检测husky配置
  async detectHuskyConfig() {
    const huskyPath = join(this.projectPath, '.husky');
    if (existsSync(huskyPath)) {
      this.config.hasHusky = true;
      
      // 检查是否有commit-msg钩子
      const commitMsgHook = join(huskyPath, 'commit-msg');
      if (existsSync(commitMsgHook)) {
        this.config.hasCommitMsgHook = true;
      }
    }

    // 检查package.json中的husky配置
    if (this.config.packageJson?.husky) {
      this.config.huskyConfig = this.config.packageJson.husky;
    }
  }

  // 检测conventional commits配置
  async detectConventionalConfig() {
    // 检查是否有conventional-changelog相关配置
    if (this.config.packageJson) {
      const deps = {
        ...this.config.packageJson.dependencies,
        ...this.config.packageJson.devDependencies
      };

      const conventionalPackages = [
        'conventional-changelog-cli',
        'conventional-changelog-conventionalcommits',
        'conventional-changelog-angular',
        'conventional-changelog-eslint',
        'conventional-changelog-express',
        'conventional-changelog-jquery',
        'conventional-changelog-jshint'
      ];

      for (const pkg of conventionalPackages) {
        if (deps[pkg]) {
          this.config.conventionalConfig = {
            type: pkg.replace('conventional-changelog-', ''),
            package: pkg
          };
          break;
        }
      }
    }
  }

  // 智能推断commit风格
  inferCommitStyle() {
    // 优先级：commitlint > conventional-changelog > commitizen > git模板 > 默认
    
    if (this.config.commitlintConfig) {
      this.config.commitStyle = 'conventional';
      return;
    }

    if (this.config.conventionalConfig) {
      this.config.commitStyle = 'conventional';
      return;
    }

    if (this.config.commitizen) {
      this.config.commitStyle = 'conventional';
      return;
    }

    if (this.config.gitmessage || this.config.globalCommitTemplate || this.config.projectCommitTemplate) {
      this.config.commitStyle = 'detailed';
      return;
    }

    // 检查项目类型
    if (this.config.packageJson) {
      const pkg = this.config.packageJson;
      
      // 如果是库或框架项目，倾向于使用conventional
      if (pkg.private === false || pkg.publishConfig || pkg.repository) {
        this.config.commitStyle = 'conventional';
        return;
      }
      
      // 如果是应用项目，倾向于使用simple
      if (pkg.scripts && (pkg.scripts.start || pkg.scripts.dev)) {
        this.config.commitStyle = 'simple';
        return;
      }
    }

    // 默认使用conventional
    this.config.commitStyle = 'conventional';
  }

  // 智能推断语言
  inferLanguage() {
    // 检查package.json中的语言信息
    if (this.config.packageJson) {
      const pkg = this.config.packageJson;
      
      // 检查description、keywords等字段的语言
      if (pkg.description) {
        if (/[\u4e00-\u9fa5]/.test(pkg.description)) {
          this.config.language = '中文';
          return;
        }
      }
      
      if (pkg.keywords) {
        for (const keyword of pkg.keywords) {
          if (/[\u4e00-\u9fa5]/.test(keyword)) {
            this.config.language = '中文';
            return;
          }
        }
      }
    }

    // 检查README文件的语言
    const readmeFiles = ['README.md', 'README_CN.md', 'README.zh-CN.md'];
    for (const file of readmeFiles) {
      const filePath = join(this.projectPath, file);
      if (existsSync(filePath)) {
        try {
          const content = readFileSync(filePath, 'utf8');
          if (/[\u4e00-\u9fa5]/.test(content)) {
            this.config.language = '中文';
            return;
          }
        } catch (error) {
          // 忽略读取错误
        }
      }
    }

    // 检查.gitmessage文件
    if (this.config.gitmessage && /[\u4e00-\u9fa5]/.test(this.config.gitmessage)) {
      this.config.language = '中文';
      return;
    }

    // 默认使用中文
    this.config.language = '中文';
  }

  // 简单的YAML解析器
  parseYaml(content) {
    const config = {};
    const lines = content.split('\n');
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const colonIndex = trimmed.indexOf(':');
        if (colonIndex > 0) {
          const key = trimmed.substring(0, colonIndex).trim();
          const value = trimmed.substring(colonIndex + 1).trim();
          config[key] = value;
        }
      }
    }
    
    return config;
  }

  // 获取推荐的配置
  getRecommendedConfig() {
    return {
      style: this.config.commitStyle,
      language: this.config.language,
      reason: this.getRecommendationReason()
    };
  }

  // 获取推荐原因
  getRecommendationReason() {
    const reasons = [];
    
    if (this.config.commitlintConfig) {
      reasons.push('检测到commitlint配置');
    }
    
    if (this.config.conventionalConfig) {
      reasons.push(`检测到conventional-changelog配置 (${this.config.conventionalConfig.type})`);
    }
    
    if (this.config.commitizen) {
      reasons.push('检测到commitizen配置');
    }
    
    if (this.config.gitmessage) {
      reasons.push('检测到.gitmessage模板文件');
    }
    
    if (this.config.hasHusky) {
      reasons.push('检测到husky git hooks');
    }
    
    if (this.config.packageJson?.repository) {
      reasons.push('检测到开源项目配置');
    }
    
    if (reasons.length === 0) {
      reasons.push('基于项目类型推断');
    }
    
    return reasons.join(', ');
  }

  // 显示检测结果
  showDetectionResult() {
    console.log('\n🔍 项目配置检测结果:');
    console.log('─'.repeat(50));
    console.log(`📝 推荐Commit风格: ${this.config.commitStyle}`);
    console.log(`🌍 推荐语言: ${this.config.language}`);
    console.log(`💡 推荐原因: ${this.getRecommendationReason()}`);
    
    if (this.config.commitlintConfig) {
      console.log(`✅ 检测到commitlint配置`);
    }
    
    if (this.config.conventionalConfig) {
      console.log(`✅ 检测到conventional-changelog配置`);
    }
    
    if (this.config.commitizen) {
      console.log(`✅ 检测到commitizen配置`);
    }
    
    if (this.config.gitmessage) {
      console.log(`✅ 检测到.gitmessage模板`);
    }
    
    if (this.config.hasHusky) {
      console.log(`✅ 检测到husky配置`);
    }
    
    console.log('─'.repeat(50));
  }
}
