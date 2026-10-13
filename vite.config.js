import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteStaticCopy } from 'vite-plugin-static-copy'
import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'
import yaml from 'js-yaml'
// config.yml / content / assets / public(根级文件)，build 时覆盖写入 dist。未启用时全部 no-op。
import { getSiteDir, getSiteName, getContentDir, getConfigPath, getAssetsDir, getSitePublicDir, copyDir } from './scripts/lib/site.js'
const rootDir = process.cwd()
const ddlCalendarMountPath = '/ddl-calendar'
const ddlCalendarDir = path.join(rootDir, 'utils', 'ddl-calendar')
const ddlCalendarDist = path.join(ddlCalendarDir, 'dist')
const ddlCalendarPublicData = path.join(rootDir, 'public', 'ddl-calendar')

function getContentType(filePath) {
  const ext = path.extname(filePath).toLowerCase()

  if (ext === '.html') return 'text/html; charset=utf-8'
  if (ext === '.js') return 'text/javascript; charset=utf-8'
  if (ext === '.css') return 'text/css; charset=utf-8'
  if (ext === '.yaml' || ext === '.yml') return 'text/yaml; charset=utf-8'
  if (ext === '.json') return 'application/json; charset=utf-8'

  return 'application/octet-stream'
}

function isInside(parentDir, targetPath) {
  const relative = path.relative(parentDir, targetPath)
  return Boolean(relative) && !relative.startsWith('..') && !path.isAbsolute(relative)
}

/**
 * 把站点配置内联进 index.html（window.__PPAGE_CONFIG__），
 * 应用启动时同步可用，省掉 "HTML -> JS -> config.yml" 的一环运行时瀑布。
 */
function ppageInlineConfigPlugin() {
  return {
    name: 'ppage-inline-config',
    transformIndexHtml(html) {
      try {
        const config = yaml.load(fs.readFileSync(getConfigPath(), 'utf-8'))
        // 转义 < 防止内容中出现 </script> 提前闭合标签
        const json = JSON.stringify(config).replace(/</g, '\\u003c')
        return {
          html,
          tags: [
            {
              tag: 'script',
              children: `window.__PPAGE_CONFIG__ = ${json};`,
              injectTo: 'head',
            },
          ],
        }
      } catch (error) {
        console.warn('[ppage-inline-config] 配置内联失败，回退为运行时加载:', error.message)
        return html
      }
    },
  }
}

function ensureDdlCalendarDist() {
  const indexPath = path.join(ddlCalendarDist, 'index.html')

  if (fs.existsSync(indexPath)) {
    return true
  }

  if (!fs.existsSync(path.join(ddlCalendarDir, 'package.json'))) {
    return false
  }

  execSync('npm run build', {
    cwd: ddlCalendarDir,
    stdio: 'inherit',
    env: {
      ...process.env,
      VITE_BASE: './',
      VITE_DEADLINES_URL: 'deadlines.yaml',
      VITE_HOME_URL: '../',
    },
  })

  return fs.existsSync(indexPath)
}

function serveFile(res, filePath) {
  res.setHeader('Content-Type', getContentType(filePath))
  res.setHeader('Cache-Control', 'no-cache')
  res.end(fs.readFileSync(filePath))
}

function serveDdlCalendarDevRoute(req, res, next) {
  if (!req.url) {
    next()
    return
  }

  const { pathname } = new URL(req.url, 'http://localhost')

  if (pathname === ddlCalendarMountPath) {
    res.statusCode = 302
    res.setHeader('Location', `${ddlCalendarMountPath}/`)
    res.end()
    return
  }

  if (!pathname.startsWith(`${ddlCalendarMountPath}/`)) {
    next()
    return
  }

  try {
    if (!ensureDdlCalendarDist()) {
      res.statusCode = 503
      res.setHeader('Content-Type', 'text/plain; charset=utf-8')
      res.end('ddl-calendar submodule is not initialized. Run npm run feature:ddl-calendar first.')
      return
    }

    const requestedPath = decodeURIComponent(
      pathname.slice(`${ddlCalendarMountPath}/`.length)
    )
    const normalizedPath =
      requestedPath === '' || requestedPath === 'index.html'
        ? 'index.html'
        : requestedPath
    const sourceRoot =
      normalizedPath === 'deadlines.yaml' ? ddlCalendarPublicData : ddlCalendarDist
    const filePath = path.resolve(sourceRoot, normalizedPath)

    if (!isInside(sourceRoot, filePath) || !fs.existsSync(filePath)) {
      next()
      return
    }

    serveFile(res, filePath)
  } catch (error) {
    console.error('ddl-calendar dev route failed:', error.message)
    res.statusCode = 500
    res.setHeader('Content-Type', 'text/plain; charset=utf-8')
    res.end(`ddl-calendar dev route failed: ${error.message}`)
  }
}

