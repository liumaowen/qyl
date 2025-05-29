/// <reference types="vitest" />

import legacy from '@vitejs/plugin-legacy'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue({
      template: {
        compilerOptions: {
          // isCustomElement: (tag) => tag.startsWith('swiper-')
        }
      }
    }),
    legacy()
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom'
  },
  server: {
    proxy: {
      '/apiopen': {
        target: 'https://api.apiopen.top',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/apiopen/, '')
      },
      '/mmpapi': {
        target: 'https://api.mmp.cc',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/mmpapi/, '')
      }
    }
  }
})
