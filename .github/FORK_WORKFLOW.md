# Fork 工作流程指南

这个文档说明了如何 fork PPage 项目，并保持与上游仓库同步，同时保护你的自定义内容。

## 🎯 工作流程概览

```
上游仓库 (mappedinfo/ppage)
    ↓ fork
你的仓库 (yourusername/ppage)
    ↓ clone
本地仓库
    ↓ npm run init (生成用户内容)
    ↓ 自定义配置和内容
    ↓ npm run update (获取上游更新)
    ↑ git push (推送到你的仓库)
```

## 📋 详细步骤

### 1. Fork 仓库

在 GitHub 上点击 "Fork" 按钮，fork 到你的账户下。

### 2. 克隆到本地

```bash
git clone https://github.com/yourusername/ppage.git
cd ppage
npm install
```

### 3. 初始化项目

```bash
npm run init
```

这会：
- 将示例内容归档到 `_template/` 目录
- 创建空白的配置模板
- 设置你的内容目录结构

### 4. 配置 Git

确保用户文件已在 `.gitignore` 中（已自动配置）：

```gitignore
# 用户内容和配置（不提交到你的仓库）
config.yml
public/config.yml
content/
public/assets/
_template/
scripts/deploy.sh
```

### 5. 自定义内容

编辑配置文件和添加内容：

```bash
# 编辑配置
vim config.yml

# 添加博客文章
vim content/posts/my-first-post.md

# 测试
npm run dev
```

### 6. 提交代码修改（如果有）

如果你修改了源代码：

```bash
git add src/
git commit -m "Custom modifications"
git push origin main
```

**注意**：用户内容（`config.yml`, `content/` 等）不会被提交。

### 7. 获取上游更新

当上游有新功能或修复时：

```bash
npm run update
```

这会：
1. 自动备份你的用户文件
2. 从上游拉取更新
3. 合并到你的分支
4. 恢复你的用户文件
5. 更新依赖包

### 8. 推送更新

```bash
git push origin main
```

## 🔐 文件管理策略

### 不提交到 Git 的文件（本地保存）

这些文件包含你的个人信息，只保存在本地：

- `config.yml` - 站点配置
- `public/config.yml` - 公共配置
- `content/` - 所有内容文件
- `public/assets/` - 个人资源
- `_template/` - 归档的模板
- `scripts/deploy.sh` - 部署脚本

### 提交到 Git 的文件（代码修改）

如果你修改了这些文件，会被提交：

- `src/` - 源代码修改
- `package.json` - 依赖修改
- 其他代码文件

### 上游仓库保留的文件（作为参考）

上游仓库中保留示例文件供参考：

- `config.example.yml` - 配置示例
- `content/` - 示例内容
- 文档文件

## 🎭 多环境管理

### 方案一：使用不同分支

```bash
# 生产环境
git checkout main
npm run dev

# 测试环境
git checkout -b test
# 修改配置进行测试
```

### 方案二：使用环境变量

在 `config.yml` 中使用占位符，通过构建脚本替换。

### 方案三：本地配置文件

```bash
# 不同环境使用不同配置
cp config.example.yml config.yml
# 编辑 config.yml 进行自定义
```

## 🚀 部署流程

### GitHub Pages 部署

1. 配置 `scripts/deploy.sh`：
```bash
#!/bin/bash
npm run build
# 部署到 GitHub Pages
```

2. 运行部署：
```bash
bash scripts/deploy.sh
```

### 其他平台部署

参考 [USER_GUIDE.md](../USER_GUIDE.md) 中的部署章节。

## 🔄 更新策略

### 定期检查更新

建议每月检查一次：

```bash
# 查看上游更新
git fetch upstream
git log HEAD..upstream/main --oneline
```

### 选择性更新

如果只想要特定更新：

```bash
# 获取上游信息
git fetch upstream

# 查看具体改动
git diff HEAD..upstream/main

# 只更新特定文件
git checkout upstream/main -- src/components/某文件.jsx
```

## 💡 最佳实践

### 1. 分离关注点

- **内容管理**：所有内容放在 `content/`
- **配置管理**：使用 `config.yml`
- **代码修改**：在 `src/` 中进行，考虑提 PR

### 2. 文档化修改

如果修改了源代码，创建 `CUSTOMIZATIONS.md` 记录：

```markdown
# 我的自定义修改

## 修改的文件
- src/components/Header.jsx - 添加了自定义 logo

## 修改原因
...
```

### 3. 备份策略

- 定期推送到远程仓库
- 本地备份 `content/` 目录
- 使用 `_template/` 作为参考

### 4. 贡献上游

如果你的修改对其他人有用，考虑：

1. 创建新分支
2. 提交 Pull Request 到上游
3. 让更多人受益

## 🐛 故障排除

### 更新后配置丢失

```bash
# 从备份恢复（如果存在）
cp .backup-*/config.yml config.yml

# 从 git 历史恢复
git show HEAD:config.yml > config.yml
```

### 合并冲突

```bash
# 查看冲突
git status

# 编辑冲突文件，搜索 <<<<<<< 标记
# 解决后：
git add .
git commit
```

### 想要回退更新

```bash
# 查看提交历史
git log --oneline

# 回退到更新前
git reset --hard <commit-hash>
```

## 📚 相关资源

- [UPDATE_GUIDE.md](../UPDATE_GUIDE.md) - 详细更新指南
- [INIT_GUIDE.md](../INIT_GUIDE.md) - 初始化指南
- [USER_GUIDE.md](../USER_GUIDE.md) - 使用指南

## 🤝 获取帮助

- GitHub Issues: 提交问题和建议
- Discussions: 讨论使用经验
- Pull Requests: 贡献代码

---

Happy coding! 🎉
