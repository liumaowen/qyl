// 调试工具函数
export const debug = {
  // 检查是否为调试构建
  isDebugBuild: () => {
    return import.meta.env.MODE === 'production' && 
           (window as any).__DEBUG_BUILD__ === true;
  },

  // 调试日志（仅在调试构建中显示）
  log: (...args: any[]) => {
    if (debug.isDebugBuild()) {
      console.log('[DEBUG]', ...args);
    }
  },

  // 调试警告
  warn: (...args: any[]) => {
    if (debug.isDebugBuild()) {
      console.warn('[DEBUG WARN]', ...args);
    }
  },

  // 调试错误
  error: (...args: any[]) => {
    if (debug.isDebugBuild()) {
      console.error('[DEBUG ERROR]', ...args);
    }
  },

  // 性能监控
  time: (label: string) => {
    if (debug.isDebugBuild()) {
      console.time(`[DEBUG] ${label}`);
    }
  },

  timeEnd: (label: string) => {
    if (debug.isDebugBuild()) {
      console.timeEnd(`[DEBUG] ${label}`);
    }
  },

  // 组件调试信息
  component: (componentName: string, data: any) => {
    if (debug.isDebugBuild()) {
      console.log(`[DEBUG COMPONENT] ${componentName}:`, data);
    }
  },

  // API 调试信息
  api: (url: string, data: any) => {
    if (debug.isDebugBuild()) {
      console.log(`[DEBUG API] ${url}:`, data);
    }
  }
};

// 全局调试对象（仅在调试构建中可用）
if (typeof window !== 'undefined') {
  (window as any).__DEBUG__ = debug;
} 