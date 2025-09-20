# CLAUDE.md

此文件为 Claude Code (claude.ai/code) 在此代码库中工作时提供指导。
请始终使用中文回复

## 项目概述

这是一个使用 Vue 3、Ionic Framework 和 Capacitor 构建的移动应用项目。该应用支持 Android 平台，包含视频播放和文件操作等功能。

### 关键技术
- Vue 3
- Ionic Framework
- Capacitor
- TypeScript
- Vite

## 开发命令

### 安装依赖
```bash
npm install
```

### 本地开发
```bash
npm run dev
```

### 生产构建
```bash
npm run build
```

### 调试生产构建
```bash
npm run build:debug
```

### 运行测试
```bash
# 单元测试
npm run test:unit

# 端到端测试
npm run test:e2e
```

### 代码检查
```bash
npm run lint
```

### Capacitor 命令
```bash
# 同步平台
npx cap sync

# 打开 Android 项目
npx cap open android
```

## 项目架构

### 目录结构
- `src/` - 主要源代码
  - `api/` - API 服务定义
  - `components/` - 可复用的 Vue 组件
  - `composables/` - Vue composables
  - `config/` - 配置文件
  - `locales/` - 国际化文件
  - `router/` - Vue Router 配置
  - `store/` - 全局状态管理
  - `utils/` - 工具函数
  - `views/` - 页面组件
- `public/` - 静态资源
- `tests/` - 测试文件
- `android/` - Capacitor Android 平台代码

### 路由
应用程序使用基于标签的导航与 Vue Router。主要路由包括：
- Tab1: 首页/视频内容
- Tab2: 次要内容
- Tab3: 附加内容
- ShortDramas: 短视频内容
- My: 用户个人资料/账户部分
- DramasDetail: 内容详情视图
- AnalyticsDemo: 分析演示

### 状态管理
全局状态通过 `src/store/state.ts` 中的 Vue 响应式 API 进行管理，包括：
- 应用程序配置
- 视频播放域设置
- 分析初始化状态
- 短视频配置

### 构建配置
使用 Vite 作为构建工具，配置在 `vite.config.ts` 中：
- 开发和生产的环境特定设置
- API 端点的代理配置
- 带调试构建选项的 Terser 压缩
- 通过 @vitejs/plugin-legacy 支持旧版浏览器

## 重要说明
- 项目使用 TypeScript 确保类型安全
- 使用 vue-i18n 实现国际化
- 使用 Video.js 进行视频播放
- 使用 Swiper 实现轮播/滑块组件
- Capacitor 插件提供原生设备功能