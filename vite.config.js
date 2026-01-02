import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteStaticCopy } from 'vite-plugin-static-copy'
import { execSync } from 'child_process'
import fs from 'fs'

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
      }),
      // 自定义插件：为 Markdown 文件设置正确的字符编码
      {
        name: 'markdown-encoding',
        configureServer(server) {
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
          if (command === 'build') {
            console.log('\n🚀 开始执行 SSG 预渲染...');
            try {
              // 执行预渲染脚本
              execSync('node scripts/prerender.js', { stdio: 'inherit' });
              // 生成 sitemap 和 robots.txt
              execSync('node scripts/generate-sitemap.js', { stdio: 'inherit' });
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
