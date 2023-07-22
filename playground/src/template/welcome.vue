<script setup lang="ts">
import { ref } from 'vue'

// 引入 @opentiny/vue 组件
import { Button as TinyButton } from '@opentiny/vue'

const msg = ref('Hello World!')
</script>

<template>
  <h1>{{ msg }}</h1>
  <TinyButton>确定</TinyButton>
</template>
