<script setup lang="ts">
import { type ComputedRef, reactive, ref } from 'vue'
import { Notify, Option as TinyOption, Select as TinySelect } from '@opentiny/vue'
import { useDark, useToggle } from '@vueuse/core'
import Share from '../icons/Share.vue'
import GitHub from '../icons/Github.vue'
import Sun from '../icons/Sun.vue'
import Moon from '../icons/Moon.vue'
import { cdn, getSupportedOpVersions, getSupportedVueVersions } from '@/utils/dependency'
import { type ReplStore, type VersionKey } from '@/composables/store'

const { store } = defineProps<{
  store: ReplStore
}>()

const dark = useDark()
const toggleDark = useToggle(dark)

interface Version {
  text: string
  published: ComputedRef<string[]>
  active: string
}

const versions = reactive<Record<VersionKey, Version>>({
  openTiny: {
    text: 'TinyVue',
    published: getSupportedOpVersions(),
    active: store.versions.openTiny,
  },
  vue: {
    text: 'Vue',
    published: getSupportedVueVersions(),
    active: store.versions.vue,
  },
})

const cdns = reactive([
  { value: 'unpkg', label: 'unpkg' },
  { value: 'jsdelivr', label: 'jsdelivr' },
  { value: 'jsdelivr-fastly', label: 'jsdelivr-fastly' },
])
const cdnValue = ref(cdn)

async function setVersion(v: any, key: VersionKey) {
  versions[key].active = 'loading...'
  await store.setVersion(key, v)
  versions[key].active = v
}

async function copyLink() {
  await navigator.clipboard.writeText(location.href)
  Notify({
    type: 'success',
    title: '分享',
    message: '当前URL已被复制到剪贴板.',
    duration: 2000,
  })
}
</script>

<template>
  <nav>
    <div m-0 flex items-center font-medium>
      <img h-35px relative mr-2 v="mid" top="2px" alt="logo" src="../assets/logo.png">
      <div lt-sm-hidden flex="~ gap-1" items-center>
        <div text-xl>
          TinyVue Playground
        </div>
      </div>
    </div>

    <div flex="~ gap-2" items-center>
      <div v-for="(v, key) of versions" :key="key" flex="~ gap-2" items-center lt-lg-hidden>
        <span whitespace-nowrap>{{ `${v.text} Version:` }}</span>
        <TinySelect v-model="v.active" placeholder="请选择" @change="setVersion(v.active, key)">
          <TinyOption v-for="ver in v.published" :key="ver" :label="ver" :value="ver" />
        </TinySelect>
      </div>
      <div>
        <span whitespace-nowrap>cdn: </span>
        <TinySelect v-model="cdnValue" placeholder="请选择">
          <TinyOption v-for="cdn in cdns" :key="cdn.value" :label="cdn.label" :value="cdn.value" />
        </TinySelect>
      </div>

      <div flex="~ gap-4" items-center>
        <div flex-1>
          <Share @click="copyLink" />
        </div>
        <div flex-1 title="Toggle dark mode" class="toggle-dark" @click="toggleDark()">
          <Sun class="light" />
          <Moon class="dark" />
        </div>
        <div flex-1>
          <a href="https://github.com/opentiny/tiny-vue-playground/tree/main" target="_blank">
            <GitHub />
          </a>
        </div>
      </div>
    </div>
  </nav>
</template>

<style lang="scss">
.tiny-select {
  width: 120px;
}

nav {
  --bg: #fff;
  --bg-light: #fff;
  --border: #ddd;
  --at-apply: 'box-border flex justify-between px-4 z-999 relative';

  height: var(--nav-height);
  background-color: var(--bg);
  box-shadow: 0 0 6px #5e7ce0;
}

.dark nav {
  --bg: #1a1a1a;
  --bg-light: #242424;
  --border: #383838;
  --at-apply: 'shadow-none';
  border-bottom: 1px solid var(--border);
}

nav {
  --bg: #fff;
  --bg-light: #fff;
  --border: #ddd;
  --btn: #666;
  --highlight: #333;
  --green: #3ca877;
  --purple: #904cbc;
  --btn-bg: #eee;
  --h-color-primary: #5d80f4;

  color: var(--base);
  height: var(--nav-height);
  box-sizing: border-box;
  padding: 0 1em;
  background-color: var(--bg);
  box-shadow: 0 0 6px var(--h-color-primary);
  position: relative;
  z-index: 999;
  display: flex;
  justify-content: space-between;
}

.dark nav {
  --base: #ddd;
  --bg: #1a1a1a;
  --bg-light: #242424;
  --border: #383838;
  --highlight: #fff;
  --btn-bg: #333;

  box-shadow: none;
  border-bottom: 1px solid var(--border);
}

h1 {
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  place-items: center;
  color: #000;
}

.dark h1 {
  color: #fff;
}

h1 img {
  height: 24px;
  margin-right: 10px;
}

@media (max-width: 560px) {
  h1 span {
    font-size: 0.9em;
  }
}

@media (max-width: 520px) {
  h1 span {
    display: none;
  }
}

.toggle-dev span,
.toggle-ssr span {
  font-size: 12px;
  border-radius: 4px;
  padding: 4px 6px;
}

.toggle-dev span {
  background: var(--purple);
  color: #fff;
}

.toggle-dev.dev span {
  background: var(--green);
}

.toggle-dark svg {
  width: 18px;
  height: 18px;
}

.toggle-dark .dark,
.dark .toggle-dark .light {
  display: none;
}

.dark .toggle-dark .dark {
  display: inline-block;
}

html.dark {
  .div {
    font-size: 16px;
    margin-right: 6px;
    a {
      svg {
        width: 20px;
        height: 20px;
      }
    }
    svg {
      width: 16px;
      height: 16px;
      color: #fff;
    }
  }
}
</style>
