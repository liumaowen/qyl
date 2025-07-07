import { devConfig } from './env.development';
import { prodConfig } from './env.production';

// 环境配置
export const environment = {
  production: import.meta.env.PROD,
  development: import.meta.env.DEV,
  mode: import.meta.env.MODE,
  
  // 根据环境选择配置
  ...(import.meta.env.PROD ? prodConfig : devConfig)
};

// Vue 生产模式配置函数
export function configureVueForProduction() {
  const isDebugBuild = import.meta.env.MODE === 'production' && 
    (window as any).__DEBUG_BUILD__ === true;
  
  if (environment.production && !isDebugBuild) {
    // 禁用 Vue 开发工具
    if (typeof window !== 'undefined') {
      (window as any).__VUE_DEVTOOLS_GLOBAL_HOOK__ = undefined;
    }
    
    // 禁用 console 警告（可选）
    if (!environment.enableConsoleLog) {
      console.log = () => {};
      console.warn = () => {};
      console.error = () => {};
    }
  }
} 