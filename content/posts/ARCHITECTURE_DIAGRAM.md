# 文档中心组件架构图

## 1. 组件层级结构

```
DocumentCenter (主组件)
├── Header (头部)
│   ├── Title (标题)
│   └── Count Badge (文档数量徽章)
├── Breadcrumb (面包屑导航) [可选]
└── Container (主容器)
    ├── Sidebar/Navigation (导航区)
    │   ├── Document List (平面列表模式)
    │   │   └── Document Item
    │   │       ├── Title
    │   │       └── Order Badge
    │   └── Document Tree (树形模式)
    │       └── Tree Node
    │           ├── Expand Button
    │           ├── Title
    │           ├── Order Badge
    │           └── Children (递归)
    └── Content Area (内容区)
        └── Article
            ├── Metadata (元数据)
            │   ├── Date
            │   ├── Author
            │   └── Tags
            └── MarkdownRenderer (Markdown渲染)
```

## 2. 数据处理流程

```
┌──────────────────────────────────────────────────┐
│                  用户请求                         │
│    <DocumentCenter type="page" collection="..." />│
└────────────────┬─────────────────────────────────┘
                 │
                 ▼
┌──────────────────────────────────────────────────┐
│              文件发现层                           │
│   import.meta.glob('../../content/**/*.md')      │
│   - posts: content/posts/**/*.md                 │
│   - pages: content/pages/**/*.md                 │
└────────────────┬─────────────────────────────────┘
                 │
                 ▼
┌──────────────────────────────────────────────────┐
│              文件加载层                           │
│   loadAllMarkdownFiles()                         │
│   - Fetch 文件内容                               │
│   - 提取标题 (extractTitle)                      │
│   - 标记类型 (post/page)                         │
└────────────────┬─────────────────────────────────┘
                 │
                 ▼
┌──────────────────────────────────────────────────┐
│              文档增强层                           │
│   enhanceDocument()                              │
│   - 提取元数据 (extractMetadata)                 │
│   - 生成 ID (generateDocumentId)                 │
│   - 添加层级信息                                  │
└────────────────┬─────────────────────────────────┘
                 │
                 ▼
┌──────────────────────────────────────────────────┐
│              过滤层                               │
│   filterDocumentsByType() ──┐                    │
│   filterByCollection() ──────┤                   │
│   filterMarkdownByLanguage() ┤─→ 过滤后的文档     │
│   customFilter() ────────────┘                    │
└────────────────┬─────────────────────────────────┘
                 │
                 ▼
┌──────────────────────────────────────────────────┐
│              排序层                               │
│   sortDocuments()                                │
│   - 预定义排序 (order/date/title)                │
│   - 自定义排序函数                                │
└────────────────┬─────────────────────────────────┘
                 │
                 ▼
        ┌────────┴────────┐
        │                 │
        ▼                 ▼
┌───────────────┐  ┌──────────────────┐
│   平面列表     │  │   树形结构        │
│ Document[]    │  │ buildDocumentTree()│
└───────┬───────┘  └────────┬──────────┘
        │                   │
        │                   ▼
        │          ┌──────────────────┐
        │          │  建立父子关系     │
        │          │  排序子节点       │
        │          │  递归构建树       │
        │          └────────┬──────────┘
        │                   │
        └─────────┬─────────┘
                  │
                  ▼
┌──────────────────────────────────────────────────┐
│              渲染层                               │
│   React Component Render                         │
│   - 列表/树形导航                                 │
│   - 文档内容展示                                  │
│   - 交互处理                                      │
└──────────────────────────────────────────────────┘
```

## 3. 模块依赖关系

```
┌─────────────────────────────────────────────┐
│           DocumentCenter.jsx                │
│           (主组件)                           │
└──────┬────────┬──────────┬──────────────────┘
       │        │          │
       ▼        ▼          ▼
┌──────────┐ ┌─────────┐ ┌────────────────┐
│markdownIndex│ i18nMarkdown│ documentCenter│
│   .js    │ │   .js   │ │     .js        │
└──────────┘ └─────────┘ └────────────────┘
       │        │          │
       └────────┴──────────┘
              │
              ▼
┌─────────────────────────────────────────────┐
│         底层依赖                             │
│  - React Hooks (useState, useEffect, useMemo)│
│  - i18n Context                             │
│  - MarkdownRenderer                         │
└─────────────────────────────────────────────┘
```

## 4. 文件组织结构

```
ppage/
├── src/
│   ├── components/
│   │   └── documentation/          # 文档中心组件目录
│   │       ├── DocumentCenter.jsx           # 主组件
│   │       └── DocumentCenter.module.css    # 样式文件
│   ├── utils/
│   │   ├── markdownIndex.js        # 文件发现和加载
│   │   ├── i18nMarkdown.js         # 多语言支持
│   │   └── documentCenter.js       # 文档处理工具 ⭐新增
│   ├── pages/
│   │   ├── Posts.jsx               # 使用 DocumentCenter
│   │   └── Pages.jsx               # 使用 DocumentCenter
│   ├── examples/
│   │   └── DocumentCenterExamples.jsx  # 使用示例 ⭐新增
│   └── i18n/
│       └── locales/
│           ├── zh.js               # 添加 documentCenter 翻译
│           └── en.js               # 添加 documentCenter 翻译
└── content/
    ├── posts/
    │   └── document-center-guide.md        # 使用指南 ⭐新增
    └── pages/
        ├── quick-start.md                  # 快速开始 ⭐新增
        └── config-document-properties.md   # 配置说明 ⭐新增
```

