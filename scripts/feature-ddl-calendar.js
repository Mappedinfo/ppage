#!/usr/bin/env node

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { spawnSync } from 'child_process'
import yaml from 'js-yaml'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '..')
const configPath = path.join(rootDir, 'public', 'config.yml')
const publicCalendarDir = path.join(rootDir, 'public', 'ddl-calendar')
const publicCalendarYaml = path.join(publicCalendarDir, 'deadlines.yaml')
const ddlCalendarDir = path.join(rootDir, 'utils', 'ddl-calendar')
const ddlCalendarSampleYaml = path.join(
  ddlCalendarDir,
  'public',
  'deadlines.yaml'
)

const colors = {
  reset: '\x1b[0m',
  blue: '\x1b[34m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
}

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: options.cwd || rootDir,
    env: { ...process.env, ...(options.env || {}) },
    stdio: 'inherit',
    shell: process.platform === 'win32',
  })

  if (result.status !== 0) {
    throw new Error(
      `${command} ${args.join(' ')} failed with exit code ${result.status}`
    )
  }
}

function readConfigText() {
  if (!fs.existsSync(configPath)) {
    throw new Error('找不到 public/config.yml，请先在 PPage 根目录运行此命令')
  }

  return fs.readFileSync(configPath, 'utf8')
}

function readConfig(configText) {
  return yaml.load(configText) || {}
}

function ensureTrailingNewline(text) {
  return text.endsWith('\n') ? text : `${text}\n`
}

function ensureSubmoduleReady() {
  if (fs.existsSync(path.join(ddlCalendarDir, 'package.json'))) {
    log('✓ ddl-calendar submodule 已就绪', 'green')
    return
  }

  log('📦 初始化 ddl-calendar submodule...', 'blue')
  run('git', [
    'submodule',
    'update',
    '--init',
    '--recursive',
    'utils/ddl-calendar',
  ])
}

function ensureDependencies() {
  if (fs.existsSync(path.join(ddlCalendarDir, 'node_modules'))) {
    log('✓ ddl-calendar 依赖已存在', 'green')
    return
  }

  log('📦 安装 ddl-calendar 依赖...', 'blue')
  const hasLockfile = fs.existsSync(
    path.join(ddlCalendarDir, 'package-lock.json')
  )

  try {
    run('npm', [hasLockfile ? 'ci' : 'install'], { cwd: ddlCalendarDir })
  } catch (error) {
    if (!hasLockfile) throw error
    log('⚠️  npm ci 失败，回退到 npm install...', 'yellow')
    run('npm', ['install'], { cwd: ddlCalendarDir })
  }
}

function ensureCalendarData() {
  fs.mkdirSync(publicCalendarDir, { recursive: true })

  if (fs.existsSync(publicCalendarYaml)) {
    log('✓ public/ddl-calendar/deadlines.yaml 已存在，跳过覆盖', 'green')
    return
  }

  if (!fs.existsSync(ddlCalendarSampleYaml)) {
    throw new Error('找不到 ddl-calendar 示例 deadlines.yaml')
  }

  fs.copyFileSync(ddlCalendarSampleYaml, publicCalendarYaml)
  log('✓ 创建 public/ddl-calendar/deadlines.yaml', 'green')
}

function ensureFeaturesConfig(configText, config) {
  const targetBlock = [
    '  ddlCalendar:',
    '    enabled: true',
    '    path: "/ddl-calendar/"',
    '    data: "/ddl-calendar/deadlines.yaml"',
  ].join('\n')

  if (config?.features?.ddlCalendar?.enabled === true) {
    return configText
  }

  if (!/^features:\s*$/m.test(configText)) {
    return `${ensureTrailingNewline(configText)}
# 可选功能配置
features:
${targetBlock}
`
  }

  if (!/^\s{2}ddlCalendar:\s*$/m.test(configText)) {
    return configText.replace(/^features:\s*$/m, `features:\n${targetBlock}`)
  }

  return configText.replace(
    /^\s{2}ddlCalendar:\n(?:^\s{4}.*(?:\n|$))*/m,
    `${targetBlock}\n`
  )
}

function ensureNavigationItem(configText, config) {
  const exists = Array.isArray(config.navigation)
    ? config.navigation.some(item => item?.path === '/ddl-calendar/')
    : /path:\s*["']\/ddl-calendar\/["']/.test(configText)

  if (exists) {
    return configText
  }

  const itemLines = [
    '  - name: "DDL Calendar"',
    '    path: "/ddl-calendar/"',
    '    placement: "menu"',
    '    reloadDocument: true',
  ]

  const lines = configText.split('\n')
  const navigationIndex = lines.findIndex(line => /^navigation:\s*$/.test(line))

  if (navigationIndex === -1) {
    return `${ensureTrailingNewline(configText)}
navigation:
${itemLines.join('\n')}
`
  }

  let insertIndex = lines.length

  for (let index = navigationIndex + 1; index < lines.length; index += 1) {
    const line = lines[index]

    if (/^# 主题配置/.test(line) || /^theme:\s*$/.test(line)) {
      insertIndex = index
      break
    }

    if (
      index > navigationIndex + 1 &&
      /^[A-Za-z_][A-Za-z0-9_-]*:\s*$/.test(line)
    ) {
      insertIndex = index
      break
    }
  }

  const needsBlankLine =
    insertIndex < lines.length && lines[insertIndex].trim() !== ''
  lines.splice(insertIndex, 0, ...itemLines, ...(needsBlankLine ? [''] : []))

  return lines.join('\n')
}

function ensureConfig() {
  const originalText = readConfigText()
  const originalConfig = readConfig(originalText)
  let nextText = ensureFeaturesConfig(originalText, originalConfig)
  const nextConfig = readConfig(nextText)
  nextText = ensureNavigationItem(nextText, nextConfig)

  if (nextText === originalText) {
    log('✓ public/config.yml 已启用 ddl-calendar', 'green')
    return
  }

  fs.writeFileSync(configPath, nextText)
  log('✓ 更新 public/config.yml', 'green')
}

function printUsage() {
  console.log(`Usage:
  npm run feature:ddl-calendar
  node scripts/feature-ddl-calendar.js install
`)
}

async function main() {
  const command = process.argv[2] || 'install'

  if (command === '--help' || command === '-h') {
    printUsage()
    return
  }

  if (command !== 'install') {
    throw new Error(`未知命令: ${command}`)
  }

  log('🚀 启用 ddl-calendar optional feature...', 'blue')
  ensureSubmoduleReady()
  ensureDependencies()
  ensureCalendarData()
  ensureConfig()
  log(
    '✨ ddl-calendar 已启用。现在可以编辑 public/ddl-calendar/deadlines.yaml',
    'green'
  )
}

main().catch(error => {
  console.error(`${colors.red}❌ 安装失败: ${error.message}${colors.reset}`)
  process.exit(1)
})
