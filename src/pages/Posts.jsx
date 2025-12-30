import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MarkdownRenderer } from '../components/markdown/MarkdownRenderer';
import { loadAllMarkdownFiles } from '../utils/markdownIndex';
import { useI18n } from '../i18n/I18nContext';
import styles from './Posts.module.css';

/**
 * 博客文章列表页面组件
 * 自动扫描 content/posts/ 目录下的所有 Markdown 文件
 */
export function Posts() {
  const [posts, setPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { t } = useI18n();

  useEffect(() => {
    loadPosts();
  }, []);

  async function loadPosts() {
    try {
      setLoading(true);
      setError(null);
      
      // 使用自动扫描功能加载所有 Markdown 文件
      const allMarkdownFiles = await loadAllMarkdownFiles();
      
      // 只获取 posts 类型的文件
      const postFiles = allMarkdownFiles
        .filter(file => file.type === 'post')
        .map(file => ({
          name: file.path.split('/').pop(),
          title: file.title,
          path: file.path,
          content: file.content
        }));
      
      console.log(`自动发现 ${postFiles.length} 篇博客文章`);
      setPosts(postFiles);
      
      // 默认加载第一篇文章
      if (postFiles.length > 0) {
        setSelectedPost({
          path: postFiles[0].path,
          content: postFiles[0].content
        });
      }
    } catch (err) {
      console.error('加载文章列表失败:', err);
      setError('加载文章列表失败');
    } finally {
      setLoading(false);
    }
  }

  async function loadPost(path) {
    try {
      // 先从已加载的 posts 中查找
      const post = posts.find(p => p.path === path);
      if (post && post.content) {
        setSelectedPost({ path, content: post.content });
        return;
      }
      
      // 如果没有预加载的内容，则通过 fetch 加载
      const response = await fetch(path);
      if (!response.ok) {
        throw new Error(`加载文章失败: ${response.statusText}`);
      }
      const content = await response.text();
      setSelectedPost({ path, content });
    } catch (err) {
      console.error('加载文章失败:', err);
      setError(`加载文章失败: ${err.message}`);
    }
  }

  if (loading) {
    return (
      <div className={styles.posts}>
        <div className={styles.loading}>{t('common.loading')}</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.posts}>
        <div className={styles.error}>{error}</div>
      </div>
    );
  }

  return (
    <div className={styles.posts}>
      <div className={styles.header}>
        <h1 className={styles.title}>{t('posts.title')}</h1>
        {!loading && posts.length > 0 && (
          <span className={styles.count}>{t('posts.count', { count: posts.length })}</span>
        )}
      </div>
      
      {posts.length === 0 && !loading ? (
        <div className={styles.empty}>
          <p>{t('posts.empty')}</p>
          <p className={styles.hint}>{t('posts.emptyHint')}</p>
        </div>
      ) : (
        <div className={styles.container}>
        {/* 文章列表侧边栏 */}
        <aside className={styles.sidebar}>
          <h2 className={styles.sidebarTitle}>{t('posts.listTitle')}</h2>
          <ul className={styles.postList}>
            {posts.map((post, index) => (
              <li 
                key={index}
                className={`${styles.postItem} ${selectedPost?.path === post.path ? styles.active : ''}`}
                onClick={() => loadPost(post.path)}
              >
                {post.title}
              </li>
            ))}
          </ul>
        </aside>

        {/* 文章内容区域 */}
        <main className={styles.content}>
          {selectedPost ? (
            <MarkdownRenderer content={selectedPost.content} />
          ) : (
            <div className={styles.empty}>{t('posts.selectPost')}</div>
          )}
        </main>
      </div>
      )}
    </div>
  );
}
