import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ConfigProvider } from './config/ConfigContext';
import { ThemeProvider } from './components/theme/ThemeContext';
import { I18nProvider } from './i18n/I18nContext';
import { Layout } from './components/layout/Layout';
import { Home } from './pages/Home';
import { About } from './pages/About';
import { Projects } from './pages/Projects';
import { Posts } from './pages/Posts';
import { Files } from './pages/Files';

function App() {
  return (
    <ConfigProvider>
      <I18nProvider>
        <ThemeProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Layout />}>
                <Route index element={<Home />} />
                <Route path="about" element={<About />} />
                <Route path="projects" element={<Projects />} />
                <Route path="posts" element={<Posts />} />
                <Route path="files" element={<Files />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </ThemeProvider>
      </I18nProvider>
    </ConfigProvider>
  );
}

export default App;
