#!/usr/bin/env node

/**
 * 静态站点生成器（SSG）- 预渲染 Markdown 页面
 *
 * 功能：
 * 1. 扫描所有 Markdown 文件
 * 2. 为每个文件生成静态 HTML
 * 3. 保留完整的 SEO 元数据
 * 4. 支持后续 React Hydration
 */

import { fileURLToPath } from 'url'
import { dirname, join, relative } from 'path'
import {
  readFileSync,
  writeFileSync,
  mkdirSync,
  existsSync,
  readdirSync,
  statSync,
} from 'fs'
import MarkdownIt from 'markdown-it'
import markdownItAnchor from 'markdown-it-anchor'
import markdownItTaskLists from 'markdown-it-task-lists'
import hljs from 'highlight.js'
import yaml from 'js-yaml'
import { getContentDir } from './lib/site.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const rootDir = join(__dirname, '..')
const contentDir = getContentDir()
const distDir = join(rootDir, 'dist')

/**
 * 创建 Markdown 渲染器
 */
function createMarkdownRenderer() {
  const md = new MarkdownIt({
    html: false,
    linkify: true,
    typographer: true,
    highlight: function (str, lang) {
      if (lang && hljs.getLanguage(lang)) {
        try {
          return hljs.highlight(str, { language: lang }).value
        } catch (__) {}
      }
      return ''
    },
  })

  md.use(markdownItAnchor, {
    permalink: markdownItAnchor.permalink.headerLink({
      safariReaderFix: true,
      class: 'header-anchor',
    }),
  })

  md.use(markdownItTaskLists, {
    enabled: true,
    label: true,
  })

  const defaultLinkOpenRenderer =
    md.renderer.rules.link_open ||
    function (tokens, idx, options, env, self) {
      return self.renderToken(tokens, idx, options)
    }

  md.renderer.rules.link_open = function (tokens, idx, options, env, self) {
    const token = tokens[idx]
    const hrefIndex = token.attrIndex('href')

    if (hrefIndex >= 0) {
      const href = token.attrs[hrefIndex][1]
      if (href.startsWith('http://') || href.startsWith('https://')) {
        token.attrPush(['target', '_blank'])
        token.attrPush(['rel', 'noopener noreferrer'])
      }
    }

    return defaultLinkOpenRenderer(tokens, idx, options, env, self)
  }

  return md
}

/**
 * 从 Markdown 中提取 front matter
 */
function extractFrontMatter(content) {
  const frontMatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n/
  const match = content.match(frontMatterRegex)

  if (match) {
    try {
      const metadata = yaml.load(match[1])
      const markdownContent = content.replace(frontMatterRegex, '')
      return { metadata, content: markdownContent }
    } catch (error) {
      console.warn('Failed to parse front matter:', error)
    }
  }

  return { metadata: {}, content }
}

/**
 * 从 Markdown 内容中提取标题
 */
