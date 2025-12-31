# PPage 更新指南

## 概述

当你 fork 了 PPage 仓库并自定义了内容后，你可以安全地获取上游仓库的最新功能和 bug 修复。本指南将帮助你安全地更新代码，同时保护你的自定义配置和内容。

## 🔒 核心机制：Git Merge Strategy

我们使用 **Git 的合并策略**来保护你的文件：

1. **用户内容提交到 Git** - 你的配置和内容也会被 Git 管理
2. **`.gitattributes` 配置** - 指定哪些文件在合并时保留你的版本
3. **自动保护** - 合并时 Git 会自动保护这些文件，不会被上游覆盖

## 🔒 受保护的文件

以下文件和目录通过 `.gitattributes` 配置，在更新过程中会自动保护，**始终保留你的版本**：

- `public/config.yml` - 你的站点配置文件
- `content/**` - 你的所有内容（博客、页面、文件）
- `public/assets/**` - 你的资源文件（图片、图标等）
- `_template/**` - 归档的模板文件
- `scripts/deploy.sh` - 你的部署脚本

**工作原理**：

```bash
# 查看 .gitattributes 配置
cat .gitattributes

# 输出示例：
public/config.yml merge=ours
content/** merge=ours
# ...
```

`merge=ours` 表示在合并冲突时，**始终使用我们的版本**（yours），而不是上游的版本。

## 🚀 快速更新

### 方式一：使用 update 命令（推荐）

```bash
npm run update
```

这个命令会自动：
1. ✅ 检查 Git 状态
2. ✅ 配置上游仓库（如果未配置）
3. ✅ 配置 Git 合并策略
4. ✅ 拉取并合并上游更新
5. ✅ 自动保护你的用户文件
6. ✅ 更新依赖包

### 方式二：手动更新

如果你想更精细地控制更新过程：

```bash
# 1. 提交当前更改
git add .
git commit -m "Save my changes"

# 2. 配置上游仓库（首次需要）
git remote add upstream https://github.com/mappedinfo/ppage.git

# 3. 配置 Git 合并策略（首次需要）
git config merge.ours.driver true

# 4. 获取上游更新
git fetch upstream

# 5. 查看更新内容（可选）
git log HEAD..upstream/main --oneline

# 6. 合并更新 - 你的用户文件会自动保护！
git merge upstream/main

# 7. 更新依赖
npm install

# 8. 推送到你的仓库
git push origin main
```

## 📋 完整工作流程

### 1. 准备工作

在更新前，先提交你的更改：

```bash
# 查看当前状态
git status

# 提交更改
git add .
git commit -m "Save my changes before update"
```

**重要**：必须先提交更改，否则 `npm run update` 会提示你先提交。

### 2. 运行更新

```bash
npm run update
```

**输出示例**：

```
🚀 开始更新 PPage 代码...

⚙️  配置 Git 合并策略...
  ✓ 合并策略配置完成

📡 配置上游仓库...
  ✓ 已添加上游仓库

🔄 拉取上游更新...

🔀 合并上游更新到 main 分支...
   💡 .gitattributes 中配置的文件会自动保留你的版本

  ✓ 合并成功！

📦 更新依赖包...
  ✓ 依赖更新完成

✨ 更新完成！
```

### 3. 测试更新

```bash
# 启动开发服务器
npm run dev

# 检查你的配置和内容是否正常
```

### 4. 推送到你的仓库

```bash
# 推送更新到你的 fork
git push origin main
```

## 🔄 更新流程详解

### 自动备份机制

`npm run update` 会在更新前自动创建备份：

1. 创建临时备份目录 `.backup-[时间戳]`
2. 复制所有受保护的文件到备份目录
3. 执行更新操作
4. 恢复受保护的文件
5. 清理备份目录

如果更新失败，备份会被保留，你可以手动恢复。

### 冲突处理

如果在合并时出现冲突：

1. 更新脚本会自动恢复你的用户文件
2. 你需要手动解决代码冲突
3. 解决后运行：
   ```bash
   git add .
   git commit -m "Resolve merge conflicts"
   ```

## 📁 文件组织建议

为了更好地管理更新，建议：

### ✅ 推荐做法

- **用户内容** 放在 `content/` 目录下
- **用户配置** 使用 `public/config.yml`
- **用户资源** 放在 `public/assets/` 目录下
- **自定义脚本** 放在 `scripts/deploy.sh` 或其他自定义脚本文件中

### ❌ 避免做法

