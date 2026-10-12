/**
 * GitHub Pages 没有服务端重写规则。public/404.html 会把请求路径写入
 * sessionStorage（键 redirectPath）后跳回站点根目录；应用启动时调用本函数，
 * 把地址栏恢复为原路径，让 React Router 渲染对应页面。
 */

export const REDIRECT_PATH_KEY = 'redirectPath'

/**
 * 若存在 404.html 暂存的路径，则恢复到地址栏。无论是否恢复，都会清除该键，
 * 保证同一次暂存只被消费一次。
 *
 * @param {Storage} storage - 通常为 window.sessionStorage
 * @param {History} history - 通常为 window.history
 * @param {Location} location - 通常为 window.location
 * @returns {boolean} 是否改写了地址栏
 */
export function restoreRedirectPath(storage, history, location) {
  let target = null
  try {
    target = storage.getItem(REDIRECT_PATH_KEY)
    storage.removeItem(REDIRECT_PATH_KEY)
  } catch {
    return false
  }

  // 只接受站内绝对路径，拒绝协议相对地址（//host）及其他形式
  if (
    typeof target !== 'string' ||
    !target.startsWith('/') ||
    target.startsWith('//')
  ) {
    return false
  }

  const current = location.pathname + location.search + location.hash
  if (target === current) return false

  history.replaceState(history.state, '', target)
  return true
}
