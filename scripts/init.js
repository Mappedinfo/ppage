#!/usr/bin/env node

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '..')

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
}

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

// 检查目录是否存在
function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true })
  }
}

// 复制文件
function copyFile(src, dest) {
  ensureDir(path.dirname(dest))
  fs.copyFileSync(src, dest)
}

// 复制目录
function copyDir(src, dest) {
  ensureDir(dest)
  const entries = fs.readdirSync(src, { withFileTypes: true })

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name)
    const destPath = path.join(dest, entry.name)

    if (entry.isDirectory()) {
      copyDir(srcPath, destPath)
    } else {
      copyFile(srcPath, destPath)
    }
  }
}

// 归档当前模板文件
function archiveTemplate() {
  log('\n📦 步骤 1: 归档当前模板文件...', 'blue')

  const templateDir = path.join(rootDir, '_template')
  ensureDir(templateDir)

  // 归档内容目录
  const contentSrc = path.join(rootDir, 'content')
  const contentDest = path.join(templateDir, 'content')
  if (fs.existsSync(contentSrc)) {
    log('  ✓ 归档 content/ 目录...', 'green')
    copyDir(contentSrc, contentDest)
  }

  // 归档配置文件
  const configSrc = path.join(rootDir, 'config.yml')
  const configDest = path.join(templateDir, 'config.yml')
  if (fs.existsSync(configSrc)) {
    log('  ✓ 归档 config.yml 文件...', 'green')
    copyFile(configSrc, configDest)
  }

  // 归档 public/config.yml
  const publicConfigSrc = path.join(rootDir, 'public', 'config.yml')
  const publicConfigDest = path.join(templateDir, 'public-config.yml')
  if (fs.existsSync(publicConfigSrc)) {
    log('  ✓ 归档 public/config.yml 文件...', 'green')
    copyFile(publicConfigSrc, publicConfigDest)
  }

  log('  ✅ 模板文件归档完成！', 'green')
}

// 创建用户内容模板
function createUserTemplate() {
  log('\n🎨 步骤 2: 创建用户内容模板...', 'blue')

  // 创建用户内容目录结构
  const userContentDir = path.join(rootDir, 'content')
  ensureDir(userContentDir)

  // 创建子目录
  const postsDir = path.join(userContentDir, 'posts')
  const pagesDir = path.join(userContentDir, 'pages')
  const filesDir = path.join(userContentDir, 'files')
  const pdfsDir = path.join(filesDir, 'pdfs')

  ensureDir(postsDir)
  ensureDir(pagesDir)
  ensureDir(filesDir)
  ensureDir(pdfsDir)

  // 创建指引性模板文件
  const welcomePost = `---
title: "欢迎使用 PPage"
date: "${new Date().toISOString().split('T')[0]}"
description: "开始使用 PPage 搭建你的个人主页"
tags:
  - "PPage"
  - "开始"
---

# 欢迎使用 PPage

这是一个示例博客文章。请在此处填写你的内容。

## 如何使用

1. 编辑 \`config.yml\` 配置文件，填写你的个人信息
2. 在 \`content/posts/\` 目录下创建新的 Markdown 文件来写博客
3. 在 \`content/pages/\` 目录下创建页面内容
4. 在 \`content/files/\` 目录下放置需要展示的文件

## 开始创作

删除这个文件，开始创作你自己的内容吧！
`

  const aboutPage = `---
title: "关于我"
---

# 关于我

**请在此填写关于你的信息**

## 个人简介

在这里介绍你自己...

## 研究方向

列出你的研究方向或专业领域...

## 教育背景

- 学位 - 学校名称，时间
- 学位 - 学校名称，时间

## 工作经历

- 职位 - 公司/机构，时间
`

  const readmeFile = `# 文件目录

这个目录用于存放你想要在网站上展示的文件（如 PDF、文档等）。

## 使用方法

1. 将文件放在这个目录或子目录下
2. 在 Markdown 文章中引用文件：\`[下载文件](/content/files/your-file.pdf)\`
3. 系统会自动扫描并在文件页面展示

## 建议的目录结构

- \`pdfs/\` - PDF 文档
- \`docs/\` - 其他文档
- \`images/\` - 图片资源
`

  fs.writeFileSync(path.join(postsDir, 'welcome.md'), welcomePost)
  fs.writeFileSync(path.join(pagesDir, 'about.md'), aboutPage)
  fs.writeFileSync(path.join(filesDir, 'README.md'), readmeFile)

  log('  ✓ 创建 content/posts/welcome.md', 'green')
  log('  ✓ 创建 content/pages/about.md', 'green')
  log('  ✓ 创建 content/files/README.md', 'green')
  log('  ✅ 用户内容模板创建完成！', 'green')
}

