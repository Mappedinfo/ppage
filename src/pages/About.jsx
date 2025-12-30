import React from 'react';
import { useProfileConfig, useConfig } from '../config/ConfigContext';
import { useI18n } from '../i18n/I18nContext';
import styles from './About.module.css';

/**
 * 关于页面组件
 */
export function About() {
  const profile = useProfileConfig();
  const { config } = useConfig();
  const { t, language } = useI18n();

  // 从配置中获取自定义内容（如果有）
  const siteDescription = config?.pageContent?.about?.siteDescription?.[language] 
    || t('about.siteDescription');

  return (
    <div className={styles.about}>
      <h1 className={styles.title}>{t('about.title')}</h1>
      
      <div className={styles.content}>
        <section className={styles.section}>
          <h2 className={styles.subtitle}>{t('about.bioTitle')}</h2>
          <p className={styles.text}>{profile?.bio || t('about.bioDefault')}</p>
        </section>

        {profile?.email && (
          <section className={styles.section}>
            <h2 className={styles.subtitle}>{t('about.contactTitle')}</h2>
            <p className={styles.text}>
              {t('about.emailLabel')}: <a href={`mailto:${profile.email}`} className={styles.link}>
                {profile.email}
              </a>
            </p>
          </section>
        )}

        <section className={styles.section}>
          <h2 className={styles.subtitle}>{t('about.siteTitle')}</h2>
          <p className={styles.text}>
            {siteDescription}
          </p>
        </section>
      </div>
    </div>
  );
}
