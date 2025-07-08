# 用户分析系统使用说明

## 概述

本系统为Ionic+Vue3+Capacitor项目提供了完整的匿名用户信息收集和分析功能，无需用户登录即可收集设备信息、使用行为等数据。

## 功能特性

### 收集的信息
- **设备唯一ID**: 基于设备硬件信息生成的唯一标识
- **设备型号**: 手机/平板的具体型号
- **平台信息**: Android/iOS/Web
- **应用版本**: 当前安装的应用版本号
- **系统版本**: 设备操作系统版本
- **IP地址**: 用户网络IP地址（可选）
- **使用统计**: 首次使用时间、最后使用时间、使用次数

### 事件追踪
- 页面访问事件
- 功能使用事件
- 错误事件
- 自定义事件
- 应用生命周期事件

## 快速开始

### 1. 配置分析端点

编辑 `src/config/analytics.ts` 文件，设置你的API端点：

```typescript
export const ANALYTICS_CONFIG = {
  ENDPOINT: process.env.NODE_ENV === 'production' 
    ? 'https://your-production-api.com/analytics'  // 生产环境API
    : 'https://your-dev-api.com/analytics',        // 开发环境API
  // ... 其他配置
};
```

### 2. 在组件中使用

```vue
<script setup lang="ts">
import { useUserAnalytics } from '@/composables/useUserAnalytics';

const { 
  trackEvent, 
  trackPageView, 
  trackFeatureUsage, 
  trackError 
} = useUserAnalytics();

// 记录页面访问
await trackPageView('home_page');

// 记录功能使用
await trackFeatureUsage('video_play', { 
  video_id: '123',
  duration: 300 
});

// 记录错误
await trackError('网络连接失败', 'NETWORK_ERROR');

// 记录自定义事件
await trackEvent('button_click', {
  button_id: 'download_btn',
  page: 'video_detail'
});
</script>
```

### 3. 在路由中使用

在 `src/router/index.ts` 中添加页面访问追踪：

```typescript
import { useUserAnalytics } from '@/composables/useUserAnalytics';

router.beforeEach(async (to, from, next) => {
  const { trackPageView } = useUserAnalytics();
  await trackPageView(to.name as string);
  next();
});
```

## 配置选项

### 分析配置 (`src/config/analytics.ts`)

```typescript
export const ANALYTICS_CONFIG = {
  // 是否启用分析功能
  ENABLED: true,
  
  // 是否在开发环境下也上报数据
  ENABLE_IN_DEV: false,
  
  // 数据上报超时时间（毫秒）
  TIMEOUT: 10000,
  
  // 是否收集IP地址
  COLLECT_IP: true,
  
  // 失败数据存储最大条数
  MAX_FAILED_DATA_COUNT: 10,
};
```

### 预定义事件

```typescript
export const ANALYTICS_EVENTS = {
  APP_LAUNCH: 'app_launch',
  PAGE_VIEW: 'page_view',
  FEATURE_USAGE: 'feature_usage',
  ERROR: 'error',
  VIDEO_PLAY: 'video_play',
  // ... 更多事件
};
```

## API数据格式

### 用户信息上报

```json
{
  "event": "user_info",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "userInfo": {
    "deviceId": "device_1234567890_abc123",
    "deviceModel": "iPhone 14 Pro",
    "platform": "ios",
    "appVersion": "1.0.0",
    "osVersion": "iOS 17.0",
    "firstUseTime": "2024-01-01T10:00:00.000Z",
    "lastUseTime": "2024-01-01T12:00:00.000Z",
    "useCount": 5,
    "ipAddress": "192.168.1.100"
  }
}
```

### 事件上报

```json
{
  "event": "page_view",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "userInfo": {
    // ... 用户信息
  },
  "additionalData": {
    "page": "home",
    "referrer": "splash"
  }
}
```

## 后端API要求

你的后端API需要处理以下格式的数据：

### POST /analytics

**请求体格式:**
```json
{
  "event": "string",           // 事件名称
  "timestamp": "string",       // ISO 8601时间戳
  "userInfo": {               // 用户信息对象
    "deviceId": "string",
    "deviceModel": "string",
    "platform": "string",
    "appVersion": "string",
    "osVersion": "string",
    "firstUseTime": "string",
    "lastUseTime": "string",
    "useCount": "number",
    "ipAddress": "string"
  },
  "additionalData": {          // 可选，额外数据
    // 任意键值对
  }
}
```

**响应要求:**
- 状态码: 200 (成功) 或 4xx/5xx (失败)
- 内容类型: application/json

## 隐私保护

### 数据收集原则
1. **匿名性**: 不收集任何个人身份信息
2. **最小化**: 只收集必要的使用统计信息
3. **透明性**: 用户可查看收集的数据
4. **可控性**: 用户可禁用数据收集

### 合规性
- 符合GDPR匿名数据处理要求
- 不收集敏感个人信息
- 提供数据收集说明

## 故障排除

### 常见问题

1. **数据上报失败**
   - 检查网络连接
   - 验证API端点配置
   - 查看控制台错误信息

2. **设备信息获取失败**
   - 检查Capacitor权限配置
   - 确认设备插件已安装

3. **IP地址获取失败**
   - 检查网络连接
   - 可能是防火墙阻止

### 调试模式

在开发环境下，可以启用详细日志：

```typescript
// 在 src/config/analytics.ts 中
ENABLE_IN_DEV: true,  // 开发环境下也上报数据
```

## 示例页面

访问 `/analytics-demo` 页面查看完整的演示功能。

## 注意事项

1. **网络权限**: 确保应用有网络访问权限
2. **存储权限**: 确保应用有本地存储权限
3. **API端点**: 确保后端API正确配置并运行
4. **数据安全**: 建议使用HTTPS协议
5. **性能影响**: 分析功能对应用性能影响很小

## 更新日志

### v1.0.0
- 初始版本
- 基础用户信息收集
- 事件追踪功能
- 本地存储和重试机制 