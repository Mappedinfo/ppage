#!/bin/bash

# PPage 本地部署脚本
# 用于将构建产出部署到 GitHub Pages
# 
# 使用方法：
#   ./scripts/deploy.sh 或 npm run deploy
#
# 特性：
#   - 使用相对路径构建，支持任意部署路径
#   - 自动读取 config.yml 配置
#   - 支持自定义域名（CNAME）
#   - 一键自动化部署

set -e
# 加载 .env.local（若存在），使 PPAGE_SITE 等变量对部署生效
if [ -f ".env.local" ]; then
  set -a
  . ./.env.local
  set +a
fi

# 选择配置文件：PPAGE_SITE 启用时从 sites/<name>/ 读，否则用默认 public/config.yml
if [ -n "$PPAGE_SITE" ]; then
  CONFIG_FILE="sites/$PPAGE_SITE/config.yml"
  echo "🌐 站点 profile: $PPAGE_SITE"
else
  CONFIG_FILE="public/config.yml"
fi

echo "🚀 PPage 部署工具 - 开始部署..."
echo ""

# 0. 从配置文件读取部署信息
echo "🔍 读取配置文件: $CONFIG_FILE"

if [ ! -f "$CONFIG_FILE" ]; then
  echo "❌ 错误: 找不到 $CONFIG_FILE"
  echo "请在项目根目录执行此脚本"
  exit 1
fi

# 使用 grep 和 sed 提取仓库地址
REPOSITORY=$(grep -A 2 '^deploy:' "$CONFIG_FILE" | grep 'repository:' | sed 's/.*repository:[[:space:]]*["\x27]\{0,1\}\([^"\x27]*\)["\x27]\{0,1\}.*/\1/' | tr -d '\r')
BRANCH=$(grep -A 2 '^deploy:' "$CONFIG_FILE" | grep 'branch:' | sed 's/.*branch:[[:space:]]*["\x27]\{0,1\}\([^"\x27]*\)["\x27]\{0,1\}.*/\1/' | tr -d '\r')
CUSTOM_DOMAIN=$(grep -A 5 '^deploy:' "$CONFIG_FILE" | grep 'customDomain:' | awk -F: '{print $2}' | sed 's/[" ]//g' | cut -d'#' -f1 | tr -d '\r')

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

# 未选择站点 profile 时，CONFIG_FILE 指向产品自带的 demo 配置（public/config.yml），
# 其部署仓库是产品仓库本身。为防止误把 demo 覆盖到线上站点，默认拒绝部署。
if [ -z "$PPAGE_SITE" ] && [ "$PPAGE_DEPLOY_DEMO" != "1" ]; then
  echo "❌ 未设置 PPAGE_SITE，本次会把产品自带的 demo 配置部署到: $REPOSITORY"
  echo "   请在 .env.local 中写入 PPAGE_SITE=<站点名>（例如 PPAGE_SITE=shiqi）。"
  echo "   确需部署 demo 时，设置 PPAGE_DEPLOY_DEMO=1 后重试。"
  exit 1
fi

echo "✅ 仓库地址: $REPOSITORY"
echo "✅ 部署分支: $BRANCH"

if [ -n "$CUSTOM_DOMAIN" ]; then
  echo "✅ 自定义域名: $CUSTOM_DOMAIN"
else
  echo "ℹ️  未配置自定义域名"
fi

echo ""

# 部署确认（可通过环境变量 SKIP_CONFIRM=1 跳过）
if [ "$SKIP_CONFIRM" != "1" ]; then
  read -p "⚠️  确认部署到上述仓库？ [y/N] " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ 取消部署"
    exit 0
  fi
  echo ""
fi

# 1. 清理旧的构建产出
if [ -d "dist" ]; then
  echo "🧹 清理旧的构建产出..."
  rm -rf dist
fi

# 2. 构建项目
echo "📦 构建项目（使用相对路径，支持任意部署路径）..."
npm run build

# 2.3. 验证构建产物
if [ ! -f "dist/index.html" ]; then
  echo "❌ 错误: 构建失败，未找到 dist/index.html"
  exit 1
fi
echo "✓ 构建成功"

# 2.5. 生成 CNAME 文件（如果配置了自定义域名）
if [ -n "$CUSTOM_DOMAIN" ]; then
  echo "🏷️  生成 CNAME 文件..."
  echo "$CUSTOM_DOMAIN" > dist/CNAME
  echo "✅ CNAME 文件已生成: $CUSTOM_DOMAIN"
fi

# 2.6. 添加 .nojekyll 文件（禁用 Jekyll 处理）
echo "📄 添加 .nojekyll 文件..."
touch dist/.nojekyll
echo "✅ .nojekyll 文件已生成（禁用 Jekyll，确保所有文件正确部署）"

# 3. 进入构建产出目录
cd dist

# 4. 初始化 git 仓库（如果还没有）
if [ ! -d ".git" ]; then
  echo "🔧 初始化 Git 仓库..."
  git init
  git checkout -b "$BRANCH"
else
  echo "✓ Git 仓库已存在"
fi

# 5. 添加所有文件
echo "📝 添加文件..."
git add -A

# 6. 提交
echo "💾 提交更改..."
git commit -m "deploy: 更新站点 $(date '+%Y-%m-%d %H:%M:%S')" || echo "没有更改需要提交"

# 7. 推送到 GitHub
echo "📤 推送到 $REPOSITORY ..."
git remote add origin "$REPOSITORY" 2>/dev/null || true
git remote set-url origin "$REPOSITORY"
git push -f origin "$BRANCH"

echo "✅ 部署完成！"
echo ""
echo "🎉 部署信息："
echo "  仓库: $REPOSITORY"
echo "  分支: $BRANCH"
if [ -n "$CUSTOM_DOMAIN" ]; then
  echo "  域名: https://$CUSTOM_DOMAIN"
else
  # 从仓库 URL 提取 username 和 repo
  REPO_INFO=$(echo "$REPOSITORY" | sed 's/.*github.com[:/]\(.*\)\.git/\1/' | sed 's/.*github.com[:/]\(.*\)/\1/')
  echo "  网址: https://$REPO_INFO (GitHub Pages)"
fi
echo ""
echo "🕒 请稍候 1-2 分钟，GitHub Pages 正在部署..."
echo "📌 提示: 相对路径构建支持任意部署路径（根路径/子目录）"

cd ..
