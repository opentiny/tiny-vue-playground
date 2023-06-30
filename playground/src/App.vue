<script setup lang="ts">
import { ref } from 'vue'
import { Repl } from 'opentiny-repl'
import MonacoEditor from 'opentiny-repl/monaco-editor'
import 'opentiny-repl/style.css'

const name = ref('xioa')
</script>

<template>
  <Repl :editor="MonacoEditor" />
</template>
