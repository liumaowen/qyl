/// <reference types="vitest" />

import legacy from '@vitejs/plugin-legacy'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const isProduction = mode === 'production';
  const isDebugBuild = process.env.DEBUG_BUILD === 'true';
  
  return {
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
          // 调试构建时保留 console 和 debugger
          drop_console: isProduction && !isDebugBuild,
          drop_debugger: isProduction && !isDebugBuild,
          // 保留函数名以便调试
          keep_fnames: isDebugBuild,
          keep_classnames: isDebugBuild
        },
        mangle: {
          // 调试构建时不混淆顶级变量名
          toplevel: isProduction && !isDebugBuild,
          keep_fnames: isDebugBuild,
          keep_classnames: isDebugBuild
        },
        // 调试构建时生成 sourcemap
        sourceMap: isDebugBuild
      },
      // 调试构建时生成 sourcemap
      sourcemap: isDebugBuild
    },
    server: {
      proxy: {
        '/apiopen': {
          target: 'https://api.apiopen.top',
          changeOrigin: true,
          rewrite: path => path.replace(/^\/apiopen/, '')
        },
        '/mmpapi': {
          target: 'https://www.qylapi.top',
          changeOrigin: true,
          rewrite: path => path.replace(/^\/mmpapi/, '')
        },
        '/mgtv': {
          target: 'https://api.mgtv109.cc',
          // target: 'https://lb0b.mgtv1266.cc',
          changeOrigin: true,
          rewrite: path => path.replace(/^\/mgtv/, '')
        },
        '/ipapi': {
          target: 'https://ipapi.co',
          changeOrigin: true,
          rewrite: path => path.replace(/^\/ipapi/, '')
        }
      }
    },
    // base: '/open/', // 打包H5时使用
  }
})
