/**
 * 多语言 Markdown 文件加载工具
 * 支持根据语言代码加载对应的 Markdown 文件
 */

import { getAssetPath } from './pathUtils'

/**
 * 加载多语言 Markdown 文件
 * @param {string} basePath - 基础路径（不含语言后缀），如 '/content/pages/about-site'
 * @param {string} language - 语言代码，如 'zh' 或 'en'
 * @param {string} fallbackLanguage - 后备语言代码，默认 'zh'
 * @returns {Promise<string|null>} Markdown 内容，如果加载失败返回 null
 */
export async function loadI18nMarkdown(
  basePath,
  language,
  fallbackLanguage = 'zh'
) {
  // 尝试加载指定语言的文件
  const paths = [
    `${basePath}.${language}.md`, // 如: /content/pages/about-site.zh.md
    `${basePath}.md`, // 如: /content/pages/about-site.md (无语言后缀)
  ]

  // 如果指定语言不是后备语言，也尝试后备语言
  if (language !== fallbackLanguage) {
    paths.push(`${basePath}.${fallbackLanguage}.md`)
  }

  for (const path of paths) {
    try {
      // 使用 getAssetPath 自动适配部署路径
      const fullPath = getAssetPath(path)
      const response = await fetch(fullPath)
      if (response.ok) {
        const content = await response.text()
        console.log(`成功加载 Markdown: ${path}`)
        return content
      }
    } catch (error) {
      console.warn(`无法加载 ${path}:`, error.message)
    }
  }

  console.warn(`所有路径都加载失败: ${paths.join(', ')}`)
  return null
}

/**
 * 预加载多个语言的 Markdown 文件
 * @param {string} basePath - 基础路径
 * @param {string[]} languages - 语言代码数组
 * @returns {Promise<Object>} 语言代码到内容的映射
 */
export async function preloadI18nMarkdown(basePath, languages = ['zh', 'en']) {
  const result = {}

  await Promise.all(
    languages.map(async lang => {
      const content = await loadI18nMarkdown(basePath, lang)
      if (content) {
        result[lang] = content
      }
    })
  )

  return result
}

/**
 * 从文件路径中提取语言代码
 * @param {string} path - 文件路径，如 '/content/pages/about-site.zh.md'
 * @returns {string|null} 语言代码，如 'zh'、'en'，或 null（无语言后缀）
 */
export function extractLanguageFromPath(path) {
  // 匹配 .zh.md, .en.md 等模式
  const match = path.match(/\.(zh|en)\.md$/)
  return match ? match[1] : null
}

/**
 * 从文件路径中提取基础路径（不含语言后缀）
 * @param {string} path - 文件路径
 * @returns {string} 基础路径，如 '/content/pages/about-site'
 */
export function getBasePath(path) {
  // 移除语言后缀（如果存在）
  return path.replace(/\.(zh|en)\.md$/, '')
}

/**
 * 根据当前语言过滤 Markdown 文件列表
 * 规则：
 * 1. 优先选择带有当前语言后缀的文件（如 about-site.zh.md）
 * 2. 如果没有当前语言版本，选择无语言后缀的文件（如 about.md）
 * 3. 如果都没有，使用后备语言版本
 * 4. 确保每个基础文件名只出现一次
 *
 * @param {Array} files - 文件列表，每个文件包含 path 属性
 * @param {string} currentLanguage - 当前语言代码
 * @param {string} fallbackLanguage - 后备语言代码
 * @returns {Array} 过滤后的文件列表
 */
export function filterMarkdownByLanguage(
  files,
  currentLanguage = 'zh',
  fallbackLanguage = 'zh'
) {
  // 按基础路径分组
  const fileGroups = new Map()

  files.forEach(file => {
    const basePath = getBasePath(file.path)
    const lang = extractLanguageFromPath(file.path)

    if (!fileGroups.has(basePath)) {
      fileGroups.set(basePath, [])
    }

    fileGroups.get(basePath).push({
      ...file,
      language: lang,
      basePath,
    })
  })

  // 为每个基础路径选择最合适的版本
  const result = []

  fileGroups.forEach((group, basePath) => {
    // 优先级：当前语言 > 无语言后缀 > 后备语言 > 其他
    let selected = null

    // 1. 尝试找到当前语言版本
    selected = group.find(f => f.language === currentLanguage)

    // 2. 如果没有，尝试找到无语言后缀版本
    if (!selected) {
      selected = group.find(f => f.language === null)
    }

    // 3. 如果没有，尝试找到后备语言版本
    if (!selected && currentLanguage !== fallbackLanguage) {
      selected = group.find(f => f.language === fallbackLanguage)
    }

    // 4. 如果都没有，使用第一个可用的文件
    if (!selected && group.length > 0) {
      selected = group[0]
    }

    if (selected) {
      result.push(selected)
    }
  })

  return result
}
