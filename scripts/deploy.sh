#!/bin/bash

# PPage 本地部署脚本
# 用于将构建产出部署到 GitHub Pages

set -e

echo "🚀 开始构建和部署..."

# 0. 从 public/config.yml 读取配置
echo "🔍 读取配置文件..."

if [ ! -f "public/config.yml" ]; then
  echo "❌ 错误: 找不到 public/config.yml 文件"
  echo "请在项目根目录执行此脚本"
  exit 1
fi

# 使用 grep 和 sed 提取仓库地址
REPOSITORY=$(grep -A 2 '^deploy:' public/config.yml | grep 'repository:' | sed 's/.*repository:[[:space:]]*["\x27]\{0,1\}\([^"\x27]*\)["\x27]\{0,1\}.*/\1/' | tr -d '\r')
BRANCH=$(grep -A 2 '^deploy:' public/config.yml | grep 'branch:' | sed 's/.*branch:[[:space:]]*["\x27]\{0,1\}\([^"\x27]*\)["\x27]\{0,1\}.*/\1/' | tr -d '\r')

# 如果没有读取到，使用默认值
if [ -z "$REPOSITORY" ] || [ "$REPOSITORY" = "https://github.com/yourusername/ppage" ]; then
  echo "⚠️  警告: 未配置有效的仓库地址"
  echo "请在 public/config.yml 中修改 deploy.repository 配置"
  echo "例如: repository: \"https://github.com/yourusername/yourrepo\""
  exit 1
fi

if [ -z "$BRANCH" ]; then
  BRANCH="gh-pages"
fi

echo "✅ 仓库地址: $REPOSITORY"
echo "✅ 部署分支: $BRANCH"

# 1. 构建项目
echo "📦 构建项目..."
npm run build

# 2. 进入构建产出目录
cd dist

# 3. 初始化 git 仓库（如果还没有）
if [ ! -d ".git" ]; then
  echo "🔧 初始化 Git 仓库..."
  git init
  git checkout -b gh-pages
fi

# 4. 添加所有文件
echo "📝 添加文件..."
git add -A

# 5. 提交
echo "💾 提交更改..."
git commit -m "deploy: 更新站点 $(date '+%Y-%m-%d %H:%M:%S')" || echo "没有更改需要提交"

# 6. 推送到 GitHub
echo "📤 推送到 $REPOSITORY ..."
git remote add origin "$REPOSITORY" 2>/dev/null || true
git remote set-url origin "$REPOSITORY"
git push -f origin "$BRANCH"

echo "✅ 部署完成！"
echo "📁 产出目录: dist/"
echo "🌐 请稍候片刻访问你的 GitHub Pages 网址"

cd ..
