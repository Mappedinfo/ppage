---
title: 文档中心组件指南
id: document-center-guide
type: page
collection: tutorials
parent: advanced-index
order: 3
date: 2025-12-31
author: System
tags: [tutorial, documentation, component]
category: 教程
relatedDocs: [quick-reference, advanced-features, auto-folder-scan-guide]
---

# 文档中心组件使用指南

## 概述

文档中心（DocumentCenter）是一个强大而灵活的文档管理和展示组件，它将文档组织抽象成一个统一的系统，可以像管理一本电子书一样管理你的所有文档。

> 📚 **相关阅读**：
> - [快速参考手册](#doc-quick-reference) - 快速查询常用配置和 API
> - [高级功能使用](#doc-advanced-features) - 了解双向链接、智能排序等高级特性
> - [自动文件夹扫描指南](#doc-auto-folder-scan-guide) - 实现自动发现和管理文档

## 核心特性

### 1. 统一的文档管理
- 自动发现和加载 Markdown 文件
- 支持多种文档类型（posts、pages 或全部）
- 智能标题提取和元数据解析

### 2. 灵活的组织结构
- **平面列表**：简单的文档列表展示
- **树形结构**：支持父子层级关系
- **集合管理**：通过 collection 字段对文档分组

### 3. 强大的排序和过滤
- 内置排序方式（order、title、date、path）
- 支持自定义排序函数
- 支持自定义过滤函数

### 4. 多种布局模式
- **sidebar**：侧边栏布局（默认）
- **dropdown**：下拉菜单布局
- **tabs**：标签页布局

### 5. 多语言支持
- 自动根据当前语言过滤文档
- 支持语言后缀文件（如 `about.zh.md`、`about.en.md`）

## Front Matter 配置

在 Markdown 文件头部使用 YAML front matter 来配置文档属性：

```yaml
---
title: 文档标题
id: unique-doc-id
order: 1
parent: parent-doc-id
collection: user-guide
date: 2025-12-31
author: 作者名
tags: [tag1, tag2, tag3]
category: 分类
---
```

### 字段说明

- **title**: 文档标题（覆盖自动提取的标题）
- **id**: 唯一标识符（用于建立父子关系，不设置则自动生成）
- **order**: 排序序号（数字越小越靠前）
- **parent**: 父文档的 ID（用于建立层级关系）
- **collection**: 集合名称（用于文档分组）
- **date**: 发布日期
- **author**: 作者
- **tags**: 标签数组
- **category**: 分类

## 使用示例

### 基础用法

```jsx
import { DocumentCenter } from '../components/documentation/DocumentCenter';

function App() {
  return <DocumentCenter />;
}
```

### 只展示博客文章

```jsx
<DocumentCenter 
  type="post" 
  title="博客文章"
  showCount={true}
/>
```

### 只展示文档页面

```jsx
<DocumentCenter 
  type="page" 
  title="文档页面"
  showCount={true}
/>
```

### 展示特定集合

```jsx
<DocumentCenter 
  collection="user-guide"
  title="用户指南"
  enableTree={true}
  showBreadcrumb={true}
/>
```

### 启用树形结构

```jsx
<DocumentCenter 
  type="page"
  enableTree={true}
  showBreadcrumb={true}
/>
```

### 自定义排序

```jsx
// 按日期降序排列
const sortByDate = (a, b) => {
  const dateA = a.metadata?.date || '';
  const dateB = b.metadata?.date || '';
  return dateB.localeCompare(dateA);
};

<DocumentCenter 
  type="post"
  customSort={sortByDate}
/>
```

### 自定义过滤

```jsx
// 只显示包含特定标签的文档
const filterByTag = (doc) => {
  return doc.metadata?.tags?.includes('tutorial');
};

<DocumentCenter 
  customFilter={filterByTag}
/>
```

### 监听文档切换

```jsx
const handleDocumentChange = (doc) => {
  console.log('切换到:', doc.title);
  // 执行其他操作
};

<DocumentCenter 
  onDocumentChange={handleDocumentChange}
/>
```

## 建立文档层级关系

### 方法 1: 使用 parent 字段

```yaml
# parent-doc.md
---
title: 父文档
id: parent-doc
order: 1
---

# 父文档内容

# child-doc.md
---
title: 子文档
id: child-doc
parent: parent-doc
order: 1
---

# 子文档内容
```

### 方法 2: 使用文件路径（自动）

将子文档放在子目录中，系统会自动识别层级关系：

```
content/
  pages/
    guide/
      index.md        # 主指南
      getting-started.md
      advanced.md
```

## 文档集合

通过 `collection` 字段将相关文档组织在一起：

```yaml
---
title: 快速开始
collection: tutorial
order: 1
---
```

```yaml
---
title: 进阶教程
collection: tutorial
order: 2
---
```

然后使用：

```jsx
<DocumentCenter 
  collection="tutorial"
  title="教程"
  enableTree={true}
/>
```

## 最佳实践

### 1. 合理使用 order 字段
- 使用 10、20、30 这样的间隔，便于后续插入新文档
- 不是所有文档都需要 order，无序的会按标题排序

### 2. 统一 ID 命名规范
- 使用短横线分隔的小写字母：`user-guide-intro`
- 与文件名保持一致性
- 避免使用特殊字符

### 3. 合理组织集合
- 将相关文档归类到同一个 collection
- 使用有意义的集合名称
- 每个集合不要包含太多文档（建议 10-30 个）

### 4. 善用层级关系
- 不要创建过深的层级（建议最多 3-4 层）
- 确保父子关系清晰明确
- 叶子节点包含实际内容，中间节点可以是索引页

### 5. 标签使用建议
- 每个文档 2-5 个标签
- 使用一致的标签命名
- 建立标签索引表

## API 参考

### Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| type | string | 'all' | 文档类型过滤：'post'、'page' 或 'all' |
| collection | string | null | 集合名称过滤 |
| enableTree | boolean | false | 是否启用树形结构 |
| customSort | Function\|string | 'order' | 排序方式 |
| customFilter | Function | null | 自定义过滤函数 |
| title | string | null | 标题 |
| showCount | boolean | true | 是否显示文档数量 |
| showBreadcrumb | boolean | false | 是否显示面包屑 |
| layout | string | 'sidebar' | 布局模式 |
| onDocumentChange | Function | null | 文档切换回调 |
| className | string | '' | 自定义 CSS 类 |

### 工具函数

```javascript
import {
  extractMetadata,
  enhanceDocument,
  filterDocumentsByType,
  sortDocuments,
  buildDocumentTree,
  findDocumentById,
  getDocumentPath,
  getAdjacentDocuments,
  groupDocumentsByCollection,
  searchDocuments
} from '../utils/documentCenter';
```

## 迁移指南

### 从 Posts 组件迁移

**之前：**
```jsx
import { Posts } from './pages/Posts';
<Posts />
```

**之后：**
```jsx
import { DocumentCenter } from './components/documentation/DocumentCenter';
<DocumentCenter type="post" title="博客文章" />
```

### 从 Pages 组件迁移

**之前：**
```jsx
import { Pages } from './pages/Pages';
<Pages />
```

**之后：**
```jsx
import { DocumentCenter } from './components/documentation/DocumentCenter';
<DocumentCenter type="page" title="文档页面" />
```

## 常见问题

### Q: 文档没有显示？
A: 检查以下几点：
1. 文件是否在 `content/posts/` 或 `content/pages/` 目录下
2. 文件扩展名是否为 `.md`
3. type 参数是否正确设置
4. 检查浏览器控制台是否有错误

### Q: 树形结构没有正确显示？
A: 确保：
1. 设置了 `enableTree={true}`
2. 文档的 `parent` 字段指向了正确的父文档 ID
3. 父文档确实存在

### Q: 如何实现文档搜索？
A: 使用 `searchDocuments` 工具函数：

```jsx
import { searchDocuments } from '../utils/documentCenter';

const results = searchDocuments(documents, searchQuery);
```

### Q: 如何自定义样式？
A: 通过 `className` 属性添加自定义类，或覆盖 CSS 变量：

```css
.custom-doc-center {
  --accent-color: #007bff;
  --background-secondary: #f8f9fa;
}
```

## 总结

文档中心组件提供了一个完整的文档管理解决方案，通过灵活的配置和丰富的功能，可以满足从简单博客到复杂文档系统的各种需求。
