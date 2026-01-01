import React, { useState } from 'react'
import styles from './PDFViewer.module.css'

/**
 * PDF 查看器组件
 */
export function PDFViewer({ url, title = 'PDF 文档' }) {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

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

  const fullUrl = getFullPath(url)

  const handleLoad = () => {
    setIsLoading(false)
  }

  const handleError = () => {
    setIsLoading(false)
    setError('PDF 加载失败')
  }

  return (
    <div className={styles.pdfViewer}>
      <div className={styles.header}>
        <h3 className={styles.title}>{title}</h3>
        <a
          href={fullUrl}
          download
          className={styles.downloadButton}
          target="_blank"
          rel="noopener noreferrer"
        >
          下载 PDF
        </a>
      </div>

      <div className={styles.viewerContainer}>
        {isLoading && (
          <div className={styles.loading}>
            <div className={styles.spinner}></div>
            <p>加载中...</p>
          </div>
        )}

        {error && (
          <div className={styles.error}>
            <p>{error}</p>
            <a href={fullUrl} download className={styles.downloadLink}>
              点击下载 PDF
            </a>
          </div>
        )}

        <iframe
          src={fullUrl}
          className={styles.iframe}
          title={title}
          onLoad={handleLoad}
          onError={handleError}
        />
      </div>
    </div>
  )
}
