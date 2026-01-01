/**
 * 文件夹扫描工具
 * 自动发现 content 目录下的所有文件夹（排除 files）
 * 并为每个文件夹生成相应的文档中心配置
 */

import { getAssetPath } from './pathUtils'

/**
 * 获取所有 Markdown 文件的 glob 模块
 * 排除 files 文件夹
 */
const allMarkdownModules = import.meta.glob('../../content/**/*.md', {
  query: '?url',
  eager: false,
})

/**
 * 从路径中提取文件夹名称
 * @param {string} path - 文件路径
 * @returns {string|null} 文件夹名称
 */
function extractFolderName(path) {
  // path 例如: '../../content/posts/welcome.md'
  const match = path.match(/\.\.\/\.\.\/content\/([^\/]+)\//)
  return match ? match[1] : null
}

/**
 * 扫描 content 目录，发现所有文件夹
 * @returns {Array<Object>} 文件夹配置数组
 */
export function scanContentFolders() {
  const folders = new Map()

  // 遍历所有 Markdown 文件，提取文件夹信息
  for (const path in allMarkdownModules) {
    const folderName = extractFolderName(path)

    // 排除 files 文件夹和无效路径
    if (!folderName || folderName === 'files') {
      continue
    }

    // 如果文件夹已存在，增加文件计数
    if (folders.has(folderName)) {
      const folder = folders.get(folderName)
      folder.fileCount++
    } else {
      // 创建新文件夹配置
      folders.set(folderName, {
        name: folderName,
        type: 'page', // 默认类型，可以通过 index.md 的 front matter 覆盖
        fileCount: 1,
        path: `/content/${folderName}`,
        routePath: `/${folderName}`,
      })
    }
  }

  return Array.from(folders.values())
}

/**
 * 获取指定文件夹的所有 Markdown 文件路径
 * @param {string} folderName - 文件夹名称
 * @returns {Array<string>} 文件路径数组
 */
export function getFolderFiles(folderName) {
  const files = []

  for (const path in allMarkdownModules) {
    const folder = extractFolderName(path)
    if (folder === folderName) {
      // 转换为绝对路径
      // 注意：content 目录是静态资源，始终从根路径访问，不需要 base 前缀
      const relativePath = path.replace('../..', '')
      const absolutePath = relativePath
      files.push(absolutePath)
    }
  }

  return files
}

/**
 * 检查文件夹是否有 index.md
 * @param {string} folderName - 文件夹名称
 * @returns {boolean}
 */
export function hasIndexFile(folderName) {
  const indexPattern = `../../content/${folderName}/index.md`
  return indexPattern in allMarkdownModules
}

/**
 * 加载文件夹的 index.md 配置
 * @param {string} folderName - 文件夹名称
 * @returns {Promise<Object|null>} index.md 的配置信息
 */
export async function loadFolderIndex(folderName) {
  // 构建 index.md 路径
  // 使用 getAssetPath 自动适配部署路径
  const indexPath = getAssetPath(`/content/${folderName}/index.md`)

  try {
    const response = await fetch(indexPath)
    if (!response.ok) {
      return null
    }

    const content = await response.text()

    // 解析 front matter
    const frontMatterMatch = content.match(/^---\s*\n([\s\S]*?)\n---/)
    if (!frontMatterMatch) {
      return { content }
    }

    const frontMatter = frontMatterMatch[1]
    const config = {
      content,
      title: null,
      description: null,
      type: 'page',
      enableTree: false,
      showBreadcrumb: false,
      layout: 'sidebar',
      icon: null,
      order: null,
    }

    // 解析 front matter 字段
    const lines = frontMatter.split('\n')
    lines.forEach(line => {
      const [key, ...valueParts] = line.split(':')
      if (!key) return

      const trimmedKey = key.trim()
      const value = valueParts
        .join(':')
        .trim()
        .replace(/^["']|["']$/g, '')

      switch (trimmedKey) {
        case 'title':
          config.title = value
          break
        case 'description':
          config.description = value
          break
        case 'type':
          config.type = value
          break
        case 'enableTree':
          config.enableTree = value === 'true'
          break
        case 'showBreadcrumb':
          config.showBreadcrumb = value === 'true'
          break
        case 'layout':
          config.layout = value
          break
        case 'icon':
          config.icon = value
          break
        case 'order':
          config.order = parseInt(value, 10)
          break
      }
    })

    return config
  } catch (error) {
    console.error(`加载 index.md 失败: ${folderName}`, error)
    return null
  }
}

/**
 * 生成完整的文件夹配置
 * 结合扫描结果、index.md 配置和 config.yml 配置
 * @param {Object} siteConfig - 站点配置对象
 * @returns {Promise<Array<Object>>} 文件夹配置数组
 */
export async function generateFolderConfigs(siteConfig = {}) {
  const folders = scanContentFolders()
  const configs = []
  const collections = siteConfig.collections || {}

  for (const folder of folders) {
    // 检查此文件夹是否在 config 中配置
    const collectionConfig = collections[folder.name] || {}

    // 如果明确设置为 disabled，则跳过
    if (collectionConfig.enabled === false) {
      continue
    }

    const indexConfig = await loadFolderIndex(folder.name)

    // 合并配置：优先级 config.yml > index.md > 默认值
    const config = {
      name: folder.name,
      title: indexConfig?.title || formatFolderName(folder.name),
      description: indexConfig?.description || '',
      type: indexConfig?.type || 'page',
      routePath: folder.routePath,
      enableTree: indexConfig?.enableTree || false,
      showBreadcrumb: indexConfig?.showBreadcrumb || false,
      layout: indexConfig?.layout || 'sidebar',
      icon: indexConfig?.icon || null,
      order: collectionConfig.order ?? indexConfig?.order ?? 999,
      fileCount: folder.fileCount,
      hasIndex: !!indexConfig,
      // 从 config.yml 添加的配置
      showInNavigation: collectionConfig.showInNavigation ?? true,
      showInMobile: collectionConfig.showInMobile ?? false,
    }

    configs.push(config)
  }

  // 按 order 排序
  configs.sort((a, b) => a.order - b.order)

  return configs
}

/**
 * 格式化文件夹名称为可读标题
 * @param {string} folderName - 文件夹名称
 * @returns {string} 格式化后的标题
 */
function formatFolderName(folderName) {
  return folderName
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

/**
 * 获取所有 Markdown 模块（用于其他工具函数）
 * @returns {Object} glob 模块对象
 */
export function getAllMarkdownModules() {
  return allMarkdownModules
}
