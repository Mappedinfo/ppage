---
title: 'Google Analytics 快速参考'
date: '2026-01-06'
description: 'Google Analytics 配置和使用快速参考'
---

# Google Analytics 快速参考

## 基本配置

在 `public/config.yml` 中添加：

```yaml
analytics:
  googleAnalytics: 'G-XXXXXXXXXX' # 你的 GA 测量 ID
  enableInDev: false # 开发环境是否启用
```

## 自定义事件跟踪

### 导入函数

```jsx
import { trackEvent } from '../components/analytics/GoogleAnalytics'
```

### 发送事件

```jsx
// 简单事件
trackEvent('event_name')

// 带参数的事件
trackEvent('event_name', {
  param1: 'value1',
  param2: 'value2',
})
```

## 常见事件示例

### 按钮点击

```jsx
trackEvent('button_click', {
  button_name: 'contact',
  button_location: 'header',
})
```

### 文件下载

```jsx
trackEvent('file_download', {
  file_name: 'paper.pdf',
  file_type: 'pdf',
})
```

### 外部链接

```jsx
trackEvent('outbound_link', {
  link_url: 'https://example.com',
  link_text: 'Example',
})
```

### 表单提交

```jsx
trackEvent('form_submit', {
  form_name: 'contact',
  form_type: 'email',
})
```

### 视频播放

```jsx
trackEvent('video_play', {
  video_title: 'Tutorial Video',
  video_duration: '05:30',
})
```

## 环境控制

| 环境 | enableInDev | 发送数据 |
| ---- | ----------- | -------- |
| 开发 | false       | ❌       |
| 开发 | true        | ✅       |
| 生产 | false       | ✅       |
| 生产 | true        | ✅       |

## 故障排查

### 检查初始化

打开浏览器控制台，查看：

```
Google Analytics: 初始化成功 (G-XXXXXXXXXX)
```

### 检查页面跟踪

路由变化时应看到：

```
Google Analytics: 页面浏览跟踪 - /path
```

### 检查事件跟踪

触发事件时应看到：

```
Google Analytics: 事件跟踪 - event_name {params}
```

## 测量 ID 格式

✅ 正确：`G-XXXXXXXXXX`（GA4）  
❌ 错误：`UA-XXXXXX-X`（旧版 Universal Analytics）

## 在 GA 后台查看

1. **实时报告**：报告 → 实时
2. **事件报告**：报告 → 参与度 → 事件
3. **页面报告**：报告 → 参与度 → 页面和屏幕

## 相关文档

- [完整指南](./google-analytics-guide.md)
- [配置文件说明](../../config.example.yml)
