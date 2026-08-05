#!/usr/bin/env node

/**
 * 内容加密上传脚本
 * 在 git 提交前加密指定文件夹的内容
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import readline from 'readline'
import { encryptContent, generateEncryptedMetadata } from './crypto.js'
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

    // 更简单的解析方式：直接匹配 enabled 和 protectedFolders
    let enabled = false
    let protectedFolders = ['content/protected']

    // 解析 enabled：在 encryption: 之后、在有意义的行上寻找
    const lines = configContent.split('\n')
    let inEncryptionSection = false

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      const trimmedLine = line.trim()

      // 检测是否进入 encryption 部分
      if (trimmedLine.startsWith('encryption:')) {
        inEncryptionSection = true
        continue
      }

      // 如果在 encryption 部分
      if (inEncryptionSection) {
        // 如果遇到下一个主分组（不以空格开头的非注释行），退出
        if (
          trimmedLine.length > 0 &&
          !trimmedLine.startsWith('#') &&
          !line.startsWith(' ') &&
          !line.startsWith('\t')
        ) {
          break
        }

        // 解析 enabled
        if (trimmedLine.match(/enabled:\s*(true|false)/)) {
          const match = trimmedLine.match(/enabled:\s*(true|false)/)
          enabled = match[1] === 'true'
        }

        // 解析 protectedFolders - 处理带缩进的列表项
        // 跳过注释掉的行（以 # 开头）
        if (trimmedLine.match(/^-\s+/) && !trimmedLine.startsWith('#')) {
          const match = trimmedLine.match(/^-\s+["']?(.+?)["']?$/)
          if (match && match[1]) {
            // 移除行尾注释
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
  // 检查是否包含加密标记
  return (
    content.includes('<!-- ENCRYPTED_CONTENT -->') ||
    content.match(/^---\s*\n[\s\S]*?encrypted:\s*true/m)
  )
}

/**
 * 加密单个文件
 * @param {string} filePath - 文件路径
 * @param {string} password - 加密密码
 * @returns {boolean} 是否成功
 */
function encryptFile(filePath, password) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8')

    // 检查是否已加密
    if (isEncrypted(content)) {
      log(`  ⏭️  跳过（已加密）: ${path.relative(rootDir, filePath)}`, 'yellow')
      return true
    }

    // 加密内容
    const encrypted = encryptContent(content, password)

    // 生成元数据
    const metadata = generateEncryptedMetadata(filePath, encrypted)

    // 构建加密后的文件内容（保留 front matter 结构）
    const frontMatterMatch = content.match(/^---\s*\n([\s\S]*?)\n---/)
    let newContent

    if (frontMatterMatch) {
      // 如果有 front matter，更新它
      const frontMatter = frontMatterMatch[1]
      const restContent = content.substring(frontMatterMatch[0].length)

      newContent = `---
${frontMatter}
encrypted: true
encryptedAt: "${metadata.encryptedAt}"
---

<!-- ENCRYPTED_CONTENT -->
${encrypted}
<!-- /ENCRYPTED_CONTENT -->`
    } else {
      // 如果没有 front matter，创建一个
      newContent = `---
encrypted: true
encryptedAt: "${metadata.encryptedAt}"
---

<!-- ENCRYPTED_CONTENT -->
${encrypted}
<!-- /ENCRYPTED_CONTENT -->`
    }

    // 写回文件
    fs.writeFileSync(filePath, newContent, 'utf-8')

    log(`  ✅ 加密成功: ${path.relative(rootDir, filePath)}`, 'green')
    return true
  } catch (error) {
    log(
      `  ❌ 加密失败: ${path.relative(rootDir, filePath)} - ${error.message}`,
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

  log('\n🔐 内容加密工具', 'blue')
  log('='.repeat(50), 'blue')

  // 读取配置
  const config = loadEncryptionConfig()

  if (!config.enabled) {
    log('\n⚠️  加密功能未启用', 'yellow')
    log('请在 public/config.yml 中设置 encryption.enabled: true', 'yellow')
    process.exit(0)
  }

  if (!config.protectedFolders || config.protectedFolders.length === 0) {
    log('\n⚠️  未配置受保护的文件夹', 'yellow')
    log('请在 public/config.yml 中设置 encryption.protectedFolders', 'yellow')
    process.exit(0)
  }

  log(`\n📁 受保护的文件夹: ${config.protectedFolders.join(', ')}`, 'blue')

  // 扫描所有需要加密的文件
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
    log('\n✨ 没有找到需要加密的文件', 'green')
    process.exit(0)
  }

  // 检查是否所有文件都已加密
  const unencryptedFiles = allFiles.filter(file => {
    const content = fs.readFileSync(file, 'utf-8')
    return !isEncrypted(content)
  })

  if (unencryptedFiles.length === 0) {
    log('\n✨ 所有文件已加密，无需重复加密', 'green')
    log(`   总计: ${allFiles.length} 个文件`, 'green')
    process.exit(0)
  }

  log(
    `\n找到 ${allFiles.length} 个文件，其中 ${unencryptedFiles.length} 个未加密`,
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
    password = await readPassword('\n🔑 请输入加密密码: ')

    if (!password || password.trim() === '') {
      log('\n❌ 密码不能为空', 'red')
      process.exit(1)
    }

    // 确认密码
    const confirmPassword = await readPassword('🔑 请再次输入密码以确认: ')

    if (password !== confirmPassword) {
      log('\n❌ 两次输入的密码不一致', 'red')
      process.exit(1)
    }
  }

  log('\n🔒 开始加密文件...', 'blue')

  // 加密所有文件
  let successCount = 0
  let skipCount = 0
  let errorCount = 0

  for (const file of allFiles) {
    const content = fs.readFileSync(file, 'utf-8')
    if (isEncrypted(content)) {
      skipCount++
      log(`  ⏭️  跳过（已加密）: ${path.relative(rootDir, file)}`, 'yellow')
    } else if (encryptFile(file, password)) {
      successCount++
    } else {
      errorCount++
    }
  }

  log('\n' + '='.repeat(50), 'blue')
  log(`📊 加密完成！`, 'green')
  log(`  ✅ 成功: ${successCount} 个`, 'green')
  log(`  ⏭️  跳过: ${skipCount} 个`, 'yellow')
  log(`  ❌ 失败: ${errorCount} 个`, 'red')

  if (errorCount > 0) {
    log('\n⚠️  部分文件加密失败，请检查错误信息', 'yellow')
    process.exit(1)
  }

  log('\n✨ 所有文件加密成功！现在可以提交到 git 了。', 'green')
}

// 运行主函数
main().catch(error => {
  log(`\n❌ 发生错误: ${error.message}`, 'red')
  process.exit(1)
})
