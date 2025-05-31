import axios from 'axios';

// 域名配置
const apiConfig = {
  qylapi: {
    dev: '/qylapi', // 走 Vite 代理
    prod: 'https://120.46.169.69:8081' // 生产环境地址
  }
};

// 根据环境获取 baseURL
function getBaseURL(key: keyof typeof apiConfig) {
  return import.meta.env.MODE === 'development'
    ? apiConfig[key].dev
    : apiConfig[key].prod;
}

// 创建 axios 实例
export const qylapiRequest = axios.create({
  baseURL: getBaseURL('qylapi')
});