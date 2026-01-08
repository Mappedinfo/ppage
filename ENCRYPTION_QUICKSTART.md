# 🔐 加密功能快速开始

这是一个完整的加密功能示例，展示如何在开发环境中测试和使用内容加密。

## ⚡ 快速体验（3分钟）

### 第1步：启用加密功能 ✅

配置已经准备好了！查看 `public/config.yml`：

```yaml
encryption:
  enabled: true # 已启用
  protectedFolders:
    - 'content/protected'
```

### 第2步：查看示例文件 📁

我们已经为你准备了4个示例文件在 `content/protected/` 目录：

- `test-encrypted.md` - 基础测试示例
- `private-diary.md` - 个人日记示例
- `technical-notes.md` - 技术笔记示例
- `meeting-minutes.md` - 会议纪要示例

**现在这些文件还是明文，你可以打开查看！**

### 第3步：加密内容 🔒

运行加密命令：

```bash
npm run encrypt
```

系统会提示：

```
🔐 内容加密工具
==================================================

📁 受保护的文件夹: content/protected

找到 4 个文件

🔑 请输入加密密码:
```

**输入密码**：`demo2025`（推荐用于演示）

**再次确认**：`demo2025`

你会看到：

```
🔒 开始加密文件...
  ✅ 加密成功: content/protected/test-encrypted.md
  ✅ 加密成功: content/protected/private-diary.md
  ✅ 加密成功: content/protected/technical-notes.md
  ✅ 加密成功: content/protected/meeting-minutes.md

==================================================
📊 加密完成！
  ✅ 成功: 4 个
  ⏭️  跳过: 0 个
  ❌ 失败: 0 个

✨ 所有文件加密成功！现在可以提交到 git 了。
```

### 第4步：启动开发服务器 🚀

```bash
npm run dev
```

### 第5步：体验加密内容 🎯

1. 打开浏览器访问：http://localhost:5173
2. 点击导航栏的"文档"
3. 找到加密的文档（会显示标题）
4. 点击任一文档
5. 弹出密码输入框 🔐
6. 输入密码：`demo2025`
7. 点击"解锁内容"
8. ✨ 内容成功解密并显示！

### 第6步：测试会话缓存 💾

- 继续点击其他加密文档
- 不需要再次输入密码
- 刷新浏览器后需要重新输入（安全设计）

## 🎬 演示场景

### 场景A：查看加密文件源码

```bash
cat content/protected/test-encrypted.md
```

你会看到：

```markdown
---
title: '测试加密内容'
encrypted: true
encryptedAt: '2025-01-08T12:00:00.000Z'
---

<!-- ENCRYPTED_CONTENT -->

base64编码的乱码数据...

<!-- /ENCRYPTED_CONTENT -->
```

**说明**：即使有源文件访问权限，也无法直接读取内容！

### 场景B：提交到Git

```bash
git status
git add content/protected/
git commit -m "Add encrypted demo content"
```

**说明**：加密内容可以安全提交到公开仓库！

### 场景C：密码错误处理

1. 访问加密文档
2. 输入错误密码（如：`wrong123`）
3. 系统提示：**"密码错误，请重试"**
4. 重新输入正确密码
5. 成功解锁

### 场景D：移动端体验

1. 使用手机浏览器访问（或浏览器开发工具切换到移动模式）
2. 密码输入界面自动适配
3. 功能完全正常

## 📸 截图说明

### 密码输入界面

```
┌─────────────────────────────┐
│  🔒 受保护的内容             │
│  ─────────────────────────  │
│                             │
│  此内容已加密保护，         │
│  请输入密码以查看。         │
│                             │
│  ┌─────────────────────┐   │
│  │ 请输入密码      👁️  │   │
│  └─────────────────────┘   │
│                             │
│  ┌──────────┐  ┌────────┐  │
│  │ 解锁内容 │  │  取消  │  │
│  └──────────┘  └────────┘  │
│                             │
│  💡 提示：密码将在本次会话  │
│  中保存，刷新页面后需要     │
│  重新输入。                 │
└─────────────────────────────┘
```

### 解锁成功

```
┌─────────────────────────────┐
│  🔒 受保护的内容             │
│  ─────────────────────────  │
│                             │
│  # 测试加密内容              │
│                             │
│  这是一个受保护的文档...    │
│                             │
└─────────────────────────────┘
```

## 🛠️ 开发者工具

### 查看加密配置

```bash
grep -A 10 "encryption:" public/config.yml
```

### 列出所有受保护文件

```bash
find content/protected -name "*.md"
```

### 检查文件是否已加密

```bash
grep "ENCRYPTED_CONTENT" content/protected/*.md
```

### 重置示例（重新加密）

```bash
# 如果想要重新测试加密过程：
# 1. 从 git 恢复原始文件（如果已提交）
git checkout content/protected/

# 2. 或者重新创建示例文件
npm run init  # 如果有初始化脚本

# 3. 重新加密
npm run encrypt
```

## 📚 学习资源

### 核心文件说明

```
ppage/
├── scripts/
│   ├── crypto.js          # 加密核心算法（Node.js）
│   └── encrypt.js         # 加密CLI工具
├── src/
│   ├── utils/
│   │   └── encryption.js  # 前端解密工具
│   └── components/
│       └── common/
│           ├── PasswordPrompt.jsx      # 密码输入界面
│           └── ProtectedContent.jsx    # 受保护内容组件
├── content/
│   └── protected/         # 示例加密内容
└── ENCRYPTION.md          # 完整文档
```

### 技术栈

- **加密算法**：AES-256-GCM
- **密钥派生**：PBKDF2（100,000次迭代）
- **前端解密**：Web Crypto API
- **UI框架**：React + CSS Modules

### 扩展阅读

- [ENCRYPTION.md](./ENCRYPTION.md) - 完整的加密功能文档
- [content/protected/README.md](./content/protected/README.md) - 示例说明
- [Web Crypto API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API)

## 🤔 常见问题

### Q1：为什么要在本地加密而不是在服务器端？

**A**：因为 PPage 是纯前端项目，没有服务器。本地加密的优势：

- 无需服务器成本
- 更高的安全性（密码不会传输）
- 适合静态站点部署

### Q2：加密后还能修改内容吗？

**A**：可以，但需要重新加密：

1. 从 git 恢复原始文件或手动解密
2. 修改内容
3. 重新运行 `npm run encrypt`

### Q3：忘记密码怎么办？

**A**：如果忘记密码：

- 无法解密已加密的内容
- 需要从备份或 git 历史恢复原始文件
- 建议使用密码管理器存储密码

### Q4：可以为不同文件使用不同密码吗？

**A**：可以！

1. 在 `public/config.yml` 中配置多个受保护文件夹
2. 为每个文件夹分别运行加密脚本
3. 用户访问时输入对应的密码

### Q5：性能如何？

**A**：

- 加密：本地操作，速度很快（毫秒级）
- 解密：浏览器操作，通常在100ms内完成
- 对用户体验影响很小

## 🎯 下一步

现在你已经了解了基础用法，可以：

1. **自定义内容**：在 `content/protected/` 下创建自己的私密文档
2. **修改密码**：使用更安全的密码
3. **集成到项目**：将加密功能用于实际项目
4. **阅读文档**：查看 [ENCRYPTION.md](./ENCRYPTION.md) 了解更多

## 💬 反馈

如果遇到问题或有改进建议，欢迎提 Issue！

---

**提示**：这是开发环境示例配置，生产环境请：

- 使用强密码（至少12位）
- 定期更换密码
- 做好密码备份
- 保护好原始文件

🎉 开始体验吧！运行 `npm run encrypt` 即可开始！
