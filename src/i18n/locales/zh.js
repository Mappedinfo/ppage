/**
 * 中文语言包
 */
export const zh = {
  // 通用
  common: {
    loading: '加载中...',
    error: '出错了',
    empty: '暂无内容',
    viewMore: '查看更多',
    download: '下载',
    openInNewTab: '在新窗口打开',
  },

  // 页面标题
  pages: {
    home: '首页',
    about: '关于',
    posts: '博客',
    projects: '项目',
    files: '文件',
  },

  // 首页
  home: {
    welcome: '欢迎',
    projectsSection: '项目',
    viewProject: '查看项目 →',
  },

  // 关于页面
  about: {
    title: '关于我',
    bioTitle: '个人简介',
    bioDefault: '欢迎来到我的个人主页！',
    contactTitle: '联系方式',
    emailLabel: 'Email',
    siteTitle: '关于本站',
    siteDescription: '本站点使用 PPage 构建，这是一个纯前端的个人主页生成系统，支持通过 YAML 配置文件快速搭建个人主页，支持 Markdown 内容创作，支持多种主题切换，部署在 GitHub Pages 上。',
  },

  // 博客页面
  posts: {
    title: '博客文章',
    listTitle: '文章列表',
    count: '共 {count} 篇文章',
    empty: '暂无博客文章',
    emptyHint: '在 content/posts/ 目录下添加 Markdown 文件即可自动发现',
    selectPost: '请选择一篇文章',
    loadError: '加载文章失败',
  },

  // 项目页面
  projects: {
    title: '项目列表',
    empty: '暂无项目',
    viewProject: '查看项目 →',
  },

  // 文件页面
  files: {
    title: '文件列表',
    scanning: '正在扫描...',
    count: '共 {count} 个文件',
    manualCount: '{count} 个手动配置',
    autoCount: '{count} 个自动发现',
    empty: '系统内暂时没有文件',
    emptyHint: '你可以在 config.yml 的 files 配置中添加文件',
    typeLabel: '类型',
    sizeLabel: '大小',
    relatedTitle: '相关内容',
    openInNewTab: '在新窗口打开',
  },

  // 页脚
  footer: {
    poweredBy: '由',
    poweredByLink: 'PPage',
    poweredBySuffix: '驱动',
  },

  // 语言切换
  language: {
    zh: '中文',
    en: 'English',
  },
};
