---
title: 完整用户指南
id: user-guide
type: page
collection: tutorials
parent: deployment-index
order: 1
date: 2025-12-31
author: System
tags: [tutorial, user-guide, manual]
category: 教程
---

# PPage - 个人主页系统

一个纯前端部署的个人主页生成系统，支持通过 YAML 配置文件一站式配置，Markdown 内容创作，多主题切换，零成本部署在 GitHub Pages。

## ✨ 特性

- 🎨 **多主题系统** - 内置明亮、暗黑、学术三种主题，支持运行时切换
- 📝 **Markdown 驱动** - 使用 Markdown 编写内容，自动渲染为美观网页
- ⚙️ **配置即内容** - 通过 YAML 文件一站式管理个人信息、项目、导航
- 📱 **响应式设计** - 完美适配桌面、平板、移动设备
- 🚀 **零成本部署** - 部署到 GitHub Pages，无需服务器和数据库
- 📄 **学术友好** - 原生支持 PDF 预览和多格式文件下载

## 🚀 快速开始

### 1. 克隆项目

```bash
git clone https://github.com/mappedinfo/ppage.git
cd ppage
```

### 2. 安装依赖

```bash
npm install
```

### 3. 配置站点

编辑 `public/config.yml` 文件，配置你的个人信息：

```yaml
# 站点基本信息
site:
  title: '你的名字'
  description: '你的个人主页'
  author: '你的名字'

# 个人资料
profile:
  name: '你的名字'
  avatar: '/assets/images/avatar.jpg'
  bio: '一句话介绍自己'
  email: 'your.email@example.com'

# 更多配置见 public/config.yml 文件...
```

### 4. 本地预览

```bash
npm run dev
```

访问 `http://localhost:5173` 预览你的站点。

### 5. 构建和部署

选择适合你的部署方式：

#### 方式一：子目录部署（推荐）

适用于：`yourusername.github.io/ppage`

```bash
# 配置 public/config.yml 中的 deploy.repository
# 然后执行：
./scripts/deploy.sh
```

#### 方式二：根域名部署

适用于：`yourusername.github.io` 或自定义域名 `yourdomain.com`

```bash
# 配置 public/config.yml 中的 deploy.repository
# 然后执行：
./scripts/deploy.sh root
```

