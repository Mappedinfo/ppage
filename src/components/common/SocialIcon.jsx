import React from 'react'
import {
  FaGithub,
  FaTwitter,
  FaLinkedin,
  FaFacebook,
  FaInstagram,
  FaYoutube,
  FaEnvelope,
  FaGlobe,
  FaMedium,
  FaReddit,
  FaStackOverflow,
  FaWeixin,
  FaWeibo,
} from 'react-icons/fa'
import {
  SiGooglescholar,
  SiOrcid,
  SiResearchgate,
  SiZhihu,
} from 'react-icons/si'

/**
 * 社交媒体图标映射
 * 支持常见的社交平台和学术平台
 */
const iconMap = {
  // 常见社交平台
  github: FaGithub,
  twitter: FaTwitter,
  linkedin: FaLinkedin,
  facebook: FaFacebook,
  instagram: FaInstagram,
  youtube: FaYoutube,
  email: FaEnvelope,
  website: FaGlobe,
  medium: FaMedium,
  reddit: FaReddit,
  stackoverflow: FaStackOverflow,
  wechat: FaWeixin,
  weibo: FaWeibo,
  zhihu: SiZhihu,

  // 学术平台
  scholar: SiGooglescholar,
  'google-scholar': SiGooglescholar,
  'google scholar': SiGooglescholar,
  orcid: SiOrcid,
  researchgate: SiResearchgate,
  'research-gate': SiResearchgate,
}

/**
 * 社交媒体图标组件
 * @param {string} icon - 图标名称（小写）
 * @param {number} size - 图标大小（默认 20）
 * @param {object} props - 其他传递给图标的属性
 */
export function SocialIcon({ icon, size = 20, ...props }) {
  // 转换为小写并查找对应的图标组件
  const iconKey = icon?.toLowerCase() || ''
  const IconComponent = iconMap[iconKey]

  // 如果找不到对应图标，返回默认的全局图标
  if (!IconComponent) {
    return <FaGlobe size={size} {...props} />
  }

  return <IconComponent size={size} {...props} />
}

/**
 * 获取所有支持的图标名称列表
 */
export function getSupportedIcons() {
  return Object.keys(iconMap)
}

/**
 * 检查图标名称是否被支持
 */
export function isIconSupported(icon) {
  const iconKey = icon?.toLowerCase() || ''
  return iconKey in iconMap
}
