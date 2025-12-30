import React from 'react';
import { useConfig } from '../config/ConfigContext';
import { PDFViewer } from '../components/common/PDFViewer';
import { DownloadButton } from '../components/common/DownloadButton';
import styles from './Files.module.css';

/**
 * 文件列表页面组件
 */
export function Files() {
  const { config } = useConfig();
  const files = config?.files || [];

  // 获取文件图标
  const getFileIcon = (type) => {
    switch (type) {
      case 'pdf':
        return '📄';
      case 'document':
        return '📝';
      case 'image':
        return '🖼️';
      case 'video':
        return '🎥';
      case 'audio':
        return '🎵';
      default:
        return '📁';
    }
  };

  // 获取关联的 posts 或项目
  const getRelatedItems = (file) => {
    const items = [];
    
    if (file.relatedPost) {
      items.push({ type: 'post', title: file.relatedPost, path: '/posts' });
    }
    
    if (file.relatedProject) {
      items.push({ type: 'project', title: file.relatedProject, path: '/projects' });
    }
    
    return items;
  };

  return (
    <div className={styles.files}>
      <h1 className={styles.title}>文件列表</h1>
      
      {files.length === 0 ? (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>📂</div>
          <p className={styles.emptyText}>系统内暂时没有文件</p>
          <p className={styles.emptyHint}>
            你可以在 config.yml 的 files 配置中添加文件
          </p>
        </div>
      ) : (
        <div className={styles.grid}>
          {files.map((file, index) => {
            const relatedItems = getRelatedItems(file);
            
            return (
              <article key={index} className={styles.card}>
                <div className={styles.header}>
                  <span className={styles.icon}>{getFileIcon(file.type)}</span>
                  <h2 className={styles.name}>{file.title}</h2>
                </div>
                
                {file.description && (
                  <p className={styles.description}>{file.description}</p>
                )}
                
                <div className={styles.meta}>
                  {file.type && (
                    <span className={styles.type}>
                      类型: {file.type.toUpperCase()}
                    </span>
                  )}
                  {file.size && (
                    <span className={styles.size}>
                      大小: {file.size}
                    </span>
                  )}
                </div>

                {/* 关联的 posts 或项目 */}
                {relatedItems.length > 0 && (
                  <div className={styles.related}>
                    <h3 className={styles.relatedTitle}>相关内容:</h3>
                    <ul className={styles.relatedList}>
                      {relatedItems.map((item, idx) => (
                        <li key={idx} className={styles.relatedItem}>
                          <a href={item.path} className={styles.relatedLink}>
                            {item.type === 'post' ? '📝' : '🚀'} {item.title}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* PDF 预览 */}
                {file.type === 'pdf' && file.preview && file.path && (
                  <div className={styles.preview}>
                    <PDFViewer pdfUrl={file.path} />
                  </div>
                )}

                {/* 操作按钮 */}
                <div className={styles.actions}>
                  {file.path && (
                    <>
                      <DownloadButton 
                        fileUrl={file.path} 
                        fileName={file.title}
                        variant="primary"
                      />
                      <a 
                        href={file.path} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className={styles.viewButton}
                      >
                        在新窗口打开
                      </a>
                    </>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