详细部署指南请查看下方的 [🚢 部署指南](#-部署指南) 部分。

## 📂 目录结构

```
ppage/
├── public/              # 静态资源
│   ├── assets/          # 用户资源（图片、文件、PDF）
│   └── config.yml       # 配置文件（唯一配置文件）
├── src/                 # 源代码
│   ├── components/      # React 组件
│   ├── config/          # 配置处理
│   ├── pages/           # 页面组件
│   ├── themes/          # 主题 CSS
│   └── utils/           # 工具函数
├── scripts/             # 部署脚本
└── .github/workflows/   # GitHub Actions
```

## ⚙️ 配置文件说明

### 站点配置

```yaml
site:
  title: '站点标题'
  description: '站点描述'
  author: '作者名称'
  baseUrl: '/' # 部署路径，如 GitHub Pages 用 /repo-name/
```

### 个人资料

```yaml
profile:
  name: '你的名字'
  avatar: '/assets/images/avatar.jpg'
  bio: '个人简介'
  email: '邮箱地址'
  location: '所在地'
```

### 导航菜单

```yaml
navigation:
  - name: '首页'
    path: '/'
  - name: '关于'
    path: '/about'
  - name: '项目'
    path: '/projects'
```

### 主题配置

```yaml
theme:
  default: 'light' # 默认主题
  available: # 可用主题列表
    - 'light'
    - 'dark'
    - 'academic'
```

### 项目列表

```yaml
projects:
  - name: '项目名称'
    description: '项目描述'
    url: '项目链接'
    tags:
      - 'React'
      - 'Vite'
```

### 社交链接

```yaml
social:
  - name: 'GitHub'
    icon: 'github'
    url: 'https://github.com/yourusername'
  - name: 'Email'
    icon: 'email'
    url: 'mailto:your.email@example.com'
```

## 🎨 主题定制

系统内置三种主题：

- **Light (明亮)** - 白色背景，适合日间阅读
- **Dark (暗黑)** - 深色背景，护眼模式
- **Academic (学术)** - 简约专业，适合学术展示

用户可以通过页面右上角的主题切换器一键切换主题。

## 📝 添加内容

### 添加 Markdown 文章

1. 在 `content/posts/` 目录下创建 `.md` 文件
2. 编写 Markdown 内容
3. 系统会自动渲染为网页

### 添加静态文件

1. 将文件放置在 `public/assets/files/` 目录
2. 在 `public/config.yml` 中配置文件信息：

```yaml
files:
  - title: '我的简历'
    description: 'PDF 格式简历'
    type: 'pdf'
    path: '/assets/files/resume.pdf'
    preview: true
```

## 🚢 部署指南

### GitHub Pages 部署

PPage 支持两种部署方式：

#### 方式一：子目录部署（默认）

适用于：`yourusername.github.io/ppage` 或 `domain.com/ppage`

```bash
# 1. 配置部署信息（编辑 public/config.yml）
deploy:
  repository: "https://github.com/yourusername/ppage"
  branch: "gh-pages"

# 2. 执行部署（自动清理、构建、部署）
./scripts/deploy.sh
# 或显式指定子目录模式
./scripts/deploy.sh subdir
```

**注意**：`deploy.sh` 脚本会自动执行以下步骤：

1. 🧹 清理旧的 `dist` 目录
2. 📦 构建项目（使用正确的 base 路径）
3. 📤 部署到 GitHub Pages

#### 方式二：根域名部署

适用于：`yourusername.github.io` 或 `domain.com`

```bash
# 1. 配置部署信息（编辑 public/config.yml）
deploy:
  repository: "https://github.com/yourusername/yourusername.github.io"
  branch: "main"  # 根域名部署通常使用 main 分支
  customDomain: "yourdomain.com"  # 自定义域名（可选）

# 2. 执行根域名部署（自动清理、构建、部署）
./scripts/deploy.sh root
```

**关于 CNAME 文件**：

- 如果配置了 `customDomain`，脚本会自动生成 `CNAME` 文件
- 每次部署都会保留并更新 CNAME 文件
- 无需手动管理 CNAME 文件

#### 手动构建不同类型

```bash
# 子目录部署构建（base path = /ppage/）
npm run build:subdir

# 根域名部署构建（base path = /）
npm run build:root

# 自定义 base path
VITE_BASE_PATH=/custom-path/ npm run build
```

#### 配置 GitHub Pages

1. **子目录部署**
   - 进入仓库 Settings → Pages
   - Source 选择 "Deploy from a branch"
   - Branch 选择 `gh-pages` 和 `/ (root)`
   - 访问：`https://yourusername.github.io/ppage`

2. **根域名部署（使用 yourusername.github.io 仓库）**
   - 进入仓库 Settings → Pages
   - Source 选择 "Deploy from a branch"
   - Branch 选择 `main` 和 `/ (root)`
   - 访问：`https://yourusername.github.io`

3. **自定义域名**
   - 在 GitHub Pages 设置中添加自定义域名
   - 使用根域名部署模式：`./scripts/deploy.sh root`
   - 访问：`https://yourdomain.com`

### 其他静态托管平台

PPage 可以部署到任何支持静态网站的平台：

- Vercel
- Netlify
- Cloudflare Pages

只需执行 `npm run build`，将 `dist` 目录内容上传即可。

## 🛠️ 开发指南

### 本地开发

```bash
# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览生产构建
npm run preview
```

### 项目技术栈

- **前端框架**: React 19
- **构建工具**: Vite
- **路由**: React Router
- **Markdown**: markdown-it
- **配置**: YAML (js-yaml)
- **样式**: CSS Modules + CSS 变量

## 📄 License

MIT License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 💬 支持

如有问题或建议，请在 GitHub Issues 中提出。
