import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteStaticCopy } from 'vite-plugin-static-copy'

// https://vite.dev/config/
export default defineConfig(({ command }) => {
  // 支持通过环境变量配置 base 路径
  // 开发环境默认使用 /
  // 生产环境：
  //   - 如果设置了 VITE_BASE_PATH 环境变量，使用该值
  //   - 否则使用默认值 /ppage/
  // 使用方法：
  //   根域名部署: VITE_BASE_PATH=/ npm run build
  //   子目录部署: npm run build (或 VITE_BASE_PATH=/ppage/ npm run build)
  const base = command === 'build' 
    ? (process.env.VITE_BASE_PATH || '/ppage/')
    : '/';
  
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
      minify: 'esbuild', // 使用 esbuild 代替 terser
    },
  };
});
