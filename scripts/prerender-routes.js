#!/usr/bin/env node

/**
 * 首页与导航路由的真预渲染（SSG）：
 *
 * 1. 用 Vite SSR 构建应用入口（src/ssr-entry.jsx -> dist-ssr/）；
 * 2. 对首页与每个顶层路由调用 renderRoute 得到真实 HTML；
 * 3. 写出 dist/index.html 与 dist/<route>.html，并加 <meta name="prerender">。
 *
 * 客户端 main.jsx 检测到该标记后用 hydrateRoot 接管，无需等待数据加载。
 * 本脚本是原"导航路由壳文件"机制的升级：壳文件只是空 index.html 副本，
 * 现在输出包含真实首屏内容。
 */

import fs from 'fs'
import path from 'path'
import { spawnSync } from 'child_process'
import { pathToFileURL } from 'url'
import yaml from 'js-yaml'
import { getConfigPath, rootDir } from './lib/site.js'

const distDir = path.join(rootDir, 'dist')
const ssrOutDirName = 'dist-ssr'
const ssrOutDir = path.join(rootDir, ssrOutDirName)
const indexPath = path.join(distDir, 'index.html')
const SAFE_SEGMENT = /^[a-z0-9][a-z0-9-]*$/i

function loadConfig() {
  return yaml.load(fs.readFileSync(getConfigPath(), 'utf-8')) || {}
}

/** 首页之外的顶层路由：导航中的路径 + 显式启用的集合 */
function topLevelRouteSegments(config) {
  const segments = new Set()

  for (const item of config.navigation || []) {
    const raw =
      typeof item?.path === 'string' ? item.path.replace(/^\/+|\/+$/g, '') : ''
    if (!raw || raw.includes('/')) continue
    segments.add(raw)
  }

  for (const [name, collection] of Object.entries(config.collections || {})) {
    if (collection?.enabled === true) segments.add(name)
  }

  return [...segments]
}

/** 每次都重新构建 SSR 入口，保证使用最新源码 */
function buildSsrBundle() {
  const bundle = path.join(ssrOutDir, 'ssr-entry.js')
  const viteBin = path.join(rootDir, 'node_modules', 'vite', 'bin', 'vite.js')

  console.log('\n🧩 构建 SSR 入口...')
  const result = spawnSync(
    process.execPath,
    [
      viteBin,
      'build',
      '--ssr',
      'src/ssr-entry.jsx',
      '--outDir',
      ssrOutDirName,
      '--emptyOutDir',
    ],
    { cwd: rootDir, stdio: 'inherit' }
  )

  if (result.status !== 0 || !fs.existsSync(bundle)) {
    throw new Error('SSR 入口构建失败')
  }
  return bundle
}

async function main() {
  if (!fs.existsSync(indexPath)) {
    throw new Error('dist/index.html 不存在，请先执行 vite build')
  }

  const config = loadConfig()
  const bundle = buildSsrBundle()
  const { renderRoute } = await import(pathToFileURL(bundle).href)

  const template = fs.readFileSync(indexPath, 'utf-8')
  if (!template.includes('<div id="root"></div>')) {
    throw new Error('index.html 中未找到空 root 容器')
  }

  const routes = [
    '/',
    ...topLevelRouteSegments(config).filter(
      segment =>
        SAFE_SEGMENT.test(segment) &&
        !fs.existsSync(path.join(distDir, segment))
    ),
  ]

  let written = 0
  for (const route of routes) {
    // MemoryRouter 需要绝对路径；'about' 会导致路由匹配失败并输出空内容
    const routePath = route === '/' ? '/' : `/${route}`
    const appHtml = renderRoute(routePath, config)
    let html = template.replace(
      '<div id="root"></div>',
      `<div id="root">${appHtml}</div>`
    )
    html = html.replace(
      '</head>',
      '  <meta name="prerender" content="true">\n</head>'
    )

    const target =
      route === '/' ? indexPath : path.join(distDir, `${route}.html`)
    fs.writeFileSync(target, html, 'utf-8')
    written++
    console.log(`✅ 预渲染 ${route} -> ${path.relative(distDir, target)}`)
  }

  console.log(`\n✨ 路由预渲染完成（${written} 个路由）\n`)
}

main().catch(error => {
  console.error(`❌ 路由预渲染失败: ${error.message}`)
  process.exit(1)
})
