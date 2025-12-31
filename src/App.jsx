import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ConfigProvider, useSiteConfig } from './config/ConfigContext';
import { ThemeProvider } from './components/theme/ThemeContext';
import { I18nProvider } from './i18n/I18nContext';
import { Layout } from './components/layout/Layout';
import { Home } from './pages/Home';
import { About } from './pages/About';
import { Projects } from './pages/Projects';
import { Posts } from './pages/Posts';
import { Files } from './pages/Files';
import { News } from './pages/News';

function AppContent() {
  const siteConfig = useSiteConfig();
  
  // 动态设置页面标题
  useEffect(() => {
    if (siteConfig?.title) {
      document.title = siteConfig.title;
    }
  }, [siteConfig?.title]);
  
  // 获取 Vite 配置的基础路径，支持子目录部署
  const basename = import.meta.env.BASE_URL || '/';
  
  return (
    <I18nProvider>
      <ThemeProvider>
        <BrowserRouter basename={basename}>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="about" element={<About />} />
              <Route path="projects" element={<Projects />} />
              <Route path="posts" element={<Posts />} />
              <Route path="files" element={<Files />} />
              <Route path="news" element={<News />} />
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
