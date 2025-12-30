import React, { createContext, useContext, useState, useEffect } from 'react';
import { DEFAULT_LANGUAGE, SUPPORTED_LANGUAGES, t as translate } from './index';

/**
 * I18n Context
 */
const I18nContext = createContext();

/**
 * 本地存储的键名
 */
const STORAGE_KEY = 'ppage_language';

/**
 * I18n Provider 组件
 */
export function I18nProvider({ children }) {
  // 初始化语言：优先从 localStorage 读取，其次使用默认语言
  const [language, setLanguage] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved && SUPPORTED_LANGUAGES.includes(saved) ? saved : DEFAULT_LANGUAGE;
    } catch (error) {
      console.error('Failed to load language from localStorage:', error);
      return DEFAULT_LANGUAGE;
    }
  });

  /**
   * 切换语言
   */
  const switchLanguage = (lang) => {
    if (!SUPPORTED_LANGUAGES.includes(lang)) {
      console.warn(`Unsupported language: ${lang}`);
      return;
    }
    
    setLanguage(lang);
    
    // 保存到 localStorage
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch (error) {
      console.error('Failed to save language to localStorage:', error);
    }
  };

  /**
   * 翻译函数
   */
  const t = (key, params) => {
    return translate(language, key, params);
  };

  const value = {
    language,
    switchLanguage,
    t,
  };

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

/**
 * 使用 I18n 的 Hook
 */
export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within I18nProvider');
  }
  return context;
}
