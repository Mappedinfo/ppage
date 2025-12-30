/**
 * 文件扫描工具 - 从 Markdown 文件中自动提取文件引用
 */

import { loadAllMarkdownFiles } from './markdownIndex';

/**
 * 从 Markdown 内容中提取文件链接
 * @param {string} markdown - Markdown 文本
 * @returns {Array} 文件链接数组
 */
export function extractFileLinks(markdown) {
  const files = [];
  
  // 匹配 Markdown 链接: [文本](路径)
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  let match;
  
  while ((match = linkRegex.exec(markdown)) !== null) {
    const text = match[1];
    const path = match[2];
    
    // 只处理 /content/files/ 路径的文件
    if (path.startsWith('/content/files/')) {
      const fileInfo = parseFilePath(path, text);
      if (fileInfo) {
        files.push(fileInfo);
      }
    }
  }
  
  return files;
}

/**
 * 解析文件路径，提取文件信息
 * @param {string} path - 文件路径
 * @param {string} title - 链接文本（作为标题）
 * @returns {Object} 文件信息对象
 */
function parseFilePath(path, title) {
  // 提取文件扩展名
  const ext = path.split('.').pop().toLowerCase();
  
  // 确定文件类型
  const type = getFileType(ext);
  
  // 提取文件名（不含扩展名）
  const fileName = path.split('/').pop();
  const nameWithoutExt = fileName.substring(0, fileName.lastIndexOf('.'));
  
  return {
    title: title || nameWithoutExt,
    path: path,
    type: type,
    extension: ext,
    preview: type === 'pdf' // PDF 默认开启预览
  };
}

/**
 * 根据扩展名判断文件类型
 * @param {string} ext - 文件扩展名
 * @returns {string} 文件类型
 */
function getFileType(ext) {
  const typeMap = {
    // PDF
    'pdf': 'pdf',
    
    // 文档
    'doc': 'document',
    'docx': 'document',
    'txt': 'document',
    'md': 'document',
    'odt': 'document',
    
    // 表格
    'xls': 'spreadsheet',
    'xlsx': 'spreadsheet',
    'csv': 'spreadsheet',
    'ods': 'spreadsheet',
    
    // 演示文稿
    'ppt': 'presentation',
    'pptx': 'presentation',
    'odp': 'presentation',
    
    // 图片
    'jpg': 'image',
    'jpeg': 'image',
    'png': 'image',
    'gif': 'image',
    'svg': 'image',
    'webp': 'image',
    
    // 视频
    'mp4': 'video',
    'avi': 'video',
    'mov': 'video',
    'mkv': 'video',
    'webm': 'video',
    
    // 音频
    'mp3': 'audio',
    'wav': 'audio',
    'ogg': 'audio',
    'm4a': 'audio',
    
    // 压缩包
    'zip': 'archive',
    'rar': 'archive',
    '7z': 'archive',
    'tar': 'archive',
    'gz': 'archive',
  };
  
  return typeMap[ext] || 'file';
}

/**
 * 扫描所有 Markdown 文件并提取文件引用
 * @param {Array} markdownFiles - Markdown 文件数组 [{path, content, title}]
 * @returns {Array} 去重后的文件列表
 */
export async function scanMarkdownFiles(markdownFiles) {
  const allFiles = [];
  const fileMap = new Map(); // 用于去重
  
  for (const mdFile of markdownFiles) {
    const files = extractFileLinks(mdFile.content);
    
    files.forEach(file => {
      // 添加来源信息
      const fileWithSource = {
        ...file,
        relatedPost: mdFile.title || mdFile.path.split('/').pop().replace('.md', ''),
        sourcePath: mdFile.path
      };
      
      // 使用路径作为唯一标识进行去重
      if (!fileMap.has(file.path)) {
        fileMap.set(file.path, fileWithSource);
      } else {
        // 如果文件已存在，添加额外的关联信息
        const existing = fileMap.get(file.path);
        if (!existing.relatedPosts) {
          existing.relatedPosts = [existing.relatedPost];
        }
        existing.relatedPosts.push(fileWithSource.relatedPost);
        existing.relatedPost = existing.relatedPosts.join(', ');
      }
    });
  }
  
  return Array.from(fileMap.values());
}

/**
 * 自动扫描并生成文件列表
 * @returns {Promise<Array>} 文件列表
 */
export async function autoGenerateFileList() {
  try {
    // 使用 Vite 的 glob 功能加载所有 Markdown 文件
    const markdownFiles = await loadAllMarkdownFiles();
    
    // 扫描并提取文件引用
    const files = await scanMarkdownFiles(markdownFiles);
    
    console.log(`自动扫描完成，找到 ${files.length} 个文件引用`);
    
    return files;
  } catch (error) {
    console.error('自动生成文件列表失败:', error);
    return [];
  }
}
