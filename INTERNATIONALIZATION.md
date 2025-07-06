# 国际化配置使用说明

## 概述

本项目已配置完整的国际化支持，支持中文和英文两种语言，可以根据用户设备语言自动切换。

## 功能特性

- ✅ 自动检测设备语言
- ✅ 支持手动切换语言
- ✅ 语言设置持久化存储
- ✅ 支持原生应用（Capacitor）
- ✅ 完整的语言包管理

## 支持的语言

- 🇨🇳 简体中文 (zh-CN)
- 🇺🇸 English (en-US)

## 使用方法

### 1. 在模板中使用

```vue
<template>
  <!-- 简单文本 -->
  <div>{{ $t('nav.recommend') }}</div>
  
  <!-- 带参数的文本 -->
  <div>{{ $t('video.watchFullDrama', { count: 10 }) }}</div>
  
  <!-- 在属性中使用 -->
  <ion-title>{{ $t('page.episode', { number: 1 }) }}</ion-title>
</template>
```

### 2. 在脚本中使用

```vue
<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

// 简单文本
console.log(t('common.loading'))

// 带参数的文本
console.log(t('my.completed', { percent: 50 }))
</script>
```

### 3. 语言切换

```typescript
import { changeLocale } from '@/locales'

// 切换到英文
await changeLocale('en-US')

// 切换到中文
await changeLocale('zh-CN')
```

## 语言包结构

### 导航相关
```typescript
nav: {
  recommend: '推荐',
  shortDrama: '短剧',
  my: '我的'
}
```

### 视频播放相关
```typescript
video: {
  firstEpisode: '第一集',
  watchFullDrama: '观看完整短剧·全{count}集',
  skipAd: '跳过广告',
  skipAfter: '{seconds}秒后跳过'
}
```

### 页面标题
```typescript
page: {
  episode: '第{number}集',
  shortDrama: '短剧'
}
```

### 个人中心
```typescript
my: {
  vip: 'VIP',
  viewWebsite: '查看官网',
  checkUpdate: '检查更新',
  downloadingUpdate: '正在下载更新，请稍等...',
  completed: '已完成：{percent}%',
  copyright: '© {year} 短剧应用',
  version: '版本 {version}'
}
```

## 添加新语言

1. 在 `src/locales/` 目录下创建新的语言文件，如 `ja-JP.ts`
2. 在 `src/locales/index.ts` 中添加新语言配置：

```typescript
import ja from './ja-JP'

export const supportedLocales = [
  { code: 'zh-CN', name: '简体中文', flag: '🇨🇳' },
  { code: 'en-US', name: 'English', flag: '🇺🇸' },
  { code: 'ja-JP', name: '日本語', flag: '🇯🇵' }  // 新增
]

const messages = {
  'zh-CN': zh,
  'en-US': en,
  'ja-JP': ja  // 新增
}
```

## 语言切换组件

项目已包含 `LanguageSwitcher` 组件，可以在任何页面中使用：

```vue
<template>
  <LanguageSwitcher />
</template>

<script setup lang="ts">
import LanguageSwitcher from '@/components/LanguageSwitcher.vue'
</script>
```

## 注意事项

1. **参数传递**：使用 `{ key: value }` 格式传递参数
2. **嵌套访问**：使用点号访问嵌套的翻译键，如 `nav.recommend`
3. **默认语言**：如果翻译键不存在，会回退到中文
4. **持久化**：语言设置会自动保存到本地存储和设备存储

## 开发建议

1. **统一管理**：所有文本都应该通过语言包管理
2. **键名规范**：使用有意义的键名，按功能模块分组
3. **参数验证**：确保传递的参数与语言包中的占位符匹配
4. **测试覆盖**：确保所有语言包都有对应的翻译

## 已完成的国际化内容

- ✅ 导航标签
- ✅ 视频播放界面
- ✅ 广告相关文本
- ✅ 个人中心页面
- ✅ 更新提示
- ✅ 错误信息
- ✅ 通用操作文本

## 待完成的内容

- 🔄 更多页面文本
- 🔄 错误提示信息
- �� 成功提示信息
- 🔄 加载状态文本 