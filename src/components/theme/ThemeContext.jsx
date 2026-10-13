import React, { createContext, useContext, useState, useEffect } from 'react'
import { useThemeConfig } from '../../config/ConfigContext'

// 导入主题 CSS
import '../../themes/light.css'
import '../../themes/dark.css'
import '../../themes/academic.css'
import '../../themes/glass.css'

const ThemeContext = createContext(null)

function getInitialTheme(themeConfig) {
  if (!themeConfig) return null

  // SSR（预渲染）或隐私模式下没有 localStorage
  let savedTheme = null
  try {
    savedTheme = localStorage.getItem('ppage-theme')
  } catch (error) {
    savedTheme = null
  }
  const initialTheme = savedTheme || themeConfig.default

  return themeConfig.available.includes(initialTheme)
    ? initialTheme
    : themeConfig.default
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme)
}

/**
 * 主题提供者组件
 */
export function ThemeProvider({ children }) {
  const themeConfig = useThemeConfig()
  const [currentTheme, setCurrentTheme] = useState(() =>
    getInitialTheme(themeConfig)
  )

  useEffect(() => {
    if (currentTheme) {
      applyTheme(currentTheme)
    }
  }, [currentTheme])

  /**
   * 切换主题
   */
  const switchTheme = theme => {
    if (!themeConfig?.available.includes(theme)) {
      console.warn(`主题 "${theme}" 不在可用列表中`)
      return
    }

    setCurrentTheme(theme)
    applyTheme(theme)
    localStorage.setItem('ppage-theme', theme)
  }

  /**
   * 切换到下一个主题
   */
  const toggleTheme = () => {
    if (!themeConfig || !currentTheme) return

    const currentIndex = themeConfig.available.indexOf(currentTheme)
    const nextIndex = (currentIndex + 1) % themeConfig.available.length
    const nextTheme = themeConfig.available[nextIndex]

    switchTheme(nextTheme)
  }

  const value = {
    currentTheme,
    availableThemes: themeConfig?.available || [],
    switchTheme,
    toggleTheme,
  }

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

/**
 * 使用主题的 Hook
 */
export function useTheme() {
  const context = useContext(ThemeContext)

  if (!context) {
    throw new Error('useTheme 必须在 ThemeProvider 内部使用')
  }

  return context
}
