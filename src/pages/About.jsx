import React, { useState, useEffect } from 'react'
import { useProfileConfig, useConfig } from '../config/ConfigContext'
import { useI18n } from '../i18n/I18nContext'
import { MarkdownRenderer } from '../components/markdown/MarkdownRenderer'
import { loadI18nMarkdown } from '../utils/i18nMarkdown'
import styles from './About.module.css'

/**
 * 关于页面组件
 * 支持从 Markdown 文件加载"关于我"和"关于本站"内容
 */
export function About() {
  const profile = useProfileConfig()
  const { config } = useConfig()
  const { t, language } = useI18n()
  const [aboutMarkdown, setAboutMarkdown] = useState(null)
  const [siteMarkdown, setSiteMarkdown] = useState(null)
  const [loading, setLoading] = useState(true)

  // 加载"关于我"和"关于本站"的 Markdown 内容
  useEffect(() => {
    async function loadMarkdownContent() {
      setLoading(true)
      try {
        // content 目录是静态资源，始终从根路径访问，不需要 base 前缀

        // 加载"关于我"内容
        try {
          const aboutPath = '/content/pages/about'
          const aboutMd = await loadI18nMarkdown(aboutPath, language)
          setAboutMarkdown(aboutMd)
        } catch (error) {
          console.log('未找到关于我的 Markdown 文件，将使用配置文件内容')
          setAboutMarkdown(null)
        }

        // 加载"关于本站"内容
        try {
          const sitePath = '/content/pages/about-site'
          const siteMd = await loadI18nMarkdown(sitePath, language)
          setSiteMarkdown(siteMd)
        } catch (error) {
          console.log('未找到关于本站的 Markdown 文件')
          setSiteMarkdown(null)
        }
      } catch (error) {
        console.error('加载内容失败:', error)
      } finally {
        setLoading(false)
      }
    }

    loadMarkdownContent()
  }, [language])

  // 获取"关于本站"内容（优先级：Markdown文件 > 配置文件 > 翻译）
  const getSiteDescription = () => {
    if (siteMarkdown) {
      return { type: 'markdown', content: siteMarkdown }
    }
    const configDescription =
      config?.pageContent?.about?.siteDescription?.[language]
    if (configDescription) {
      return { type: 'text', content: configDescription }
    }
    return { type: 'text', content: t('about.siteDescription') }
  }

  const siteDescription = getSiteDescription()

  return (
    <div className={styles.about}>
      {loading ? (
        <p className={styles.text}>{t('common.loading')}</p>
      ) : (
        <>
          {/* 关于我部分 - 优先使用 Markdown，否则使用配置 */}
          {aboutMarkdown ? (
            <MarkdownRenderer content={aboutMarkdown} />
          ) : (
            <>
              <h1 className={styles.title}>{t('about.title')}</h1>
              <div className={styles.content}>
                <section className={styles.section}>
                  <h2 className={styles.subtitle}>{t('about.bioTitle')}</h2>
                  <p className={styles.text}>
                    {profile?.bio || t('about.bioDefault')}
                  </p>
                </section>

                {profile?.email && (
                  <section className={styles.section}>
                    <h2 className={styles.subtitle}>
                      {t('about.contactTitle')}
                    </h2>
                    <p className={styles.text}>
                      {t('about.emailLabel')}:{' '}
                      <a
                        href={`mailto:${profile.email}`}
                        className={styles.link}
                      >
                        {profile.email}
                      </a>
                    </p>
                  </section>
                )}
              </div>
            </>
          )}

          {/* 关于本站部分 */}
          {siteMarkdown && (
            <div className={styles.siteSection}>
              <MarkdownRenderer content={siteMarkdown} />
            </div>
          )}

          {!siteMarkdown && siteDescription.content && (
            <section className={styles.section}>
              <h2 className={styles.subtitle}>{t('about.siteTitle')}</h2>
              {siteDescription.type === 'markdown' ? (
                <MarkdownRenderer content={siteDescription.content} />
              ) : (
                <p className={styles.text}>{siteDescription.content}</p>
              )}
            </section>
          )}
        </>
      )}
    </div>
  )
}
