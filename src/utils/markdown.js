import MarkdownIt from 'markdown-it'
import markdownItAnchor from 'markdown-it-anchor'
import markdownItTaskLists from 'markdown-it-task-lists'
import hljs from 'highlight.js/lib/core'
import bash from 'highlight.js/lib/languages/bash'
import c from 'highlight.js/lib/languages/c'
import cpp from 'highlight.js/lib/languages/cpp'
import csharp from 'highlight.js/lib/languages/csharp'
import css from 'highlight.js/lib/languages/css'
import diff from 'highlight.js/lib/languages/diff'
import dockerfile from 'highlight.js/lib/languages/dockerfile'
import go from 'highlight.js/lib/languages/go'
import ini from 'highlight.js/lib/languages/ini'
import java from 'highlight.js/lib/languages/java'
import javascript from 'highlight.js/lib/languages/javascript'
import json from 'highlight.js/lib/languages/json'
import kotlin from 'highlight.js/lib/languages/kotlin'
import markdown from 'highlight.js/lib/languages/markdown'
import nginx from 'highlight.js/lib/languages/nginx'
import php from 'highlight.js/lib/languages/php'
import python from 'highlight.js/lib/languages/python'
import r from 'highlight.js/lib/languages/r'
import ruby from 'highlight.js/lib/languages/ruby'
import rust from 'highlight.js/lib/languages/rust'
import sql from 'highlight.js/lib/languages/sql'
import swift from 'highlight.js/lib/languages/swift'
import typescript from 'highlight.js/lib/languages/typescript'
import xml from 'highlight.js/lib/languages/xml'
import yaml from 'highlight.js/lib/languages/yaml'

// 按需注册语言，替代全量 highlight.js（未注册的语言自动回退为默认转义）。
// 站点内容实际使用：jsx/bash/yaml/javascript/markdown/json/css/python。
const LANGUAGES = {
  bash,
  c,
  cpp,
  csharp,
  css,
  diff,
  dockerfile,
  go,
  ini,
  java,
  javascript, // 含 js/jsx/mjs/cjs 别名
  json,
  kotlin,
  markdown, // 含 md 别名
  nginx,
  php,
  python, // 含 py 别名
  r,
  ruby,
  rust,
  sql,
  swift,
  typescript, // 含 ts 别名
  xml, // 含 html/svg 别名
  yaml, // 含 yml 别名
}
for (const [name, language] of Object.entries(LANGUAGES)) {
  hljs.registerLanguage(name, language)
}

/**
 * 创建配置好的 Markdown-it 实例
 */
export function createMarkdownRenderer() {
  const md = new MarkdownIt({
    html: false, // 禁用 HTML 标签以提高安全性
    linkify: true, // 自动转换 URL 为链接
    typographer: true, // 启用智能引号和其他排版替换
    highlight: function (str, lang) {
      // 代码高亮
      if (lang && hljs.getLanguage(lang)) {
        try {
          return hljs.highlight(str, { language: lang }).value
        } catch (__) {}
      }
      return '' // 使用默认转义
    },
  })

  // 添加锚点插件
  md.use(markdownItAnchor, {
    permalink: markdownItAnchor.permalink.headerLink({
      safariReaderFix: true,
      class: 'header-anchor',
    }),
  })

  // 添加任务列表插件
  md.use(markdownItTaskLists, {
    enabled: true,
    label: true,
  })

  // 自定义渲染规则：为外部链接添加属性
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
      // 检查是否是外部链接
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
 * 移除 Markdown 内容中的 YAML front matter
 * @param {string} markdown - Markdown 文本
 * @returns {string} 移除 front matter 后的 Markdown 文本
 */
export function removeFrontMatter(markdown) {
  // 匹配 YAML front matter: ---\n...\n---
  const frontMatterRegex = /^---\s*\n[\s\S]*?\n---\s*\n/
  return markdown.replace(frontMatterRegex, '')
}

/**
 * 渲染 Markdown 文本为 HTML
 * @param {string} markdown - Markdown 文本
 * @returns {string} HTML 字符串
 */
export function renderMarkdown(markdown) {
  // 移除 YAML front matter
  const content = removeFrontMatter(markdown)
  const md = createMarkdownRenderer()
  return md.render(content)
}

/**
 * 从 Markdown 内容中提取标题，生成目录
 * @param {string} markdown - Markdown 文本
 * @returns {Array} 标题列表
 */
export function extractHeadings(markdown) {
  const headings = []
  const lines = markdown.split('\n')

  lines.forEach(line => {
    const match = line.match(/^(#{1,6})\s+(.+)$/)
    if (match) {
      const level = match[1].length
      const text = match[2].trim()
      const slug = text
        .toLowerCase()
        .replace(/[^\w\u4e00-\u9fa5]+/g, '-')
        .replace(/^-+|-+$/g, '')

      headings.push({
        level,
        text,
        slug,
      })
    }
  })

  return headings
}

/**
 * 估算 Markdown 内容的阅读时间
 * @param {string} markdown - Markdown 文本
 * @returns {number} 阅读时间（分钟）
 */
export function estimateReadingTime(markdown) {
  // 移除 Markdown 语法
  const plainText = markdown
    .replace(/^#+\s+/gm, '') // 标题
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // 链接
    .replace(/[*_~`]/g, '') // 格式化符号
    .replace(/```[\s\S]*?```/g, '') // 代码块
    .replace(/`[^`]+`/g, '') // 行内代码

  // 计算字数（中英文混合）
  const chineseChars = (plainText.match(/[\u4e00-\u9fa5]/g) || []).length
  const words = plainText.split(/\s+/).filter(w => w.length > 0).length

  // 中文阅读速度约 300-500 字/分钟，英文约 200-250 词/分钟
  const readingTime = Math.ceil(chineseChars / 400 + words / 225)

  return readingTime || 1
}
