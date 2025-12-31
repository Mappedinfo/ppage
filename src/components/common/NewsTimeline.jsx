import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useConfig } from '../../config/ConfigContext';
import { useI18n } from '../../i18n/I18nContext';
import styles from './NewsTimeline.module.css';

/**
 * 新闻时间轴组件 - 用于在首页展示最近动态
 * @param {number} limit - 显示的新闻数量限制，默认为 5
 */
export function NewsTimeline({ limit = 5 }) {
  const { config } = useConfig();
  const { t } = useI18n();

  const newsItems = config?.news || [];

  // 按时间排序并限制数量
  const recentNews = useMemo(() => {
    return [...newsItems]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, limit);
  }, [newsItems, limit]);

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

  if (newsItems.length === 0) {
    return null;
  }

  return (
    <div className={styles.newsTimeline}>
      <div className={styles.header}>
        <h2 className={styles.title}>{t('news.recentNews')}</h2>
        <Link to="/news" className={styles.viewAll}>
          {t('news.viewAll')} →
        </Link>
      </div>

      <div className={styles.timeline}>
        {recentNews.map((item, index) => (
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
                
                {(item.location || item.venue) && (
                  <div className={styles.meta}>
                    {item.location && <span>📍 {item.location}</span>}
                    {item.venue && <span>🏛️ {item.venue}</span>}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
