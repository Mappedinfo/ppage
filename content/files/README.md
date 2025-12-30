# 文件目录说明

这个目录用于存放各种文档和文件，包括 PDF、Word 文档等。

## 📁 目录结构

```
content/files/
├── pdfs/           # PDF 文件
│   └── sample.pdf
└── docs/           # 其他文档（Word, Excel, PPT 等）
    └── sample.docx
```

## 📝 使用方法

### 1. 添加文件

将你的文件放入对应的子目录：
- PDF 文件 → `pdfs/` 目录
- 其他文档 → `docs/` 目录

### 2. 在配置文件中注册

编辑 `config.yml` 或 `public/config.yml`，在 `files` 部分添加文件信息：

```yaml
files:
  - title: "我的论文"
    description: "这是我的研究论文"
    type: "pdf"
    path: "/content/files/pdfs/my-paper.pdf"
    preview: true
    size: "3.5MB"
    relatedPost: "研究笔记"        # 可选：关联的博客文章
    relatedProject: "研究项目"     # 可选：关联的项目
```

### 3. 在 Markdown 中引用

在你的博客文章或页面中，可以直接引用这些文件：

```markdown
[下载我的论文](/content/files/pdfs/my-paper.pdf)

![文档图示](/content/files/images/diagram.png)
```

## 💡 提示

- 文件路径以 `/content/files/` 开头
- 建议为每个文件配置 `size` 属性，方便用户了解文件大小
- PDF 文件可以设置 `preview: true` 开启在线预览
- 通过 `relatedPost` 和 `relatedProject` 可以建立内容之间的关联
