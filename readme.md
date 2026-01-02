# PPage - 个人主页系统

一个纯前端部署的个人主页生成系统。

## ✨ 核心特性

### 🎯 零配置部署

- ✅ **纯前端部署**，无需服务器和数据库
- ✅ **通用路径适配**，支持子目录和根域名部署
- ✅ **一键部署**到 GitHub Pages，零成本托管
- ✅ **自动化脚本**，清理、构建、部署一步完成

### 🚀 **SEO 优化（新增！）**

- ✅ **静态站点生成（SSG）**，构建时预渲染 HTML 页面
- ✅ **搜索引擎友好**，爬虫可直接索引完整内容
- ✅ **首屏极速加载**，无需等待 JavaScript 执行
- ✅ **React Hydration**，保持所有动态交互功能
- ✅ **Open Graph 标签**，完美支持社交分享预览
- ✅ **自动生成** sitemap.xml 和 robots.txt
- ✅ **结构化数据**，JSON-LD 增强搜索结果展示

### 📝 强大的内容管理

- ✅ **YAML 配置文件**一站式管理站点内容
- ✅ **Markdown 创作**，自动渲染为响应式网页
- ✅ **自动文件夹扫描**，在 `content/` 下创建文件夹即可自动生成页面
- ✅ **文档中心**，支持层级结构、面包屑导航、双向链接
- ✅ **自动文件扫描**，引用文件自动在文件页面展示
- ✅ **新闻时间轴**，支持多种事件类型和论文状态

### 🎨 丰富的展示功能

- ✅ **多主题支持**（明亮、暗黑、学术、玻璃），支持运行时切换
- ✅ **国际化（i18n）**，支持中英文切换
- ✅ **响应式设计**，完美适配各种设备
- ✅ **汉堡菜单**，移动端自动收纳次要导航
- ✅ **PDF 在线预览**和文件下载

### 🔧 开发者友好

- ✅ **配置驱动**，通过 `collections` 控制文档集合
- ✅ **安全更新机制**，fork 后可安全获取上游更新
- ✅ **Git merge strategy**，自动保护用户内容
- ✅ **代码质量工具**（ESLint、Stylelint、Prettier）

## 快速开始

### 方式一：使用初始化命令（推荐）

```bash
# 克隆项目
git clone https://github.com/mappedinfo/ppage.git
cd ppage

# 安装依赖
npm install

# 初始化项目（归档示例模板，创建用户模板）
npm run init

# 编辑配置文件，填写你的个人信息
# 配置文件：public/config.yml（搜索【请填写】标记）

# 本地开发
npm run dev

# 构建和部署（自动适配任意路径）
npm run deploy
```

### 方式二：直接使用示例模板

```bash
# 克隆项目
git clone https://github.com/mappedinfo/ppage.git
cd ppage

# 安装依赖
npm install

# 直接编辑现有的配置文件和内容
# 配置文件：public/config.yml
# 内容目录：content/

# 本地开发
npm run dev

# 构建和部署（自动适配任意路径）
npm run deploy
```

## 📚 文档

- [USER_GUIDE.md](./USER_GUIDE.md) - 详细使用文档
- [INIT_GUIDE.md](./INIT_GUIDE.md) - `ppage init` 命令使用指南
- [UPDATE_GUIDE.md](./UPDATE_GUIDE.md) - 如何安全地更新 fork 的代码
- [LINT.md](./LINT.md) - 代码质量工具使用指南

## 💡 主要功能

### 自动文件夹扫描

在 `content/` 目录下创建任何文件夹，系统会自动：

- 扫描并识别文件夹
- 生成导航菜单项
- 创建对应的路由和页面

通过 `public/config.yml` 中的 `collections` 配置控制：

```yaml
collections:
  tutorials:
    enabled: true # 是否启用
    showInNavigation: true # 是否在导航栏显示
    showInMobile: false # 移动端是否直接显示
    order: 1 # 导航顺序
```

### 文档中心

强大的文档管理系统，支持：

- **层级结构**：通过 `parent` 字段建立父子关系
- **智能排序**：支持置顶、优先级、order 多级排序
- **面包屑导航**：自动生成文档路径
- **双向链接**：自动识别文档间引用

### 自动文件扫描

在 Markdown 中引用文件，系统会自动：

