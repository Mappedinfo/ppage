import { Link } from 'react-router-dom'
import { useI18n } from '../i18n/I18nContext'
import styles from './NotFound.module.css'

/**
 * 404 页面未找到组件
 */
export function NotFound() {
  const { t } = useI18n()

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.code}>404</div>
        <h1 className={styles.title}>{t('notFound.title')}</h1>
        <p className={styles.description}>{t('notFound.description')}</p>

        <div className={styles.actions}>
          <Link to="/" className={styles.homeButton}>
            {t('notFound.backHome')}
          </Link>
          <button
            onClick={() => window.history.back()}
            className={styles.backButton}
          >
            {t('notFound.goBack')}
          </button>
        </div>

        <div className={styles.illustration}>
          <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
            <circle
              cx="100"
              cy="100"
              r="80"
              fill="var(--theme-primary-light)"
              opacity="0.1"
            />
            <path
              d="M 70 80 Q 100 60 130 80"
              stroke="var(--theme-primary)"
              strokeWidth="4"
              fill="none"
              strokeLinecap="round"
            />
            <circle cx="80" cy="90" r="8" fill="var(--theme-primary)" />
            <circle cx="120" cy="90" r="8" fill="var(--theme-primary)" />
            <path
              d="M 70 130 Q 100 145 130 130"
              stroke="var(--theme-primary)"
              strokeWidth="4"
              fill="none"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>
    </div>
  )
}
