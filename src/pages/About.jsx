import React, { useState, useEffect } from 'react';
import { useProfileConfig, useConfig } from '../config/ConfigContext';
import { useI18n } from '../i18n/I18nContext';
import { MarkdownRenderer } from '../components/markdown/MarkdownRenderer';
import { loadI18nMarkdown } from '../utils/i18nMarkdown';
import styles from './About.module.css';

/**
 * 关于页面组件
 * 支持从 Markdown 文件加载"关于本站"内容
 */
export function About() {
  const profile = useProfileConfig();
  const { config } = useConfig();
  const { t, language } = useI18n();
  const [siteMarkdown, setSiteMarkdown] = useState(null);
  const [loading, setLoading] = useState(true);

  // 加载"关于本站"的 Markdown 内容
  useEffect(() => {
    async function loadSiteDescription() {
      setLoading(true);
      try {
        // 获取 base 路径并构建正确的文件路径
        const base = import.meta.env.BASE_URL || '/';
        const relativePath = '/content/pages/about-site';
        const basePath = base === '/' ? relativePath : base + relativePath.replace(/^\//, '');
        // 尝试从 Markdown 文件加载
        const markdown = await loadI18nMarkdown(basePath, language);
        setSiteMarkdown(markdown);
      } catch (error) {
        console.error('加载关于本站内容失败:', error);
        setSiteMarkdown(null);
      } finally {
        setLoading(false);
      }
    }
    
    loadSiteDescription();
  }, [language]);

  // 获取"关于本站"内容（优先级：Markdown文件 > 配置文件 > 翻译）
  const getSiteDescription = () => {
    if (siteMarkdown) {
      return { type: 'markdown', content: siteMarkdown };
    }
    const configDescription = config?.pageContent?.about?.siteDescription?.[language];
    if (configDescription) {
      return { type: 'text', content: configDescription };
    }
    return { type: 'text', content: t('about.siteDescription') };
  };

  const siteDescription = getSiteDescription();

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
          {loading ? (
            <p className={styles.text}>{t('common.loading')}</p>
          ) : siteDescription.type === 'markdown' ? (
            <div className={styles.markdownContent}>
              <MarkdownRenderer content={siteDescription.content} />
            </div>
          ) : (
            <p className={styles.text}>{siteDescription.content}</p>
          )}
        </section>
      </div>
    </div>
  );
}
