/**
 * 路径工具函数
 * 用于处理相对路径部署时的资源路径计算
 */

/**
 * 页面加载时的 pathname（模块求值时记录，早于 main.jsx 中的深链恢复）。
 * 404 深链恢复会改写地址栏；若之后仍从当前地址推断 base，多级路径会得到错误的
 * 部署前缀，导致 config.yml 等资源 404。因此 base 推断必须以加载时的地址为准。
 */
const LOAD_TIME_PATHNAME =
  typeof window !== 'undefined' ? window.location.pathname : '/'

/**
 * 获取当前应用的基础路径
 * 通过检测 script 标签的 src 属性来推断部署路径
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

  // 生产环境：从 script 标签的 src 属性推断 base 路径
  // 因为 Vite 构建时使用了相对路径，script src 会是 './assets/index-xxx.js'
  // 我们需要从当前 URL 和 HTML 位置计算 base

  const pathname = LOAD_TIME_PATHNAME

  console.log('[pathUtils] Detecting base path...')
  console.log('[pathUtils] Current pathname:', pathname)

  // 如果 pathname 是 '/' 或 '/index.html'，说明在根目录
  if (pathname === '/' || pathname === '/index.html') {
    console.log('[pathUtils] Detected root deployment')
    return '/'
  }

  // 对于其他路径，需要区分 index.html 和 SPA 路由

  // 如果路径以 / 结尾且不包含 .html，可能是目录访问（如 /ppage/）
  // 这是 index.html 所在的目录
  if (pathname.endsWith('/') && !pathname.includes('.html')) {
    console.log('[pathUtils] Detected directory access:', pathname)
    return pathname
  }

  // 如果路径是 /ppage/index.html，提取 /ppage/
  if (pathname.endsWith('/index.html')) {
    const base = pathname.replace(/\/index\.html$/, '/')
    console.log('[pathUtils] Detected index.html in subdirectory:', base)
    return base
  }

  // 对于 SPA 路由（如 /ppage/about），需要找到 index.html 所在的目录
  // 这里我们假设 index.html 在第一层子目录（如 /ppage/）
  const segments = pathname.split('/').filter(s => s)

  console.log('[pathUtils] Path segments:', segments)

  if (segments.length === 0) {
    console.log('[pathUtils] No segments, assuming root')
    return '/'
  }

  // 如果只有一层（如 /about），说明 index.html 在根目录
  if (segments.length === 1) {
    console.log(
      '[pathUtils] Single segment, assuming root deployment with SPA route'
    )
    return '/'
  }

  // 如果有多层（如 /ppage/about 或 /projects/ppage/docs）
  // 我们假设 index.html 在第一层子目录
  const base = '/' + segments[0] + '/'
  console.log('[pathUtils] Multiple segments, detected base:', base)
  return base
}

/**
 * 获取静态资源的完整路径
 * 静态资源包括：config.yml, content 目录下的文件等
 *
 * 注意：使用绝对路径 + base 前缀的方式，确保资源正确加载
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

  // 拼接基础路径（绝对路径）
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
