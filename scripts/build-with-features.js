#!/usr/bin/env node

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { spawnSync } from 'child_process'
import yaml from 'js-yaml'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '..')
const ddlCalendarDir = path.join(rootDir, 'utils', 'ddl-calendar')
const ddlCalendarDist = path.join(ddlCalendarDir, 'dist')
const siteDist = path.join(rootDir, 'dist')
const ddlCalendarSiteDist = path.join(siteDist, 'ddl-calendar')
const ddlCalendarPublicData = path.join(rootDir, 'public', 'ddl-calendar')

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

function npmBin(name) {
  return path.join(
    rootDir,
    'node_modules',
    '.bin',
    process.platform === 'win32' ? `${name}.cmd` : name
  )
}

function readConfig() {
  const configPath = path.join(rootDir, 'public', 'config.yml')

  if (!fs.existsSync(configPath)) {
    return {}
  }

  const configText = fs.readFileSync(configPath, 'utf8')
  return yaml.load(configText) || {}
}

function isDdlCalendarEnabled(config) {
  return config?.features?.ddlCalendar?.enabled === true
}

function ensureSubmoduleReady() {
  if (fs.existsSync(path.join(ddlCalendarDir, 'package.json'))) {
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

function ensureDdlCalendarDependencies() {
  if (fs.existsSync(path.join(ddlCalendarDir, 'node_modules'))) {
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

function copyDir(src, dest) {
  if (!fs.existsSync(src)) return

  fs.mkdirSync(dest, { recursive: true })

  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name)
    const destPath = path.join(dest, entry.name)

    if (entry.isDirectory()) {
      copyDir(srcPath, destPath)
    } else {
      fs.mkdirSync(path.dirname(destPath), { recursive: true })
      fs.copyFileSync(srcPath, destPath)
    }
  }
}

function buildDdlCalendar() {
  ensureSubmoduleReady()
  ensureDdlCalendarDependencies()

  log('📅 构建 ddl-calendar feature...', 'blue')
  run('npm', ['run', 'build'], {
    cwd: ddlCalendarDir,
    env: {
      VITE_BASE: './',
      VITE_DEADLINES_URL: 'deadlines.yaml',
      VITE_HOME_URL: '../',
    },
  })

  if (!fs.existsSync(path.join(ddlCalendarDist, 'index.html'))) {
    throw new Error('ddl-calendar build failed: dist/index.html not found')
  }

  fs.rmSync(ddlCalendarSiteDist, { recursive: true, force: true })
  copyDir(ddlCalendarDist, ddlCalendarSiteDist)
  copyDir(ddlCalendarPublicData, ddlCalendarSiteDist)

  log('✅ ddl-calendar 已输出到 dist/ddl-calendar/', 'green')
}

async function main() {
  log('📦 构建 PPage...', 'blue')
  run(npmBin('vite'), ['build'])

  const config = readConfig()

  if (isDdlCalendarEnabled(config)) {
    buildDdlCalendar()
  } else {
    log('ℹ️  ddl-calendar feature 未启用，跳过构建', 'yellow')
  }
}

main().catch(error => {
  console.error(`${colors.red}❌ 构建失败: ${error.message}${colors.reset}`)
  process.exit(1)
})
