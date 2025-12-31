import React, { useMemo, useEffect, useRef } from 'react';
import { renderMarkdown } from '../../utils/markdown';
import styles from './MarkdownRenderer.module.css';
import 'highlight.js/styles/github-dark.css';

/**
 * Markdown 渲染器组件
 * @param {Object} props
 * @param {string} props.content - Markdown 内容
 * @param {string} props.className - 自定义样式类
 * @param {Function} props.onInternalLinkClick - 内部链接点击回调 (docId) => {}
 */
export function MarkdownRenderer({ content, className = '', onInternalLinkClick }) {
  const containerRef = useRef(null);
  
  // 使用 useMemo 缓存渲染结果
  const html = useMemo(() => {
    if (!content) return '';
    return renderMarkdown(content);
  }, [content]);

  // 处理内部链接点击
  useEffect(() => {
    if (!containerRef.current || !onInternalLinkClick) return;
    
    const handleClick = (e) => {
      const target = e.target.closest('a');
      if (!target) return;
      
      const href = target.getAttribute('href');
      if (!href) return;
      
      // 处理 #doc- 格式的内部链接
      if (href.startsWith('#doc-')) {
        e.preventDefault();
        const docId = href.substring(5); // 移除 '#doc-' 前缀
        onInternalLinkClick(docId);
        return;
      }
      
      // 处理 /content/ 格式的内部链接
      if (href.startsWith('/content/')) {
        e.preventDefault();
        // 转换路径为文档 ID
        const docId = href
          .replace(/^\/content\//, '')
          .replace(/\.md$/, '')
          .replace(/\.(zh|en)$/, '')
          .replace(/\//g, '-');
        onInternalLinkClick(docId);
        return;
      }
    };
    
    const container = containerRef.current;
    container.addEventListener('click', handleClick);
    
    return () => {
      container.removeEventListener('click', handleClick);
    };
  }, [onInternalLinkClick]);

  if (!content) {
    return null;
  }

  return (
    <div 
      ref={containerRef}
      className={`${styles.markdown} ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
