import React from 'react'
import { useSiteConfig, useSocialConfig } from '../../config/ConfigContext'
import { useI18n } from '../../i18n/I18nContext'
import { SocialIcon } from '../common/SocialIcon'
import styles from './Footer.module.css'

/**
 * 页面底部组件
 */
export function Footer() {
  const siteConfig = useSiteConfig()
  const socialLinks = useSocialConfig()
  const { t } = useI18n()
  const currentYear = new Date().getFullYear()

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.content}>
          {/* 社交链接 */}
          {socialLinks && socialLinks.length > 0 && (
            <div className={styles.social}>
              {socialLinks.map((link, index) => (
                <a
                  key={index}
                  href={link.url}
                  className={styles.socialLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={link.name}
                  title={link.name}
                >
                  <SocialIcon icon={link.icon} size={20} />
                  <span className={styles.socialName}>{link.name}</span>
                </a>
              ))}
            </div>
          )}

          {/* 版权信息 */}
          <div className={styles.copyright}>
            <p>
              © {currentYear} {siteConfig?.author || siteConfig?.title}.{' '}
              {t('footer.poweredBy')}{' '}
              <a
                href="https://github.com/mappedinfo/ppage"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.link}
              >
                {t('footer.poweredByLink')}
              </a>
              {t('footer.poweredBySuffix') && ` ${t('footer.poweredBySuffix')}`}
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
