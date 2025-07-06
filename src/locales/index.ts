import { createI18n } from 'vue-i18n'
import { Preferences  } from '@capacitor/preferences'

// 导入语言包
import zh from './zh-CN';
import en from './en-US';

// 支持的语言列表
export const supportedLocales = [
  { code: 'zh-CN', name: '简体中文', flag: '🇨🇳' },
  { code: 'en-US', name: 'English', flag: '🇺🇸' },
]

// 语言包配置
const messages = {
  'zh-CN': zh,
  'en-US': en
}

// 获取默认语言（同步版本）
const getDefaultLocale = (): string => {
  // 优先使用存储的语言设置
  const storedLocale = localStorage.getItem('locale')
  if (storedLocale && supportedLocales.some(locale => locale.code === storedLocale)) {
    return storedLocale
  }
  
  // 获取浏览器/系统语言
  const browserLocales = navigator.languages || [navigator.language]
  
  // 遍历所有语言，找到第一个匹配的支持语言
  for (const locale of browserLocales) {
    // 精确匹配
    const exactMatch = supportedLocales.find(l => l.code === locale)
    if (exactMatch) {
      return exactMatch.code
    }
    
    // 语言代码匹配（如 zh-CN 匹配 zh）
    const languageCode = locale.split('-')[0]
    const languageMatch = supportedLocales.find(l => l.code.startsWith(languageCode))
    if (languageMatch) {
      return languageMatch.code
    }
  }
  
  // 默认返回中文
  return 'zh-CN'
}

// 异步初始化语言设置
const initializeLocale = async () => {
  try {
    // 尝试从设备存储获取语言设置
    const { value } = await Preferences.get({ key: 'locale' })
    if (value && supportedLocales.some(locale => locale.code === value)) {
      i18n.global.locale.value = value as any
      localStorage.setItem('locale', value)
    }
  } catch (error) {
    console.warn('Failed to get locale from device storage:', error)
  }
}

// 创建i18n实例
const i18n = createI18n({
  legacy: false, // 使用Composition API模式
  locale: getDefaultLocale(),
  fallbackLocale: 'zh-CN',
  messages,
  globalInjection: true, // 全局注入$t方法
})

// 初始化语言设置
initializeLocale()

// 语言切换函数
export const changeLocale = async (locale: string) => {
  if (supportedLocales.some(l => l.code === locale)) {
    i18n.global.locale.value = locale as any
    localStorage.setItem('locale', locale)
    
    // 保存到设备存储（用于原生应用）
    try {
        await Preferences.set({ key: 'locale', value: locale});
    } catch (error) {
      console.warn('Failed to save locale to device storage:', error)
    }
  }
}

// 获取当前语言
export const getCurrentLocale = () => i18n.global.locale.value

// 获取语言显示名称
export const getLocaleName = (code: string) => {
  const locale = supportedLocales.find(l => l.code === code)
  return locale ? locale.name : code
}

export default i18n 