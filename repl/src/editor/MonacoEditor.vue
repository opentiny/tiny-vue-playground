<script setup lang="ts">
import Monaco from '../monaco/Monaco.vue'
// import type { EditorEmits } from './types'
interface EditorEmits {
  (e: 'change', code: string): void
}
type PreviewMode = 'js' | 'css' | 'ssr'
interface EditorProps {
  value: string
  filename: string
  readonly?: boolean
  mode?: PreviewMode
}

defineProps<EditorProps>()
const emit = defineEmits<EditorEmits>()

defineOptions({
  editorType: 'monaco',
})

const onChange = (code: string) => {
  emit('change', code)
}
</script>

<template>
  <Monaco
    @change="onChange"
    :filename="filename"
    :value="value"
    :readonly="readonly"
    :mode="mode"
  />
</template>