- 扫描所有 Markdown 中的文件链接
- 在文件页面自动展示
- 支持 PDF 预览和下载

### 新闻时间轴

展示学术动态和重要事件：

- 支持多种事件类型（论文、获奖、会议等）
- 论文状态追踪（已接收、在线、已发表）
- 时间轴展示，直观易读

## 🚢 部署

PPage 使用**相对路径构建**，自动适配任何部署路径，无需手动配置 base path。

### 一键部署

```bash
# 1. 配置 public/config.yml 中的 deploy 信息
deploy:
  repository: "https://github.com/yourusername/yourrepo"
  branch: "gh-pages"
  customDomain: ""  # 可选，填写自定义域名

# 2. 执行部署（自动清理、构建、部署）
npm run deploy
```

### 支持的部署场景

✅ **子目录部署**：`yourusername.github.io/ppage`  
✅ **根域名部署**：`yourusername.github.io`  
✅ **自定义域名**：`yourdomain.com`

**自动适配原理**：

- 构建时使用 `base: './'` 相对路径
- 运行时通过 `window.location.pathname` 动态检测部署路径
- 无需手动配置，一次构建随处可用

### 手动构建

```bash
# 清理旧文件
npm run clean

# 常规构建（自动使用相对路径 + SSG 预渲染）
npm run build

# 预览构建结果
npm run preview
```

### SSG 预渲染说明

🆕 **双模式渲染架构**

从 v0.2.0 开始，PPage 实现了 **SSG（静态站点生成）+ CSR（客户端渲染）混合模式**：

**构建时**：

1. Vite 构建 React 应用
2. 自动扫描所有 Markdown 文件
3. 为每个 .md 生成静态 HTML 页面
4. 生成 sitemap.xml 和 robots.txt

**运行时**：

- 搜索引擎爬虫：直接索引 HTML 内容
- 用户访问：HTML 首屏快速显示，React Hydration 启用交互功能

**SEO 优化效果**：

- ✅ 首次内容绘制（FCP）减少 80%
- ✅ 搜索引擎可索引性：优秀
- ✅ 社交分享预览：完美支持
- ✅ 用户体验：显著提升

更多部署细节请查看 [USER_GUIDE.md 的部署指南](./USER_GUIDE.md#-部署指南)。

## 🔄 Fork 后如何更新？

当你 fork 了本仓库并自定义了内容后，可以安全地获取上游更新：

```bash
# 一键更新，自动保护你的配置和内容
npm run update
```

**受保护的文件**（更新时不会被覆盖）：

- `public/config.yml` - 你的站点配置
- `content/` - 你的所有内容
- `public/assets/` - 你的资源文件
- `scripts/deploy.sh` - 你的部署脚本

详细更新流程请查看 [UPDATE_GUIDE.md](./UPDATE_GUIDE.md)。

## 🔧 技术栈

- **前端框架**：React 18 + Vite
- **路由**：React Router 6
- **Markdown 渲染**：markdown-it
- **SSG 预渲染**：构建时静态 HTML 生成 + React Hydration
- **配置解析**：js-yaml
- **样式**：CSS Modules + CSS Variables
- **代码质量**：ESLint + Stylelint + Prettier
- **国际化**：React Context 自定义 i18n
- **SEO 优化**：Open Graph + JSON-LD + Sitemap

## 🛠️ 开发指南

### 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 代码检查
npm run lint

# 代码格式化
npm run format

# 自动修复问题
npm run lint:fix
```

### 项目结构

```
ppage/
├── content/              # 内容目录
│   ├── pages/          # 文档页面
│   ├── posts/          # 博客文章
│   ├── files/          # 文件资源
│   └── tutorials/      # 自定义文档集合
├── public/
│   ├── config.yml      # 站点配置文件
│   └── assets/         # 静态资源
├── src/
│   ├── components/     # React 组件
│   ├── pages/          # 页面组件
│   ├── utils/          # 工具函数
│   ├── config/         # 配置解析
│   ├── i18n/           # 国际化
│   └── themes/         # 主题样式
└── scripts/            # 工具脚本
    ├── deploy.sh       # 部署脚本
    ├── init.js         # 初始化脚本
    └── update.js       # 更新脚本
```

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📝 License

MIT License - 详见 [LICENSE](LICENSE) 文件
