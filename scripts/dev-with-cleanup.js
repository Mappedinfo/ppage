#!/usr/bin/env node

/**
 * 开发服务器包装脚本
 * 在开发服务器结束时自动解密文件
 */

import { spawn } from 'child_process'
import { fileURLToPath } from 'url'
import path from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '..')

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
}

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

/**
 * 运行解密脚本
 */
function runDecrypt() {
  return new Promise(resolve => {
    log('\n🔓 开发服务器已停止，正在解密文件...', 'blue')

    const decrypt = spawn('node', ['scripts/decrypt.js'], {
      cwd: rootDir,
      stdio: 'inherit',
    })

    decrypt.on('close', code => {
      if (code === 0) {
        log('✨ 文件解密完成\n', 'blue')
      } else {
        log('⚠️  文件解密失败，请手动运行: npm run decrypt\n', 'yellow')
      }
      resolve()
    })

    decrypt.on('error', err => {
      log(`⚠️  解密脚本执行失败: ${err.message}\n`, 'yellow')
      resolve()
    })
  })
}

/**
 * 主函数
 */
async function main() {
  // 启动 Vite 开发服务器
  const vite = spawn('npx', ['vite'], {
    cwd: rootDir,
    stdio: 'inherit',
  })

  // 处理退出信号
  const cleanup = async signal => {
    log(`\n📡 接收到 ${signal} 信号`, 'blue')

    // 终止 Vite 进程
    vite.kill('SIGTERM')

    // 等待 Vite 进程完全结束
    await new Promise(resolve => {
      vite.on('close', resolve)
      // 如果 2 秒内没有结束，强制继续
      setTimeout(resolve, 2000)
    })

    // 运行解密脚本
    await runDecrypt()

    // 退出进程
    process.exit(0)
  }

  // 监听各种退出信号
  process.on('SIGINT', () => cleanup('SIGINT'))
  process.on('SIGTERM', () => cleanup('SIGTERM'))

  // 监听 Vite 进程结束
  vite.on('close', async code => {
    if (code !== null && code !== 0) {
      log(`\n⚠️  开发服务器异常退出 (code: ${code})`, 'yellow')
    }

    // 运行解密脚本
    await runDecrypt()

    process.exit(code || 0)
  })

  vite.on('error', err => {
    log(`\n❌ 启动开发服务器失败: ${err.message}`, 'yellow')
    process.exit(1)
  })
}

// 运行主函数
main().catch(error => {
  console.error('发生错误:', error)
  process.exit(1)
})
