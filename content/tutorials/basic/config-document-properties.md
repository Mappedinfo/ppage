---
title: 配置文档属性
id: config-document-properties
type: page
collection: tutorials
parent: basic-index
order: 1
date: 2025-12-31
author: System
tags: [tutorial, configuration, front-matter]
category: 教程
---

# 配置文档属性

通过 YAML front matter 配置文档的各种属性。

## 基础属性

### title - 文档标题
```yaml
---
title: 我的文档标题
---
```

### id - 唯一标识符
```yaml
---
id: my-unique-doc-id
---
```
用于建立文档之间的关系，如果不设置会自动生成。

### order - 排序序号
```yaml
---
order: 1
---
```
数字越小越靠前，建议使用 10、20、30 这样的间隔。

## 层级属性

### parent - 父文档
```yaml
---
parent: parent-doc-id
---
```
指定父文档的 ID，用于建立层级关系。

### collection - 文档集合
```yaml
---
collection: user-guide
---
```
将相关文档归类到同一个集合。

## 元数据属性

### date - 日期
```yaml
---
date: 2025-12-31
---
```

### author - 作者
```yaml
---
author: 张三
---
```

### tags - 标签
```yaml
---
tags: [tutorial, beginner, guide]
---
```

### category - 分类
```yaml
---
category: 教程
---
```

## 完整示例

```yaml
---
title: 完整配置示例
id: full-config-example
order: 10
parent: config-document-properties
collection: tutorial
date: 2025-12-31
author: 系统
tags: [example, configuration, reference]
category: 参考
---

# 文档内容从这里开始...
```
