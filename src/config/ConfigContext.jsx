import React, { createContext, useContext, useState, useEffect } from 'react';
import { loadConfig } from './parser';
import { ensureValidConfig } from './validator';

// 创建配置上下文
const ConfigContext = createContext(null);

/**
 * 配置提供者组件
 */
export function ConfigProvider({ children }) {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchConfig() {
      try {
        setLoading(true);
        const loadedConfig = await loadConfig();
        const validatedConfig = ensureValidConfig(loadedConfig);
        setConfig(validatedConfig);
        setError(null);
      } catch (err) {
        console.error('配置加载或验证失败:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchConfig();
  }, []);

  const value = {
    config,
    loading,
    error,
    reload: async () => {
      const loadedConfig = await loadConfig();
      const validatedConfig = ensureValidConfig(loadedConfig);
      setConfig(validatedConfig);
    }
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}>
        <div>加载配置中...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        flexDirection: 'column',
        padding: '20px'
      }}>
        <h2 style={{ color: '#d32f2f' }}>配置加载失败</h2>
        <pre style={{ 
          background: '#f5f5f5', 
          padding: '15px', 
          borderRadius: '4px',
          maxWidth: '600px',
          overflow: 'auto'
        }}>
          {error}
        </pre>
      </div>
    );
  }

  return (
    <ConfigContext.Provider value={value}>
      {children}
    </ConfigContext.Provider>
  );
}

/**
 * 使用配置的 Hook
 * @returns {object} 配置对象和相关方法
 */
export function useConfig() {
  const context = useContext(ConfigContext);
  
  if (!context) {
    throw new Error('useConfig 必须在 ConfigProvider 内部使用');
  }
  
  return context;
}

/**
 * 获取站点配置
 */
export function useSiteConfig() {
  const { config } = useConfig();
  return config?.site;
}

/**
 * 获取个人资料配置
 */
export function useProfileConfig() {
  const { config } = useConfig();
  return config?.profile;
}

/**
 * 获取主题配置
 */
export function useThemeConfig() {
  const { config } = useConfig();
  return config?.theme;
}

/**
 * 获取导航配置
 */
export function useNavigationConfig() {
  const { config } = useConfig();
  return config?.navigation || [];
}

/**
 * 获取社交链接配置
 */
export function useSocialConfig() {
  const { config } = useConfig();
  return config?.social || [];
}

/**
 * 获取文件配置
 */
export function useFilesConfig() {
  const { config } = useConfig();
  return config?.files || [];
}

/**
 * 获取项目配置
 */
export function useProjectsConfig() {
  const { config } = useConfig();
  return config?.projects || [];
}
