<script setup lang="ts">
import { Repl } from 'opentiny-repl'
import MonacoEditor from 'opentiny-repl/monaco-editor'
import 'opentiny-repl/style.css'
</script>

<template>
  <div class="container">
    <Repl :editor="MonacoEditor" />
  </div>
</template>

<style scoped>
.dark {
  color-scheme: dark;
}

html,
body {
  height: 100%;
  margin: 0;
  font-size: 13px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans',
    'Helvetica Neue', sans-serif;
  margin: 0;
  --base: #444;
  --nav-height: 50px;
}

.container {
  /* height: calc(100vh - 50px); */
  height: 97vh;
}

button {
  border: none;
  outline: none;
  cursor: pointer;
  margin: 0;
  background-color: transparent;
}
</style>
