import { Link } from 'react-router-dom'
import { useNavigationConfig, useSiteConfig } from '../../config/ConfigContext'
import { ThemeSwitcher } from '../theme/ThemeSwitcher'
import { LanguageSwitcher } from '../theme/LanguageSwitcher'
import { HamburgerMenu } from './HamburgerMenu'
import { useI18n } from '../../i18n/I18nContext'
import { getAssetPath } from '../../utils/pathUtils'
import styles from './Header.module.css'

/**
 * 根据路径获取导航项的国际化文本
 * @param {object} item - 导航项
 * @param {Function} t - i18n 翻译函数
 * @returns {string} 翻译后的文本
 */
function getNavigationLabel(item, t) {
  const path = item.path
  // 路径到 i18n key 的映射
  const pathToI18nKey = {
    '/': 'pages.home',
    '/about': 'pages.about',
    '/projects': 'pages.projects',
    '/posts': 'pages.posts',
    '/pages': 'pages.docs',
    '/files': 'pages.files',
    '/news': 'pages.news',
    '/links': 'pages.links',
    '/tutorials': 'pages.tutorials',
    '/development': 'pages.development',
  }

  if (!pathToI18nKey[path]) {
    return item.name || path
  }

  const translated = t(pathToI18nKey[path])
  return translated === pathToI18nKey[path] ? item.name || path : translated
}

function getNavigationPlacement(item) {
  if (['primary', 'menu', 'hidden'].includes(item.placement)) {
    return item.placement
  }

  return item.showInMobile === false ? 'menu' : 'primary'
}

function getReloadDocumentHref(path) {
  if (/^[a-z][a-z0-9+.-]*:/i.test(path)) {
    return path
  }

  return getAssetPath(path)
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
          placement: config.placement,
          showInMobile: config.showInMobile ?? false, // 使用 config 中的配置
          order: config.order ?? 999, // 使用 folderConfig 中的 order
        }
      }),
  ]
    .map(item => ({
      ...item,
      placement: getNavigationPlacement(item),
    }))
    .filter(item => item.placement !== 'hidden')
    .sort((a, b) => {
      // 按 order 字段升序排序
      const orderDiff = (a.order ?? 999) - (b.order ?? 999)
      if (orderDiff !== 0) return orderDiff
      // order 相同时保持相对位置稳定
      return 0
    })

  const primaryNav = allNavigation.filter(item => item.placement === 'primary')
  const menuNav = allNavigation.filter(item => item.placement === 'menu')

  // 为汉堡菜单准备数据
  const hamburgerItems = menuNav.map(item => ({
    path: item.path,
    label: item.isDynamic ? item.name : getNavigationLabel(item, t),
    reloadDocument: item.reloadDocument,
  }))

  const renderNavigationItem = item => {
    const label = item.isDynamic ? item.name : getNavigationLabel(item, t)

    if (item.reloadDocument) {
      return (
        <a
          key={item.path}
          href={getReloadDocumentHref(item.path)}
          className={styles.navLink}
        >
          {label}
        </a>
      )
    }

    return (
      <Link key={item.path} to={item.path} className={styles.navLink}>
        {label}
      </Link>
    )
  }

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <Link to="/" className={styles.logo}>
          {siteConfig?.title || t('pages.home')}
        </Link>

        {/* 主导航 - 仅展示 placement=primary 的项 */}
        <nav className={styles.nav}>{primaryNav.map(renderNavigationItem)}</nav>

        {/* 移动端主导航 - 与桌面端保持同一组 primary 项 */}
        <nav className={styles.mobileNav}>
          {primaryNav.map(renderNavigationItem)}
        </nav>

        <div className={styles.actions}>
          {/* 菜单 - 展示 placement=menu 的项 */}
          <HamburgerMenu items={hamburgerItems} />
          <LanguageSwitcher />
          <ThemeSwitcher />
        </div>
      </div>
    </header>
  )
}
