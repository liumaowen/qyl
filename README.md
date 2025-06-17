# qyl 项目

## 项目简介

本项目基于 Vue、Ionic、Capacitor 开发，支持安卓平台，包含视频播放、文件操作等功能。

## 主要技术栈

- Vue 3
- Ionic Framework
- Capacitor
- TypeScript

## 快速开始

1. 安装依赖

   ```bash
   npm install
   ```

2. 本地开发

   ```bash
   npm run dev
   ```

3. 构建前端

   ```bash
   npm run build
   ```

4. 同步 Capacitor 平台

   ```bash
   npx cap sync
   ```

5. 运行安卓项目

   ```bash
   npx cap open android
   ```

## 云端打包

- 支持 GitHub Actions 自动打包 APK。
- 也可上传到 Appflow 云端打包。

## 常见问题

- 如果遇到 JDK 版本相关报错，请根据 Capacitor 版本选择合适的 JDK（6.x 推荐 JDK 17，7.x 需 JDK 21）。
- 插件兼容性请参考各插件官方文档。

## 许可