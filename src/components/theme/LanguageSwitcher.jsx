import React from 'react';
import { useI18n } from '../../i18n/I18nContext';
import { SUPPORTED_LANGUAGES } from '../../i18n';
import styles from './LanguageSwitcher.module.css';

/**
 * 语言切换器组件
 */
export function LanguageSwitcher() {
  const { language, switchLanguage, t } = useI18n();

  return (
    <div className={styles.languageSwitcher}>
      <select
        value={language}
        onChange={(e) => switchLanguage(e.target.value)}
        className={styles.select}
        aria-label="Switch Language"
      >
        {SUPPORTED_LANGUAGES.map((lang) => (
          <option key={lang} value={lang}>
            {t(`language.${lang}`)}
          </option>
        ))}
      </select>
    </div>
  );
}
