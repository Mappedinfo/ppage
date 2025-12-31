import React from 'react';
import { Link } from 'react-router-dom';
import { useNavigationConfig, useSiteConfig } from '../../config/ConfigContext';
import { ThemeSwitcher } from '../theme/ThemeSwitcher';
import { LanguageSwitcher } from '../theme/LanguageSwitcher';
import { useI18n } from '../../i18n/I18nContext';
import styles from './Header.module.css';

/**
 * 根据路径获取导航项的国际化文本
 * @param {string} path - 路由路径
 * @param {Function} t - i18n 翻译函数
 * @returns {string} 翻译后的文本
 */
function getNavigationLabel(path, t) {
  // 路径到 i18n key 的映射
  const pathToI18nKey = {
    '/': 'pages.home',
    '/about': 'pages.about',
    '/projects': 'pages.projects',
    '/posts': 'pages.posts',
    '/files': 'pages.files',
    '/news': 'pages.news',
  };

  return t(pathToI18nKey[path]) || path;
}

/**
 * 页面头部导航组件
 */
export function Header() {
  const navigation = useNavigationConfig();
  const siteConfig = useSiteConfig();
  const { t } = useI18n();

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <Link to="/" className={styles.logo}>
          {siteConfig?.title || t('pages.home')}
        </Link>

        <nav className={styles.nav}>
          {navigation.map((item) => (
            <Link 
              key={item.path} 
              to={item.path} 
              className={styles.navLink}
            >
              {getNavigationLabel(item.path, t)}
            </Link>
          ))}
        </nav>

        <div className={styles.actions}>
          <LanguageSwitcher />
          <ThemeSwitcher />
        </div>
      </div>
    </header>
  );
}
