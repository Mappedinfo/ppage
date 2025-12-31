import React, { useMemo } from 'react';
import { useConfig } from '../config/ConfigContext';
import { useI18n } from '../i18n/I18nContext';
import styles from './News.module.css';

/**
 * 新闻/时间轴页面组件
 * 展示学术活动、论文状态、访问交流等动态信息
 */
export function News() {
  const { config } = useConfig();
  const { t } = useI18n();

  // 获取新闻配置
  const newsItems = config?.news || [];

  // 按时间排序新闻（最新的在前）
  const sortedNews = useMemo(() => {
    return [...newsItems].sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateB - dateA;
    });
  }, [newsItems]);

  // 格式化日期
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // 判断是否是未来事件
  const isFutureEvent = (dateString) => {
    return new Date(dateString) > new Date();
  };

  // 获取新闻类型的样式类名
  const getTypeClassName = (type) => {
    const typeMap = {
      'paper': styles.typePaper,
      'award': styles.typeAward,
      'talk': styles.typeTalk,
      'visit': styles.typeVisit,
      'conference': styles.typeConference,
      'graduation': styles.typeGraduation,
      'service': styles.typeService,
      'other': styles.typeOther
    };
    return typeMap[type] || styles.typeOther;
  };

  // 获取论文状态的样式类名
  const getStatusClassName = (status) => {
    const statusMap = {
      'accepted': styles.statusAccepted,
      'online': styles.statusOnline,
      'published': styles.statusPublished,
      'submitted': styles.statusSubmitted,
      'reject': styles.statusReject
    };
    return statusMap[status] || '';
  };

  return (
    <div className={styles.news}>
      <h1 className={styles.title}>{t('news.title')}</h1>
      
      {newsItems.length === 0 ? (
        <div className={styles.empty}>
          <p>{t('news.empty')}</p>
          <p className={styles.emptyHint}>{t('news.emptyHint')}</p>
        </div>
      ) : (
        <div className={styles.timeline}>
          {sortedNews.map((item, index) => (
            <div 
              key={index} 
              className={`${styles.timelineItem} ${
                isFutureEvent(item.date) ? styles.futureEvent : styles.pastEvent
              }`}
            >
              <div className={styles.timelineMarker}>
                <div className={`${styles.dot} ${getTypeClassName(item.type)}`} />
              </div>
              
              <div className={styles.timelineContent}>
                <div className={styles.dateLabel}>
                  {formatDate(item.date)}
                  {isFutureEvent(item.date) && (
                    <span className={styles.futureBadge}>{t('news.upcoming')}</span>
                  )}
                </div>
                
                <div className={styles.newsCard}>
                  <div className={styles.newsHeader}>
                    <span className={`${styles.typeTag} ${getTypeClassName(item.type)}`}>
                      {t(`news.types.${item.type}`)}
                    </span>
                    {item.status && (
                      <span className={`${styles.statusTag} ${getStatusClassName(item.status)}`}>
                        {t(`news.status.${item.status}`)}
                      </span>
                    )}
                  </div>
                  
                  <h3 className={styles.newsTitle}>{item.title}</h3>
                  
                  {item.description && (
                    <p className={styles.newsDescription}>{item.description}</p>
                  )}
                  
                  {item.location && (
                    <p className={styles.location}>📍 {item.location}</p>
                  )}
                  
                  {item.venue && (
                    <p className={styles.venue}>🏛️ {item.venue}</p>
                  )}
                  
                  {item.tags && item.tags.length > 0 && (
                    <div className={styles.tags}>
                      {item.tags.map((tag, tagIndex) => (
                        <span key={tagIndex} className={styles.tag}>{tag}</span>
                      ))}
                    </div>
                  )}
                  
                  {item.url && (
                    <a 
                      href={item.url} 
                      className={styles.link}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {t('news.viewDetails')} →
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
