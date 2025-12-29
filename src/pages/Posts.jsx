import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MarkdownRenderer } from '../components/markdown/MarkdownRenderer';
import styles from './Posts.module.css';

/**
 * 博客文章列表页面组件
 */
export function Posts() {
  const [posts, setPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadPosts();
  }, []);

  async function loadPosts() {
    try {
      setLoading(true);
      setError(null);
      
      // 这里可以通过配置或约定来获取文章列表
      // 暂时硬编码一个示例文章
      const postFiles = [
        { name: 'welcome.md', title: '欢迎使用 PPage', path: '/content/posts/welcome.md' }
      ];
      
      setPosts(postFiles);
      
      // 默认加载第一篇文章
      if (postFiles.length > 0) {
        loadPost(postFiles[0].path);
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
        <div className={styles.loading}>加载中...</div>
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
      <h1 className={styles.title}>博客文章</h1>
      
      <div className={styles.container}>
        {/* 文章列表侧边栏 */}
        <aside className={styles.sidebar}>
          <h2 className={styles.sidebarTitle}>文章列表</h2>
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
            <div className={styles.empty}>请选择一篇文章</div>
          )}
        </main>
      </div>
    </div>
  );
}
