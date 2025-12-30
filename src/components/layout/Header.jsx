import React from 'react';
import { Link } from 'react-router-dom';
import { useNavigationConfig, useSiteConfig } from '../../config/ConfigContext';
import { ThemeSwitcher } from '../theme/ThemeSwitcher';
import { LanguageSwitcher } from '../theme/LanguageSwitcher';
import { useI18n } from '../../i18n/I18nContext';
import styles from './Header.module.css';

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
              {item.name}
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