function extractTitle(content, filename) {
  const h1Match = content.match(/^#\s+(.+)$/m)
  if (h1Match) {
    return h1Match[1].trim()
  }
  return filename.replace('.md', '')
}

/**
 * 从 Markdown 内容中提取描述
 */
function extractDescription(content, maxLength = 160) {
  // 移除 Markdown 语法
  const plainText = content
    .replace(/^#+\s+/gm, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[*_~`]/g, '')
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`[^`]+`/g, '')
    .trim()

  // 取前 maxLength 个字符
  return plainText.length > maxLength
    ? plainText.substring(0, maxLength) + '...'
    : plainText
}

/**
 * 递归扫描目录中的所有 Markdown 文件
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
 * 生成 HTML 模板
 */
function generateHTML({ title, description, content, metadata, path, config }) {
  const baseUrl = config?.site?.url || ''
  const siteTitle = config?.site?.title || 'PPage'
  const author = config?.profile?.name || metadata?.author || ''
  const keywords = metadata?.tags?.join(', ') || metadata?.keywords || ''
  const fullTitle = `${title} - ${siteTitle}`
  const canonicalUrl = baseUrl ? `${baseUrl}${path.replace('.html', '')}` : ''
  const ogImage = metadata?.image || `${baseUrl}/og-image.png`
  const publishDate = metadata?.date || new Date().toISOString()

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  
  <!-- 基础 SEO -->
  <title>${fullTitle}</title>
  <meta name="description" content="${description}">
  <meta name="keywords" content="${keywords}">
  <meta name="author" content="${author}">
  ${canonicalUrl ? `<link rel="canonical" href="${canonicalUrl}">` : ''}
  
  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="article">
  <meta property="og:url" content="${canonicalUrl}">
  <meta property="og:title" content="${fullTitle}">
  <meta property="og:description" content="${description}">
  <meta property="og:image" content="${ogImage}">
  <meta property="og:site_name" content="${siteTitle}">
  
  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:url" content="${canonicalUrl}">
  <meta name="twitter:title" content="${fullTitle}">
  <meta name="twitter:description" content="${description}">
  <meta name="twitter:image" content="${ogImage}">
  
  <!-- 结构化数据 (JSON-LD) -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "${title}",
    "description": "${description}",
    "author": {
      "@type": "Person",
      "name": "${author}"
    },
    "datePublished": "${publishDate}",
    "dateModified": "${publishDate}",
    "publisher": {
      "@type": "Organization",
      "name": "${siteTitle}",
      "url": "${baseUrl}"
    }
  }
  </script>
  
  <!-- 预加载关键资源 -->
  <link rel="preload" href="./assets/index.css" as="style">
  <link rel="preload" href="./assets/index.js" as="script">
  
  <!-- 样式表 -->
  <link rel="stylesheet" href="./assets/index.css">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.11.1/styles/github-dark.min.css">
  
  <!-- React Hydration 标记 -->
  <meta name="prerender" content="true">
  <meta name="hydrate" content="true">
</head>
<body>
  <!-- SSG 预渲染内容 -->
  <div id="root">
    <div class="markdown-static-content">
      <article class="markdown-article">
        <header class="article-header">
          <h1>${title}</h1>
          ${metadata?.date ? `<time datetime="${metadata.date}">${metadata.date}</time>` : ''}
          ${metadata?.tags?.length ? `<div class="tags">${metadata.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}</div>` : ''}
        </header>
        <div class="article-content">
          ${content}
        </div>
      </article>
    </div>
  </div>
  
  <!-- React 应用入口 (用于 Hydration) -->
  <script type="module" src="./assets/index.js"></script>
  
  <!-- 预渲染元数据 (供 React 使用) -->
  <script id="prerender-data" type="application/json">
  ${JSON.stringify({ title, metadata, path })}
  </script>
</body>
</html>`
}

/**
 * 加载站点配置
 */
function loadConfig() {
  const configPath = join(rootDir, 'public', 'config.yml')
  if (existsSync(configPath)) {
    try {
      const configContent = readFileSync(configPath, 'utf-8')
      return yaml.load(configContent)
    } catch (error) {
      console.warn('Failed to load config.yml:', error)
    }
  }
  return null
}

/**
 * 主函数：预渲染所有 Markdown 文件
 */
async function prerender() {
  console.log('🚀 开始静态站点生成（SSG）...\n')

  // 检查 dist 目录
  if (!existsSync(distDir)) {
    console.error('❌ dist 目录不存在，请先运行 npm run build')
    process.exit(1)
  }

  // 检查 content 目录
  if (!existsSync(contentDir)) {
    console.error('❌ content 目录不存在')
    process.exit(1)
  }

  // 加载配置
  const config = loadConfig()

  // 扫描所有 Markdown 文件
  const markdownFiles = scanMarkdownFiles(contentDir)
  console.log(`📁 找到 ${markdownFiles.length} 个 Markdown 文件\n`)

  // 创建渲染器
  const md = createMarkdownRenderer()

  let successCount = 0
  let errorCount = 0

  // 处理每个文件
  for (const filePath of markdownFiles) {
    try {
      const relativePath = relative(contentDir, filePath)
      const content = readFileSync(filePath, 'utf-8')

      // 提取 front matter 和内容
      const { metadata, content: markdownContent } = extractFrontMatter(content)

      // 提取标题和描述
      const title =
        metadata.title || extractTitle(markdownContent, relativePath)
      const description =
        metadata.description || extractDescription(markdownContent)

      // 渲染 HTML
      const htmlContent = md.render(markdownContent)

      // 生成输出路径
      const htmlPath = relativePath.replace('.md', '.html')
      const outputPath = join(distDir, 'content', htmlPath)
      const outputDir = dirname(outputPath)

      // 创建目录
      if (!existsSync(outputDir)) {
        mkdirSync(outputDir, { recursive: true })
      }

      // 生成完整 HTML
      const fullHtml = generateHTML({
        title,
        description,
        content: htmlContent,
        metadata,
        path: `/content/${htmlPath}`,
        config,
      })

      // 写入文件
      writeFileSync(outputPath, fullHtml, 'utf-8')

      console.log(`✅ ${relativePath} → ${htmlPath}`)
      successCount++
    } catch (error) {
      console.error(
        `❌ 处理失败 ${relative(contentDir, filePath)}:`,
        error.message
      )
      errorCount++
    }
  }

  console.log(`\n📊 完成！成功: ${successCount}, 失败: ${errorCount}`)
  console.log('✨ 静态 HTML 页面已生成到 dist/content/ 目录\n')
}

// 执行预渲染
prerender().catch(error => {
  console.error('❌ 预渲染失败:', error)
  process.exit(1)
})
