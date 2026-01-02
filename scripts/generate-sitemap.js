#!/usr/bin/env node

/**
 * 生成 sitemap.xml 和 robots.txt
 * 增强 SEO，帮助搜索引擎更好地索引网站
 */

import { fileURLToPath } from 'url'
import { dirname, join, relative } from 'path'
import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs'
import yaml from 'js-yaml'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const rootDir = join(__dirname, '..')
const contentDir = join(rootDir, 'content')
const distDir = join(rootDir, 'dist')

/**
 * 加载站点配置
 */
function loadConfig() {
  const configPath = join(rootDir, 'public', 'config.yml')
  try {
    const configContent = readFileSync(configPath, 'utf-8')
    return yaml.load(configContent)
  } catch (error) {
    console.warn('Failed to load config.yml:', error)
    return null
  }
}

/**
 * 递归扫描 Markdown 文件
 */
function scanMarkdownFiles(dir) {
  const files = []

  function scan(currentDir) {
    const items = readdirSync(currentDir)

    for (const item of items) {
      const fullPath = join(currentDir, item)
      const stat = statSync(fullPath)

      if (stat.isDirectory()) {
        scan(fullPath)
      } else if (item.endsWith('.md')) {
        files.push(fullPath)
      }
    }
  }

  scan(dir)
  return files
}

/**
 * 提取文件修改时间
 */
function getLastModified(filePath) {
  try {
    const stat = statSync(filePath)
    return stat.mtime.toISOString()
  } catch {
    return new Date().toISOString()
  }
}

/**
 * 从 Markdown 中提取 front matter
 */
function extractFrontMatter(content) {
  const frontMatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n/
  const match = content.match(frontMatterRegex)

  if (match) {
    try {
      return yaml.load(match[1])
    } catch (error) {
      return {}
    }
  }

  return {}
}

/**
 * 计算页面优先级
 */
function calculatePriority(path, metadata) {
  // 首页最高优先级
  if (path === '/') return '1.0'

  // 重要页面
  if (path.includes('/pages/')) return '0.9'

  // 博客文章
  if (path.includes('/posts/')) return '0.8'

  // 其他页面
  return '0.7'
}

/**
 * 生成 sitemap.xml
 */
function generateSitemap(config) {
  const baseUrl = config?.site?.url || 'https://example.com'
  const markdownFiles = scanMarkdownFiles(contentDir)

  let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml"
        xmlns:mobile="http://www.google.com/schemas/sitemap-mobile/1.0"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
`

  // 添加首页
  sitemap += `  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
`

  // 添加主要页面
  const mainPages = ['about', 'posts', 'pages', 'projects', 'files', 'news']
  for (const page of mainPages) {
    sitemap += `  <url>
    <loc>${baseUrl}/${page}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
`
  }

  // 添加所有 Markdown 页面
  for (const filePath of markdownFiles) {
    const relativePath = relative(contentDir, filePath)
    const urlPath = '/content/' + relativePath.replace('.md', '')
    const lastmod = getLastModified(filePath)

    // 读取 front matter
    const content = readFileSync(filePath, 'utf-8')
    const metadata = extractFrontMatter(content)

    const priority = calculatePriority(urlPath, metadata)
    const changefreq = metadata.changefreq || 'monthly'

    sitemap += `  <url>
    <loc>${baseUrl}${urlPath}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>
`
  }

  sitemap += '</urlset>'

  return sitemap
}

/**
 * 生成 robots.txt
 */
function generateRobotsTxt(config) {
  const baseUrl = config?.site?.url || 'https://example.com'

  return `# https://www.robotstxt.org/robotstxt.html
User-agent: *
Allow: /

# Sitemap
Sitemap: ${baseUrl}/sitemap.xml

# 禁止爬取的路径
Disallow: /assets/
Disallow: /*.json$
`
}

/**
 * 主函数
 */
function main() {
  console.log('🗺️  开始生成 SEO 文件...\n')

  // 加载配置
  const config = loadConfig()

  // 生成 sitemap.xml
  const sitemap = generateSitemap(config)
  const sitemapPath = join(distDir, 'sitemap.xml')
  writeFileSync(sitemapPath, sitemap, 'utf-8')
  console.log('✅ sitemap.xml 已生成')

  // 生成 robots.txt
  const robotsTxt = generateRobotsTxt(config)
  const robotsPath = join(distDir, 'robots.txt')
  writeFileSync(robotsPath, robotsTxt, 'utf-8')
  console.log('✅ robots.txt 已生成')

  console.log('\n✨ SEO 文件生成完成！\n')
}

main()
