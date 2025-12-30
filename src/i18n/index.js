import { zh } from './locales/zh';
import { en } from './locales/en';

/**
 * 支持的语言列表
 */
export const SUPPORTED_LANGUAGES = ['zh', 'en'];

/**
 * 默认语言
 */
export const DEFAULT_LANGUAGE = 'zh';

/**
 * 语言包集合
 */
export const translations = {
  zh,
  en,
};

/**
 * 获取翻译文本
 * @param {string} lang - 语言代码
 * @param {string} key - 翻译键，支持点号分隔的路径，如 'about.title'
 * @param {object} params - 参数对象，用于替换文本中的占位符
 * @returns {string} 翻译后的文本
 */
export function t(lang, key, params = {}) {
  const keys = key.split('.');
  let value = translations[lang] || translations[DEFAULT_LANGUAGE];
  
  for (const k of keys) {
    if (value && typeof value === 'object') {
      value = value[k];
    } else {
      return key; // 如果找不到翻译，返回原始 key
    }
  }
  
  if (typeof value !== 'string') {
    return key;
  }
  
  // 替换参数占位符，如 {count}
  return value.replace(/\{(\w+)\}/g, (match, paramKey) => {
    return params[paramKey] !== undefined ? params[paramKey] : match;
  });
}
