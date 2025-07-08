export const ANALYTICS_CONFIG = {
  
  // 是否启用分析功能
  ENABLED: true,
  
  // 是否在开发环境下也上报数据
  ENABLE_IN_DEV: true,
  
  // 数据上报重试次数
  MAX_RETRY_COUNT: 3,
  
  // 失败数据存储最大条数
  MAX_FAILED_DATA_COUNT: 10,
  
  // 数据上报超时时间（毫秒）
  TIMEOUT: 10000,
  
  // 是否收集IP地址
  COLLECT_IP: true,
  
  // 是否收集设备信息
  COLLECT_DEVICE_INFO: true,
  
  // 自定义事件前缀
  EVENT_PREFIX: 'qyl_',
  
  // 敏感信息过滤
  SENSITIVE_FIELDS: ['password', 'token', 'secret'],
};

export const ANALYTICS_EVENTS = {
  // 应用生命周期事件
  APP_LAUNCH: 'app_launch',
  APP_BACKGROUND: 'app_background',
  APP_FOREGROUND: 'app_foreground',
  
  // 页面访问事件
  PAGE_VIEW: 'page_view',
  
  // 功能使用事件
  FEATURE_USAGE: 'feature_usage',
  
  // 错误事件
  ERROR: 'error',
  
  // 用户行为事件
  BUTTON_CLICK: 'button_click',
  VIDEO_PLAY: 'video_play',
  VIDEO_PAUSE: 'video_pause',
  VIDEO_COMPLETE: 'video_complete',
  
  // 性能事件
  PERFORMANCE: 'performance',
  
  // 网络事件
  NETWORK_ERROR: 'network_error',
  API_CALL: 'api_call',
};

export const ANALYTICS_PAGES = {
  HOME: 'home',
  SHORT_DRAMAS: 'short_dramas',
  DRAMAS_DETAIL: 'dramas_detail',
  MY: 'my',
  TAB1: 'tab1',
  TAB2: 'tab2',
  TAB3: 'tab3',
};

export const ANALYTICS_FEATURES = {
  VIDEO_PLAYER: 'video_player',
  DOWNLOAD: 'download',
  SHARE: 'share',
  LIKE: 'like',
  COMMENT: 'comment',
  SEARCH: 'search',
  FILTER: 'filter',
  SETTINGS: 'settings',
  LANGUAGE_SWITCH: 'language_switch',
}; 