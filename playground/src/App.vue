<script setup lang="ts">
import { Repl, type SFCOptions } from 'opentiny-repl'
import Monaco from 'opentiny-repl/monaco-editor'
import { ref, watchEffect } from 'vue'
import { useDark } from '@vueuse/core'
import { ElConfigProvider } from 'element-plus'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
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
})

store.init().then(() => (loading.value = false))

// store.setVersion('3.2.47')

function handleKeydown(evt: KeyboardEvent) {
  if ((evt.ctrlKey || evt.metaKey) && evt.code === 'KeyS')
    evt.preventDefault()
}

const dark = useDark()

// persist state
watchEffect(() => history.replaceState({}, '', `#${store.serialize()}`))
</script>

<template>
  <ElConfigProvider :locale="zhCn">
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
      <div v-loading="{ text: 'Loading...' }" h-100vh />
    </template>
  </ElConfigProvider>
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
  height: calc(100vh - var(--nav-height)) !important;
}

.dark .vue-repl,
.vue-repl {
  --color-branding: var(--el-color-primary) !important;
}

.dark body {
  background-color: #1a1a1a;
}
</style>
