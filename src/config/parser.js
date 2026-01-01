import yaml from 'js-yaml'
import { getAssetPath } from '../utils/pathUtils'

/**
 * 解析 YAML 配置文件
 * @param {string} yamlContent - YAML 文件内容
 * @returns {object} 解析后的配置对象
 */
export function parseConfig(yamlContent) {
  try {
    const config = yaml.load(yamlContent)
    return config
  } catch (error) {
    console.error('配置文件解析失败:', error)
    throw new Error(`配置文件解析错误: ${error.message}`)
  }
}

/**
 * 从公共目录加载配置文件
 * @returns {Promise<object>} 配置对象
 */
export async function loadConfig() {
  try {
    // 使用 getAssetPath 获取正确的配置文件路径
    // 自动适配任意部署路径
    const configPath = getAssetPath('/config.yml')
    const response = await fetch(configPath)
    if (!response.ok) {
      throw new Error(`配置文件加载失败: ${response.statusText}`)
    }
    const yamlContent = await response.text()
    return parseConfig(yamlContent)
  } catch (error) {
    console.error('配置文件加载失败:', error)
    // 返回默认配置
    return getDefaultConfig()
  }
}

/**
 * 获取默认配置
 * @returns {object} 默认配置对象
 */
function getDefaultConfig() {
  return {
    site: {
      title: '个人主页',
      description: '基于 Markdown 的个人主页系统',
      author: 'Your Name',
      baseUrl: '/',
    },
    profile: {
      name: 'Your Name',
      avatar: '/assets/images/avatar.jpg',
      bio: '研究者 | 开发者 | 学习者',
      email: 'your.email@example.com',
    },
    social: [],
    navigation: [
      { name: '首页', path: '/' },
      { name: '关于', path: '/about' },
    ],
    theme: {
      default: 'light',
      available: ['light', 'dark'],
    },
    content: {
      postsPath: '/content/posts',
      pagesPath: '/content/pages',
      assetsPath: '/assets',
    },
    files: [],
    projects: [],
  }
}