## 5. 状态管理流程

```
┌─────────────────────────────────────┐
│        组件初始化                    │
│  useState/useEffect                 │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│    加载文档 (loadDocuments)          │
│  - 设置 loading = true              │
│  - 调用 loadAllMarkdownFiles()      │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│    处理文档                          │
│  - 过滤                              │
│  - 排序                              │
│  - 构建树（可选）                     │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│    更新状态                          │
│  - setDocuments(processed)          │
│  - setSelectedDoc(first)            │
│  - setLoading(false)                │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│    用户交互                          │
│  - selectDocument(doc)              │
│  - toggleNode(nodeId)               │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│    触发回调                          │
│  - onDocumentChange(doc)            │
└─────────────────────────────────────┘
```

## 6. 树形结构构建算法

```
输入: documents = [doc1, doc2, doc3, ...]

步骤 1: 增强文档
for each doc in documents:
    doc = enhanceDocument(doc)  // 添加 ID、元数据

步骤 2: 创建映射
docMap = { doc.id -> doc }
nodeMap = { doc.id -> treeNode }

步骤 3: 建立父子关系
for each doc in documents:
    node = nodeMap[doc.id]
    if doc.parent:
        parentNode = nodeMap[doc.parent]
        parentNode.children.push(node)
    else:
        rootChildren.push(node)

步骤 4: 递归排序
function sortChildren(node):
    node.children.sort(by order, then by title)
    for child in node.children:
        sortChildren(child)

步骤 5: 返回根节点
return {
    id: 'root',
    children: rootChildren
}

输出: 树形结构
root
├── node1 (order: 1)
│   ├── node1.1 (order: 1)
│   └── node1.2 (order: 2)
└── node2 (order: 2)
    └── node2.1 (order: 1)
```

## 7. Props 数据流

```
用户传入 Props
    │
    ├── type ──────────→ filterDocumentsByType()
    ├── collection ────→ filter by collection
    ├── customFilter ──→ custom filter function
    ├── customSort ────→ sortDocuments()
    ├── enableTree ────→ buildDocumentTree()
    ├── layout ────────→ CSS class (sidebar/dropdown/tabs)
    ├── showBreadcrumb → renderBreadcrumb()
    ├── showCount ─────→ render count badge
    ├── title ─────────→ render title
    ├── onDocumentChange → callback on selection
    └── className ─────→ custom CSS class
```

## 8. 元数据提取流程

```
Markdown 文件内容
    │
    ▼
┌─────────────────────────────┐
│  检测 YAML Front Matter      │
│  /^---\s*\n(.*?)\n---/      │
└──────────┬──────────────────┘
           │
           ▼
┌─────────────────────────────┐
│  解析 YAML 内容              │
│  - title: ...               │
│  - id: ...                  │
│  - order: ...               │
│  - parent: ...              │
│  - collection: ...          │
│  - date: ...                │
│  - author: ...              │
│  - tags: [...]              │
│  - category: ...            │
└──────────┬──────────────────┘
           │
           ▼
┌─────────────────────────────┐
│  返回元数据对象              │
│  {                          │
│    title: string,           │
│    id: string,              │
│    order: number,           │
│    parent: string,          │
│    collection: string,      │
│    ...                      │
│  }                          │
└─────────────────────────────┘
```

## 9. 关键特性实现

### 多语言支持
```
文档文件
├── about.md          → 无语言后缀（默认）
├── about.zh.md       → 中文版本
└── about.en.md       → 英文版本

选择逻辑:
1. 尝试 about.{currentLang}.md
2. 尝试 about.md (无后缀)
3. 尝试 about.{fallbackLang}.md
4. 使用第一个可用文件
```

### 树形展开/折叠
```
State: expandedNodes = Set(['node-1', 'node-3'])

toggleNode(nodeId):
    if expandedNodes.has(nodeId):
        expandedNodes.delete(nodeId)
    else:
        expandedNodes.add(nodeId)
    
    setState(new Set(expandedNodes))

renderTreeNode(node):
    isExpanded = expandedNodes.has(node.id)
    if isExpanded:
        render children
```

### 面包屑导航
```
getDocumentPath(doc, tree):
    path = []
    
    function search(node, currentPath):
        if node.id == doc.id:
            path = currentPath + [node]
            return true
        
        for child in node.children:
            if search(child, currentPath + [node]):
                return true
    
    search(tree, [])
    return path.filter(n => n.id != 'root')

结果: [root, parent, current] → 渲染为 "root / parent / current"
```

这个架构设计确保了组件的高度模块化、可扩展性和可维护性！
