#!/usr/bin/env node

/**
 * 内容解密脚本
 * 在 npm run dev 结束后解密指定文件夹的内容，便于本地编辑
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import readline from 'readline'
import { decryptContent } from './crypto.js'
import { getContentDir, getConfigPath } from './lib/site.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '..')

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
}

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

/**
 * 加载 .env 文件
 */
function loadEnvFile() {
  const envPath = path.join(rootDir, '.env.local')
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf-8')
    envContent.split('\n').forEach(line => {
      const trimmed = line.trim()
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=')
        if (key && valueParts.length > 0) {
          process.env[key.trim()] = valueParts.join('=').trim()
        }
      }
    })
  }
}

/**
 * 读取配置文件中的加密设置
 * @returns {Object} 加密配置
 */
function loadEncryptionConfig() {
  const configPath = getConfigPath()

  if (!fs.existsSync(configPath)) {
    log('警告: 配置文件不存在，使用默认设置', 'yellow')
    return {
      enabled: false,
      protectedFolders: ['content/protected'],
    }
  }

  try {
    const configContent = fs.readFileSync(configPath, 'utf-8')

    let enabled = false
    let protectedFolders = ['content/protected']

    const lines = configContent.split('\n')
    let inEncryptionSection = false

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      const trimmedLine = line.trim()

      if (trimmedLine.startsWith('encryption:')) {
        inEncryptionSection = true
        continue
      }

      if (inEncryptionSection) {
        if (
          trimmedLine.length > 0 &&
          !trimmedLine.startsWith('#') &&
          !line.startsWith(' ') &&
          !line.startsWith('\t')
        ) {
          break
        }

        if (trimmedLine.match(/enabled:\s*(true|false)/)) {
          const match = trimmedLine.match(/enabled:\s*(true|false)/)
          enabled = match[1] === 'true'
        }

        if (trimmedLine.match(/^-\s+/) && !trimmedLine.startsWith('#')) {
          const match = trimmedLine.match(/^-\s+["']?(.+?)["']?$/)
          if (match && match[1]) {
            const folder = match[1].split('#')[0].trim().replace(/["']/g, '')
            if (folder && folder.length > 0) {
              if (
                protectedFolders.length === 1 &&
                protectedFolders[0] === 'content/protected'
              ) {
                protectedFolders = []
              }
              protectedFolders.push(folder)
            }
          }
        }
      }
    }

    return { enabled, protectedFolders }
  } catch (error) {
    log(`读取配置文件失败: ${error.message}`, 'red')
    return {
      enabled: false,
      protectedFolders: ['content/protected'],
    }
  }
}

/**
 * 从命令行读取密码（隐藏输入）
 * @param {string} prompt - 提示信息
 * @returns {Promise<string>} 用户输入的密码
 */
function readPassword(prompt) {
  return new Promise(resolve => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    })

    rl.question(prompt, password => {
      rl.close()
      resolve(password)
    })
  })
}

/**
 * 扫描目录中的所有 Markdown 文件
 * @param {string} dir - 目录路径
 * @returns {Array} 文件路径数组
 */
function scanMarkdownFiles(dir) {
  const files = []

  if (!fs.existsSync(dir)) {
    return files
  }

  function scan(currentDir) {
    const items = fs.readdirSync(currentDir)

    for (const item of items) {
      const fullPath = path.join(currentDir, item)
      const stat = fs.statSync(fullPath)

      if (stat.isDirectory()) {
        scan(fullPath)
      } else if (item.endsWith('.md')) {
        files.push(fullPath)
      }
    }
  }

  scan(dir)
  return files
}

/**
 * 检查文件是否已加密
 * @param {string} content - 文件内容
 * @returns {boolean} 是否已加密
 */
function isEncrypted(content) {
  return (
    content.includes('<!-- ENCRYPTED_CONTENT -->') ||
    content.match(/^---\s*\n[\s\S]*?encrypted:\s*true/m)
  )
}

/**
 * 解密单个文件
 * @param {string} filePath - 文件路径
 * @param {string} password - 解密密码
 * @returns {boolean} 是否成功
 */
