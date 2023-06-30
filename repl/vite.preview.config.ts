import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import DefineOptions from 'unplugin-vue-define-options/vite'
import replace from '@rollup/plugin-replace'

export default defineConfig({
  plugins: [
    vue({
      script: {
        defineModel: true,
      },
    }),
    DefineOptions()
  ],
  resolve: {
    alias: {
      path: 'path-browserify',
    },
  },
  worker: {
    format: 'es',
    plugins: [
      replace({
        preventAssignment: true,
        values: {
          'process.env.NODE_ENV': JSON.stringify('production'),
        },
      }),
    ],
  },
})
