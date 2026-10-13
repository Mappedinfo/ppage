import { renderToString } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import App from './App.jsx'

/**
 * SSR 入口：供构建脚本（scripts/prerender-routes.js）预渲染路由 HTML。
 * 配置由调用方注入（构建时读取的站点配置），路由使用 MemoryRouter 以脱离 DOM 依赖。
 * 客户端 main.jsx 检测到 <meta name="prerender"> 后用 hydrateRoot 接管。
 */
export function renderRoute(path, config) {
  return renderToString(
    <App
      RouterComponent={MemoryRouter}
      routerProps={{ initialEntries: [path] }}
      initialConfig={config}
    />
  )
}
