import React from 'react';
import { useProfileConfig, useConfig } from '../config/ConfigContext';
import { useI18n } from '../i18n/I18nContext';
import styles from './Home.module.css';

/**
 * 首页组件
 */
export function Home() {
  const profile = useProfileConfig();
  const { config } = useConfig();
  const { t } = useI18n();

  return (
    <div className={styles.home}>
      <div className={styles.hero}>
        {profile?.avatar && (
          <img 
            src={profile.avatar} 
            alt={profile.name}
            className={styles.avatar}
          />
        )}
        <h1 className={styles.name}>{profile?.name || t('home.welcome')}</h1>
        {profile?.bio && <p className={styles.bio}>{profile.bio}</p>}
        {profile?.location && (
          <p className={styles.location}>📍 {profile.location}</p>
        )}
      </div>

      {/* 项目列表 */}
      {config?.projects && config.projects.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>{t('home.projectsSection')}</h2>
          <div className={styles.projects}>
            {config.projects.map((project, index) => (
              <div key={index} className={styles.projectCard}>
                <h3 className={styles.projectName}>{project.name}</h3>
                {project.description && (
                  <p className={styles.projectDescription}>{project.description}</p>
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
                    className={styles.projectLink}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {t('home.viewProject')}
                  </a>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
