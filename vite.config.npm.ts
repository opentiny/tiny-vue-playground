import path from 'node:path'
import fs from 'node:fs'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import UnoCSS from 'unocss/vite'
import { presetAttributify, presetIcons, presetUno } from 'unocss'
import Components from 'unplugin-vue-components/vite'

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
    })
  ],
  define: {
    'process.env': { ...process.env },
    'process.platform': '""'
  },
  optimizeDeps: {
    exclude: ['@vue/repl']
  },
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      fileName: 'tiny-repl',
      formats: ['es']
    },
    rollupOptions: {
      external: ['typescript', 'vue']
    },
    minify: false
  }
})
