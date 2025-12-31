import React from 'react';
import styles from './BacklinksPanel.module.css';

/**
 * 双向链接面板组件
 * 显示文档的对外链接和反向链接
 * 
 * @param {Object} props
 * @param {Array} props.outgoing - 对外链接数组
 * @param {Array} props.incoming - 反向链接数组
 * @param {Function} props.onLinkClick - 链接点击回调
 */
export function BacklinksPanel({ outgoing = [], incoming = [], onLinkClick }) {
  const hasLinks = outgoing.length > 0 || incoming.length > 0;

  if (!hasLinks) {
    return (
      <div className={styles.panel}>
        <div className={styles.empty}>
          暂无链接关系
        </div>
      </div>
    );
  }

  const getLinkTypeLabel = (type) => {
    switch (type) {
      case 'explicit':
        return '显式关联';
      case 'content':
        return '内容引用';
      case 'parent':
        return '父子关系';
      default:
        return '链接';
    }
  };

  const getLinkTypeClass = (type) => {
    return styles[`type-${type}`] || '';
  };

  return (
    <div className={styles.panel}>
      {/* 对外链接 */}
      {outgoing.length > 0 && (
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>
            <span className={styles.icon}>→</span>
            链接到的文档 ({outgoing.length})
          </h3>
          <ul className={styles.linkList}>
            {outgoing.map((link, index) => (
              <li 
                key={`${link.id}-${index}`}
                className={`${styles.linkItem} ${getLinkTypeClass(link.type)}`}
              >
                <div className={styles.linkInfo} onClick={() => onLinkClick && onLinkClick(link)}>
                  <span className={styles.linkTitle}>{link.title}</span>
                  <span className={styles.linkType}>{getLinkTypeLabel(link.type)}</span>
                </div>
                <button 
                  className={styles.jumpButton}
                  onClick={(e) => {
                    e.stopPropagation();
                    onLinkClick && onLinkClick(link);
                  }}
                  title="跳转到该文档"
                >
                  →
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 反向链接 */}
      {incoming.length > 0 && (
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>
            <span className={styles.icon}>←</span>
            被引用自 ({incoming.length})
          </h3>
          <ul className={styles.linkList}>
            {incoming.map((link, index) => (
              <li 
                key={`${link.id}-${index}`}
                className={`${styles.linkItem} ${getLinkTypeClass(link.type)}`}
              >
                <div className={styles.linkInfo} onClick={() => onLinkClick && onLinkClick(link)}>
                  <span className={styles.linkTitle}>{link.title}</span>
                  <span className={styles.linkType}>{getLinkTypeLabel(link.type)}</span>
                </div>
                <button 
                  className={styles.jumpButton}
                  onClick={(e) => {
                    e.stopPropagation();
                    onLinkClick && onLinkClick(link);
                  }}
                  title="跳转到该文档"
                >
                  →
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 统计信息 */}
      <div className={styles.stats}>
        <div className={styles.statItem}>
          <span className={styles.statLabel}>总链接数</span>
          <span className={styles.statValue}>{outgoing.length + incoming.length}</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statLabel}>连接强度</span>
          <span className={styles.statValue}>
            {outgoing.length > 0 && incoming.length > 0 ? '双向' : '单向'}
          </span>
        </div>
      </div>
    </div>
  );
}