- 不要直接修改 `src/` 目录下的源代码
- 不要修改 `scripts/init.js` 和 `scripts/update.js`
- 如果需要修改源代码，建议：
  - Fork 后创建新分支
  - 提交 Pull Request 到上游
  - 或者在你的分支上维护补丁

## 🔧 配置上游仓库

### 查看已配置的远程仓库

```bash
git remote -v
```

你应该看到：
```
origin    https://github.com/yourusername/ppage.git (fetch)
origin    https://github.com/yourusername/ppage.git (push)
upstream  https://github.com/mappedinfo/ppage.git (fetch)
upstream  https://github.com/mappedinfo/ppage.git (push)
```

### 手动配置上游仓库

如果没有 upstream：

```bash
git remote add upstream https://github.com/mappedinfo/ppage.git
```

### 更换上游仓库地址

```bash
git remote set-url upstream https://github.com/mappedinfo/ppage.git
```

## 🐛 常见问题

### Q: 更新后我的配置丢失了怎么办？

A: 如果使用 `npm run update`，你的配置会被自动保护和恢复。如果手动更新导致配置丢失，可以从以下位置恢复：

1. Git 历史记录：`git checkout HEAD~1 -- public/config.yml`
2. 备份目录（如果存在）：`.backup-[时间戳]/`
3. `_template/` 目录（如果之前运行过 init）

### Q: 更新时出现冲突怎么办？

A: 
1. 使用 `npm run update` 时，你的用户文件会被自动恢复
2. 只需要解决代码文件的冲突
3. 运行 `git status` 查看冲突文件
4. 编辑冲突文件，解决冲突标记（`<<<<<<<`, `=======`, `>>>>>>>`）
5. 运行 `git add . && git commit`

### Q: 我修改了源代码，更新会覆盖吗？

A: 是的，对 `src/` 目录的修改可能会被覆盖或产生冲突。建议：

- **方案一**：在你的 fork 上维护独立分支
- **方案二**：使用 git stash 暂存修改，更新后重新应用
- **方案三**：向上游提交 PR，让你的修改合并到主仓库

### Q: 如何查看上游有哪些更新？

A: 

```bash
# 获取上游信息
git fetch upstream

# 查看更新日志
git log HEAD..upstream/main --oneline

# 查看详细差异
git diff HEAD..upstream/main
```

### Q: 可以选择性更新某些文件吗？

A: 可以，但需要手动操作：

```bash
# 获取上游更新
git fetch upstream

# 只更新特定文件
git checkout upstream/main -- src/components/某个文件.jsx

# 提交
git commit -m "Update specific file from upstream"
```

### Q: 更新失败了怎么办？

A: 

1. 如果使用了 `npm run update`，备份文件会被保留
2. 查看错误信息，确定失败原因
3. 可以使用 `git reset --hard` 回退到更新前的状态
4. 如果有备份目录，手动恢复文件
5. 寻求帮助：在 GitHub Issues 中提问

## 🎯 最佳实践

### 1. 定期更新

建议每月检查一次上游更新：

```bash
git fetch upstream
git log HEAD..upstream/main --oneline
```

### 2. 分支策略

- `main` 分支：保持与个人配置同步
- `upstream` 分支：跟踪上游仓库（可选）
- `custom` 分支：重大自定义修改（可选）

### 3. 文档化修改

如果你修改了源代码，建议：
- 在项目中创建 `CUSTOMIZATIONS.md` 记录修改
- 使用 git commit 详细描述修改原因
- 考虑向上游提交 PR

### 4. 测试环境

在更新前，可以在测试分支上先尝试：

```bash
# 创建测试分支
git checkout -b test-update

# 在测试分支上更新
npm run update

# 测试无问题后合并到 main
git checkout main
git merge test-update
```

## 📚 相关文档

- [INIT_GUIDE.md](./INIT_GUIDE.md) - 初始化指南
- [USER_GUIDE.md](./USER_GUIDE.md) - 使用指南
- [config.example.yml](./config.example.yml) - 配置文件示例

## 💡 获取帮助

如果遇到问题：

1. 查看 [GitHub Issues](https://github.com/mappedinfo/ppage/issues)
2. 提交新的 Issue 描述你的问题
3. 查看上游仓库的更新日志
4. 参考 Git 文档和教程

## 🔐 安全提示

- 更新前务必备份重要数据
- 不要在 `.gitignore` 中移除用户文件保护规则
- 定期推送到远程仓库作为备份
- 考虑使用 GitHub 的 fork 同步功能

---

祝你更新顺利！如果有任何问题，欢迎提 Issue。🚀
