import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { getAssetPath } from '../../utils/pathUtils'
import styles from './HamburgerMenu.module.css'

function getReloadDocumentHref(path) {
  if (/^[a-z][a-z0-9+.-]*:/i.test(path)) {
    return path
  }

  return getAssetPath(path)
}

/**
 * 汉堡菜单组件
 * @param {Array} items - 菜单项数组
 * @param {Function} onItemClick - 点击菜单项的回调
 */
export function HamburgerMenu({ items = [], onItemClick }) {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef(null)

  // 切换菜单状态
  const toggleMenu = () => {
    setIsOpen(!isOpen)
  }

  // 关闭菜单
  const closeMenu = () => {
    setIsOpen(false)
  }

  // 点击菜单项
  const handleItemClick = item => {
    closeMenu()
    if (onItemClick) {
      onItemClick(item)
    }
  }

  // 点击外部区域关闭菜单
  useEffect(() => {
    const handleClickOutside = event => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        closeMenu()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('touchstart', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('touchstart', handleClickOutside)
    }
  }, [isOpen])

  // ESC 键关闭菜单
  useEffect(() => {
    const handleEscape = event => {
      if (event.key === 'Escape') {
        closeMenu()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen])

  if (!items || items.length === 0) {
    return null
  }

  return (
    <div className={styles.hamburgerContainer} ref={menuRef}>
      {/* 汉堡按钮 */}
      <button
        className={`${styles.hamburgerButton} ${isOpen ? styles.open : ''}`}
        onClick={toggleMenu}
        aria-label="菜单"
        aria-expanded={isOpen}
      >
        <span className={styles.line}></span>
        <span className={styles.line}></span>
        <span className={styles.line}></span>
      </button>

      {/* 下拉菜单 */}
      {isOpen && (
        <div className={styles.dropdownMenu}>
          {items.map(item =>
            item.reloadDocument ? (
              <a
                key={item.path}
                href={getReloadDocumentHref(item.path)}
                className={styles.menuItem}
                onClick={() => handleItemClick(item)}
              >
                {item.label}
              </a>
            ) : (
              <Link
                key={item.path}
                to={item.path}
                className={styles.menuItem}
                onClick={() => handleItemClick(item)}
              >
                {item.label}
              </Link>
            )
          )}
        </div>
      )}
    </div>
  )
}
