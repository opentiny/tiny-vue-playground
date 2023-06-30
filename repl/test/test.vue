<script setup lang="ts">
import { Repl, ReplStore } from '../src/index'
import MonacoEditor from '../src/editor/MonacoEditor.vue'
import { EditorComponentType } from 'src/editor/types';

import Header from './head.vue'
import { ref, watchEffect } from 'vue'

const setVH = () => {
  document.documentElement.style.setProperty('--vh', window.innerHeight + `px`)
}
window.addEventListener('resize', setVH)
setVH()

const useDevMode = ref(false)
const useSSRMode = ref(false)

let hash = location.hash.slice(1)
if (hash.startsWith('__DEV__')) {
  hash = hash.slice(7)
  useDevMode.value = true
}
if (hash.startsWith('__SSR__')) {
  hash = hash.slice(7)
  useSSRMode.value = true
}

const store = new ReplStore({
  serializedState: hash,
})

store.setVueVersion('3.3.4')

// enable experimental features
const sfcOptions = {
  script: {
    inlineTemplate: !useDevMode.value,
    reactivityTransform: true
  }
}

// persist state
watchEffect(() => {
  const newHash = store
    .serialize()
    .replace(/^#/, useSSRMode.value ? `#__SSR__` : `#`)
    .replace(/^#/, useDevMode.value ? `#__DEV__` : `#`)
  history.replaceState({}, '', newHash)
})

function toggleDevMode() {
  const dev = (useDevMode.value = !useDevMode.value)
  sfcOptions.script.inlineTemplate = !dev
  store.setFiles(store.getFiles())
}

function toggleSSR() {
  useSSRMode.value = !useSSRMode.value
  store.setFiles(store.getFiles())
}
</script>

<template>
  <Header :store="store" :dev="useDevMode" :ssr="useSSRMode" @toggle-dev="toggleDevMode" @toggle-ssr="toggleSSR" />
  <Repl :editor="(MonacoEditor  as any as EditorComponentType)"/>
</template>

<style scoped>
.dark {
  color-scheme: dark;
}

body {
  font-size: 13px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
    Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  margin: 0;
  --base: #444;
  --nav-height: 50px;
}

.vue-repl {
  height: calc(100vh - 50px);
}

button {
  border: none;
  outline: none;
  cursor: pointer;
  margin: 0;
  background-color: transparent;
}
</style>
