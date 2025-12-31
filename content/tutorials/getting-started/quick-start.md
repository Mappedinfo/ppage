---
title: 快速开始
id: quick-start
type: page
collection: tutorials
parent: getting-started-index
order: 1
date: 2025-12-31
author: System
tags: [tutorial, quick-start, beginner]
category: 教程
pinned: true
---

# 快速开始

欢迎使用文档中心系统！本指南将帮助你快速上手。

## 第一步：创建文档

在 `content/posts/` 或 `content/pages/` 目录下创建 Markdown 文件：

```markdown
---
title: 我的第一篇文档
id: my-first-doc
collection: tutorial
order: 2
parent: quick-start
---

# 我的第一篇文档

这是文档内容...
```

## 第二步：使用文档中心组件

```jsx
import { DocumentCenter } from './components/documentation/DocumentCenter';

function App() {
  return (
    <DocumentCenter 
      collection="tutorial"
      enableTree={true}
    />
  );
}
```

## 第三步：查看效果

启动开发服务器，访问页面即可看到你的文档。

## 下一步

- [配置文档属性](config-document-properties.md)
- [建立文档层级](document-hierarchy.md)
- [高级功能](advanced-features.md)