function decryptFile(filePath, password) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8')

    // 检查是否已加密
    if (!isEncrypted(content)) {
      log(`  ⏭️  跳过（未加密）: ${path.relative(rootDir, filePath)}`, 'yellow')
      return true
    }

    // 提取加密内容
    const encryptedMatch = content.match(
      /<!-- ENCRYPTED_CONTENT -->\s*([\s\S]*?)\s*<!-- \/ENCRYPTED_CONTENT -->/
    )

    if (!encryptedMatch) {
      log(
        `  ❌ 解密失败: ${path.relative(rootDir, filePath)} - 未找到加密内容`,
        'red'
      )
      return false
    }

    const encryptedContent = encryptedMatch[1].trim()

    // 解密内容
    const decrypted = decryptContent(encryptedContent, password)

    // 写回文件
    fs.writeFileSync(filePath, decrypted, 'utf-8')

    log(`  ✅ 解密成功: ${path.relative(rootDir, filePath)}`, 'green')
    return true
  } catch (error) {
    log(
      `  ❌ 解密失败: ${path.relative(rootDir, filePath)} - ${error.message}`,
      'red'
    )
    return false
  }
}

/**
 * 主函数
 */
async function main() {
  // 加载 .env 文件
  loadEnvFile()

  log('\n🔓 内容解密工具', 'blue')
  log('='.repeat(50), 'blue')

  // 读取配置
  const config = loadEncryptionConfig()

  if (!config.enabled) {
    log('\n⚠️  加密功能未启用，无需解密', 'yellow')
    process.exit(0)
  }

  if (!config.protectedFolders || config.protectedFolders.length === 0) {
    log('\n⚠️  未配置受保护的文件夹', 'yellow')
    process.exit(0)
  }

  log(`\n📁 受保护的文件夹: ${config.protectedFolders.join(', ')}`, 'blue')

  // 扫描所有需要解密的文件
  let allFiles = []
  for (const folder of config.protectedFolders) {
    const folderPath =
      folder.replace(/^content\//, '') === folder
        ? path.join(rootDir, folder)
        : path.join(getContentDir(), folder.replace(/^content\//, ''))
    const files = scanMarkdownFiles(folderPath)
    allFiles = allFiles.concat(files)
  }

  if (allFiles.length === 0) {
    log('\n✨ 没有找到需要解密的文件', 'green')
    process.exit(0)
  }

  // 检查是否有加密文件
  const encryptedFiles = allFiles.filter(file => {
    const content = fs.readFileSync(file, 'utf-8')
    return isEncrypted(content)
  })

  if (encryptedFiles.length === 0) {
    log('\n✨ 所有文件已解密，无需重复解密', 'green')
    log(`   总计: ${allFiles.length} 个文件`, 'green')
    process.exit(0)
  }

  log(
    `\n找到 ${allFiles.length} 个文件，其中 ${encryptedFiles.length} 个已加密`,
    'blue'
  )

  // 检查是否是静默模式（从环境变量读取密码）
  const envPassword = process.env.PPAGE_ENCRYPT_PASSWORD
  let password

  if (envPassword) {
    log('\n🔑 使用环境变量中的密码', 'blue')
    password = envPassword
  } else {
    // 读取密码
    password = await readPassword('\n🔑 请输入解密密码: ')

    if (!password || password.trim() === '') {
      log('\n❌ 密码不能为空', 'red')
      process.exit(1)
    }
  }

  log('\n🔓 开始解密文件...', 'blue')

  // 解密所有文件
  let successCount = 0
  let skipCount = 0
  let errorCount = 0

  for (const file of allFiles) {
    const content = fs.readFileSync(file, 'utf-8')
    if (!isEncrypted(content)) {
      skipCount++
      log(`  ⏭️  跳过（未加密）: ${path.relative(rootDir, file)}`, 'yellow')
    } else if (decryptFile(file, password)) {
      successCount++
    } else {
      errorCount++
    }
  }

  log('\n' + '='.repeat(50), 'blue')
  log(`📊 解密完成！`, 'green')
  log(`  ✅ 成功: ${successCount} 个`, 'green')
  log(`  ⏭️  跳过: ${skipCount} 个`, 'yellow')
  log(`  ❌ 失败: ${errorCount} 个`, 'red')

  if (errorCount > 0) {
    log('\n⚠️  部分文件解密失败，请检查密码是否正确', 'yellow')
    process.exit(1)
  }

  log('\n✨ 所有文件解密成功！现在可以编辑文件了。', 'green')
}

// 运行主函数
main().catch(error => {
  log(`\n❌ 发生错误: ${error.message}`, 'red')
  process.exit(1)
})
