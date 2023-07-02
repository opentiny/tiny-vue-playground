import { defineConfig } from 'unocss'
import transformerDirective from '@unocss/transformer-directives'

export default defineConfig({
  transformers: [transformerDirective()],
  shortcuts: {
    'color-primary': 'color-[var(--el-color-primary)]'
  }
})
