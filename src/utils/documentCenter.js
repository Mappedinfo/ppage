/**
 * 文档中心工具函数
 * 提供文档组织、排序、树形结构构建等功能
 */

import { extractTitle } from './markdownIndex';

/**
 * 从 Markdown 内容中提取元数据（Front Matter）
 * @param {string} content - Markdown 内容
 * @returns {Object} 元数据对象
 */
export function extractMetadata(content) {
  const metadata = {
    title: null,
    order: null,
    parent: null,
    collection: null,
    date: null,
    author: null,
    tags: [],
    category: null,
    id: null,
    pinned: false,
    sticky: false,
    priority: 0,
    links: [],        // 对外链接（在 front matter 中声明）
    relatedDocs: []   // 相关文档（在 front matter 中声明）
  };

  // 提取 YAML front matter
  const frontMatterMatch = content.match(/^---\s*\n([\s\S]*?)\n---/);
  if (!frontMatterMatch) return metadata;

  const frontMatter = frontMatterMatch[1];
  const lines = frontMatter.split('\n');

  lines.forEach(line => {
    const [key, ...valueParts] = line.split(':');
    if (!key) return;

    const trimmedKey = key.trim();
    const value = valueParts.join(':').trim();

    switch (trimmedKey) {
      case 'title':
        metadata.title = value.replace(/^["']|["']$/g, '');
        break;
      case 'order':
        metadata.order = parseInt(value, 10);
        break;
      case 'parent':
        metadata.parent = value.replace(/^["']|["']$/g, '');
        break;
      case 'collection':
        metadata.collection = value.replace(/^["']|["']$/g, '');
        break;
      case 'date':
        metadata.date = value.replace(/^["']|["']$/g, '');
        break;
      case 'author':
        metadata.author = value.replace(/^["']|["']$/g, '');
        break;
      case 'category':
        metadata.category = value.replace(/^["']|["']$/g, '');
        break;
      case 'id':
        metadata.id = value.replace(/^["']|["']$/g, '');
        break;
      case 'pinned':
        metadata.pinned = value === 'true' || value === true;
        break;
      case 'sticky':
        metadata.sticky = value === 'true' || value === true;
        break;
      case 'priority':
        metadata.priority = parseInt(value, 10) || 0;
        break;
      case 'tags':
        // 处理标签数组：可能是 [tag1, tag2] 或 YAML 数组格式
        const tagsMatch = value.match(/\[(.*)\]/);
        if (tagsMatch) {
          metadata.tags = tagsMatch[1]
            .split(',')
            .map(tag => tag.trim().replace(/^["']|["']$/g, ''))
            .filter(Boolean);
        }
        break;
      case 'links':
        // 处理链接数组
        const linksMatch = value.match(/\[(.*)\]/);
        if (linksMatch) {
          metadata.links = linksMatch[1]
            .split(',')
            .map(link => link.trim().replace(/^["']|["']$/g, ''))
            .filter(Boolean);
        }
        break;
      case 'relatedDocs':
        // 处理相关文档数组
        const relatedMatch = value.match(/\[(.*)\]/);
        if (relatedMatch) {
          metadata.relatedDocs = relatedMatch[1]
            .split(',')
            .map(doc => doc.trim().replace(/^["']|["']$/g, ''))
            .filter(Boolean);
        }
        break;
    }
  });

  return metadata;
}

/**
 * 增强文档对象，添加元数据和 ID
 * @param {Object} file - 原始文件对象
 * @returns {Object} 增强后的文档对象
 */
export function enhanceDocument(file) {
  const metadata = extractMetadata(file.content);
  
  // 生成文档 ID（如果 metadata 中没有指定）
  const id = metadata.id || generateDocumentId(file.path);
  
  return {
    ...file,
    id,
    metadata,
    title: metadata.title || file.title,
    order: metadata.order,
    parent: metadata.parent,
    collection: metadata.collection
  };
}

/**
 * 从文件路径生成文档 ID
 * @param {string} path - 文件路径
 * @returns {string} 文档 ID
 */
function generateDocumentId(path) {
  // 移除 /content/ 前缀和 .md 后缀，将路径转换为 ID
  return path
    .replace(/^\/content\//, '')
    .replace(/\.md$/, '')
    .replace(/\.(zh|en)$/, '')
    .replace(/\//g, '-');
}

/**
 * 根据类型过滤文档
 * @param {Array} documents - 文档数组
 * @param {string} type - 文档类型
 * @returns {Array} 过滤后的文档数组
 */
export function filterDocumentsByType(documents, type) {
  if (type === 'all') return documents;
  return documents.filter(doc => doc.type === type);
}

/**
 * 文档排序
 * @param {Array} documents - 文档数组
 * @param {Function|string} sortBy - 排序方式（函数或预定义键）
 * @returns {Array} 排序后的文档数组
 */
export function sortDocuments(documents, sortBy = 'order') {
  const docs = [...documents];
  
  if (typeof sortBy === 'function') {
    return docs.sort(sortBy);
  }
  
  switch (sortBy) {
    case 'order':
      // 智能排序：置顶 > 优先级 > order > 文件名
      return docs.sort((a, b) => {
        // 1. 置顶文件优先（pinned 或 sticky）
        const aPinned = a.metadata?.pinned || a.metadata?.sticky || false;
        const bPinned = b.metadata?.pinned || b.metadata?.sticky || false;
        if (aPinned !== bPinned) return bPinned - aPinned;
        
        // 2. 按优先级排序
        const aPriority = a.metadata?.priority || 0;
        const bPriority = b.metadata?.priority || 0;
        if (aPriority !== bPriority) return bPriority - aPriority;
        
        // 3. 按 order 字段排序
        const orderA = a.order ?? Infinity;
        const orderB = b.order ?? Infinity;
        if (orderA !== orderB) return orderA - orderB;
        
        // 4. 按标题字母顺序排序
        return a.title.localeCompare(b.title);
      });
      
    case 'title':
      return docs.sort((a, b) => a.title.localeCompare(b.title));
      
    case 'date':
      return docs.sort((a, b) => {
        const dateA = a.metadata?.date || '';
        const dateB = b.metadata?.date || '';
        return dateB.localeCompare(dateA); // 降序
      });
      
    case 'path':
      return docs.sort((a, b) => a.path.localeCompare(b.path));
      
    default:
      return docs;
  }
}

/**
 * 构建文档树形结构
 * @param {Array} documents - 文档数组
 * @returns {Object} 树形结构根节点
 */
export function buildDocumentTree(documents) {
  // 增强所有文档
  const enhancedDocs = documents.map(doc => enhanceDocument(doc));
  
  // 创建文档映射
  const docMap = new Map();
  enhancedDocs.forEach(doc => {
    docMap.set(doc.id, doc);
  });
  
  // 创建树节点
  const nodeMap = new Map();
  const rootChildren = [];
  
  enhancedDocs.forEach(doc => {
    const node = {
      id: doc.id,
      title: doc.title,
      order: doc.order,
      document: doc,
      children: []
    };
    nodeMap.set(doc.id, node);
  });
  
  // 建立父子关系
  enhancedDocs.forEach(doc => {
    const node = nodeMap.get(doc.id);
    
    if (doc.parent) {
      const parentNode = nodeMap.get(doc.parent);
      if (parentNode) {
        parentNode.children.push(node);
      } else {
        console.warn(`文档 ${doc.id} 的父节点 ${doc.parent} 不存在`);
        rootChildren.push(node);
      }
    } else {
      rootChildren.push(node);
    }
  });
  
  // 对每个节点的子节点进行排序
  function sortChildren(node) {
    if (node.children.length > 0) {
      node.children.sort((a, b) => {
        const orderA = a.order ?? Infinity;
        const orderB = b.order ?? Infinity;
        if (orderA !== orderB) return orderA - orderB;
        return a.title.localeCompare(b.title);
      });
      node.children.forEach(child => sortChildren(child));
    }
  }
  
  // 创建根节点
  const root = {
    id: 'root',
    title: 'Root',
    children: rootChildren
  };
  
  sortChildren(root);
  
  return root;
}

/**
 * 根据 ID 查找文档
 * @param {string} id - 文档 ID
 * @param {Object} tree - 文档树
 * @returns {Object|null} 文档对象
 */
export function findDocumentById(id, tree) {
  function search(node) {
    if (node.id === id) return node.document;
    
    if (node.children) {
      for (const child of node.children) {
        const found = search(child);
        if (found) return found;
      }
    }
    
    return null;
  }
  
  return search(tree);
}

/**
 * 获取文档的路径（面包屑）
 * @param {Object} document - 文档对象
 * @param {Object} tree - 文档树
 * @returns {Array} 路径节点数组
 */
export function getDocumentPath(document, tree) {
  if (!tree || !document) return [];
  
  const path = [];
  
  function search(node, currentPath) {
    const newPath = [...currentPath, node];
    
    if (node.id === document.id) {
      path.push(...newPath);
      return true;
    }
    
    if (node.children) {
      for (const child of node.children) {
        if (search(child, newPath)) {
          return true;
        }
      }
    }
    
    return false;
  }
  
  search(tree, []);
  
  // 移除根节点
  return path.filter(node => node.id !== 'root');
}

/**
 * 获取文档的前一个和后一个文档（用于导航）
 * @param {Object} document - 当前文档
 * @param {Array} documents - 文档数组
 * @returns {Object} { prev, next }
 */
export function getAdjacentDocuments(document, documents) {
  const index = documents.findIndex(doc => doc.id === document.id);
  
  return {
    prev: index > 0 ? documents[index - 1] : null,
    next: index < documents.length - 1 ? documents[index + 1] : null
  };
}

/**
 * 按集合分组文档
 * @param {Array} documents - 文档数组
 * @returns {Object} 集合名到文档数组的映射
 */
export function groupDocumentsByCollection(documents) {
  const groups = new Map();
  
  documents.forEach(doc => {
    const collection = doc.collection || 'default';
    if (!groups.has(collection)) {
      groups.set(collection, []);
    }
    groups.get(collection).push(doc);
  });
  
  return Object.fromEntries(groups);
}

/**
 * 搜索文档
 * @param {Array} documents - 文档数组
 * @param {string} query - 搜索关键词
 * @returns {Array} 匹配的文档数组
 */
export function searchDocuments(documents, query) {
  if (!query || query.trim() === '') return documents;
  
  const lowerQuery = query.toLowerCase();
  
  return documents.filter(doc => {
    // 搜索标题
    if (doc.title.toLowerCase().includes(lowerQuery)) return true;
    
    // 搜索内容
    if (doc.content.toLowerCase().includes(lowerQuery)) return true;
    
    // 搜索标签
    if (doc.metadata?.tags) {
      return doc.metadata.tags.some(tag => 
        tag.toLowerCase().includes(lowerQuery)
      );
    }
    
    return false;
  });
}

/**
 * 从文档内容中提取所有内部链接
 * @param {string} content - Markdown 内容
 * @returns {Array} 链接的文档 ID 数组
 */
export function extractInternalLinks(content) {
  const links = [];
  
  // 匹配 Markdown 链接: [文本](路径)
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  let match;
  
  while ((match = linkRegex.exec(content)) !== null) {
    const path = match[2];
    
    // 只处理内部文档链接（以 /content/ 开头或 # 开头的文档 ID）
    if (path.startsWith('/content/') || path.startsWith('#doc-')) {
      const docId = extractDocIdFromPath(path);
      if (docId && !links.includes(docId)) {
        links.push(docId);
      }
    }
  }
  
  return links;
}

/**
 * 从路径中提取文档 ID
 * @param {string} path - 文件路径或 ID
 * @returns {string} 文档 ID
 */
function extractDocIdFromPath(path) {
  // 如果是 #doc- 格式，直接提取 ID
  if (path.startsWith('#doc-')) {
    return path.substring(5);
  }
  
  // 如果是文件路径，转换为 ID
  if (path.startsWith('/content/')) {
    return path
      .replace(/^\/content\//, '')
      .replace(/\.md$/, '')
      .replace(/\.(zh|en)$/, '')
      .replace(/\//g, '-');
  }
  
  return path;
}

/**
 * 构建所有文档的反向链接映射
 * @param {Array} documents - 文档数组（已增强）
 * @returns {Map} 文档 ID 到反向链接数组的映射
 */
export function buildBacklinksMap(documents) {
  const backlinksMap = new Map();
  
  // 初始化映射
  documents.forEach(doc => {
    backlinksMap.set(doc.id, []);
  });
  
  // 遍历所有文档，构建反向链接
  documents.forEach(sourceDoc => {
    // 1. 从 front matter 中的 relatedDocs 获取链接
    const relatedDocs = sourceDoc.metadata?.relatedDocs || [];
    relatedDocs.forEach(targetId => {
      if (backlinksMap.has(targetId)) {
        const backlinks = backlinksMap.get(targetId);
        if (!backlinks.find(bl => bl.id === sourceDoc.id)) {
          backlinks.push({
            id: sourceDoc.id,
            title: sourceDoc.title,
            type: 'explicit', // 显式关联
            path: sourceDoc.path
          });
        }
      }
    });
    
    // 2. 从文档内容中提取的内部链接
    const internalLinks = extractInternalLinks(sourceDoc.content);
    internalLinks.forEach(targetId => {
      if (backlinksMap.has(targetId)) {
        const backlinks = backlinksMap.get(targetId);
        if (!backlinks.find(bl => bl.id === sourceDoc.id)) {
          backlinks.push({
            id: sourceDoc.id,
            title: sourceDoc.title,
            type: 'content', // 内容链接
            path: sourceDoc.path
          });
        }
      }
    });
    
    // 3. 从 front matter 中的 parent 关系建立链接
    if (sourceDoc.parent) {
      if (backlinksMap.has(sourceDoc.parent)) {
        const backlinks = backlinksMap.get(sourceDoc.parent);
        if (!backlinks.find(bl => bl.id === sourceDoc.id)) {
          backlinks.push({
            id: sourceDoc.id,
            title: sourceDoc.title,
            type: 'parent', // 父子关系
            path: sourceDoc.path
          });
        }
      }
    }
  });
  
  return backlinksMap;
}

/**
 * 获取文档的所有链接（对外链接 + 反向链接）
 * @param {Object} document - 文档对象
 * @param {Map} backlinksMap - 反向链接映射
 * @param {Array} allDocuments - 所有文档数组
 * @returns {Object} { outgoing: [], incoming: [] }
 */
export function getDocumentLinks(document, backlinksMap, allDocuments) {
  const outgoing = [];
  const incoming = [];
  
  // 1. 获取对外链接（从 relatedDocs）
  const relatedDocs = document.metadata?.relatedDocs || [];
  relatedDocs.forEach(docId => {
    const targetDoc = allDocuments.find(d => d.id === docId);
    if (targetDoc) {
      outgoing.push({
        id: targetDoc.id,
        title: targetDoc.title,
        type: 'explicit',
        path: targetDoc.path
      });
    }
  });
  
  // 2. 从内容中提取的链接
  const internalLinks = extractInternalLinks(document.content);
  internalLinks.forEach(docId => {
    const targetDoc = allDocuments.find(d => d.id === docId);
    if (targetDoc && !outgoing.find(link => link.id === docId)) {
      outgoing.push({
        id: targetDoc.id,
        title: targetDoc.title,
        type: 'content',
        path: targetDoc.path
      });
    }
  });
  
  // 3. 获取反向链接
  if (backlinksMap.has(document.id)) {
    incoming.push(...backlinksMap.get(document.id));
  }
  
  return { outgoing, incoming };
}

/**
 * 构建文档引用关系图谱数据
 * @param {Object} centerDoc - 中心文档
 * @param {Map} backlinksMap - 反向链接映射
 * @param {Array} allDocuments - 所有文档数组
 * @param {number} maxDepth - 最大深度（默认3跳）
 * @returns {Object} { nodes: [], edges: [] }
 */
export function buildDocumentGraph(centerDoc, backlinksMap, allDocuments, maxDepth = 3) {
  if (!centerDoc) return { nodes: [], edges: [] };
  
  const nodes = [];
  const edges = [];
  const visited = new Set();
  const nodeMap = new Map(); // id -> node
  
  // BFS 遍历构建图谱
  const queue = [{ doc: centerDoc, depth: 0 }];
  visited.add(centerDoc.id);
  
  // 添加中心节点
  const centerNode = {
    id: centerDoc.id,
    title: centerDoc.title,
    depth: 0,
    isCenter: true,
    collection: centerDoc.metadata?.collection || centerDoc.folder
  };
  nodes.push(centerNode);
  nodeMap.set(centerDoc.id, centerNode);
  
  while (queue.length > 0) {
    const { doc, depth } = queue.shift();
    
    if (depth >= maxDepth) continue;
    
    // 获取当前文档的链接
    const links = getDocumentLinks(doc, backlinksMap, allDocuments);
    
    // 处理对外链接
    links.outgoing.forEach(link => {
      // 添加边
      edges.push({
        source: doc.id,
        target: link.id,
        type: link.type,
        direction: 'outgoing'
      });
      
      // 如果节点未访问过，添加节点并继续遍历
      if (!visited.has(link.id)) {
        const targetDoc = allDocuments.find(d => d.id === link.id);
        if (targetDoc) {
          visited.add(link.id);
          const node = {
            id: link.id,
            title: link.title,
            depth: depth + 1,
            isCenter: false,
            collection: targetDoc.metadata?.collection || targetDoc.folder
          };
          nodes.push(node);
          nodeMap.set(link.id, node);
          queue.push({ doc: targetDoc, depth: depth + 1 });
        }
      }
    });
    
    // 处理反向链接
    links.incoming.forEach(link => {
      // 添加边
      edges.push({
        source: link.id,
        target: doc.id,
        type: link.type,
        direction: 'incoming'
      });
      
      // 如果节点未访问过，添加节点并继续遍历
      if (!visited.has(link.id)) {
        const sourceDoc = allDocuments.find(d => d.id === link.id);
        if (sourceDoc) {
          visited.add(link.id);
          const node = {
            id: link.id,
            title: link.title,
            depth: depth + 1,
            isCenter: false,
            collection: sourceDoc.metadata?.collection || sourceDoc.folder
          };
          nodes.push(node);
          nodeMap.set(link.id, node);
          queue.push({ doc: sourceDoc, depth: depth + 1 });
        }
      }
    });
  }
  
  return { nodes, edges };
}

/**
 * 计算图谱节点的布局位置（使用力导向布局算法）
 * @param {Array} nodes - 节点数组
 * @param {Array} edges - 边数组
 * @param {number} width - 画布宽度
 * @param {number} height - 画布高度
 * @returns {Array} 带有位置信息的节点数组
 */
export function calculateGraphLayout(nodes, edges, width, height) {
  if (nodes.length === 0) return [];
  
  // 初始化节点位置（环形布局）
  const layoutNodes = nodes.map((node, index) => {
    if (node.isCenter) {
      return {
        ...node,
        x: width / 2,
        y: height / 2,
        vx: 0,
        vy: 0
      };
    }
    
    // 按深度分层圆形布局
    const radius = 80 + node.depth * 60;
    const angle = (index / nodes.length) * 2 * Math.PI;
    
    return {
      ...node,
      x: width / 2 + radius * Math.cos(angle),
      y: height / 2 + radius * Math.sin(angle),
      vx: 0,
      vy: 0
    };
  });
  
  return layoutNodes;
}
