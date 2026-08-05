import React from 'react'
import { Link } from 'react-router-dom'
import { useProfileConfig, useConfig } from '../config/ConfigContext'
import { useI18n } from '../i18n/I18nContext'
import { NewsTimeline } from '../components/common/NewsTimeline'
import { SocialIcon } from '../components/common/SocialIcon'
import styles from './Home.module.css'

/**
 * 首页组件
 */
export function Home() {
  const profile = useProfileConfig()
  const { config } = useConfig()
  const { t } = useI18n()
  const socialLinks = config?.social || []
  const projects = config?.projects || []
  const featuredProjects = projects.filter(project => project.featured === true)
  const homeProjects =
    featuredProjects.length > 0 ? featuredProjects : projects.slice(0, 3)
  const hasMoreProjects = projects.length > homeProjects.length

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
        {socialLinks.length > 0 && (
          <div className={styles.socialLinks}>
            {socialLinks.map((link, index) => (
              <a
                key={`${link.name}-${index}`}
                href={link.url}
                className={styles.socialLink}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={link.name}
                title={link.name}
              >
                <SocialIcon icon={link.icon} size={20} />
                <span>{link.name}</span>
              </a>
            ))}
          </div>
        )}
      </div>

      {/* 项目列表 */}
      {homeProjects.length > 0 && (
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>{t('home.projectsSection')}</h2>
            {hasMoreProjects && (
              <Link to="/projects" className={styles.sectionLink}>
                {t('home.viewAllProjects')} →
              </Link>
            )}
          </div>
          <div className={styles.projects}>
            {homeProjects.map((project, index) => (
              <div key={index} className={styles.projectCard}>
                <h3 className={styles.projectName}>{project.name}</h3>
                {project.description && (
                  <p className={styles.projectDescription}>
                    {project.description}
                  </p>
                )}
                {project.tags && project.tags.length > 0 && (
                  <div className={styles.tags}>
                    {project.tags.map((tag, tagIndex) => (
                      <span key={tagIndex} className={styles.tag}>
                        {tag}
                      </span>
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

      {/* 新闻/动态时间轴 */}
      <NewsTimeline limit={5} />
    </div>
  )
}
