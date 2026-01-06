import React from 'react'
import { trackEvent } from '../analytics/GoogleAnalytics'
import styles from './DownloadButton.module.css'

/**
 * 文件下载按钮组件
 */
export function DownloadButton({ file, variant = 'primary', size = 'medium' }) {
  if (!file || !file.path) {
    return null
  }

  const { title, path, description, size: fileSize, type } = file

  // 获取完整的文件路径
  // 注意：静态资源从根路径访问，不需要 base 前缀
  const getFullPath = filePath => {
    // 如果是外部 URL，直接返回
    if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
      return filePath
    }
    // 本地文件，确保以 / 开头
    return filePath.startsWith('/') ? filePath : `/${filePath}`
  }

  // 获取文件图标
  const getFileIcon = () => {
    switch (type) {
      case 'pdf':
        return '📄'
      case 'document':
        return '📝'
      case 'archive':
        return '📦'
      case 'image':
        return '🖼️'
      default:
        return '📁'
    }
  }

  // 处理下载点击事件
  const handleDownloadClick = () => {
    // 发送 Google Analytics 事件
    trackEvent('file_download', {
      file_name: title || path,
      file_type: type || 'unknown',
      file_path: path,
    })
  }

  return (
    <a
      href={getFullPath(path)}
      download
      className={`${styles.downloadButton} ${styles[variant]} ${styles[size]}`}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleDownloadClick}
    >
      <span className={styles.icon}>{getFileIcon()}</span>
      <div className={styles.content}>
        <div className={styles.title}>{title}</div>
        {description && <div className={styles.description}>{description}</div>}
        {fileSize && <div className={styles.size}>{fileSize}</div>}
      </div>
      <span className={styles.downloadIcon}>⬇</span>
    </a>
  )
}

/**
 * 文件列表组件
 */
export function FileList({ files }) {
  if (!files || files.length === 0) {
    return (
      <div className={styles.emptyState}>
        <p>暂无文件</p>
      </div>
    )
  }

  return (
    <div className={styles.fileList}>
      {files.map((file, index) => (
        <DownloadButton key={index} file={file} />
      ))}
    </div>
  )
}