// 站点 profile 覆盖插件：PPAGE_SITE 启用时，dev 从 sites/<name>/ 伺服
// config.yml / content / assets，build 时覆盖写入 dist。未启用时全部 no-op。
function ppageSitePlugin(isSsrBuild) {
  const siteDir = getSiteDir()
  return {
    name: 'ppage-site-override',
    configureServer(server) {
      if (!siteDir) return
      const contentDir = getContentDir()
      const configPath = getConfigPath()
      const assetsDir = getAssetsDir()
      const sitePublicDir = getSitePublicDir()
      server.middlewares.use((req, res, next) => {
        const url = (req.url || '').split('?')[0]
        try {
          if (url === '/config.yml' && fs.existsSync(configPath)) return serveFile(res, configPath)
          if (url.startsWith('/content/')) {
            const f = path.join(contentDir, decodeURIComponent(url.slice('/content/'.length)))
            if (isInside(contentDir, f) && fs.existsSync(f)) return serveFile(res, f)
          }
          if (url.startsWith('/assets/')) {
            const f = path.join(assetsDir, decodeURIComponent(url.slice('/assets/'.length)))
            if (isInside(assetsDir, f) && fs.existsSync(f)) return serveFile(res, f)
          }
          if (sitePublicDir && url !== '/' && !url.includes('..')) {
            const f = path.join(sitePublicDir, decodeURIComponent(url.slice(1)))
            if (isInside(sitePublicDir, f) && fs.existsSync(f) && fs.statSync(f).isFile()) return serveFile(res, f)
          }
        } catch (_) { /* fall through */ }
        next()
      })
    },
    closeBundle() {
      // closeBundle 仅在 build 时触发；SSR 入口构建不需要重复写入 dist
      if (!siteDir || isSsrBuild) return
      console.log(`\n🌐 写入站点 profile "${getSiteName()}" 到 dist...`)
      const dist = path.join(rootDir, 'dist')
      if (fs.existsSync(getConfigPath())) fs.copyFileSync(getConfigPath(), path.join(dist, 'config.yml'))
      copyDir(getContentDir(), path.join(dist, 'content'))
      copyDir(getAssetsDir(), path.join(dist, 'assets'))
      if (getSitePublicDir()) copyDir(getSitePublicDir(), dist)
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ command, mode, isSsrBuild }) => {
  // 使用相对路径，自动适配任何部署路径
  // './' 表示相对于当前 HTML 文件的路径
  // 优点：
  // 1. 可以部署到任意路径（根路径、子目录、多层子目录）
  // 2. 无需配置环境变量
  // 3. 本地预览和线上部署行为完全一致
  const base = './'
  
  return {
    plugins: [
      ppageInlineConfigPlugin(),
      ppageSitePlugin(isSsrBuild),
      react(),
      // 复制当前站点 profile 的 content 目录到构建输出（未启用 profile 时即产品根目录 content/）
      // 注意：必须使用 profile 目录，否则产品自带的 demo 文件会随构建一起发布
      viteStaticCopy({
        targets: [
          {
            src: path.relative(rootDir, getContentDir()) || 'content',
            dest: ''
          }
        ]
      }),
      // 自定义插件：为 Markdown 文件设置正确的字符编码
      {
        name: 'markdown-encoding',
        configureServer(server) {
          server.middlewares.use(serveDdlCalendarDevRoute)

          // 使用 transform 钩子拦截 .md 文件请求
          server.middlewares.use(async (req, res, next) => {
            if (req.url && req.url.endsWith('.md')) {
              try {
                // 读取文件内容
                const filePath = req.url.replace(/^\//, '');
                const fullPath = `${process.cwd()}/${filePath}`;
                
                if (fs.existsSync(fullPath)) {
                  const content = fs.readFileSync(fullPath, 'utf-8');
                  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
                  res.setHeader('Cache-Control', 'no-cache');
                  res.end(content);
                  return;
                }
              } catch (err) {
                // 如果出错，继续使用默认处理
              }
            }
            next();
          });
        },
        configurePreviewServer(server) {
          server.middlewares.use(async (req, res, next) => {
            if (req.url && req.url.endsWith('.md')) {
              try {
                const filePath = req.url.replace(/^\//, '');
                const fullPath = `${process.cwd()}/dist/${filePath}`;
                
                if (fs.existsSync(fullPath)) {
                  const content = fs.readFileSync(fullPath, 'utf-8');
                  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
                  res.setHeader('Cache-Control', 'no-cache');
                  res.end(content);
                  return;
                }
              } catch (err) {
                // 如果出错，继续使用默认处理
              }
            }
            next();
          });
        },
      },
      // SSG 插件：构建完成后执行预渲染
      {
        name: 'ssg-prerender',
        closeBundle() {
          if (command === 'build' && !isSsrBuild) {
            console.log('\n🚀 开始执行 SSG 预渲染...');
            try {
              // 执行预渲染脚本
              execSync('node scripts/prerender.js', { stdio: 'inherit' });
              // 生成 sitemap 和 robots.txt
              execSync('node scripts/generate-sitemap.js', { stdio: 'inherit' });
              // 为导航路由生成 200 响应的壳文件（GitHub Pages 无服务端重写）
              execSync('node scripts/prerender-routes.js', { stdio: 'inherit' });
              console.log('✨ SSG 预渲染完成！\n');
            } catch (error) {
              console.error('❌ SSG 预渲染失败:', error.message);
              // 不中断构建流程
            }
          }
        }
      }
    ],
    base,
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: false,
      minify: 'esbuild',
    },
  };
});
