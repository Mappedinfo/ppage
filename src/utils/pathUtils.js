/**
 * 路径工具函数
 * 用于处理相对路径部署时的资源路径计算
 */

/**
 * 获取当前应用的基础路径
 * 通过解析当前页面 URL 和 index.html 的位置来推断
 *
 * 例如：
 * - 部署在根路径: https://example.com/ -> '/'
 * - 部署在子目录: https://example.com/ppage/ -> '/ppage/'
 * - 部署在多层子目录: https://example.com/projects/ppage/ -> '/projects/ppage/'
 *
 * @returns {string} 基础路径，以 '/' 结尾
 */
export function getBasePath() {
  // 开发环境
  if (import.meta.env.DEV) {
    return '/'
  }

  // 生产环境：从当前页面的路径推断
  const pathname = window.location.pathname

  // 如果路径是 '/' 或 '/index.html'，说明在根目录
  if (pathname === '/' || pathname === '/index.html') {
    return '/'
  }

  // 如果路径包含多层目录，需要提取基础路径
  // 例如: /ppage/index.html -> /ppage/
  // 或: /ppage/about -> /ppage/
  // 或: /projects/ppage/index.html -> /projects/ppage/

  // 移除 index.html
  let base = pathname.replace(/\/index\.html$/, '')

  // 移除路由路径（最后一个路径段）
  // 如果不是以 .html 结尾，可能是 SPA 路由
  if (!pathname.endsWith('.html')) {
    // 获取最后一个 / 之前的部分
    const lastSlashIndex = base.lastIndexOf('/', base.length - 2)
    if (lastSlashIndex > 0) {
      base = base.substring(0, lastSlashIndex)
    } else {
      base = ''
    }
  }

  // 确保以 / 结尾
  if (base && !base.endsWith('/')) {
    base += '/'
  }

  // 确保以 / 开头
  if (base && !base.startsWith('/')) {
    base = '/' + base
  }

  return base || '/'
}

/**
 * 获取静态资源的完整路径
 * 静态资源包括：config.yml, content 目录下的文件等
 *
 * @param {string} relativePath - 相对于 dist 根目录的路径，如 '/config.yml', '/content/pages/about.md'
 * @returns {string} 完整的资源路径
 */
export function getAssetPath(relativePath) {
  const basePath = getBasePath()

  // 移除 relativePath 开头的 /
  const cleanPath = relativePath.startsWith('/')
    ? relativePath.substring(1)
    : relativePath

  // 拼接基础路径
  return basePath + cleanPath
}

/**
 * 获取 React Router 的 basename
 * @returns {string} basename，用于 BrowserRouter
 */
export function getRouterBasename() {
  const basePath = getBasePath()
  // 移除末尾的 /，因为 React Router 不需要
  return basePath === '/' ? undefined : basePath.replace(/\/$/, '')
}
