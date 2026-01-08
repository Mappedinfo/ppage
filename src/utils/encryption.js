/**
 * 前端加密内容处理工具
 * 提供密码验证和内容解密功能（仅解密，不加密）
 */

/**
 * 将 Base64 字符串转换为 Uint8Array
 * @param {string} base64 - Base64 字符串
 * @returns {Uint8Array}
 */
function base64ToUint8Array(base64) {
  const binaryString = atob(base64)
  const len = binaryString.length
  const bytes = new Uint8Array(len)
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i)
  }
  return bytes
}

/**
 * 将 Uint8Array 转换为 Base64 字符串
 * @param {Uint8Array} bytes
 * @returns {string}
 */
function uint8ArrayToBase64(bytes) {
  let binary = ''
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}

/**
 * 从密码派生密钥（使用 PBKDF2）
 * @param {string} password - 用户密码
 * @param {Uint8Array} salt - 盐值
 * @returns {Promise<CryptoKey>} 派生的密钥
 */
async function deriveKey(password, salt) {
  const encoder = new TextEncoder()
  const passwordBuffer = encoder.encode(password)

  // 导入密码作为密钥材料
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    passwordBuffer,
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  )

  // 派生密钥
  return await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['decrypt']
  )
}

/**
 * 解密内容
 * @param {string} encryptedContent - 加密的内容（Base64编码）
 * @param {string} password - 解密密码
 * @returns {Promise<string>} 解密后的原始内容
 */
export async function decryptContent(encryptedContent, password) {
  try {
    // 解码 Base64
    const buffer = base64ToUint8Array(encryptedContent)

    // 提取各部分（需要与后端保持一致）
    const SALT_LENGTH = 64
    const IV_LENGTH = 16
    const AUTH_TAG_LENGTH = 16

    const salt = buffer.slice(0, SALT_LENGTH)
    const iv = buffer.slice(SALT_LENGTH, SALT_LENGTH + IV_LENGTH)
    const authTag = buffer.slice(
      SALT_LENGTH + IV_LENGTH,
      SALT_LENGTH + IV_LENGTH + AUTH_TAG_LENGTH
    )
    const encrypted = buffer.slice(SALT_LENGTH + IV_LENGTH + AUTH_TAG_LENGTH)

    // 从密码派生密钥
    const key = await deriveKey(password, salt)

    // 组合加密数据和认证标签
    const combinedData = new Uint8Array(encrypted.length + authTag.length)
    combinedData.set(encrypted, 0)
    combinedData.set(authTag, encrypted.length)

    // 解密
    const decryptedBuffer = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: iv,
        tagLength: 128,
      },
      key,
      combinedData
    )

    // 将解密的数据转换为字符串
    const decoder = new TextDecoder()
    return decoder.decode(decryptedBuffer)
  } catch (error) {
    throw new Error('解密失败：密码错误或数据损坏')
  }
}

/**
 * 验证密码是否正确
 * @param {string} encryptedContent - 加密的内容
 * @param {string} password - 待验证的密码
 * @returns {Promise<boolean>} 密码是否正确
 */
export async function verifyPassword(encryptedContent, password) {
  try {
    await decryptContent(encryptedContent, password)
    return true
  } catch {
    return false
  }
}

/**
 * 从 Markdown 内容中提取加密的内容
 * @param {string} markdown - Markdown 文件内容
 * @returns {Object|null} { encrypted: boolean, content: string, metadata: object }
 */
export function extractEncryptedContent(markdown) {
  // 检查是否是加密内容
  const encryptedMatch = markdown.match(
    /<!-- ENCRYPTED_CONTENT -->\s*([\s\S]*?)\s*<!-- \/ENCRYPTED_CONTENT -->/
  )

  if (!encryptedMatch) {
    return null
  }

  const encryptedContent = encryptedMatch[1].trim()

  // 提取 front matter
  const frontMatterMatch = markdown.match(/^---\s*\n([\s\S]*?)\n---/)
  const metadata = {}

  if (frontMatterMatch) {
    const frontMatter = frontMatterMatch[1]
    const lines = frontMatter.split('\n')

    lines.forEach(line => {
      const [key, ...valueParts] = line.split(':')
      if (!key) return

      const trimmedKey = key.trim()
      const value = valueParts
        .join(':')
        .trim()
        .replace(/^["']|["']$/g, '')

      if (trimmedKey === 'encrypted') {
        metadata.encrypted = value === 'true'
      } else if (trimmedKey === 'encryptedAt') {
        metadata.encryptedAt = value
      } else if (trimmedKey === 'title') {
        metadata.title = value
      }
    })
  }

  return {
    encrypted: true,
    content: encryptedContent,
    metadata,
  }
}

/**
 * 检查内容是否已加密
 * @param {string} content - 内容
 * @returns {boolean}
 */
export function isEncrypted(content) {
  return (
    content.includes('<!-- ENCRYPTED_CONTENT -->') ||
    /^---\s*\n[\s\S]*?encrypted:\s*true/m.test(content)
  )
}

/**
 * 存储已验证的密码（使用 sessionStorage）
 * @param {string} password - 密码
 */
export function storePassword(password) {
  if (typeof window !== 'undefined' && window.sessionStorage) {
    // 存储密码的哈希值而非明文
    sessionStorage.setItem('ppage_decrypt_key', btoa(password))
  }
}

/**
 * 获取已存储的密码
 * @returns {string|null} 密码或 null
 */
export function getStoredPassword() {
  if (typeof window !== 'undefined' && window.sessionStorage) {
    const stored = sessionStorage.getItem('ppage_decrypt_key')
    return stored ? atob(stored) : null
  }
  return null
}

/**
 * 清除已存储的密码
 */
export function clearStoredPassword() {
  if (typeof window !== 'undefined' && window.sessionStorage) {
    sessionStorage.removeItem('ppage_decrypt_key')
  }
}
