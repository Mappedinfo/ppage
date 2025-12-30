/**
 * Markdown 文件索引生成器
 * 使用 Vite 的 import.meta.glob 自动发现所有 Markdown 文件
 */

// 使用 Vite 的 glob 导入功能
const postsModules = import.meta.glob('/content/posts/**/*.md', { as: 'raw', eager: false });
const pagesModules = import.meta.glob('/content/pages/**/*.md', { as: 'raw', eager: false });

/**
 * 加载所有 Markdown 文件
 * @returns {Promise<Array>} Markdown 文件数组
 */
export async function loadAllMarkdownFiles() {
  const markdownFiles = [];
  
  // 加载 posts
  for (const path in postsModules) {
    try {
      const content = await postsModules[path]();
      const titleMatch = content.match(/^#\s+(.+)$/m);
      const title = titleMatch ? titleMatch[1] : path.split('/').pop().replace('.md', '');
      
      markdownFiles.push({
        path,
        content,
        title,
        type: 'post'
      });
    } catch (error) {
      console.error(`加载文件失败: ${path}`, error);
    }
  }
  
  // 加载 pages
  for (const path in pagesModules) {
    try {
      const content = await pagesModules[path]();
      const titleMatch = content.match(/^#\s+(.+)$/m);
      const title = titleMatch ? titleMatch[1] : path.split('/').pop().replace('.md', '');
      
      markdownFiles.push({
        path,
        content,
        title,
        type: 'page'
      });
    } catch (error) {
      console.error(`加载文件失败: ${path}`, error);
    }
  }
  
  return markdownFiles;
}

/**
 * 获取 Markdown 文件列表（仅路径和标题，不加载内容）
 * @returns {Array} 文件信息数组
 */
export function getMarkdownFileList() {
  const fileList = [];
  
  // 获取 posts 列表
  Object.keys(postsModules).forEach(path => {
    fileList.push({
      path,
      type: 'post'
    });
  });
  
  // 获取 pages 列表
  Object.keys(pagesModules).forEach(path => {
    fileList.push({
      path,
      type: 'page'
    });
  });
  
  return fileList;
}
