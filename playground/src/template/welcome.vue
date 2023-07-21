<script setup lang="ts">
import { ref } from 'vue'

// 引入 @opentiny/vue 组件
import { Button as TinyButton } from '@opentiny/vue'

const msg = ref('Hello World!123')
</script>

<template>
  <h1>{{ msg }}</h1>
  <button>123</button>
  <TinyButton>确定</TinyButton>
</template>
