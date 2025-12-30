/**
 * 多语言 Markdown 文件加载工具
 * 支持根据语言代码加载对应的 Markdown 文件
 */

/**
 * 加载多语言 Markdown 文件
 * @param {string} basePath - 基础路径（不含语言后缀），如 '/content/pages/about-site'
 * @param {string} language - 语言代码，如 'zh' 或 'en'
 * @param {string} fallbackLanguage - 后备语言代码，默认 'zh'
 * @returns {Promise<string|null>} Markdown 内容，如果加载失败返回 null
 */
export async function loadI18nMarkdown(basePath, language, fallbackLanguage = 'zh') {
  // 尝试加载指定语言的文件
  const paths = [
    `${basePath}.${language}.md`,  // 如: /content/pages/about-site.zh.md
    `${basePath}.md`,                // 如: /content/pages/about-site.md (无语言后缀)
  ];

  // 如果指定语言不是后备语言，也尝试后备语言
  if (language !== fallbackLanguage) {
    paths.push(`${basePath}.${fallbackLanguage}.md`);
  }

  for (const path of paths) {
    try {
      const response = await fetch(path);
      if (response.ok) {
        const content = await response.text();
        console.log(`成功加载 Markdown: ${path}`);
        return content;
      }
    } catch (error) {
      console.warn(`无法加载 ${path}:`, error.message);
    }
  }

  console.warn(`所有路径都加载失败: ${paths.join(', ')}`);
  return null;
}

/**
 * 预加载多个语言的 Markdown 文件
 * @param {string} basePath - 基础路径
 * @param {string[]} languages - 语言代码数组
 * @returns {Promise<Object>} 语言代码到内容的映射
 */
export async function preloadI18nMarkdown(basePath, languages = ['zh', 'en']) {
  const result = {};
  
  await Promise.all(
    languages.map(async (lang) => {
      const content = await loadI18nMarkdown(basePath, lang);
      if (content) {
        result[lang] = content;
      }
    })
  );
  
  return result;
}
