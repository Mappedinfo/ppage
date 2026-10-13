import React, { createContext, useContext, useState } from 'react'
import { useConfig } from '../config/ConfigContext'
import { DEFAULT_LANGUAGE, SUPPORTED_LANGUAGES, t as translate } from './index'

/**
 * I18n Context
 */
const I18nContext = createContext()

/**
 * 本地存储的键名
 */
const STORAGE_KEY = 'ppage_language'

function getConfiguredDefaultLanguage(config) {
  const configuredLanguage = config?.language?.default
  return SUPPORTED_LANGUAGES.includes(configuredLanguage)
    ? configuredLanguage
    : DEFAULT_LANGUAGE
}

/**
 * I18n Provider 组件
 */
export function I18nProvider({ children }) {
  const { config } = useConfig()
  const configuredDefaultLanguage = getConfiguredDefaultLanguage(config)

  // 初始化语言：优先从 localStorage 读取，其次使用配置默认语言
  const [language, setLanguage] = useState(() => {
    try {
      const saved =
        typeof localStorage !== 'undefined'
          ? localStorage.getItem(STORAGE_KEY)
          : null
      return saved && SUPPORTED_LANGUAGES.includes(saved)
        ? saved
        : configuredDefaultLanguage
    } catch (error) {
      console.error('Failed to load language from localStorage:', error)
      return configuredDefaultLanguage
    }
  })

  /**
   * 切换语言
   */
  const switchLanguage = lang => {
    if (!SUPPORTED_LANGUAGES.includes(lang)) {
      console.warn(`Unsupported language: ${lang}`)
      return
    }

    setLanguage(lang)

    // 保存到 localStorage
    try {
      localStorage.setItem(STORAGE_KEY, lang)
    } catch (error) {
      console.error('Failed to save language to localStorage:', error)
    }
  }

  /**
   * 翻译函数
   */
  const t = (key, params) => {
    return translate(language, key, params)
  }

  const value = {
    language,
    switchLanguage,
    t,
  }

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

/**
 * 使用 I18n 的 Hook
 */
export function useI18n() {
  const context = useContext(I18nContext)
  if (!context) {
    throw new Error('useI18n must be used within I18nProvider')
  }
  return context
}
