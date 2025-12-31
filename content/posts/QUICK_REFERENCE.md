# DocumentCenter 快速参考

## 基础用法

```jsx
import { DocumentCenter } from './components/documentation/DocumentCenter';

// 最简单的用法
<DocumentCenter />
```

## 常用配置

| Props | 类型 | 默认值 | 说明 |
|-------|------|--------|------|
| `type` | string | 'all' | 文档类型：'post' / 'page' / 'all' |
| `collection` | string | null | 集合名称过滤 |
| `enableTree` | boolean | false | 启用树形结构 |
| `customSort` | Function\|string | 'order' | 排序方式 |
| `customFilter` | Function | null | 自定义过滤 |
| `title` | string | null | 标题 |
| `showCount` | boolean | true | 显示文档数量 |
| `showBreadcrumb` | boolean | false | 显示面包屑 |
| `layout` | string | 'sidebar' | 布局：'sidebar' / 'dropdown' / 'tabs' |

## Front Matter 配置

```yaml
---
title: 文档标题        # 必填：显示标题
id: doc-id           # 可选：唯一标识符
order: 1             # 可选：排序序号
parent: parent-id    # 可选：父文档 ID
collection: guide    # 可选：集合名称
date: 2025-12-31     # 可选：日期
author: 作者         # 可选：作者
tags: [tag1, tag2]   # 可选：标签
category: 分类       # 可选：分类
---
```

## 快速示例

### 博客列表
```jsx
<DocumentCenter type="post" title="博客" />
```

### 文档中心
```jsx
<DocumentCenter type="page" title="文档" />
```

### 树形文档
```jsx
<DocumentCenter enableTree={true} showBreadcrumb={true} />
```

### 特定集合
```jsx
<DocumentCenter collection="tutorial" />
```

### 自定义排序
```jsx
<DocumentCenter customSort="date" />
<DocumentCenter customSort={(a,b) => a.title.localeCompare(b.title)} />
```

### 自定义过滤
```jsx
<DocumentCenter customFilter={(doc) => doc.metadata?.tags?.includes('guide')} />
```

## 工具函数

```javascript
import {
  extractMetadata,      // 提取元数据
  enhanceDocument,      // 增强文档
  sortDocuments,        // 排序文档
  buildDocumentTree,    // 构建树
  searchDocuments,      // 搜索文档
} from './utils/documentCenter';
```

## 文件位置

```
src/
  components/
    documentation/
      DocumentCenter.jsx          # 主组件
      DocumentCenter.module.css   # 样式
  utils/
    documentCenter.js             # 工具函数
  examples/
    DocumentCenterExamples.jsx    # 示例代码

content/
  posts/                          # 博客文章
  pages/                          # 文档页面
```

## 层级关系示例

```yaml
# parent.md
---
id: getting-started
title: 入门指南
order: 1
---

# child-1.md
---
id: installation
title: 安装
parent: getting-started
order: 1
---

# child-2.md
---
id: configuration
title: 配置
parent: getting-started
order: 2
---
```

## 完整示例

```jsx
<DocumentCenter
  type="page"
  collection="user-guide"
  title="用户指南"
  enableTree={true}
  showBreadcrumb={true}
  showCount={true}
  layout="sidebar"
  customSort="order"
  customFilter={(doc) => doc.metadata?.category === 'guide'}
  onDocumentChange={(doc) => console.log('切换到:', doc.title)}
  className="my-custom-class"
/>
```
