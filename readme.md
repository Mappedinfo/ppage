# PPage - 个人主页系统

一个纯前端部署的个人主页生成系统。

## 特性

- ✅ 纯前端部署，无需服务器和数据库
- ✅ 通过 YAML 配置文件一站式管理站点内容
- ✅ 支持 Markdown 内容创作，自动渲染为响应式网页
- ✅ 内置多种主题（明亮、暗黑、学术），支持运行时切换
- ✅ 响应式设计，完美适配各种设备
- ✅ 支持 PDF 在线预览和文件下载
- ✅ 可部署到 GitHub Pages，零成本托管

## 快速开始

### 方式一：使用初始化命令（推荐）

```bash
# 克隆项目
git clone https://github.com/mappedinfo/ppage.git
cd ppage

# 安装依赖
npm install

# 初始化项目（归档示例模板，创建用户模板）
npm run init

# 编辑配置文件，填写你的个人信息
# 配置文件：public/config.yml（搜索【请填写】标记）

# 本地开发
npm run dev

# 构建生产版本
npm run build
```

### 方式二：直接使用示例模板

```bash
# 克隆项目
git clone https://github.com/mappedinfo/ppage.git
cd ppage

# 安装依赖
npm install

# 直接编辑现有的配置文件和内容
# 配置文件：public/config.yml
# 内容目录：content/

# 本地开发
npm run dev

# 构建生产版本
npm run build
```

## 文档

- [USER_GUIDE.md](./USER_GUIDE.md) - 详细使用文档
- [INIT_GUIDE.md](./INIT_GUIDE.md) - `ppage init` 命令使用指南
- [UPDATE_GUIDE.md](./UPDATE_GUIDE.md) - 如何安全地更新 fork 的代码

## 🔄 Fork 后如何更新？

当你 fork 了本仓库并自定义了内容后，可以安全地获取上游更新：

```bash
# 一键更新，自动保护你的配置和内容
npm run update
```

**受保护的文件**（更新时不会被覆盖）：
- `public/config.yml` - 你的站点配置
- `content/` - 你的所有内容
- `public/assets/` - 你的资源文件
- `scripts/deploy.sh` - 你的部署脚本

详细更新流程请查看 [UPDATE_GUIDE.md](./UPDATE_GUIDE.md)。

## 技术栈

- React 18 + Vite
- React Router
- markdown-it
- js-yaml
- CSS Modules + CSS Variables

## License

MIT
