#!/usr/bin/env node

import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// 检查是否是 git 仓库
function checkGitRepo() {
  try {
    execSync('git rev-parse --git-dir', { cwd: rootDir, stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

// 检查是否有未提交的更改
function hasUncommittedChanges() {
  try {
    const status = execSync('git status --porcelain', { cwd: rootDir, encoding: 'utf-8' });
    return status.trim().length > 0;
  } catch {
    return false;
  }
}

// 获取当前分支名
function getCurrentBranch() {
  try {
    return execSync('git branch --show-current', { cwd: rootDir, encoding: 'utf-8' }).trim();
  } catch {
    return 'main';
  }
}

// 检查是否配置了上游仓库
function hasUpstream() {
  try {
    execSync('git remote get-url upstream', { cwd: rootDir, stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

// 配置 Git merge 驱动（如果未配置）
function setupMergeDriver() {
  try {
    // 检查是否已配置 ours 合并驱动
    const config = execSync('git config --get merge.ours.driver', { cwd: rootDir, encoding: 'utf-8', stdio: 'pipe' }).trim();
    if (!config) {
      throw new Error('Not configured');
    }
  } catch {
    // 配置 ours 合并驱动：在冲突时保留当前版本
    log('\n⚙️  配置 Git 合并策略...', 'blue');
    execSync('git config merge.ours.driver true', { cwd: rootDir });
    log('  ✓ 合并策略配置完成', 'green');
  }
}

// 主更新流程
async function update() {
  log('\n🚀 开始更新 PPage 代码...', 'blue');
  
  try {
    // 1. 检查 git 仓库
    if (!checkGitRepo()) {
      log('\n❌ 错误: 当前目录不是 git 仓库', 'red');
      log('   请确保你是从 git 克隆的项目', 'yellow');
      process.exit(1);
    }
    
    // 2. 检查未提交的更改
    if (hasUncommittedChanges()) {
      log('\n⚠️  检测到未提交的更改', 'yellow');
      log('\n建议先提交你的更改：', 'cyan');
      log('  git add .', 'cyan');
      log('  git commit -m "Save my changes"', 'cyan');
      log('\n然后再运行 npm run update', 'cyan');
      log('\n或者使用 git stash 暂存更改：', 'cyan');
      log('  git stash', 'cyan');
      log('  npm run update', 'cyan');
      log('  git stash pop', 'cyan');
      process.exit(1);
    }
    
    // 3. 配置 Git merge 驱动
    setupMergeDriver();
    
    // 4. 检查并配置上游仓库
    if (!hasUpstream()) {
      log('\n📡 配置上游仓库...', 'blue');
      try {
        execSync('git remote add upstream https://github.com/mappedinfo/ppage.git', { cwd: rootDir });
        log('  ✓ 已添加上游仓库', 'green');
      } catch (error) {
        log('\n❌ 错误: 无法添加上游仓库', 'red');
        log(`   ${error.message}`, 'red');
        process.exit(1);
      }
    }
    
    const currentBranch = getCurrentBranch();
    
    // 5. 获取上游更新
    log('\n🔄 拉取上游更新...', 'blue');
    execSync('git fetch upstream', { cwd: rootDir, stdio: 'inherit' });
    
    // 6. 合并上游更新
    log(`\n🔀 合并上游更新到 ${currentBranch} 分支...`, 'blue');
    log('   💡 .gitattributes 中配置的文件会自动保留你的版本', 'cyan');
    
    try {
      execSync(`git merge upstream/${currentBranch} --no-edit`, { cwd: rootDir, stdio: 'inherit' });
      log('\n  ✓ 合并成功！', 'green');
    } catch (error) {
      log('\n⚠️  合并时出现冲突', 'yellow');
      log('\n💡 说明:', 'cyan');
      log('   - 用户内容文件（config.yml, content/ 等）已自动保留你的版本', 'cyan');
      log('   - 如果有其他冲突，请手动解决', 'cyan');
      log('\n解决冲突的步骤:', 'cyan');
      log('   1. 运行 git status 查看冲突文件', 'cyan');
      log('   2. 编辑冲突文件，解决冲突标记', 'cyan');
      log('   3. 运行 git add . && git commit 完成合并', 'cyan');
      process.exit(1);
    }
    
    // 7. 安装/更新依赖
    log('\n📦 更新依赖包...', 'blue');
    try {
      execSync('npm install', { cwd: rootDir, stdio: 'inherit' });
      log('  ✓ 依赖更新完成', 'green');
    } catch (error) {
      log('\n⚠️  依赖更新失败，请手动运行 npm install', 'yellow');
    }
    
    log('\n✨ 更新完成！', 'green');
    log('\n📝 下一步：', 'cyan');
    log('  1. 运行 npm run dev 测试更新后的代码', 'cyan');
    log('  2. 检查你的配置和内容是否正常', 'cyan');
    log('  3. 推送更新: git push origin ' + currentBranch, 'cyan');
    log('\n💡 提示：', 'blue');
    log('  你的配置和内容文件已通过 .gitattributes 自动保护', 'blue');
    log('  查看保护的文件列表: cat .gitattributes', 'blue');
    
  } catch (error) {
    log(`\n❌ 更新失败: ${error.message}`, 'red');
    log('\n💡 故障排除:', 'cyan');
    log('  1. 确保网络连接正常', 'cyan');
    log('  2. 检查 git 配置是否正确', 'cyan');
    log('  3. 查看错误信息并搜索解决方案', 'cyan');
    log('  4. 如需帮助，请在 GitHub 提 Issue', 'cyan');
    process.exit(1);
  }
}

// 运行更新
update();
