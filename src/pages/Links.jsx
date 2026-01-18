import React from 'react'
import { useConfig } from '../config/ConfigContext'
import { useI18n } from '../i18n/I18nContext'
import styles from './Links.module.css'

/**
 * 友情链接页面组件
 */
export function Links() {
  const { config } = useConfig()
  const { t } = useI18n()
  const links = config?.links || []

  return (
    <div className={styles.links}>
      <h1 className={styles.title}>{t('links.title')}</h1>

      {links.length === 0 ? (
        <div className={styles.emptyContainer}>
          <p className={styles.empty}>{t('links.empty')}</p>
          <p className={styles.emptyHint}>{t('links.emptyHint')}</p>
        </div>
      ) : (
        <div className={styles.grid}>
          {links.map((link, index) => (
            <article key={index} className={styles.card}>
              {link.avatar && (
                <div className={styles.avatarContainer}>
                  <img
                    src={link.avatar}
                    alt={link.name}
                    className={styles.avatar}
                    onError={e => {
                      // 如果图片加载失败，隐藏图片容器
                      e.target.style.display = 'none'
                    }}
                  />
                </div>
              )}

              <div className={styles.content}>
                <h2 className={styles.name}>{link.name}</h2>

                {link.description && (
                  <p className={styles.description}>{link.description}</p>
                )}

                {link.tags && link.tags.length > 0 && (
                  <div className={styles.tags}>
                    {link.tags.map((tag, tagIndex) => (
                      <span key={tagIndex} className={styles.tag}>
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {link.url && (
                  <a
                    href={link.url}
                    className={styles.linkButton}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {t('links.visitSite')}
                  </a>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
