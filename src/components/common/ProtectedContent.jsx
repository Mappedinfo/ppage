import { useState, useEffect } from 'react'
import { PasswordPrompt } from './PasswordPrompt'
import { MarkdownRenderer } from '../markdown/MarkdownRenderer'
import {
  extractEncryptedContent,
  decryptContent,
  verifyPassword,
  storePassword,
  getStoredPassword,
} from '../../utils/encryption'
import styles from './ProtectedContent.module.css'

/**
 * 受保护内容组件
 * 自动检测加密内容并提示输入密码
 */
export function ProtectedContent({ content, title }) {
  const [decrypted, setDecrypted] = useState(null)
  const [showPrompt, setShowPrompt] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [encryptedData, setEncryptedData] = useState(null)

  useEffect(() => {
    // 检查内容是否已加密
    const extracted = extractEncryptedContent(content)

    if (extracted) {
      setEncryptedData(extracted)

      // 尝试使用已存储的密码自动解密
      const storedPassword = getStoredPassword()
      if (storedPassword) {
        tryDecrypt(extracted.content, storedPassword, true)
      } else {
        setShowPrompt(true)
      }
    } else {
      // 未加密的内容直接显示
      setDecrypted(content)
    }
  }, [content])

  const tryDecrypt = async (encryptedContent, password, silent = false) => {
    setLoading(true)
    setError('')

    try {
      const decryptedContent = await decryptContent(encryptedContent, password)
      setDecrypted(decryptedContent)
      setShowPrompt(false)

      // 存储密码以便后续使用
      storePassword(password)
    } catch (err) {
      if (!silent) {
        setError('密码错误，请重试')
      } else {
        // 静默失败，显示密码提示
        setShowPrompt(true)
      }
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordSubmit = password => {
    if (encryptedData) {
      tryDecrypt(encryptedData.content, password)
    }
  }

  const handleCancel = () => {
    // 可选：返回到上一页或显示占位内容
    setShowPrompt(false)
  }

  // 如果正在尝试自动解密且还没有结果
  if (encryptedData && !decrypted && !showPrompt) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>正在验证...</p>
      </div>
    )
  }

  // 如果需要输入密码
  if (showPrompt && encryptedData) {
    return (
      <PasswordPrompt
        onSubmit={handlePasswordSubmit}
        onCancel={handleCancel}
        error={error}
        loading={loading}
      />
    )
  }

  // 显示解密后的内容
  if (decrypted) {
    return (
      <div className={styles.content}>
        {encryptedData && (
          <div className={styles.protectedBadge}>🔒 受保护的内容</div>
        )}
        <MarkdownRenderer content={decrypted} />
      </div>
    )
  }

  // 默认占位
  return (
    <div className={styles.placeholder}>
      <p>内容加载中...</p>
    </div>
  )
}
