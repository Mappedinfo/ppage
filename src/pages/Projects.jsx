import React from 'react';
import { useConfig } from '../config/ConfigContext';
import { useI18n } from '../i18n/I18nContext';
import styles from './Projects.module.css';

/**
 * 项目列表页面组件
 */
export function Projects() {
  const { config } = useConfig();
  const { t } = useI18n();
  const projects = config?.projects || [];

  return (
    <div className={styles.projects}>
      <h1 className={styles.title}>{t('projects.title')}</h1>
      
      {projects.length === 0 ? (
        <p className={styles.empty}>{t('projects.empty')}</p>
      ) : (
        <div className={styles.grid}>
          {projects.map((project, index) => (
            <article key={index} className={styles.card}>
              <h2 className={styles.name}>{project.name}</h2>
              
              {project.description && (
                <p className={styles.description}>{project.description}</p>
              )}
              
              {project.tags && project.tags.length > 0 && (
                <div className={styles.tags}>
                  {project.tags.map((tag, tagIndex) => (
                    <span key={tagIndex} className={styles.tag}>{tag}</span>
                  ))}
                </div>
              )}
              
              {project.url && (
                <a 
                  href={project.url} 
                  className={styles.link}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {t('projects.viewProject')}
                </a>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
