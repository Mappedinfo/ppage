import React, { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { ConfigProvider, useConfig } from './config/ConfigContext'
import { ThemeProvider } from './components/theme/ThemeContext'
import { I18nProvider, useI18n } from './i18n/I18nContext'
import { Layout } from './components/layout/Layout'
import { FaviconManager } from './components/common/FaviconManager'
import { Home } from './pages/Home'
import { About } from './pages/About'
import { Projects } from './pages/Projects'
import { Posts } from './pages/Posts'
import { Pages } from './pages/Pages'
import { Files } from './pages/Files'
import { News } from './pages/News'
import { NotFound } from './pages/NotFound'
import { DynamicDocumentPage } from './pages/DynamicDocumentPage'
import { generateFolderConfigs } from './utils/folderScanner'
import { getRouterBasename } from './utils/pathUtils'

/**
 * 页面标题管理组件
 * 监听路由变化，动态更新页面标题为：主标题 - 当前页面
 */
function DocumentTitleManager({ folderConfigs }) {
  const location = useLocation()
  const { config } = useConfig()
  const { t } = useI18n()
  const siteTitle = config?.site?.title || '个人主页'

  useEffect(() => {
    // 获取当前路径（去除开头的 /）
    const pathname = location.pathname.replace(/^\/*/, '')

    // 根据路径确定页面标题
    let pageTitle = ''

    if (!pathname || pathname === '') {
      // 首页
      pageTitle = t('pages.home')
    } else if (pathname === 'about') {
      pageTitle = t('pages.about')
    } else if (pathname === 'projects') {
      pageTitle = t('pages.projects')
    } else if (pathname === 'posts') {
      pageTitle = t('pages.posts')
    } else if (pathname === 'pages') {
      pageTitle = t('pages.docs')
    } else if (pathname === 'files') {
      pageTitle = t('pages.files')
    } else if (pathname === 'news') {
      pageTitle = t('pages.news')
    } else {
      // 检查是否是动态生成的文档集合页面
      const folderConfig = folderConfigs.find(cfg => cfg.name === pathname)
      if (folderConfig) {
        pageTitle = folderConfig.title || pathname
      } else {
        // 未知页面，使用路径作为标题
        pageTitle = pathname
      }
    }

    // 更新文档标题
    if (pageTitle) {
      document.title = `${siteTitle} - ${pageTitle}`
    } else {
      document.title = siteTitle
    }
  }, [location.pathname, siteTitle, folderConfigs, t])

  return null // 这是一个纯逻辑组件，不渲染任何内容
}

function AppContent() {
  const { config } = useConfig() // 获取完整的配置对象
  const [folderConfigs, setFolderConfigs] = useState([])
  const [loading, setLoading] = useState(true)

  // 加载文件夹配置
  useEffect(() => {
    async function loadConfigs() {
      try {
        // 传递完整的 config 给 folderScanner
        const configs = await generateFolderConfigs(config)
        // 过滤掉 posts 和 pages，它们已经有专门的页面
        const dynamicConfigs = configs.filter(
          config =>
            config.name !== 'posts' &&
            config.name !== 'pages' &&
            config.name !== 'files'
        )
        setFolderConfigs(dynamicConfigs)
      } catch (error) {
        console.error('加载文件夹配置失败:', error)
      } finally {
        setLoading(false)
      }
    }

    // 只有当 config 加载完成后才执行
    if (config) {
      loadConfigs()
    }
  }, [config])

  // 使用自动计算的 basename，适配任意部署路径
  const basename = getRouterBasename()

  return (
    <I18nProvider>
      <ThemeProvider>
        {/* Favicon 管理 */}
        <FaviconManager />

        <BrowserRouter basename={basename}>
          {/* 页面标题管理 */}
          <DocumentTitleManager folderConfigs={folderConfigs} />

          <Routes>
            <Route path="/" element={<Layout folderConfigs={folderConfigs} />}>
              <Route index element={<Home />} />
              <Route path="about" element={<About />} />
              <Route path="projects" element={<Projects />} />
              <Route path="posts" element={<Posts />} />
              <Route path="pages" element={<Pages />} />
              <Route path="files" element={<Files />} />
              <Route path="news" element={<News />} />

              {/* 动态生成的路由 - 始终渲染，即使 loading */}
              {folderConfigs.map(config => (
                <Route
                  key={config.name}
                  path={config.name}
                  element={<DynamicDocumentPage config={config} />}
                />
              ))}

              {/* 404 页面 - 必须放在最后 */}
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </I18nProvider>
  )
}

function App() {
  return (
    <ConfigProvider>
      <AppContent />
    </ConfigProvider>
  )
}

export default App
