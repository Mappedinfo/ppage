/**
 * Markdown 文件索引生成器
 * 使用 Vite 的 import.meta.glob 自动发现所有 Markdown 文件
 */

import { getAllMarkdownModules } from './folderScanner'
import { getAssetPath } from './pathUtils'

// 使用文件夹扫描器获取所有 Markdown 模块
const allModules = getAllMarkdownModules()

// 获取 base 路径（用于 fetch 请求）
const base = import.meta.env.BASE_URL || '/'

// 为了向后兼容，保留原有的 posts 和 pages 模块导出
const postsModules = {}
const pagesModules = {}

// 分类文件到 posts 和 pages
for (const path in allModules) {
  if (path.includes('/posts/')) {
    postsModules[path] = allModules[path]
  } else if (path.includes('/pages/')) {
    pagesModules[path] = allModules[path]
  }
}

/**
 * 从 Markdown 内容中提取标题
 * 优先级：YAML front matter 中的 title > 正文中的一级标题 > 文件名
 * @param {string} content - Markdown 文件内容
 * @param {string} filename - 文件名（作为后备）
 * @returns {string} 提取的标题
 */
export function extractTitle(content, filename) {
  // 1. 尝试从 YAML front matter 中提取 title
  const frontMatterMatch = content.match(/^---\s*\n([\s\S]*?)\n---/)
  if (frontMatterMatch) {
    const frontMatter = frontMatterMatch[1]
    const titleMatch = frontMatter.match(/^title:\s*["']?([^"'\n]+)["']?/m)
    if (titleMatch) {
      return titleMatch[1].trim()
    }
  }

  // 2. 尝试从正文中提取一级标题（# 标题）
  const h1Match = content.match(/^#\s+(.+)$/m)
  if (h1Match) {
    return h1Match[1].trim()
  }

  // 3. 使用文件名作为后备
  return filename.replace('.md', '')
}

/**
 * 加载所有 Markdown 文件
 * @returns {Promise<Array>} Markdown 文件数组
 */
export async function loadAllMarkdownFiles() {
  const markdownFiles = []

  // 加载所有模块（包括 posts, pages, tutorials 等）
  for (const path in allModules) {
    try {
      // 将相对路径转换为绝对路径
      // 使用 getAssetPath 自动适配部署路径
      const relativePath = path.replace('../..', '')
      const absolutePath = getAssetPath(relativePath)
      const filename = path.split('/').pop()

      // 提取文件夹名称
      const folder = extractFolderFromPath(path)

      // 确定文件类型
      let type = 'page' // 默认类型
      if (folder === 'posts') {
        type = 'post'
      } else if (folder === 'pages') {
        type = 'page'
      }

      const response = await fetch(absolutePath)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const content = await response.text()

      // 使用新的标题提取函数
      const title = extractTitle(content, filename)

      markdownFiles.push({
        path: absolutePath,
        content,
        title,
        type,
        folder, // 添加 folder 字段
      })
    } catch (error) {
      console.error(`加载文件失败: ${path}`, error)
    }
  }

  return markdownFiles
}

/**
 * 获取 Markdown 文件列表（仅路径和标题，不加载内容）
 * @returns {Array} 文件信息数组
 */
export function getMarkdownFileList() {
  const fileList = []

  // 获取 posts 列表
  Object.keys(postsModules).forEach(path => {
    fileList.push({
      path,
      type: 'post',
    })
  })

  // 获取 pages 列表
  Object.keys(pagesModules).forEach(path => {
    fileList.push({
      path,
      type: 'page',
    })
  })

  return fileList
}

/**
 * 从路径中提取文件夹名称
 * @param {string} path - 文件路径
 * @returns {string|null} 文件夹名称
 */
function extractFolderFromPath(path) {
  const match = path.match(/\.\.\/\.\.\/content\/([^\/]+)\//)
  return match ? match[1] : null
}

/**
 * 加载指定文件夹的所有 Markdown 文件
 * @param {string} folderName - 文件夹名称
 * @returns {Promise<Array>} Markdown 文件数组
 */
export async function loadFolderMarkdownFiles(folderName) {
  const markdownFiles = []

  for (const path in allModules) {
    const folder = extractFolderFromPath(path)
    if (folder !== folderName) continue

    try {
      // 将相对路径转换为绝对路径
      // 使用 getAssetPath 自动适配部署路径
      const relativePath = path.replace('../..', '')
      const absolutePath = getAssetPath(relativePath)
      const filename = path.split('/').pop()

      const response = await fetch(absolutePath)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const content = await response.text()

      const title = extractTitle(content, filename)

      markdownFiles.push({
        path: absolutePath,
        content,
        title,
        type: 'page', // 默认类型
        folder: folderName,
      })
    } catch (error) {
      console.error(`加载文件失败: ${path}`, error)
    }
  }

  return markdownFiles
}
