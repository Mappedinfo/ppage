#!/usr/bin/env node

/**
 * 内容加密/解密工具
 * 使用 AES-256-GCM 加密算法，带盐值处理
 */

import crypto from 'crypto'

// 加密算法配置
const ALGORITHM = 'aes-256-gcm'
const KEY_LENGTH = 32 // 256 bits
const IV_LENGTH = 16 // 128 bits
const SALT_LENGTH = 64
const AUTH_TAG_LENGTH = 16
const PBKDF2_ITERATIONS = 100000

/**
 * 从密码生成密钥（使用 PBKDF2）
 * @param {string} password - 用户密码
 * @param {Buffer} salt - 盐值
 * @returns {Buffer} 派生的密钥
 */
function deriveKey(password, salt) {
  return crypto.pbkdf2Sync(
    password,
    salt,
    PBKDF2_ITERATIONS,
    KEY_LENGTH,
    'sha256'
  )
}

/**
 * 加密内容
 * @param {string} content - 要加密的内容
 * @param {string} password - 加密密码
 * @returns {string} 加密后的内容（Base64编码）
 */
export function encryptContent(content, password) {
  try {
    // 生成随机盐值和 IV
    const salt = crypto.randomBytes(SALT_LENGTH)
    const iv = crypto.randomBytes(IV_LENGTH)

    // 从密码派生密钥
    const key = deriveKey(password, salt)

    // 创建加密器
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv)

    // 加密内容
    let encrypted = cipher.update(content, 'utf8', 'hex')
    encrypted += cipher.final('hex')

    // 获取认证标签
    const authTag = cipher.getAuthTag()

    // 组合：salt + iv + authTag + encrypted
    const result = Buffer.concat([
      salt,
      iv,
      authTag,
      Buffer.from(encrypted, 'hex'),
    ])

    // 返回 Base64 编码的结果
    return result.toString('base64')
  } catch (error) {
    throw new Error(`加密失败: ${error.message}`)
  }
}

/**
 * 解密内容
 * @param {string} encryptedContent - 加密的内容（Base64编码）
 * @param {string} password - 解密密码
 * @returns {string} 解密后的原始内容
 */
export function decryptContent(encryptedContent, password) {
  try {
    // 解码 Base64
    const buffer = Buffer.from(encryptedContent, 'base64')

    // 提取各部分
    const salt = buffer.slice(0, SALT_LENGTH)
    const iv = buffer.slice(SALT_LENGTH, SALT_LENGTH + IV_LENGTH)
    const authTag = buffer.slice(
      SALT_LENGTH + IV_LENGTH,
      SALT_LENGTH + IV_LENGTH + AUTH_TAG_LENGTH
    )
    const encrypted = buffer.slice(SALT_LENGTH + IV_LENGTH + AUTH_TAG_LENGTH)

    // 从密码派生密钥
    const key = deriveKey(password, salt)

    // 创建解密器
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv)
    decipher.setAuthTag(authTag)

    // 解密内容
    let decrypted = decipher.update(encrypted, undefined, 'utf8')
    decrypted += decipher.final('utf8')

    return decrypted
  } catch (error) {
    // 密码错误或数据损坏会抛出异常
    throw new Error(`解密失败: ${error.message}`)
  }
}

/**
 * 验证密码是否正确
 * @param {string} encryptedContent - 加密的内容
 * @param {string} password - 待验证的密码
 * @returns {boolean} 密码是否正确
 */
export function verifyPassword(encryptedContent, password) {
  try {
    decryptContent(encryptedContent, password)
    return true
  } catch {
    return false
  }
}

/**
 * 生成内容摘要（用于验证）
 * @param {string} content - 内容
 * @returns {string} SHA-256 摘要（十六进制）
 */
export function generateContentHash(content) {
  return crypto.createHash('sha256').update(content, 'utf8').digest('hex')
}

/**
 * 为加密文件生成元数据
 * @param {string} originalPath - 原始文件路径
 * @param {string} encryptedContent - 加密后的内容
 * @returns {Object} 元数据对象
 */
export function generateEncryptedMetadata(originalPath, encryptedContent) {
  return {
    version: '1.0',
    algorithm: ALGORITHM,
    encrypted: true,
    originalPath,
    encryptedAt: new Date().toISOString(),
    contentHash: generateContentHash(encryptedContent),
  }
}
