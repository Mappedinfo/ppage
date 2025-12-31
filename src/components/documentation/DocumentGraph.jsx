import React, { useRef, useEffect, useState, useMemo } from 'react';
import { buildDocumentGraph, calculateGraphLayout } from '../../utils/documentCenter';
import { useTheme } from '../theme/ThemeContext';
import styles from './DocumentGraph.module.css';

/**
 * 文档引用关系图谱组件
 * @param {Object} props
 * @param {Object} props.currentDoc - 当前文档
 * @param {Map} props.backlinksMap - 反向链接映射
 * @param {Array} props.allDocuments - 所有文档数组
 * @param {Function} props.onNodeClick - 节点点击回调
 */
export function DocumentGraph({ currentDoc, backlinksMap, allDocuments, onNodeClick }) {
  const canvasRef = useRef(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [hoveredNode, setHoveredNode] = useState(null);
  const { currentTheme } = useTheme();
  
  // 计算图谱数据
  const graphData = useMemo(() => {
    if (!currentDoc) return { nodes: [], edges: [] };
    const maxDepth = isExpanded ? Infinity : 3;
    return buildDocumentGraph(currentDoc, backlinksMap, allDocuments, maxDepth);
  }, [currentDoc, backlinksMap, allDocuments, isExpanded]);
  
  // 绘制图谱
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !graphData.nodes.length) return;
    
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    // 计算节点布局
    const layoutNodes = calculateGraphLayout(graphData.nodes, graphData.edges, width, height);
    
    // 获取计算后的 CSS 变量颜色
    const computedStyle = getComputedStyle(canvas);
    const textColor = computedStyle.getPropertyValue('--text-primary').trim() || '#000';
    const bgColor = computedStyle.getPropertyValue('--bg-primary').trim() || '#fff';
    
    // 清空画布
    ctx.clearRect(0, 0, width, height);
    
    // 绘制边
    ctx.lineWidth = 1.5;
    graphData.edges.forEach(edge => {
      const sourceNode = layoutNodes.find(n => n.id === edge.source);
      const targetNode = layoutNodes.find(n => n.id === edge.target);
      
      if (sourceNode && targetNode) {
        ctx.beginPath();
        ctx.moveTo(sourceNode.x, sourceNode.y);
        ctx.lineTo(targetNode.x, targetNode.y);
        
        // 根据链接类型设置样式
        if (edge.type === 'explicit') {
          ctx.strokeStyle = '#3b82f6';
        } else if (edge.type === 'content') {
          ctx.strokeStyle = '#10b981';
        } else if (edge.type === 'parent') {
          ctx.strokeStyle = '#f59e0b';
        } else {
          // 使用半透明的文字颜色作为默认边颜色
          ctx.strokeStyle = textColor + '40';
        }
        
        ctx.stroke();
        
        // 绘制箭头
        const angle = Math.atan2(targetNode.y - sourceNode.y, targetNode.x - sourceNode.x);
        const arrowSize = 8;
        const endX = targetNode.x - Math.cos(angle) * 20;
        const endY = targetNode.y - Math.sin(angle) * 20;
        
        ctx.beginPath();
        ctx.moveTo(endX, endY);
        ctx.lineTo(
          endX - arrowSize * Math.cos(angle - Math.PI / 6),
          endY - arrowSize * Math.sin(angle - Math.PI / 6)
        );
        ctx.moveTo(endX, endY);
        ctx.lineTo(
          endX - arrowSize * Math.cos(angle + Math.PI / 6),
          endY - arrowSize * Math.sin(angle + Math.PI / 6)
        );
        ctx.stroke();
      }
    });
    
    // 绘制节点
    layoutNodes.forEach(node => {
      const isHovered = hoveredNode === node.id;
      const radius = node.isCenter ? 25 : 18;
      
      // 判断当前主题是否为深色（只有dark主题是深色背景）
      const isDarkTheme = currentTheme === 'dark';
      
      // 绘制节点圆圈
      ctx.beginPath();
      ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI);
      
      if (node.isCenter) {
        ctx.fillStyle = '#3b82f6';
      } else if (isHovered) {
        ctx.fillStyle = '#10b981';
      } else {
        // 根据主题使用不同的节点背景色
        ctx.fillStyle = isDarkTheme ? '#444' : '#f3f4f6';
      }
      
      ctx.fill();
      ctx.strokeStyle = isDarkTheme ? '#666' : '#d1d5db';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // 绘制文本
      ctx.fillStyle = textColor;
      ctx.font = node.isCenter ? 'bold 10px sans-serif' : '9px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      // 截断长文本
      let displayText = node.title;
      if (displayText.length > 8) {
        displayText = displayText.substring(0, 6) + '...';
      }
      
      ctx.fillText(displayText, node.x, node.y + radius + 10);
    });
    
    // 存储节点位置用于点击检测
    canvas._layoutNodes = layoutNodes;
  }, [graphData, hoveredNode, currentTheme]); // 添加 currentTheme 依赖，主题切换时重新绘制
  
  // 处理鼠标移动
  const handleMouseMove = (e) => {
    const canvas = canvasRef.current;
    if (!canvas || !canvas._layoutNodes) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // 检测鼠标是否在某个节点上
    const hoveredNode = canvas._layoutNodes.find(node => {
      const radius = node.isCenter ? 25 : 18;
      const distance = Math.sqrt((x - node.x) ** 2 + (y - node.y) ** 2);
      return distance <= radius;
    });
    
    setHoveredNode(hoveredNode ? hoveredNode.id : null);
    canvas.style.cursor = hoveredNode ? 'pointer' : 'default';
  };
  
  // 处理点击
  const handleClick = (e) => {
    const canvas = canvasRef.current;
    if (!canvas || !canvas._layoutNodes) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // 检测点击的节点
    const clickedNode = canvas._layoutNodes.find(node => {
      const radius = node.isCenter ? 25 : 18;
      const distance = Math.sqrt((x - node.x) ** 2 + (y - node.y) ** 2);
      return distance <= radius;
    });
    
    if (clickedNode && onNodeClick) {
      const doc = allDocuments.find(d => d.id === clickedNode.id);
      if (doc) {
        onNodeClick(doc);
      }
    }
  };
  
  if (!currentDoc || graphData.nodes.length === 0) {
    return (
      <div className={`${styles.graphContainer} ${isExpanded ? styles.expanded : ''}`}>
        <div className={styles.empty}>
          暂无引用关系
        </div>
      </div>
    );
  }
  
  // 侧边栏小窗口尺寸
  const canvasWidth = isExpanded ? 800 : 280;
  const canvasHeight = isExpanded ? 600 : 200;
  
  return (
    <div className={`${styles.graphContainer} ${isExpanded ? styles.expanded : ''}`}>
      <div className={styles.header}>
        <div className={styles.info}>
          <span className={styles.icon}>🔗</span>
          <span className={styles.title}>引用图谱</span>
          <span className={styles.stats}>
            {graphData.nodes.length}文档 · {graphData.edges.length}连接
          </span>
        </div>
        <button 
          className={styles.toggleButton}
          onClick={() => setIsExpanded(!isExpanded)}
          title={isExpanded ? '收起' : '展开完整图谱'}
        >
          {isExpanded ? '收起' : '展开'}
        </button>
      </div>
      
      <div className={styles.canvasWrapper}>
        <canvas
          ref={canvasRef}
          width={canvasWidth}
          height={canvasHeight}
          className={styles.canvas}
          onMouseMove={handleMouseMove}
          onClick={handleClick}
        />
      </div>
      
      <div className={styles.legend}>
        <div className={styles.legendItem}>
          <span className={styles.legendColor} style={{backgroundColor: '#3b82f6'}}></span>
          <span>显式关联</span>
        </div>
        <div className={styles.legendItem}>
          <span className={styles.legendColor} style={{backgroundColor: '#10b981'}}></span>
          <span>内容引用</span>
        </div>
        <div className={styles.legendItem}>
          <span className={styles.legendColor} style={{backgroundColor: '#f59e0b'}}></span>
          <span>父子关系</span>
        </div>
      </div>
      
      {!isExpanded && graphData.nodes.length > 3 && (
        <div className={styles.hint}>
          💡 点击“展开”查看完整网络
        </div>
      )}
    </div>
  );
}
