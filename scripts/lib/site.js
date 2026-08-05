/**
 * PPage 站点 profile 解析器
 *
 * 让一份产品代码可以服务多个站点：当设置了环境变量 PPAGE_SITE=<name> 时，
 * content / config.yml / assets 一律从 sites/<name>/ 读取；否则回退到仓库内
 * 默认内容（产品自身的公开 demo）。deploy 目标也从该 profile 的 config.yml 读取。
 *
 * 本模块在被 import 时会自动加载 .env / .env.local，因此 PPAGE_SITE 写在
 * .env.local 里即可对 vite.config.js 和各 node 脚本同时生效。
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
export const rootDir = path.resolve(__dirname, '../..')

function loadEnvFile(name) {
  const p = path.join(rootDir, name)
  if (!fs.existsSync(p)) return
  for (const raw of fs.readFileSync(p, 'utf-8').split('\n')) {
    const line = raw.trim()
    if (!line || line.startsWith('#')) continue
    const m = line.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/)
    if (!m) continue
    if (m[1] in process.env) continue // 不覆盖已存在的环境变量
    let val = m[2]
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1)
    }
    process.env[m[1]] = val
  }
}
loadEnvFile('.env')
loadEnvFile('.env.local')

export function getSiteName() {
  return process.env.PPAGE_SITE || ''
}

/** @returns {string|null} 活动站点目录，未启用时为 null */
export function getSiteDir() {
  const name = getSiteName()
  return name ? path.join(rootDir, 'sites', name) : null
}

export function getContentDir() {
  const site = getSiteDir()
  return site ? path.join(site, 'content') : path.join(rootDir, 'content')
}

export function getConfigPath() {
  const site = getSiteDir()
  return site
    ? path.join(site, 'config.yml')
    : path.join(rootDir, 'public', 'config.yml')
}

export function getAssetsDir() {
  const site = getSiteDir()
  return site
    ? path.join(site, 'assets')
    : path.join(rootDir, 'public', 'assets')
}

/** 递归拷贝目录（dst 已存在则合并覆盖） */
export function copyDir(src, dst) {
  if (!fs.existsSync(src)) return
  fs.mkdirSync(dst, { recursive: true })
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name)
    const d = path.join(dst, entry.name)
    if (entry.isDirectory()) copyDir(s, d)
    else fs.copyFileSync(s, d)
  }
}

/** 站点根级静态文件目录（favicon 等），未启用站点时为 null */
export function getSitePublicDir() {
  const site = getSiteDir()
  return site ? path.join(site, 'public') : null
}
