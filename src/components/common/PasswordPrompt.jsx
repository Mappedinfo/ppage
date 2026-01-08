import { useState } from 'react'
import { FaLock, FaEye, FaEyeSlash, FaTimes } from 'react-icons/fa'
import styles from './PasswordPrompt.module.css'

/**
 * 密码输入提示组件
 * 用于受保护内容的密码验证
 */
export function PasswordPrompt({ onSubmit, onCancel, error, loading }) {
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = e => {
    e.preventDefault()
    if (password.trim()) {
      onSubmit(password)
    }
  }

  const handleKeyDown = e => {
    if (e.key === 'Escape' && onCancel) {
      onCancel()
    }
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <div className={styles.icon}>
            <FaLock />
          </div>
          <h2 className={styles.title}>受保护的内容</h2>
          {onCancel && (
            <button
              className={styles.closeButton}
              onClick={onCancel}
              aria-label="关闭"
            >
              <FaTimes />
            </button>
          )}
        </div>

        <div className={styles.body}>
          <p className={styles.description}>
            此内容已加密保护，请输入密码以查看。
          </p>

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.inputGroup}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="请输入密码"
                className={styles.input}
                autoFocus
                disabled={loading}
              />
              <button
                type="button"
                className={styles.toggleButton}
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? '隐藏密码' : '显示密码'}
                disabled={loading}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>

            {error && <div className={styles.error}>{error}</div>}

            <div className={styles.actions}>
              <button
                type="submit"
                className={styles.submitButton}
                disabled={!password.trim() || loading}
              >
                {loading ? '验证中...' : '解锁内容'}
              </button>
              {onCancel && (
                <button
                  type="button"
                  className={styles.cancelButton}
                  onClick={onCancel}
                  disabled={loading}
                >
                  取消
                </button>
              )}
            </div>
          </form>

          <div className={styles.tips}>
            <p>💡 提示：密码将在本次会话中保存，刷新页面后需要重新输入。</p>
          </div>
        </div>
      </div>
    </div>
  )
}
