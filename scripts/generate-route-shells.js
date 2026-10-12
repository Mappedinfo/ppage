#!/usr/bin/env node

/**
 * 为站点导航中的顶层路由生成静态壳文件（dist/<route>.html）。
 *
 * GitHub Pages 对不存在的路径返回 HTTP 404。若导航路由没有对应文件，
 * 直接访问或刷新 /about 等页面会得到 404 状态码。这里把 dist/index.html
 * 复制为各路由文件：页面仍由 React Router 渲染，但服务器返回 200。
 *
 * 壳文件与 index.html 完全相同。资源路径为 ./assets/...，文件位于根目录，
 * 其基准目录与 index.html 相同，因此解析结果一致。
 *
 * 不在此列表中的路由（如动态文档目录）仍由 public/404.html 暂存路径并恢复。
 */

import fs from 'fs'
import path from 'path'
import yaml from 'js-yaml'
import { getConfigPath, rootDir } from './lib/site.js'

const distDir = path.join(rootDir, 'dist')
const indexPath = path.join(distDir, 'index.html')
const SAFE_SEGMENT = /^[a-z0-9][a-z0-9-]*$/i

function loadConfig() {
  return yaml.load(fs.readFileSync(getConfigPath(), 'utf-8')) || {}
}

/**
 * 收集需要壳文件的顶层路由名：导航中的路径，以及显式启用的集合。
 * 未在 collections 中声明的内容目录不在此列，避免把私密目录也暴露为可直接访问的路由。
 */
function collectRouteSegments(config) {
  const segments = new Set()

  for (const item of config.navigation || []) {
    const raw =
      typeof item?.path === 'string' ? item.path.replace(/^\/+|\/+$/g, '') : ''
    if (!raw) continue // 首页由 index.html 提供
    if (raw.includes('/')) continue // 只处理顶层路由
    segments.add(raw)
  }

  for (const [name, collection] of Object.entries(config.collections || {})) {
    if (collection?.enabled === true) segments.add(name)
  }

  return [...segments]
}

function main() {
  if (!fs.existsSync(indexPath)) {
    throw new Error('dist/index.html 不存在，请先执行 vite build')
  }

  const segments = collectRouteSegments(loadConfig())
  let written = 0

  for (const segment of segments) {
    if (!SAFE_SEGMENT.test(segment)) {
      console.warn(`⚠️  跳过非法路由名: ${segment}`)
      continue
    }

    const target = path.join(distDir, `${segment}.html`)
    if (fs.existsSync(target) || fs.existsSync(path.join(distDir, segment))) {
      console.warn(`⚠️  ${segment} 与现有产物重名，跳过`)
      continue
    }

    fs.copyFileSync(indexPath, target)
    written++
  }

  console.log(`✅ 已生成 ${written} 个导航路由壳文件`)
}

main()
