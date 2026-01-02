import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// 注销所有 Service Worker（清理遗留的 SW）
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(registrations => {
    registrations.forEach(registration => {
      registration.unregister()
      console.log('Service Worker unregistered:', registration.scope)
    })
  })
}

// 检测是否是 SSG 预渲染页面
const rootElement = document.getElementById('root')
const isPrerendered =
  rootElement &&
  rootElement.hasChildNodes() &&
  document.querySelector('meta[name="prerender"]')

if (isPrerendered) {
  // SSG 页面：使用 hydrateRoot 进行水合
  console.log('💧 检测到 SSG 预渲染内容，开始 React Hydration...')
  hydrateRoot(
    rootElement,
    <StrictMode>
      <App />
    </StrictMode>
  )
} else {
  // 常规 CSR 页面：使用 createRoot 渲染
  console.log('🌱 常规 CSR 渲染...')
  createRoot(rootElement).render(
    <StrictMode>
      <App />
    </StrictMode>
  )
}
