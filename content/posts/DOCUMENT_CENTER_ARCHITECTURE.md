# 文档中心组件架构设计

## 1. 架构概述

文档中心（DocumentCenter）是一个统一的文档管理和展示系统，将分散的文档组织抽象成一个类似电子书的结构化系统。它提供了完整的文档管理能力，包括自动发现、层级组织、灵活展示等功能。

## 2. 核心组件

### 2.1 DocumentCenter 组件
**路径**: `src/components/documentation/DocumentCenter.jsx`

主组件，负责：
- 文档加载和管理
- 用户交互处理
- 布局渲染
- 状态管理

### 2.2 工具函数模块
**路径**: `src/utils/documentCenter.js`

提供核心功能函数：
- `extractMetadata()` - 元数据提取
- `enhanceDocument()` - 文档增强
- `filterDocumentsByType()` - 类型过滤
- `sortDocuments()` - 文档排序
- `buildDocumentTree()` - 树形结构构建
- `findDocumentById()` - 文档查找
- `getDocumentPath()` - 路径获取
- `getAdjacentDocuments()` - 相邻文档
- `groupDocumentsByCollection()` - 集合分组
- `searchDocuments()` - 文档搜索

### 2.3 样式模块
**路径**: `src/components/documentation/DocumentCenter.module.css`

提供多种布局和样式支持：
- 侧边栏布局
- 下拉菜单布局
- 标签页布局
- 响应式设计

## 3. 数据流

```
┌─────────────────────────────────────────────────┐
│  1. 文件发现（Vite glob import）                │
│     import.meta.glob('../../content/**/*.md')  │
└──────────────────┬──────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────┐
│  2. 文件加载（loadAllMarkdownFiles）            │
│     - Fetch 文件内容                             │
│     - 提取标题                                    │
│     - 分类（post/page）                          │
└──────────────────┬──────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────┐
│  3. 文档增强（enhanceDocument）                  │
│     - 提取元数据（metadata）                      │
│     - 生成 ID                                    │
│     - 添加层级信息                                │
└──────────────────┬──────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────┐
│  4. 过滤和排序                                   │
│     - 类型过滤（type）                           │
│     - 集合过滤（collection）                     │
│     - 语言过滤（language）                       │
│     - 自定义过滤（customFilter）                 │
│     - 排序（customSort）                         │
└──────────────────┬──────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────┐
│  5. 结构构建（可选）                             │
│     - 树形结构（buildDocumentTree）              │
│     - 父子关系建立                                │
│     - 层级排序                                    │
└──────────────────┬──────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────┐
│  6. 渲染展示                                     │
│     - 文档列表/树                                │
│     - 文档内容                                    │
│     - 面包屑导航                                  │
└─────────────────────────────────────────────────┘
```

## 4. Front Matter 元数据

文档通过 YAML front matter 配置元数据：

```yaml
---
title: 文档标题           # 覆盖自动提取的标题
id: unique-doc-id       # 唯一标识符
order: 1                # 排序序号
parent: parent-doc-id   # 父文档 ID
collection: user-guide  # 集合名称
date: 2025-12-31       # 发布日期
author: 作者名          # 作者
tags: [tag1, tag2]     # 标签数组
category: 分类          # 分类
---
```

## 5. 功能特性

### 5.1 默认文档中心
提供基础的文档展示和浏览功能：
```jsx
<DocumentCenter />
```

### 5.2 全范围文档集合
支持所有文档的统一管理：
```jsx
<DocumentCenter type="all" />
```

### 5.3 特定类型管理
精细化的文档类型过滤：
```jsx
<DocumentCenter type="post" />  // 只显示 posts
<DocumentCenter type="page" />  // 只显示 pages
```

### 5.4 集合管理
通过 collection 字段分组：
```jsx
<DocumentCenter collection="user-guide" />
```

### 5.5 文档组织结构
支持树形层级：
```jsx
<DocumentCenter enableTree={true} showBreadcrumb={true} />
```

