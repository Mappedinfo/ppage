/**
 * English language pack
 */
export const en = {
  // Common
  common: {
    loading: 'Loading...',
    error: 'Error occurred',
    empty: 'No content',
    viewMore: 'View More',
    download: 'Download',
    openInNewTab: 'Open in New Tab',
  },

  // Page titles
  pages: {
    home: 'Home',
    about: 'About',
    posts: 'Blog',
    projects: 'Projects',
    docs: 'Docs',
    files: 'Files',
    news: 'News',
    tutorials: 'Tutorials',
    development: 'Development',
  },

  // Home page
  home: {
    welcome: 'Welcome',
    projectsSection: 'Projects',
    viewProject: 'View Project →',
  },

  // About page
  about: {
    title: 'About Me',
    bioTitle: 'Biography',
    bioDefault: 'Welcome to my personal homepage!',
    contactTitle: 'Contact',
    emailLabel: 'Email',
    siteTitle: 'About This Site',
    siteDescription:
      'This site is built with PPage, a pure frontend personal homepage generation system. It supports quick setup through YAML configuration files, Markdown content creation, multiple theme switching, and deployment on GitHub Pages.',
  },

  // Blog page
  posts: {
    title: 'Blog Posts',
    listTitle: 'Post List',
    count: '{count} posts in total',
    empty: 'No blog posts',
    emptyHint:
      'Add Markdown files to content/posts/ directory for auto-discovery',
    selectPost: 'Please select a post',
    loadError: 'Failed to load post',
  },

  // Documentation page
  pagesPage: {
    title: 'Documentation',
    listTitle: 'Document List',
    count: '{count} documents in total',
    empty: 'No documents',
    emptyHint:
      'Add Markdown files to content/pages/ directory for auto-discovery',
    selectPage: 'Please select a document',
    loadError: 'Failed to load document',
  },

  // Projects page
  projects: {
    title: 'Projects',
    empty: 'No projects',
    viewProject: 'View Project →',
  },

  // Files page
  files: {
    title: 'Files',
    scanning: 'Scanning...',
    count: '{count} files in total',
    manualCount: '{count} manual',
    autoCount: '{count} auto-discovered',
    empty: 'No files in the system',
    emptyHint: 'You can add files in the files section of config.yml',
    typeLabel: 'Type',
    sizeLabel: 'Size',
    relatedTitle: 'Related',
    openInNewTab: 'Open in New Tab',
  },

  // Footer
  footer: {
    poweredBy: 'Powered by',
    poweredByLink: 'PPage',
    poweredBySuffix: '',
  },

  // Language switcher
  language: {
    zh: '中文',
    en: 'English',
  },

  // Themes
  theme: {
    light: 'Light',
    dark: 'Dark',
    academic: 'Academic',
    glass: 'Glass Art',
  },

  // News page
  news: {
    title: 'News & Updates',
    empty: 'No news yet',
    emptyHint: 'Add news items in the news section of config.yml',
    upcoming: 'Upcoming',
    viewDetails: 'View Details',
    recentNews: 'Recent News',
    viewAll: 'View All',
    // News types
    types: {
      paper: 'Paper',
      award: 'Award',
      talk: 'Talk',
      visit: 'Visit',
      conference: 'Conference',
      graduation: 'Graduation',
      service: 'Service',
      other: 'Other',
    },
    // Paper status
    status: {
      accepted: 'Accepted',
      online: 'Online',
      published: 'Published',
      submitted: 'Submitted',
      reject: 'Rejected',
    },
  },

  // Document Center Component
  documentCenter: {
    title: 'Documentation',
    navigation: 'Navigation',
    count: '{count} documents in total',
    empty: 'No documents',
    selectDocument: 'Please select a document',
  },

  // Tutorials page
  tutorials: {
    title: 'Tutorials',
    listTitle: 'Tutorial List',
    count: '{count} tutorials in total',
    empty: 'No tutorials',
    emptyHint:
      'Add Markdown files to content/tutorials/ directory for auto-discovery',
    selectTutorial: 'Please select a tutorial',
    loadError: 'Failed to load tutorial',
    // Tutorial categories
    categories: {
      gettingStarted: 'Getting Started',
      basic: 'Basic',
      advanced: 'Advanced',
      deployment: 'Deployment',
    },
  },

  // 404 Page
  notFound: {
    title: 'Page Not Found',
    description:
      'Sorry, the page you are looking for does not exist or has been removed.',
    backHome: 'Back to Home',
    goBack: 'Go Back',
  },
}
