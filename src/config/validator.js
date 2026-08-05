/**
 * 配置验证器
 * 验证配置对象的结构和必填字段
 */

const SUPPORTED_LANGUAGES = ['zh', 'en']
const NAVIGATION_PLACEMENTS = ['primary', 'menu', 'hidden']

/**
 * 验证配置对象
 * @param {object} config - 配置对象
 * @returns {object} 验证结果 { valid: boolean, errors: string[] }
 */
export function validateConfig(config) {
  const errors = []

  // 验证 site 配置
  if (!config.site) {
    errors.push('缺少 site 配置')
  } else {
    if (!config.site.title) {
      errors.push('site.title 是必填项')
    }
  }

  // 验证 profile 配置
  if (!config.profile) {
    errors.push('缺少 profile 配置')
  } else {
    if (!config.profile.name) {
      errors.push('profile.name 是必填项')
    }
  }

  // 验证 navigation 配置
  if (!config.navigation || !Array.isArray(config.navigation)) {
    errors.push('navigation 必须是一个数组')
  } else {
    config.navigation.forEach((item, index) => {
      if (!item.name || !item.path) {
        errors.push(`navigation[${index}] 必须包含 name 和 path 字段`)
      }
      if (
        item.placement !== undefined &&
        !NAVIGATION_PLACEMENTS.includes(item.placement)
      ) {
        errors.push(
          `navigation[${index}].placement 必须是 primary、menu 或 hidden`
        )
      }
      if (
        item.reloadDocument !== undefined &&
        typeof item.reloadDocument !== 'boolean'
      ) {
        errors.push(`navigation[${index}].reloadDocument 必须是布尔值`)
      }
    })
  }

  // 验证 theme 配置
  if (!config.theme) {
    errors.push('缺少 theme 配置')
  } else {
    if (!config.theme.default) {
      errors.push('theme.default 是必填项')
    }
    if (!config.theme.available || !Array.isArray(config.theme.available)) {
      errors.push('theme.available 必须是一个数组')
    } else if (!config.theme.available.includes(config.theme.default)) {
      errors.push('theme.default 必须在 theme.available 列表中')
    }
  }

  // 验证 language 配置
  if (config.language) {
    if (
      config.language.default !== undefined &&
      !SUPPORTED_LANGUAGES.includes(config.language.default)
    ) {
      errors.push('language.default 必须是 zh 或 en')
    }
  }

  // 验证 features 配置
  if (config.features) {
    const ddlCalendar = config.features.ddlCalendar

    if (ddlCalendar) {
      if (
        ddlCalendar.enabled !== undefined &&
        typeof ddlCalendar.enabled !== 'boolean'
      ) {
        errors.push('features.ddlCalendar.enabled 必须是布尔值')
      }

      if (
        ddlCalendar.path !== undefined &&
        typeof ddlCalendar.path !== 'string'
      ) {
        errors.push('features.ddlCalendar.path 必须是字符串')
      }

      if (
        ddlCalendar.data !== undefined &&
        typeof ddlCalendar.data !== 'string'
      ) {
        errors.push('features.ddlCalendar.data 必须是字符串')
      }
    }
  }

  // 验证 social 配置
  if (config.social && Array.isArray(config.social)) {
    config.social.forEach((item, index) => {
      if (!item.name || !item.url) {
        errors.push(`social[${index}] 必须包含 name 和 url 字段`)
      }
    })
  }

  // 验证 files 配置
  if (config.files && Array.isArray(config.files)) {
    config.files.forEach((item, index) => {
      if (!item.title || !item.path) {
        errors.push(`files[${index}] 必须包含 title 和 path 字段`)
      }
    })
  }

  // 验证 collections 配置
  if (config.collections && typeof config.collections === 'object') {
    Object.entries(config.collections).forEach(([key, item]) => {
      if (
        item.placement !== undefined &&
        !NAVIGATION_PLACEMENTS.includes(item.placement)
      ) {
        errors.push(
          `collections.${key}.placement 必须是 primary、menu 或 hidden`
        )
      }
    })
  }

  // 验证 projects 配置
  if (config.projects && Array.isArray(config.projects)) {
    config.projects.forEach((item, index) => {
      if (!item.name) {
        errors.push(`projects[${index}] 必须包含 name 字段`)
      }
      if (item.featured !== undefined && typeof item.featured !== 'boolean') {
        errors.push(`projects[${index}].featured 必须是布尔值`)
      }
    })
  }

  // 验证 analytics 配置
  if (config.analytics) {
    // 如果配置了 googleAnalytics，验证格式
    if (config.analytics.googleAnalytics) {
      const gaId = config.analytics.googleAnalytics
      // GA4 测量 ID 格式：G-XXXXXXXXXX
      if (!/^G-[A-Z0-9]+$/i.test(gaId)) {
        errors.push(
          'analytics.googleAnalytics 格式不正确，应为 G-XXXXXXXXXX 格式'
        )
      }
    }
    // enableInDev 应该是布尔值
    if (
      config.analytics.enableInDev !== undefined &&
      typeof config.analytics.enableInDev !== 'boolean'
    ) {
      errors.push('analytics.enableInDev 必须是布尔值（true 或 false）')
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

/**
 * 验证并返回配置，如果验证失败则抛出错误
 * @param {object} config - 配置对象
 * @returns {object} 验证通过的配置对象
 */
export function ensureValidConfig(config) {
  const result = validateConfig(config)

  if (!result.valid) {
    const errorMessage = '配置验证失败:\n' + result.errors.join('\n')
    console.error(errorMessage)
    throw new Error(errorMessage)
  }

  return config
}

/**
 * 合并用户配置和默认配置
 * @param {object} userConfig - 用户配置
 * @param {object} defaultConfig - 默认配置
 * @returns {object} 合并后的配置
 */
export function mergeConfig(userConfig, defaultConfig) {
  return {
    site: { ...defaultConfig.site, ...userConfig.site },
    profile: { ...defaultConfig.profile, ...userConfig.profile },
    social: userConfig.social || defaultConfig.social,
    navigation: userConfig.navigation || defaultConfig.navigation,
    theme: { ...defaultConfig.theme, ...userConfig.theme },
    language: { ...defaultConfig.language, ...userConfig.language },
    features: {
      ...defaultConfig.features,
      ...userConfig.features,
      ddlCalendar: {
        ...defaultConfig.features?.ddlCalendar,
        ...userConfig.features?.ddlCalendar,
      },
    },
    content: { ...defaultConfig.content, ...userConfig.content },
    collections: userConfig.collections || defaultConfig.collections || {},
    files: userConfig.files || defaultConfig.files,
    projects: userConfig.projects || defaultConfig.projects,
    links: userConfig.links || defaultConfig.links || [],
    deploy: userConfig.deploy || defaultConfig.deploy || {},
    encryption: userConfig.encryption || defaultConfig.encryption || {},
    news: userConfig.news || defaultConfig.news || [],
    analytics: userConfig.analytics || defaultConfig.analytics || {},
  }
}
