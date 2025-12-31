---
title: 部署问题排查指南
id: deploy-troubleshooting
type: page
collection: tutorials
parent: deployment-index
order: 3
date: 2025-12-31
author: System
tags: [tutorial, troubleshooting, deployment]
category: 教程
---

# 部署问题排查指南

## 问题：访问自定义域名时出现 404 错误

### 症状
- 网站能打开，但CSS和JS文件404
- 错误信息：`Failed to load resource: the server responded with a status of 404`
- 访问的是自定义域名（如 `shiqi-wang.com`）

### 原因
使用了错误的 base 路径构建，或部署了旧的构建产物。

### 解决步骤

#### 步骤1：确认你的部署场景

你正在使用自定义域名 `shiqi-wang.com`，应该使用 **根域名部署模式**。

#### 步骤2：执行根域名部署

```bash
# 一键部署（自动清理、构建、部署）
./scripts/deploy.sh root
```

**脚本会自动执行以下操作：**
1. 🧹 清理旧的 `dist` 目录
2. 📦 使用根域名模式构建项目 (base = `/`)
3. 📤 部署到 GitHub Pages

#### 步骤3：等待部署生效

GitHub Pages 需要 1-5 分钟来更新内容。

#### 步骤4：清除浏览器缓存

- **Chrome/Edge**: `Cmd+Shift+R` (Mac) 或 `Ctrl+Shift+R` (Windows)
- **Safari**: `Cmd+Option+R`
- 或者使用无痕模式访问

#### 步骤5：验证线上文件

访问这些URL，确认文件存在：
```
https://shiqi-wang.com/
https://shiqi-wang.com/assets/index-D5-s-R9n.css
https://shiqi-wang.com/vite.svg
```

如果还是404，检查 GitHub Pages 设置中的自定义域名配置。

---

## 快速诊断命令

```bash
# 一键部署（推荐）
./scripts/deploy.sh root

# 或手动验证构建产物
cat dist/index.html | head -15
```

---

## 不同部署场景的选择

### 场景A：自定义域名（shiqi-wang.com）
```bash
./scripts/deploy.sh root
```

**配置示例** (`public/config.yml`):
```yaml
deploy:
  repository: "https://github.com/wsqstar/ppage"
  branch: "gh-pages"
  customDomain: "shiqi-wang.com"  # 自动生成 CNAME 文件
```

### 场景B：GitHub子目录 (yourusername.github.io/ppage)
```bash
./scripts/deploy.sh subdir
# 或直接
./scripts/deploy.sh
```

### 场景C：GitHub用户页面 (yourusername.github.io)
```bash
./scripts/deploy.sh root
```

**注意**：所有部署命令都会自动执行清理、构建、部署三个步骤。

---

## 自定义域名配置指南

### 第一步：配置 DNS 记录

根据你的域名类型，选择对应的 DNS 配置：

#### A. 顶级域名（Apex domain）

如果你使用的是顶级域名（如 `example.com`），需要配置 A 记录：

1. 登录你的域名注册商的 DNS 管理面板
2. 添加以下 4 条 A 记录，指向 GitHub Pages 的 IP 地址：

```
类型    主机记录    记录值
A       @          185.199.108.153
A       @          185.199.109.153
A       @          185.199.110.153
A       @          185.199.111.153
```

#### B. 子域名（Subdomain）

如果你使用的是子域名（如 `www.example.com` 或 `blog.example.com`），需要配置 CNAME 记录：

```
类型     主机记录    记录值
CNAME    www        yourusername.github.io
```

或

```
类型     主机记录    记录值
CNAME    blog       yourusername.github.io
```

**注意**：将 `yourusername` 替换为你的 GitHub 用户名。

#### C. 同时支持顶级域名和 www 子域名

如果希望 `example.com` 和 `www.example.com` 都能访问，需要同时配置：

```
类型     主机记录    记录值
A        @          185.199.108.153
A        @          185.199.109.153
A        @          185.199.110.153
A        @          185.199.111.153
CNAME    www        yourusername.github.io
```

### 第二步：配置项目

编辑 `public/config.yml` 文件，添加自定义域名配置：

```yaml
deploy:
  repository: "https://github.com/yourusername/ppage"
  branch: "gh-pages"
  customDomain: "example.com"  # 填写你的自定义域名
```

**重要提示**：
- 填写时不要加 `http://` 或 `https://` 前缀
- 如果使用 www 子域名，填写 `www.example.com`
- 如果使用顶级域名，填写 `example.com`

### 第三步：部署项目

使用根域名部署模式：

```bash
# 使用 npm 命令
npm run deploy:root

# 或直接使用脚本
./scripts/deploy.sh root
```

