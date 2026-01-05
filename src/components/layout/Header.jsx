import { Link } from 'react-router-dom'
import { useNavigationConfig, useSiteConfig } from '../../config/ConfigContext'
import { ThemeSwitcher } from '../theme/ThemeSwitcher'
import { LanguageSwitcher } from '../theme/LanguageSwitcher'
import { HamburgerMenu } from './HamburgerMenu'
import { useI18n } from '../../i18n/I18nContext'
import styles from './Header.module.css'

/**
 * 根据路径获取导航项的国际化文本
 * @param {string} path - 路由路径
 * @param {Function} t - i18n 翻译函数
 * @returns {string} 翻译后的文本
 */
function getNavigationLabel(path, t) {
  // 路径到 i18n key 的映射
  const pathToI18nKey = {
    '/': 'pages.home',
    '/about': 'pages.about',
    '/projects': 'pages.projects',
    '/posts': 'pages.posts',
    '/pages': 'pages.docs',
    '/files': 'pages.files',
    '/news': 'pages.news',
    '/tutorials': 'pages.tutorials',
    '/development': 'pages.development',
  }

  return t(pathToI18nKey[path]) || path
}

/**
 * 页面头部导航组件
 */
export function Header({ folderConfigs = [] }) {
  const navigation = useNavigationConfig()
  const siteConfig = useSiteConfig()
  const { t } = useI18n()

  // 合并静态导航和动态生成的导航
  const allNavigation = [
    // 静态导航项，添加默认顺序索引
    ...navigation.map((item, index) => ({
      ...item,
      order: item.order ?? 999 + index, // 未设置 order 时使用大数值 + 索引保持原顺序
    })),
    // 动态文件夹导航项
    ...folderConfigs
      .filter(config => config.showInNavigation !== false) // 过滤不显示的项
      .map(config => {
        // 尝试使用 i18n 翻译，如果没有则使用 index.md 中的 title
        const i18nKey = `pages.${config.name}`
        const translatedTitle = t(i18nKey)

        return {
          name: translatedTitle === i18nKey ? config.title : translatedTitle,
          path: `/${config.name}`,
          isDynamic: true,
          showInMobile: config.showInMobile ?? false, // 使用 config 中的配置
          order: config.order ?? 999, // 使用 folderConfig 中的 order
        }
      }),
  ].sort((a, b) => {
    // 按 order 字段升序排序
    const orderDiff = (a.order ?? 999) - (b.order ?? 999)
    if (orderDiff !== 0) return orderDiff
    // order 相同时保持相对位置稳定
    return 0
  })

  // 分离移动端显示和汉堡菜单中的导航项
  const mobileVisibleNav = allNavigation.filter(
    item => item.showInMobile !== false
  )
  const hamburgerNav = allNavigation.filter(item => item.showInMobile === false)

  // 为汉堡菜单准备数据
  const hamburgerItems = hamburgerNav.map(item => ({
    path: item.path,
    label: item.isDynamic ? item.name : getNavigationLabel(item.path, t),
  }))

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <Link to="/" className={styles.logo}>
          {siteConfig?.title || t('pages.home')}
        </Link>

        {/* 桌面端导航 - 显示所有导航项 */}
        <nav className={styles.nav}>
          {allNavigation.map(item => (
            <Link key={item.path} to={item.path} className={styles.navLink}>
              {item.isDynamic ? item.name : getNavigationLabel(item.path, t)}
            </Link>
          ))}
        </nav>

        {/* 移动端导航 - 只显示配置为 showInMobile 的项 */}
        <nav className={styles.mobileNav}>
          {mobileVisibleNav.map(item => (
            <Link key={item.path} to={item.path} className={styles.navLink}>
              {item.isDynamic ? item.name : getNavigationLabel(item.path, t)}
            </Link>
          ))}
        </nav>

        <div className={styles.actions}>
          {/* 汉堡菜单 - 仅在移动端显示 */}
          <HamburgerMenu items={hamburgerItems} />
          <LanguageSwitcher />
          <ThemeSwitcher />
        </div>
      </div>
    </header>
  )
}
