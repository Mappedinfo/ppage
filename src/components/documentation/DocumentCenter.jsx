import React, { useState, useEffect, useMemo } from 'react';
import { MarkdownRenderer } from '../markdown/MarkdownRenderer';
import { BacklinksPanel } from './BacklinksPanel';
import { DocumentGraph } from './DocumentGraph';
import { loadAllMarkdownFiles, loadFolderMarkdownFiles } from '../../utils/markdownIndex';
import { filterMarkdownByLanguage } from '../../utils/i18nMarkdown';
import { useI18n } from '../../i18n/I18nContext';
import { 
  buildDocumentTree, 
  sortDocuments, 
  filterDocumentsByType,
  findDocumentById,
  getDocumentPath as getDocPath,
  buildBacklinksMap,
  getDocumentLinks,
  enhanceDocument
} from '../../utils/documentCenter';
import styles from './DocumentCenter.module.css';

/**
 * 文档中心组件 - 统一的文档管理和展示系统
 * 
 * @param {Object} props - 组件属性
 * @param {string} props.type - 文档类型过滤 ('post' | 'page' | 'all')
 * @param {string} props.collection - 文档集合过滤（通过 front matter 中的 collection 字段）
 * @param {boolean} props.enableTree - 是否启用树形结构展示
 * @param {Function} props.customSort - 自定义排序函数
 * @param {Function} props.customFilter - 自定义过滤函数
 * @param {Object} props.config - 文档中心配置
 * @param {string} props.title - 文档中心标题
 * @param {boolean} props.showCount - 是否显示文档数量
 * @param {boolean} props.showBreadcrumb - 是否显示面包屑导航
 * @param {string} props.layout - 布局模式 ('sidebar' | 'dropdown' | 'tabs')
 * @param {Function} props.onDocumentChange - 文档切换回调
 */
