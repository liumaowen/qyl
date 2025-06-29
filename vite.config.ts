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
  build: {
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      },
      mangle: {
        toplevel: true
      }
    }
  },
  server: {
    proxy: {
      '/apiopen': {
        target: 'https://api.apiopen.top',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/apiopen/, '')
      },
      '/mmpapi': {
        target: 'https://www.qylapi.top/',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/mmpapi/, '')
      },
      '/mgtv': {
        target: 'https://api.mgtv109.cc',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/mgtv/, '')
      },
      '/ossgp': {
        target: 'https://ossgp.oss-cn-hangzhou.aliyuncs.com',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/ossgp/, '')
      }
    }
  }
})