// 创建用户配置文件
function createUserConfig() {
  log('\n⚙️  步骤 3: 创建配置文件模板...', 'blue')

  const configTemplate = `# PPage 个人主页配置文件
# 请按照注释提示填写你的个人信息

# ========================================
# 站点基本信息
# ========================================
site:
  title: "【请填写】你的网站标题"
  description: "【请填写】网站描述"
  author: "【请填写】你的名字"
  baseUrl: "/"

# ========================================
# 个人信息
# ========================================
profile:
  name: "【请填写】你的名字"
  avatar: "/assets/images/avatar.jpg"  # 请将头像放在 public/assets/images/ 目录下
  bio: "【请填写】简短的个人介绍"
  email: "【请填写】your.email@example.com"
  location: "【请填写】城市, 国家"

# ========================================
# 社交链接
# ========================================
social:
  - name: "GitHub"
    icon: "github"
    url: "【请填写】https://github.com/yourusername"
  - name: "Email"
    icon: "email"
    url: "【请填写】mailto:your.email@example.com"
  # 可以添加更多社交链接：
  # - name: "Twitter"
  #   icon: "twitter"
  #   url: "https://twitter.com/yourusername"

# ========================================
# 导航菜单配置
# ========================================
# placement: 控制导航显示位置，primary 显示在主导航，menu 放入菜单，hidden 隐藏
# showInMobile: 旧配置，未设置 placement 时仍会兼容；false 会被视为 menu
# order: 控制导航顺序，数值越小越靠前，默认按配置顺序（order 值从 999 开始）
navigation:
  - name: "首页"
    path: "/"
    placement: "primary"
    order: 1
  - name: "关于"
    path: "/about"
    placement: "primary"
    order: 2
  - name: "项目"
    path: "/projects"
    placement: "menu"
  - name: "博客"
    path: "/posts"
    placement: "menu"
  - name: "文件"
    path: "/files"
    placement: "menu"
  - name: "动态"
    path: "/news"
    placement: "menu"

# ========================================
# 主题配置
# ========================================
theme:
  default: "light"  # 可选: light, dark, academic, glass
  available:
    - "light"
    - "dark"
    - "academic"
    - "glass"

# ========================================
# 语言配置
# ========================================
language:
  default: "zh"  # zh(中文) 或 en(英文)

# ========================================
# 内容路径配置（通常不需要修改）
# ========================================
content:
  postsPath: "/content/posts"
  pagesPath: "/content/pages"
  filesPath: "/content/files"
  assetsPath: "/assets"

# ========================================
# 文件配置
# ========================================
# 系统会自动扫描 Markdown 中的文件链接
# 如需手动配置，请参考以下格式：
files:
  # - title: "【请填写】文件标题"
  #   description: "【请填写】文件描述"
  #   type: "pdf"
  #   path: "/content/files/pdfs/your-file.pdf"
  #   preview: true

# ========================================
# 项目列表
# ========================================
projects:
  - name: "【请填写】项目名称"
    description: "【请填写】项目描述"
    url: "【请填写】https://github.com/yourusername/project"
    featured: true
    tags:
      - "【请填写】标签1"
      - "【请填写】标签2"

# ========================================
# 部署配置
# 重要：请修改为你自己的仓库地址！
# 用于 scripts/deploy.sh 脚本部署
# ========================================
deploy:
  repository: "【请填写】https://github.com/yourusername/yourrepo"  # 你的 GitHub 仓库地址
  branch: "gh-pages"  # 部署分支，默认 gh-pages

# ========================================
# 新闻/动态配置
# ========================================
# 可以展示学术活动、论文状态、访问交流等动态信息
news:
  - title: "【请填写】动态标题"
    description: "【请填写】动态描述"
    type: "paper"  # 可选: paper, award, talk, visit, conference, graduation, service, other
    date: "${new Date().toISOString().split('T')[0]}"
    tags:
      - "【请填写】标签"
`

  const publicConfigPath = path.join(rootDir, 'public', 'config.yml')

  // 只生成 public/config.yml
  fs.writeFileSync(publicConfigPath, configTemplate)

  log('  ✓ 创建 public/config.yml', 'green')
  log('  ✅ 配置文件模板创建完成！', 'green')
}

// 主函数
async function init() {
  log('\n🚀 开始初始化 PPage 项目...', 'blue')

  try {
    // 步骤 1: 归档模板
    archiveTemplate()

    // 步骤 2: 创建用户内容模板
    createUserTemplate()

    // 步骤 3: 创建用户配置文件
    createUserConfig()

    log('\n✨ 初始化完成！', 'green')
    log('\n📝 下一步：', 'yellow')
    log('  1. 编辑 config.yml 文件，填写你的个人信息', 'yellow')
    log('  2. 在 content/posts/ 目录下创建你的博客文章', 'yellow')
    log('  3. 在 content/pages/ 目录下创建页面内容', 'yellow')
    log('  4. 运行 npm run dev 查看效果', 'yellow')
    log('\n💡 提示：原始模板文件已保存在 _template/ 目录中', 'blue')
  } catch (error) {
    log(`\n❌ 初始化失败: ${error.message}`, 'red')
    process.exit(1)
  }
}

// 运行初始化
init()
