---
title: GitHub Release 发布指南
description: 详细介绍如何在 GitHub 上发布新版本
id: release-guide
type: page
collection: development
parent: 开发指南
order: 1
showInDocumentCenter: true
---

# GitHub Release 发布指南

本指南将详细介绍如何为 PPage 项目发布新版本到 GitHub。

## 📋 前置条件

在开始发布之前，请确保：

1. ✅ 你有项目仓库的写入权限
2. ✅ 本地代码已经同步到最新
3. ✅ 所有功能已测试通过
4. ✅ 已安装 Git 和 GitHub CLI

### 安装 GitHub CLI

如果还没有安装 GitHub CLI，可以使用以下命令：

```bash
# macOS
brew install gh

# 其他系统请参考：https://cli.github.com/manual/installation
```

### 登录 GitHub CLI

首次使用需要登录：

```bash
gh auth login
```

按照提示选择：

- 使用 GitHub.com
- 首选 HTTPS 协议
- 使用 Git 凭据进行身份验证
- 通过浏览器登录

## 🚀 发布流程

### 步骤 1: 更新版本号

编辑 `package.json` 文件，更新 `version` 字段：

```json
{
  "name": "temp-ppage",
  "version": "0.0.1",  // 修改这里
  ...
}
```

版本号遵循 [语义化版本](https://semver.org/lang/zh-CN/) 规范：

- **主版本号 (MAJOR)**: 不兼容的 API 修改
- **次版本号 (MINOR)**: 向下兼容的功能性新增
- **修订号 (PATCH)**: 向下兼容的问题修正

### 步骤 2: 提交版本更新

```bash
git add package.json
git commit -m "chore: bump version to 0.0.1"
```

### 步骤 3: 创建 Git Tag

```bash
git tag -a v0.0.1 -m "Release version 0.0.1"
```

标签名称规范：

- 格式：`vX.Y.Z` (例如 `v0.0.1`, `v1.2.3`)
- 必须以小写字母 `v` 开头
- 版本号与 package.json 保持一致

### 步骤 4: 推送到 GitHub

```bash
# 推送代码和标签
git push origin main
git push origin v0.0.1
```

### 步骤 5: 创建 GitHub Release

使用 GitHub CLI 创建 release：

```bash
gh release create v0.0.1 \
  --title "v0.0.1 - 版本标题" \
  --notes "版本说明内容"
```

**示例：**

```bash
gh release create v0.0.1 \
  --title "v0.0.1 - 首个版本发布" \
  --notes "## PPage v0.0.1 - 首个版本发布

### ✨ 核心特性

#### 🎯 零配置部署
- 纯前端部署，无需服务器和数据库
- 通用路径适配，支持子目录和根域名部署

#### 📝 强大的内容管理
- YAML 配置文件一站式管理站点内容
- Markdown 创作，自动渲染为响应式网页

### 📦 快速开始

\`\`\`bash
git clone https://github.com/mappedinfo/ppage.git
cd ppage
npm install
npm run init
npm run dev
\`\`\`
"
```

## 📝 Release Notes 编写指南

一个好的 Release Notes 应该包含：

### 1. 版本标题

清晰说明版本号和主要特性：

```
v0.0.1 - 首个版本发布
v1.1.0 - 新增文档中心功能
v1.2.1 - 修复主题切换问题
```

### 2. 更新内容分类

使用清晰的分类标记：

```markdown
## v1.2.0 - 版本标题

### ✨ 新增功能 (Features)

- 新增文档中心支持
- 新增暗黑主题

### 🐛 问题修复 (Bug Fixes)

- 修复移动端导航显示问题
- 修复 PDF 预览加载失败

### 💄 样式优化 (Style)

- 优化响应式布局
- 改进导航栏样式

### ⚡️ 性能优化 (Performance)

- 优化构建速度
- 减少包体积

### 🔧 其他改动 (Chore)

- 更新依赖版本
- 改进文档说明
```

### 3. 使用 Emoji 增强可读性

推荐的 Emoji 标记：

- ✨ 新功能
- 🐛 Bug 修复
- 💄 样式/UI 改动
- ⚡️ 性能优化
- 🔧 配置/工具改动
- 📝 文档更新
- 🎨 代码结构优化
- 🔒 安全相关

### 4. 包含快速开始信息

为新用户提供快速开始的命令：

```markdown
### 📦 快速开始

\`\`\`bash

# 克隆项目

git clone https://github.com/mappedinfo/ppage.git
cd ppage

# 安装依赖

npm install

# 初始化项目

npm run init

# 本地开发

npm run dev
\`\`\`
```

## 🔄 完整脚本示例

将上述步骤整合成一个脚本：

```bash
#!/bin/bash

VERSION="0.0.1"

# 1. 更新版本号（手动编辑 package.json）
echo "请确保已更新 package.json 中的版本号为 $VERSION"
read -p "按回车继续..."

# 2. 提交版本更新
git add package.json
git commit -m "chore: bump version to $VERSION"

# 3. 创建标签
git tag -a "v$VERSION" -m "Release version $VERSION"

# 4. 推送到 GitHub
git push origin main
git push origin "v$VERSION"

# 5. 创建 release
gh release create "v$VERSION" \
  --title "v$VERSION - 版本标题" \
  --notes "版本说明"

echo "✅ Release v$VERSION 创建成功！"
```

## ⚠️ 注意事项

1. **版本号一致性**: 确保 package.json 的版本号与 git tag 保持一致
2. **标签不可修改**: Git tag 推送后不建议修改，如需修改需要删除重建
3. **Release 可编辑**: GitHub Release 创建后可以随时在网页上编辑
4. **保留历史**: 不要删除旧的 release，保持完整的版本历史

## 🔗 相关资源

- [语义化版本规范](https://semver.org/lang/zh-CN/)
- [GitHub CLI 文档](https://cli.github.com/manual/)
- [Git Tag 文档](https://git-scm.com/book/zh/v2/Git-基础-打标签)
- [GitHub Release 文档](https://docs.github.com/zh/repositories/releasing-projects-on-github)

## 📮 问题反馈

如果在发布过程中遇到问题，欢迎：

- 提交 [GitHub Issue](https://github.com/Mappedinfo/ppage/issues)
- 查看 [FAQ 常见问题](../basic/)
