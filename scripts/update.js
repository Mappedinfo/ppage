#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

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

// 受保护的用户文件列表
const PROTECTED_FILES = [
  'config.yml',
  'public/config.yml',
  'content/',
  'public/assets/',
  '_template/',
  'scripts/deploy.sh',
];

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

// 备份用户文件
function backupUserFiles() {
  log('\n📦 备份用户文件...', 'blue');
  
  const backupDir = path.join(rootDir, '.backup-' + Date.now());
  fs.mkdirSync(backupDir, { recursive: true });
  
  const backedUp = [];
  
  for (const file of PROTECTED_FILES) {
    const srcPath = path.join(rootDir, file);
    if (fs.existsSync(srcPath)) {
      const destPath = path.join(backupDir, file);
      const destDir = path.dirname(destPath);
      
      fs.mkdirSync(destDir, { recursive: true });
      
      if (fs.statSync(srcPath).isDirectory()) {
        copyDir(srcPath, destPath);
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
      
      backedUp.push(file);
      log(`  ✓ 已备份: ${file}`, 'green');
    }
  }
  
  if (backedUp.length === 0) {
    log('  ⚠️  没有找到需要备份的用户文件', 'yellow');
  }
  
  return backupDir;
}

// 复制目录
function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });
  
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// 恢复用户文件
function restoreUserFiles(backupDir) {
  log('\n📥 恢复用户文件...', 'blue');
  
  for (const file of PROTECTED_FILES) {
    const srcPath = path.join(backupDir, file);
    if (fs.existsSync(srcPath)) {
      const destPath = path.join(rootDir, file);
      const destDir = path.dirname(destPath);
      
      fs.mkdirSync(destDir, { recursive: true });
      
      if (fs.statSync(srcPath).isDirectory()) {
        // 删除目标目录后再复制
        if (fs.existsSync(destPath)) {
          fs.rmSync(destPath, { recursive: true, force: true });
        }
        copyDir(srcPath, destPath);
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
      
      log(`  ✓ 已恢复: ${file}`, 'green');
    }
  }
}

// 清理备份
function cleanupBackup(backupDir) {
  try {
    fs.rmSync(backupDir, { recursive: true, force: true });
    log(`\n🗑️  清理备份: ${path.basename(backupDir)}`, 'cyan');
  } catch (error) {
    log(`\n⚠️  清理备份失败: ${error.message}`, 'yellow');
  }
}

// 主更新流程
async function update() {
  log('\n🚀 开始更新 PPage 代码...', 'blue');
  
  // 1. 检查 git 仓库
  if (!checkGitRepo()) {
    log('\n❌ 错误: 当前目录不是 git 仓库', 'red');
    log('   请确保你是从 git 克隆的项目', 'yellow');
    process.exit(1);
  }
  
  // 2. 检查未提交的更改
  if (hasUncommittedChanges()) {
    log('\n⚠️  警告: 检测到未提交的更改', 'yellow');
    log('   建议先提交或暂存你的更改', 'yellow');
    log('   继续更新可能会导致冲突', 'yellow');
    
    // 在实际使用中，这里可以添加交互式确认
    // 为了自动化，这里继续执行
  }
  
  // 3. 检查上游仓库
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
  let backupDir = null;
  
  try {
    // 4. 备份用户文件
    backupDir = backupUserFiles();
    
    // 5. 获取上游更新
    log('\n🔄 拉取上游更新...', 'blue');
    execSync('git fetch upstream', { cwd: rootDir, stdio: 'inherit' });
    
    // 6. 合并上游更新
    log(`\n🔀 合并上游更新到 ${currentBranch} 分支...`, 'blue');
    try {
      execSync(`git merge upstream/${currentBranch} --no-edit`, { cwd: rootDir, stdio: 'inherit' });
      log('  ✓ 合并成功', 'green');
    } catch (error) {
      log('\n⚠️  合并时出现冲突', 'yellow');
      log('   正在恢复用户文件...', 'yellow');
      restoreUserFiles(backupDir);
      log('\n💡 提示:', 'cyan');
      log('   1. 请手动解决冲突', 'cyan');
      log('   2. 运行 git add . && git commit 完成合并', 'cyan');
      log('   3. 你的用户文件已经恢复，不用担心丢失', 'cyan');
      return;
    }
    
    // 7. 恢复用户文件
    restoreUserFiles(backupDir);
    
    // 8. 安装/更新依赖
    log('\n📦 更新依赖包...', 'blue');
    try {
      execSync('npm install', { cwd: rootDir, stdio: 'inherit' });
      log('  ✓ 依赖更新完成', 'green');
    } catch (error) {
      log('\n⚠️  依赖更新失败，请手动运行 npm install', 'yellow');
    }
    
    // 9. 清理备份
    cleanupBackup(backupDir);
    
    log('\n✨ 更新完成！', 'green');
    log('\n📝 下一步：', 'cyan');
    log('  1. 运行 npm run dev 测试更新后的代码', 'cyan');
    log('  2. 检查你的配置和内容是否正常', 'cyan');
    log('  3. 如有需要，运行 npm run build 重新构建', 'cyan');
    
  } catch (error) {
    log(`\n❌ 更新失败: ${error.message}`, 'red');
    
    // 如果有备份，尝试恢复
    if (backupDir && fs.existsSync(backupDir)) {
      log('\n🔄 尝试恢复用户文件...', 'yellow');
      try {
        restoreUserFiles(backupDir);
        log('  ✓ 用户文件已恢复', 'green');
      } catch (restoreError) {
        log(`  ❌ 恢复失败: ${restoreError.message}`, 'red');
        log(`  💾 备份文件位置: ${backupDir}`, 'yellow');
        log('     请手动恢复这些文件', 'yellow');
      }
    }
    
    process.exit(1);
  }
}

// 运行更新
update();
