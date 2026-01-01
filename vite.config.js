import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteStaticCopy } from 'vite-plugin-static-copy'

// https://vite.dev/config/
export default defineConfig(({ command, mode }) => {
  // 使用相对路径，自动适配任何部署路径
  // './' 表示相对于当前 HTML 文件的路径
  // 优点：
  // 1. 可以部署到任意路径（根路径、子目录、多层子目录）
  // 2. 无需配置环境变量
  // 3. 本地预览和线上部署行为完全一致
  const base = './'
  
  return {
    plugins: [
      react(),
      // 复制 content 目录到构建输出
      viteStaticCopy({
        targets: [
          {
            src: 'content',
            dest: ''
          }
        ]
      })
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
