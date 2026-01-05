import { useEffect } from 'react'
import { useSiteConfig } from '../../config/ConfigContext'

/**
 * Favicon 管理器组件
 * 根据配置动态更新网站图标
 */
export function FaviconManager() {
  const siteConfig = useSiteConfig()

  useEffect(() => {
    if (!siteConfig?.favicon) {
      return
    }

    const faviconPath = siteConfig.favicon

    // 查找或创建 favicon link 元素
    let faviconLink = document.querySelector('link[rel="icon"]')

    if (!faviconLink) {
      faviconLink = document.createElement('link')
      faviconLink.rel = 'icon'
      document.head.appendChild(faviconLink)
    }

    // 根据文件扩展名设置正确的 type
    const extension = faviconPath.split('.').pop().toLowerCase()
    let type = 'image/x-icon' // 默认 .ico 格式

    switch (extension) {
      case 'png':
        type = 'image/png'
        break
      case 'svg':
        type = 'image/svg+xml'
        break
      case 'jpg':
      case 'jpeg':
        type = 'image/jpeg'
        break
      case 'gif':
        type = 'image/gif'
        break
      case 'ico':
        type = 'image/x-icon'
        break
      default:
        type = 'image/x-icon'
    }

    faviconLink.type = type
    faviconLink.href = faviconPath
  }, [siteConfig?.favicon])

  return null // 这是一个纯逻辑组件，不渲染任何内容
}
