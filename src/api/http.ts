import axios from 'axios';

// 域名配置
const apiConfig = {
  apiopen: {
    dev: '/apiopen', // 走 Vite 代理
    prod: 'https://api.apiopen.top'
  },
  mmp: {
    dev: '/mmpapi', // 走 Vite 代理
    // prod: 'https://api.mmp.cc'
    prod: 'https://www.qylapi.top'
  },
  mgtv: {
    dev: '/mgtv', // 走 Vite 代理
    prod: 'https://api.mgtv109.cc'
  }
};

// 根据环境获取 baseURL
function getBaseURL(key: keyof typeof apiConfig) {
  return import.meta.env.MODE === 'development'
    ? apiConfig[key].dev
    : apiConfig[key].prod;
}

// 创建 axios 实例
export const apiopenRequest = axios.create({
  baseURL: getBaseURL('apiopen')
});

export const mmpRequest = axios.create({
  baseURL: getBaseURL('mmp')
});
export const mgtvRequest = axios.create({
  baseURL: getBaseURL('mgtv')
});

// 添加响应拦截器
apiopenRequest.interceptors.response.use(
  response => response,
  error => {
    console.error('APIOpen 请求错误:', error);
    return Promise.reject(error);
  }
);

mmpRequest.interceptors.response.use(
  response => response,
  error => {
    console.error('MMP 请求错误:', error);
    return Promise.reject(error);
  }
);

mgtvRequest.interceptors.response.use(
  response => response,
  error => {
    console.error('MGTV 请求错误:', error);
    return Promise.reject(error);
  }
);