### 5.6 顺序管理
灵活的排序方式：
```jsx
// 使用预定义排序
<DocumentCenter customSort="order" />
<DocumentCenter customSort="date" />
<DocumentCenter customSort="title" />

// 使用自定义排序函数
<DocumentCenter customSort={(a, b) => {
  return b.metadata.date.localeCompare(a.metadata.date);
}} />
```

### 5.7 父子页面关系
建立文档层级：
```yaml
# parent.md
---
id: parent-doc
title: 父文档
---

# child.md
---
id: child-doc
title: 子文档
parent: parent-doc
---
```

## 6. 架构优势

### 6.1 统一抽象
- 将 Posts 和 Pages 统一为文档（Document）概念
- 消除重复代码，提高可维护性
- 提供一致的使用体验

### 6.2 灵活扩展
- 支持自定义过滤和排序
- 支持多种布局模式
- 易于添加新功能

### 6.3 结构化组织
- 支持平面列表和树形结构
- 支持集合分组
- 支持父子层级

### 6.4 强大的元数据系统
- 丰富的 front matter 支持
- 自动提取和解析
- 灵活的扩展性

### 6.5 多语言支持
- 自动语言过滤
- 支持语言后缀文件
- 无缝集成 i18n

## 7. 使用场景

### 7.1 博客系统
```jsx
<DocumentCenter 
  type="post" 
  title="博客文章"
  customSort="date"
/>
```

### 7.2 文档站点
```jsx
<DocumentCenter 
  type="page" 
  enableTree={true}
  showBreadcrumb={true}
/>
```

### 7.3 知识库
```jsx
<DocumentCenter 
  type="all"
  enableTree={true}
  customFilter={(doc) => doc.metadata?.tags?.includes('knowledge')}
/>
```

### 7.4 教程系统
```jsx
<DocumentCenter 
  collection="tutorial"
  enableTree={true}
  customSort="order"
/>
```

### 7.5 API 文档
```jsx
<DocumentCenter 
  collection="api-docs"
  enableTree={true}
  layout="sidebar"
/>
```

## 8. 与现有系统的集成

### 8.1 Posts 组件迁移
```jsx
// 之前
import { Posts } from './pages/Posts';

// 之后
import { DocumentCenter } from './components/documentation/DocumentCenter';
<DocumentCenter type="post" title="博客文章" />
```

### 8.2 Pages 组件迁移
```jsx
// 之前
import { Pages } from './pages/Pages';

// 之后
import { DocumentCenter } from './components/documentation/DocumentCenter';
<DocumentCenter type="page" title="文档页面" />
```

### 8.3 利用现有工具
- 复用 `markdownIndex.js` 的文件发现功能
- 复用 `i18nMarkdown.js` 的多语言支持
- 复用 `MarkdownRenderer` 的渲染能力

## 9. 技术栈

- **React** - UI 框架
- **Vite** - 构建工具和文件发现
- **CSS Modules** - 样式隔离
- **YAML** - 元数据格式
- **Markdown** - 内容格式

## 10. 性能优化

### 10.1 文件加载
- 使用 Vite 的 glob import 实现按需加载
- 内容预加载和缓存

### 10.2 渲染优化
- 使用 React.useMemo 缓存树形结构
- 避免不必要的重渲染

### 10.3 代码分割
- 组件级别的代码分割
- 样式按需加载

## 11. 扩展方向

### 11.1 搜索功能
- 全文搜索
- 标签搜索
- 分类搜索

### 11.2 导航增强
- 上一篇/下一篇导航
- 目录（TOC）
- 侧边导航

### 11.3 交互增强
- 文档评论
- 收藏功能
- 分享功能

### 11.4 统计分析
- 阅读量统计
- 热门文档
- 访问分析

## 12. 总结

文档中心组件通过统一的抽象和灵活的设计，提供了一个强大而易用的文档管理系统。它不仅解决了当前的需求，还为未来的扩展提供了良好的基础。通过利用现有的 `markdownIndex.js` 和相关工具，实现了代码复用和功能整合，大大提升了系统的可维护性和扩展性。