**自动操作**：
- ✅ 脚本会自动读取 `customDomain` 配置
- ✅ 自动在 `dist` 目录生成 `CNAME` 文件
- ✅ 自动部署到 GitHub Pages

### 第四步：在 GitHub 上配置自定义域名

1. 进入你的 GitHub 仓库
2. 点击 **Settings** → **Pages**
3. 在 "Custom domain" 输入框中填写你的域名（如 `example.com`）
4. 点击 **Save**
5. 勾选 "Enforce HTTPS"（等待 DNS 检查通过后）

### 第五步：验证配置

#### 1. 验证 DNS 解析

```bash
# 验证 A 记录
dig example.com +noall +answer

# 验证 CNAME 记录
dig www.example.com +noall +answer
```

#### 2. 验证 CNAME 文件

访问 `https://yourusername.github.io/CNAME`，应该显示你的域名。

#### 3. 访问你的网站

等待 1-5 分钟后，访问你的自定义域名：
- `https://example.com`
- `https://www.example.com`

### 常见 DNS 提供商配置示例

#### Cloudflare

1. 登录 Cloudflare Dashboard
2. 选择你的域名 → DNS
3. 添加记录：
   - Type: `A`, Name: `@`, IPv4 address: `185.199.108.153`
   - Type: `A`, Name: `@`, IPv4 address: `185.199.109.153`
   - Type: `A`, Name: `@`, IPv4 address: `185.199.110.153`
   - Type: `A`, Name: `@`, IPv4 address: `185.199.111.153`
   - Type: `CNAME`, Name: `www`, Target: `yourusername.github.io`
4. Proxy status: 可以保持橙色云朵（Proxied）

#### 阿里云

1. 登录阿里云控制台
2. 进入域名解析设置
3. 添加记录：
   - 记录类型: `A`, 主机记录: `@`, 记录值: `185.199.108.153`
   - 记录类型: `A`, 主机记录: `@`, 记录值: `185.199.109.153`
   - 记录类型: `A`, 主机记录: `@`, 记录值: `185.199.110.153`
   - 记录类型: `A`, 主机记录: `@`, 记录值: `185.199.111.153`
   - 记录类型: `CNAME`, 主机记录: `www`, 记录值: `yourusername.github.io`

#### 腾讯云（DNSPod）

1. 登录腾讯云 DNSPod 控制台
2. 选择域名 → 添加记录
3. 添加记录（同阿里云配置）

### 自定义域名故障排查

#### 问题 1：域名无法访问或显示 404

**原因**：DNS 未生效或 CNAME 文件未正确生成

**解决方法**：
1. 检查 DNS 是否生效（可能需要等待 24-48 小时）
2. 确认 `public/config.yml` 中 `customDomain` 配置正确
3. 重新部署：`npm run deploy:root`
4. 检查 GitHub Pages 设置中的自定义域名是否已填写

#### 问题 2：HTTPS 证书错误

**原因**：GitHub 正在为你的域名申请 SSL 证书

**解决方法**：
1. 等待 10-30 分钟让 GitHub 申请证书
2. 确保 DNS 解析正确
3. 在 GitHub Pages 设置中勾选 "Enforce HTTPS"

#### 问题 3：www 子域名无法访问

**原因**：未配置 CNAME 记录

**解决方法**：
在 DNS 中添加 CNAME 记录，将 `www` 指向 `yourusername.github.io`

#### 问题 4：部署后 CNAME 文件消失

**原因**：每次部署都会覆盖 gh-pages 分支

**解决方法**：
确保 `public/config.yml` 中配置了 `customDomain`，部署脚本会自动生成 CNAME 文件。

### 参考文档

- [GitHub 官方文档：管理 GitHub Pages 站点的自定义域](https://docs.github.com/zh/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site)
- [GitHub 官方文档：关于自定义域名和 GitHub Pages](https://docs.github.com/zh/pages/configuring-a-custom-domain-for-your-github-pages-site/about-custom-domains-and-github-pages)

---

## 常见问题

### Q: 我修改了代码但网站没变化？
A: 清除浏览器缓存，或使用无痕模式访问。

### Q: 我重新部署了但还是404？
A: 
1. 等待 3-5 分钟
2. 检查 GitHub Actions 或部署日志
3. 确认 GitHub Pages 设置中的分支和目录正确

### Q: 如何知道我应该用哪种部署模式？
A: 
- 如果访问地址有子路径（如 `/ppage`）→ 使用 `subdir`
- 如果是根域名或自定义域名 → 使用 `root`

### Q: 我可以在本地测试构建产物吗？
A: 可以！
```bash
npm run build:root
npm run preview
```
然后访问 `http://localhost:4173`
