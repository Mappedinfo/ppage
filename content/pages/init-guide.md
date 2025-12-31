# PPage 初始化指南

## 概述

`ppage init` 命令用于初始化 PPage 项目，将示例模板归档并创建一个干净的、指引性的配置环境。

## 使用方法

### 步骤 1: 克隆项目

```bash
git clone https://github.com/yourusername/ppage.git
cd ppage
npm install
```

### 步骤 2: 运行初始化命令

```bash
npm run init
```

或者如果全局安装了 ppage：

```bash
ppage init
```

## 初始化做了什么？

### 1. 归档模板文件

命令会自动将当前的示例模板文件归档到 `_template/` 目录：

```
_template/
├── content/          # 原始示例内容
│   ├── posts/
│   ├── pages/
│   └── files/
└── public-config.yml # 原始 public 配置文件
```

**注意**: `_template/` 目录保存了完整的示例，你可以随时参考。

### 2. 创建用户内容模板

在 `content/` 目录下创建指引性的模板文件：

```
content/
├── posts/
│   └── welcome.md      # 欢迎文章模板
├── pages/
│   └── about.md        # 关于页面模板
└── files/
    ├── pdfs/           # PDF 文件目录
    └── README.md       # 使用说明
```

### 3. 创建配置文件模板

生成带有详细注释的配置文件：

- `public/config.yml` - 配置文件（唯一配置文件）

配置文件中所有需要填写的地方都标注了 **【请填写】** 标记。

## 配置你的网站

初始化完成后，请按以下步骤配置：

### 1. 编辑配置文件

打开 `public/config.yml`，搜索 **【请填写】** 标记，填写你的信息：

```yaml
# 站点基本信息
site:
  title: "【请填写】你的网站标题"
  description: "【请填写】网站描述"
  author: "【请填写】你的名字"

# 个人信息
profile:
  name: "【请填写】你的名字"
  email: "【请填写】your.email@example.com"
  # ...
```

### 2. 添加内容

- **博客文章**: 在 `content/posts/` 目录下创建 Markdown 文件
- **页面内容**: 在 `content/pages/` 目录下创建 Markdown 文件
- **文件资源**: 将 PDF 等文件放在 `content/files/` 目录下

### 3. 启动开发服务器

```bash
npm run dev
```

打开浏览器访问 `http://localhost:5173` 查看效果。

## 文件结构说明

初始化后的目录结构：

```
ppage/
├── _template/           # 归档的原始模板（供参考）
├── content/            # 你的内容目录
│   ├── posts/         # 博客文章
│   ├── pages/         # 页面内容
│   └── files/         # 文件资源
├── public/            # 静态资源
│   ├── assets/       # 图片、图标等
│   └── config.yml    # 配置文件（会在构建时使用）
├── src/              # 源代码
├── scripts/          # 脚本工具
│   └── init.js      # 初始化脚本
└── package.json
```

## 常见问题

### Q: 如果我想恢复原始示例怎么办？

A: 原始示例已保存在 `_template/` 目录中，你可以：

```bash
# 复制回原始内容
cp -r _template/content/* content/
cp _template/public-config.yml public/config.yml
```

### Q: 可以重复运行 init 命令吗？

A: 可以，但要注意：
- 再次运行会覆盖当前的 `content/` 和配置文件
- 建议在运行前备份你已编辑的内容
- `_template/` 目录会被更新为当前内容的备份

### Q: 如何添加新的博客文章？

A: 在 `content/posts/` 目录下创建新的 Markdown 文件：

```markdown
---
title: "文章标题"
date: "2025-12-31"
description: "文章描述"
tags:
  - "标签1"
  - "标签2"
---

# 文章内容

在这里写你的内容...
```

### Q: 如何添加文件下载链接？

A: 
1. 将文件放在 `content/files/` 目录下（如 `content/files/pdfs/my-paper.pdf`）
2. 在 Markdown 中引用：`[下载论文](/content/files/pdfs/my-paper.pdf)`
3. 系统会自动扫描并在文件页面展示

## 下一步

- 📖 查看 [USER_GUIDE.md](./USER_GUIDE.md) 了解详细使用说明
- 🎨 编辑 `public/config.yml` 自定义网站外观
- ✍️ 开始在 `content/posts/` 目录下创作你的第一篇文章
- 🚀 准备好后运行 `npm run build` 构建生产版本

## 技术支持

如果遇到问题，请：
1. 查看 [USER_GUIDE.md](./USER_GUIDE.md)
2. 参考 `_template/` 目录中的示例
3. 在 GitHub 上提交 Issue

祝你使用愉快！🎉
