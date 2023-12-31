import path from 'node:path'
import fs from 'node:fs'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import UnoCSS from 'unocss/vite'
import { presetAttributify, presetIcons, presetUno } from 'unocss'
import Components from 'unplugin-vue-components/vite'
import Inspect from 'vite-plugin-inspect'

const pathSrc = path.resolve(__dirname, 'src')

// https://vitejs.dev/config/
export default defineConfig({
  base: './',
  resolve: {
    alias: {
      '@': pathSrc
    }
  },
  plugins: [
    vue({
      script: {
        defineModel: true,
        propsDestructure: true,
        fs: {
          fileExists: fs.existsSync,
          readFile: (file) => fs.readFileSync(file, 'utf-8')
        }
      }
    }),
    Components({
      dirs: [path.resolve(pathSrc, 'components')],
      dts: path.resolve(pathSrc, 'components.d.ts')
    }),
    UnoCSS({
      presets: [presetUno(), presetAttributify(), presetIcons()]
    }),
    Inspect()
  ],
  define: {
    'process.env': { ...process.env },
    'process.platform': '""'
  },
  optimizeDeps: {
    exclude: ['@vue/repl']
  },
  build: {
    rollupOptions: {
      external: ['typescript']
    }
    // outDir: path.resolve(__dirname, '../dist') // 设置打包输出的目录，这里设置为 dist 目录
  }
})
