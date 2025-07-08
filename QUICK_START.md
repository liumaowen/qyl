# 用户分析系统快速启动指南

## 1. 启动后端服务

### 安装依赖
```bash
# 在项目根目录
npm install express cors
npm install -g nodemon  # 可选，用于开发
```

### 启动后端服务
```bash
# 方法1：直接启动
node backend-example.js

# 方法2：使用nodemon（推荐开发时使用）
nodemon backend-example.js
```

后端服务将在 `http://localhost:3000` 启动

## 2. 配置前端

### 更新API端点
编辑 `src/config/analytics.ts`，确保开发环境使用本地后端：

```typescript
ENDPOINT: process.env.NODE_ENV === 'production' 
  ? 'https://your-production-api.com/analytics'  // 生产环境API
  : 'http://localhost:3000/analytics',           // 开发环境API
```

### 启用开发环境分析
```typescript
ENABLE_IN_DEV: true,  // 在开发环境下也上报数据
```

## 3. 启动前端应用

```bash
npm run dev
```

## 4. 测试功能

### 访问演示页面
在浏览器中访问：`http://localhost:5173/analytics-demo`

### 查看后端数据
- 统计数据：`http://localhost:3000/analytics/stats`
- 设备列表：`http://localhost:3000/analytics/devices`
- 健康检查：`http://localhost:3000/health`

## 5. 验证数据收集

1. 打开浏览器开发者工具
2. 访问演示页面
3. 点击测试按钮
4. 检查控制台日志
5. 查看后端API返回的数据

## 6. 常见问题

### 后端服务无法启动
- 检查端口3000是否被占用
- 确保Node.js版本 >= 14
- 检查依赖是否正确安装

### 前端无法连接后端
- 确保后端服务正在运行
- 检查CORS配置
- 验证API端点URL

### 数据没有上报
- 检查网络连接
- 查看浏览器控制台错误
- 确认分析功能已启用

## 7. 生产环境部署

### 后端部署
1. 将 `backend-example.js` 部署到服务器
2. 安装依赖：`npm install`
3. 启动服务：`node backend-example.js`
4. 配置反向代理（如Nginx）

### 前端配置
1. 更新生产环境API端点
2. 构建应用：`npm run build`
3. 部署到Web服务器

## 8. 数据格式示例

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

## 9. 下一步

1. 根据你的需求自定义收集的数据
2. 实现更复杂的分析逻辑
3. 添加数据可视化界面
4. 实现数据导出功能
5. 添加数据清理和归档功能 