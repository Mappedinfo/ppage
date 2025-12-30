import React, { useState, useEffect } from 'react';
import { useConfig } from '../config/ConfigContext';
import { useI18n } from '../i18n/I18nContext';
import { PDFViewer } from '../components/common/PDFViewer';
import { DownloadButton } from '../components/common/DownloadButton';
import { autoGenerateFileList } from '../utils/fileScanner';
import styles from './Files.module.css';

/**
 * 文件列表页面组件
 * 支持两种方式获取文件列表：
 * 1. 从配置文件中读取（手动配置）
 * 2. 自动扫描 Markdown 中的文件引用（自动发现）
 */
export function Files() {
  const { config } = useConfig();
  const { t } = useI18n();
  const configFiles = config?.files || [];
  const [scannedFiles, setScannedFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // 加载自动扫描的文件
  useEffect(() => {
    async function loadFiles() {
      setLoading(true);
      try {
        const files = await autoGenerateFileList();
        setScannedFiles(files);
      } catch (error) {
        console.error('自动扫描文件失败:', error);
      } finally {
        setLoading(false);
      }
    }
    
    loadFiles();
  }, []);
  
  // 合并配置文件和自动扫描的文件，去重
  const allFiles = React.useMemo(() => {
    const fileMap = new Map();
    
    // 先添加配置文件中的文件（优先级更高）
    configFiles.forEach(file => {
      fileMap.set(file.path, { ...file, source: 'config' });
    });
    
    // 再添加自动扫描的文件（如果不存在）
    scannedFiles.forEach(file => {
      if (!fileMap.has(file.path)) {
        fileMap.set(file.path, { ...file, source: 'auto' });
      }
    });
    
    return Array.from(fileMap.values());
  }, [configFiles, scannedFiles]);

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
      <div className={styles.header}>
        <h1 className={styles.title}>{t('files.title')}</h1>
        <div className={styles.stats}>
          {loading && <span className={styles.loading}>{t('files.scanning')}</span>}
          {!loading && (
            <span className={styles.count}>
              {t('files.count', { count: allFiles.length })}
              {configFiles.length > 0 && ` (${t('files.manualCount', { count: configFiles.length })})`}
              {scannedFiles.length > 0 && ` (${t('files.autoCount', { count: scannedFiles.length })})`}
            </span>
          )}
        </div>
      </div>
      
      {allFiles.length === 0 && !loading ? (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>📂</div>
          <p className={styles.emptyText}>{t('files.empty')}</p>
          <p className={styles.emptyHint}>
            {t('files.emptyHint')}
          </p>
        </div>
      ) : (
        <div className={styles.grid}>
          {allFiles.map((file, index) => {
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
                      {t('files.typeLabel')}: {file.type.toUpperCase()}
                    </span>
                  )}
                  {file.size && (
                    <span className={styles.size}>
                      {t('files.sizeLabel')}: {file.size}
                    </span>
                  )}
                </div>

                {/* 关联的 posts 或项目 */}
                {relatedItems.length > 0 && (
                  <div className={styles.related}>
                    <h3 className={styles.relatedTitle}>{t('files.relatedTitle')}:</h3>
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
                    <PDFViewer url={file.path} title={file.title} />
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
                        {t('files.openInNewTab')}
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
