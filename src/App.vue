<script setup lang="ts">
import { Repl, type SFCOptions } from '@vue/repl'
import Monaco from '@vue/repl/monaco-editor'
import { ref, watchEffect } from 'vue'
import { useDark } from '@vueuse/core'
import { Loading } from '@opentiny/vue'
import LocalStorageService from './utils/localStorage'
import { useStore } from './composables/store'
import { type UserOptions } from '@/composables/store'

const loading = ref(true)

type SFCOptionsInstance = typeof SFCOptions
// enable experimental features
const sfcOptions: SFCOptionsInstance = {
  script: {
    reactivityTransform: true,
    defineModel: true,
  },
}

const initialUserOptions: UserOptions = {}

const store = useStore({
  serializedState: location.hash.slice(1),
  userOptions: initialUserOptions,
  versions: { vue: '3.2.47', openTiny: '3.9.1' },
})
LocalStorageService.setItem('versions', store.versions)

store.init().then(() => (loading.value = false))

function handleKeydown(evt: KeyboardEvent) {
  if ((evt.ctrlKey || evt.metaKey) && evt.code === 'KeyS')
    evt.preventDefault()
}

const dark = useDark()

// persist state
watchEffect(() => history.replaceState({}, '', `#${store.serialize()}`))

let loadingInstance
// eslint-disable-next-line prefer-const
loadingInstance = Loading.service({
  text: '加载中...',
  target: document.getElementById('loading'),
})

window.addEventListener('load', () => {
  loadingInstance.close()
})
</script>

<template>
  <div v-if="!loading" antialiased>
    <Header :store="store" />
    <Repl
      :theme="dark ? 'dark' : 'light'"
      :store="store"
      :editor="Monaco"
      show-compile-output
      auto-resize
      :sfc-options="sfcOptions"
      :clear-console="false"
      @keydown="handleKeydown"
    />
  </div>
  <template v-else>
    <div id="loading" h-100vh />
  </template>
</template>

<style>
body {
  --at-apply: m-none text-13px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans',
    'Helvetica Neue', sans-serif;
  --base: #444;
  --nav-height: 50px;
}

.vue-repl {
  height: calc(100vh - 50px) !important;
}

.dark .vue-repl,
.vue-repl {
  --color-branding: #5e7ce0 !important;
}

.dark body {
  background-color: #1a1a1a;
}
</style>
