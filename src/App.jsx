import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ConfigProvider, useSiteConfig } from './config/ConfigContext';
import { ThemeProvider } from './components/theme/ThemeContext';
import { I18nProvider } from './i18n/I18nContext';
import { Layout } from './components/layout/Layout';
import { Home } from './pages/Home';
import { About } from './pages/About';
import { Projects } from './pages/Projects';
import { Posts } from './pages/Posts';
import { Pages } from './pages/Pages';
import { Files } from './pages/Files';
import { News } from './pages/News';
import { DynamicDocumentPage } from './pages/DynamicDocumentPage';
import { generateFolderConfigs } from './utils/folderScanner';

function AppContent() {
  const siteConfig = useSiteConfig();
  const [folderConfigs, setFolderConfigs] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // 动态设置页面标题
  useEffect(() => {
    if (siteConfig?.title) {
      document.title = siteConfig.title;
    }
  }, [siteConfig?.title]);
  
  // 加载文件夹配置
  useEffect(() => {
    async function loadConfigs() {
      try {
        const configs = await generateFolderConfigs();
        // 过滤掉 posts 和 pages，它们已经有专门的页面
        const dynamicConfigs = configs.filter(
          config => config.name !== 'posts' && config.name !== 'pages' && config.name !== 'files'
        );
        setFolderConfigs(dynamicConfigs);
      } catch (error) {
        console.error('加载文件夹配置失败:', error);
      } finally {
        setLoading(false);
      }
    }
    loadConfigs();
  }, []);
  
  // 获取 Vite 配置的基础路径，支持子目录部署
  const basename = import.meta.env.BASE_URL || '/';
  
  return (
    <I18nProvider>
      <ThemeProvider>
        <BrowserRouter basename={basename}>
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
            </Route>
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </I18nProvider>
  );
}

function App() {
  return (
    <ConfigProvider>
      <AppContent />
    </ConfigProvider>
  );
}

export default App;
