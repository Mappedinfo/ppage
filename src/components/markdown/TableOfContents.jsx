import { useState, useEffect, useMemo } from 'react'
import { extractHeadings } from '../../utils/markdown'
import styles from './TableOfContents.module.css'

/**
 * 目录（Table of Contents）组件
 * @param {Object} props
 * @param {string} props.content - Markdown 内容
 * @param {string} props.title - 目录标题
 */
export function TableOfContents({ content, title = '目录' }) {
  const [activeId, setActiveId] = useState('')

  // 使用 useMemo 提取标题，避免在 effect 中设置状态
  const headings = useMemo(() => {
    if (!content) {
      return []
    }
    return extractHeadings(content)
  }, [content])

  // 监听滚动，高亮当前章节
  useEffect(() => {
    if (headings.length === 0) return

    const handleScroll = () => {
      const scrollPosition = window.scrollY + 100 // 偏移量

      // 找到当前可见的标题
      for (let i = headings.length - 1; i >= 0; i--) {
        const heading = headings[i]
        const element = document.getElementById(heading.slug)

        if (element && element.offsetTop <= scrollPosition) {
          setActiveId(heading.slug)
          break
        }
      }
    }

    window.addEventListener('scroll', handleScroll)
    handleScroll() // 初始化

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [headings])

  // 点击目录项，平滑滚动到对应位置
  const handleClick = (e, slug) => {
    e.preventDefault()
    const element = document.getElementById(slug)
    if (element) {
      const offset = 80 // 顶部导航栏高度
      const elementPosition = element.offsetTop - offset
      window.scrollTo({
        top: elementPosition,
        behavior: 'smooth',
      })
      setActiveId(slug)
    }
  }

  if (headings.length === 0) {
    return null
  }

  return (
    <nav className={styles.toc}>
      <h3 className={styles.title}>{title}</h3>
      <ul className={styles.list}>
        {headings.map((heading, index) => (
          <li
            key={index}
            className={`${styles.item} ${styles[`level${heading.level}`]} ${
              activeId === heading.slug ? styles.active : ''
            }`}
          >
            <a
              href={`#${heading.slug}`}
              onClick={e => handleClick(e, heading.slug)}
              className={styles.link}
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
