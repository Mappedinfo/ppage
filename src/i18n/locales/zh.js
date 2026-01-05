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
    docs: '文档',
    files: '文件',
    news: '动态',
    tutorials: '教程中心',
    development: '开发指南',
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
    siteDescription:
      '本站点使用 PPage 构建，这是一个纯前端的个人主页生成系统，支持通过 YAML 配置文件快速搭建个人主页，支持 Markdown 内容创作，支持多种主题切换，部署在 GitHub Pages 上。',
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

  // 文档页面
  pagesPage: {
    title: '文档中心',
    listTitle: '文档列表',
    count: '共 {count} 个文档',
    empty: '暂无文档',
    emptyHint: '在 content/pages/ 目录下添加 Markdown 文件即可自动发现',
    selectPage: '请选择一个文档',
    loadError: '加载文档失败',
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

  // 主题
  theme: {
    light: '明亮',
    dark: '暗黑',
    academic: '学术',
    glass: '透明艺术',
  },

  // 新闻/动态页面
  news: {
    title: '最新动态',
    empty: '暂无动态消息',
    emptyHint: '在 config.yml 的 news 配置中添加动态消息',
    upcoming: '即将到来',
    viewDetails: '查看详情',
    recentNews: '最近动态',
    viewAll: '查看全部',
    // 新闻类型
    types: {
      paper: '论文',
      award: '获奖',
      talk: '报告',
      visit: '访问',
      conference: '会议',
      graduation: '毕业',
      service: '服务',
      other: '其他',
    },
    // 论文状态
    status: {
      accepted: '已接收',
      online: '在线发表',
      published: '已出版',
      submitted: '已投稿',
      reject: '被拒',
    },
  },

  // 文档中心组件
  documentCenter: {
    title: '文档中心',
    navigation: '导航',
    count: '共 {count} 个文档',
    empty: '暂无文档',
    selectDocument: '请选择一个文档',
  },

  // 教程中心页面
  tutorials: {
    title: '教程中心',
    listTitle: '教程列表',
    count: '共 {count} 个教程',
    empty: '暂无教程',
    emptyHint: '在 content/tutorials/ 目录下添加 Markdown 文件即可自动发现',
    selectTutorial: '请选择一个教程',
    loadError: '加载教程失败',
    // 教程分类
    categories: {
      gettingStarted: '快速入门',
      basic: '基础教程',
      advanced: '高级教程',
      deployment: '部署指南',
    },
  },

  // 404 页面
  notFound: {
    title: '页面未找到',
    description: '抱歉，您访问的页面不存在或已被移除。',
    backHome: '返回首页',
    goBack: '返回上一页',
  },
}