export function DocumentCenter({
  type = 'all',
  collection = null,
  enableTree = false,
  customSort = null,
  customFilter = null,
  config = {},
  title = null,
  showCount = true,
  showBreadcrumb = false,
  layout = 'sidebar',
  onDocumentChange = null,
  className = ''
}) {
  const [documents, setDocuments] = useState([]);
  const [allDocuments, setAllDocuments] = useState([]); // 所有文档索引，用于链接查找
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedNodes, setExpandedNodes] = useState(new Set());
  const [backlinksMap, setBacklinksMap] = useState(new Map());
  const { t, language } = useI18n();

  // 加载文档
  useEffect(() => {
    loadDocuments();
  }, [language, type, collection]);

  async function loadDocuments() {
    try {
      setLoading(true);
      setError(null);
      
      // 1. 加载所有 Markdown 文件
      let allFiles;
      
      // 如果指定了 collection，尝试直接加载该文件夹
      if (collection && type === 'all') {
        allFiles = await loadFolderMarkdownFiles(collection);
      } else {
        allFiles = await loadAllMarkdownFiles();
      }
      
      // 增强所有文档（用于全局查找）
      const allEnhanced = allFiles.map(file => enhanceDocument(file));
      setAllDocuments(allEnhanced);
      
      // 2. 根据类型过滤
      let filteredFiles = allFiles;
      if (type !== 'all') {
        filteredFiles = filterDocumentsByType(allFiles, type);
      }
      
      // 3. 根据集合过滤
      if (collection) {
        filteredFiles = filteredFiles.filter(file => {
          // 检查 front matter 中的 collection 字段
          if (file.collection === collection) return true;
          // 检查文件夹名称
          if (file.folder === collection) return true;
          return false;
        });
      }
      
      // 4. 根据语言过滤
      const languageFiltered = filterMarkdownByLanguage(filteredFiles, language, 'zh');
      
      // 5. 应用自定义过滤器
      let processedFiles = customFilter 
        ? languageFiltered.filter(customFilter) 
        : languageFiltered;
      
      // 6. 排序
      processedFiles = customSort 
        ? sortDocuments(processedFiles, customSort)
        : sortDocuments(processedFiles);
      
      // 7. 增强文档（添加 ID 和 metadata）
      const enhancedFiles = processedFiles.map(file => enhanceDocument(file));
      
      console.log(`文档中心加载: ${enhancedFiles.length} 个文档 (类型: ${type}, 集合: ${collection || '全部'})`);
      console.log('当前集合文档 ID:', enhancedFiles.map(d => d.id));
      console.log('所有文档 ID:', allEnhanced.map(d => d.id));
      
      setDocuments(enhancedFiles);
      
      // 构建反向链接映射（使用所有文档）
      const linksMap = buildBacklinksMap(allEnhanced);
      setBacklinksMap(linksMap);
      
      // 默认选择第一个文档
      if (enhancedFiles.length > 0) {
        selectDocument(enhancedFiles[0]);
      }
    } catch (err) {
      console.error('加载文档失败:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // 构建文档树（如果启用）
  const documentTree = useMemo(() => {
    if (!enableTree) return null;
    return buildDocumentTree(documents);
  }, [documents, enableTree]);

  // 选择文档
  function selectDocument(doc) {
    setSelectedDoc(doc);
    if (onDocumentChange) {
      onDocumentChange(doc);
    }
  }

  // 处理链接点击
  function handleLinkClick(link) {
    const targetDoc = documents.find(d => d.id === link.id);
    if (targetDoc) {
      selectDocument(targetDoc);
      // 滚动到顶部
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  // 处理内部链接点击（从文档内容中）
  function handleInternalLinkClick(docId) {
    console.log(`点击内部链接, 目标 ID: ${docId}`);
    
    // 首先在当前集合中查找
    let targetDoc = documents.find(d => d.id === docId);
    
    // 如果当前集合中没有，在所有文档中查找
    if (!targetDoc && allDocuments.length > 0) {
      targetDoc = allDocuments.find(d => d.id === docId);
      if (targetDoc) {
        console.log(`在其他集合中找到目标文档: ${targetDoc.title} (collection: ${targetDoc.metadata?.collection || targetDoc.folder})`);
        // 将该文档添加到当前文档列表（临时）
        setDocuments(prev => [...prev, targetDoc]);
      }
    }
    
    if (targetDoc) {
      console.log(`找到目标文档: ${targetDoc.title}`);
      selectDocument(targetDoc);
      // 滚动到顶部
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      console.warn(`无法找到文档 ID: ${docId}`);
      console.log(`当前集合文档 ID:`, documents.map(d => `${d.id} (${d.title})`));
      console.log(`所有文档 ID:`, allDocuments.map(d => `${d.id} (${d.title})`));
    }
  }

  // 获取当前文档的链接信息
  const currentDocLinks = useMemo(() => {
    if (!selectedDoc) return { outgoing: [], incoming: [] };
    // 使用所有文档来获取链接信息
    return getDocumentLinks(selectedDoc, backlinksMap, allDocuments);
  }, [selectedDoc, backlinksMap, allDocuments]);

  // 切换树节点展开/折叠
  function toggleNode(nodeId) {
    setExpandedNodes(prev => {
      const next = new Set(prev);
      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        next.add(nodeId);
      }
      return next;
    });
  }

  // 渲染文档列表
  function renderDocumentList() {
    if (enableTree && documentTree) {
      // 只渲染根节点的子节点，不渲染根节点本身
      return (
        <div className={styles.treeRoot}>
          {documentTree.children && documentTree.children.map(child => 
            renderTreeNode(child, 0)
          )}
        </div>
      );
    }
    
    return (
      <ul className={styles.documentList}>
        {documents.map((doc, index) => (
          <li
            key={doc.id || index}
            className={`${styles.documentItem} ${
              selectedDoc?.id === doc.id ? styles.active : ''
            }`}
            onClick={() => selectDocument(doc)}
          >
            <span className={styles.documentTitle}>{doc.title}</span>
            {doc.order && <span className={styles.order}>{doc.order}</span>}
          </li>
        ))}
      </ul>
    );
  }

  // 渲染树形节点
  function renderTreeNode(node, level = 0) {
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = expandedNodes.has(node.id);
    const isSelected = selectedDoc?.id === node.id;

    return (
      <div key={node.id} className={styles.treeNode} style={{ '--level': level }}>
        <div
          className={`${styles.treeNodeHeader} ${
            isSelected ? styles.active : ''
          }`}
        >
          {hasChildren && (
            <button
              className={`${styles.expandButton} ${
                isExpanded ? styles.expanded : ''
              }`}
              onClick={() => toggleNode(node.id)}
            >
              ▶
            </button>
          )}
          <span
            className={styles.nodeTitle}
            onClick={() => node.document && selectDocument(node.document)}
          >
            {node.title}
          </span>
          {node.order && <span className={styles.order}>{node.order}</span>}
        </div>
        {hasChildren && isExpanded && (
          <div className={styles.treeChildren}>
            {node.children.map(child => renderTreeNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  }

  // 渲染面包屑
  function renderBreadcrumb() {
    if (!showBreadcrumb || !selectedDoc) return null;
    
    const path = getDocPath(selectedDoc, documentTree);
    
    return (
      <nav className={styles.breadcrumb}>
        {path.map((node, index) => (
          <React.Fragment key={node.id}>
            {index > 0 && <span className={styles.separator}>/</span>}
            <span
              className={styles.breadcrumbItem}
              onClick={() => node.document && selectDocument(node.document)}
            >
              {node.title}
            </span>
          </React.Fragment>
        ))}
      </nav>
    );
  }

  // 加载状态
  if (loading) {
    return (
      <div className={`${styles.documentCenter} ${className}`}>
        <div className={styles.loading}>{t('common.loading')}</div>
      </div>
    );
  }

  // 错误状态
  if (error) {
    return (
      <div className={`${styles.documentCenter} ${className}`}>
        <div className={styles.error}>{error}</div>
      </div>
    );
  }

  // 空状态
  if (documents.length === 0) {
    return (
      <div className={`${styles.documentCenter} ${className}`}>
        <div className={styles.empty}>
          <p>{t('documentCenter.empty')}</p>
        </div>
      </div>
    );
  }

  // 主界面
  return (
    <div className={`${styles.documentCenter} ${styles[layout]} ${className}`}>
      {/* 头部 */}
      <div className={styles.header}>
        <h1 className={styles.title}>
          {title || t('documentCenter.title')}
        </h1>
        {showCount && (
          <span className={styles.count}>
            {t('documentCenter.count', { count: documents.length })}
          </span>
        )}
      </div>

      {/* 面包屑 */}
      {renderBreadcrumb()}

      {/* 主内容区 */}
      <div className={styles.container}>
        {/* 侧边栏/导航 */}
        {layout === 'sidebar' && (
          <aside className={styles.sidebar}>
            <h2 className={styles.sidebarTitle}>
              {t('documentCenter.navigation')}
            </h2>
            {renderDocumentList()}
            
            {/* 引用关系图谱 - 放在侧边栏底部 */}
            {selectedDoc && (
              <DocumentGraph
                currentDoc={selectedDoc}
                backlinksMap={backlinksMap}
                allDocuments={allDocuments}
                onNodeClick={handleInternalLinkClick}
              />
            )}
          </aside>
        )}

        {/* 文档内容 */}
        <main className={styles.content}>
          {selectedDoc ? (
            <article className={styles.article}>
              {selectedDoc.metadata && (
                <div className={styles.metadata}>
                  {selectedDoc.metadata.date && (
                    <span className={styles.date}>{selectedDoc.metadata.date}</span>
                  )}
                  {selectedDoc.metadata.author && (
                    <span className={styles.author}>{selectedDoc.metadata.author}</span>
                  )}
                  {selectedDoc.metadata.tags && (
                    <div className={styles.tags}>
                      {selectedDoc.metadata.tags.map((tag, i) => (
                        <span key={i} className={styles.tag}>{tag}</span>
                      ))}
                    </div>
                  )}
                </div>
              )}
              <MarkdownRenderer 
                content={selectedDoc.content}
                onInternalLinkClick={handleInternalLinkClick}
              />
              
              {/* 双向链接面板 */}
              <BacklinksPanel 
                outgoing={currentDocLinks.outgoing}
                incoming={currentDocLinks.incoming}
                onLinkClick={handleLinkClick}
              />
            </article>
          ) : (
            <div className={styles.empty}>
              {t('documentCenter.selectDocument')}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
