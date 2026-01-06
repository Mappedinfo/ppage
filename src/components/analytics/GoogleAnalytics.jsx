import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useConfig } from '../../config/ConfigContext'

/**
 * Google Analytics 组件
 * 负责初始化 GA4 并跟踪页面浏览
 *
 * 功能特性:
 * 1. 自动从配置文件读取 GA 测量 ID
 * 2. 支持开发/生产环境区分
 * 3. 自动跟踪页面路由变化
 * 4. 错误处理和环境检测
 */
export function GoogleAnalytics() {
  const { config } = useConfig()
  const location = useLocation()

  // 获取 GA 配置
  const analyticsConfig = config?.analytics || {}
  const measurementId = analyticsConfig.googleAnalytics
  const enableInDev = analyticsConfig.enableInDev || false

  // 检测是否为开发环境
  const isDevelopment =
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname === ''

  // 初始化 Google Analytics
  useEffect(() => {
    // 如果没有配置 GA ID，不执行任何操作
    if (!measurementId) {
      console.log('Google Analytics: 未配置测量ID，跳过初始化')
      return
    }

    // 如果是开发环境且未启用开发环境跟踪，不执行
    if (isDevelopment && !enableInDev) {
      console.log('Google Analytics: 开发环境已禁用，跳过初始化')
      return
    }

    // 检查是否已经加载过 GA 脚本
    if (window.gtag) {
      console.log('Google Analytics: 脚本已加载')
      return
    }

    try {
      // 创建 gtag 函数
      window.dataLayer = window.dataLayer || []
      function gtag() {
        window.dataLayer.push(arguments)
      }
      window.gtag = gtag

      // 初始化 gtag
      gtag('js', new Date())
      gtag('config', measurementId, {
        send_page_view: false, // 禁用自动页面浏览，我们手动跟踪
      })

      // 动态加载 GA 脚本
      const script = document.createElement('script')
      script.async = true
      script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`
      document.head.appendChild(script)

      console.log(`Google Analytics: 初始化成功 (${measurementId})`)
    } catch (error) {
      console.error('Google Analytics: 初始化失败', error)
    }
  }, [measurementId, enableInDev, isDevelopment])

  // 跟踪页面浏览
  useEffect(() => {
    // 确保 GA 已初始化且有测量 ID
    if (!measurementId || !window.gtag) {
      return
    }

    // 如果是开发环境且未启用开发环境跟踪，不发送事件
    if (isDevelopment && !enableInDev) {
      return
    }

    try {
      // 发送页面浏览事件
      const pagePath = location.pathname + location.search + location.hash

      window.gtag('event', 'page_view', {
        page_path: pagePath,
        page_title: document.title,
        page_location: window.location.href,
      })

      console.log(`Google Analytics: 页面浏览跟踪 - ${pagePath}`)
    } catch (error) {
      console.error('Google Analytics: 页面浏览跟踪失败', error)
    }
  }, [location, measurementId, enableInDev, isDevelopment])

  // 这是一个纯逻辑组件，不渲染任何内容
  return null
}

/**
 * 手动发送自定义事件到 Google Analytics
 * @param {string} eventName - 事件名称
 * @param {object} eventParams - 事件参数
 *
 * @example
 * trackEvent('download', { file_name: 'paper.pdf' });
 * trackEvent('click', { button_name: 'contact' });
 */
export function trackEvent(eventName, eventParams = {}) {
  if (!window.gtag) {
    console.warn('Google Analytics: gtag 未初始化，无法发送事件')
    return
  }

  try {
    window.gtag('event', eventName, eventParams)
    console.log(`Google Analytics: 事件跟踪 - ${eventName}`, eventParams)
  } catch (error) {
    console.error('Google Analytics: 事件跟踪失败', error)
  }
}
