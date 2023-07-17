<script setup lang="ts">
import { type ComputedRef, reactive, ref } from 'vue'
import { ElMessage, ElSelect } from 'element-plus'

import { useDark, useToggle } from '@vueuse/core'
import Share from '../icons/Share.vue'
import GitHub from '../icons/GitHub.vue'
import Sun from '../icons/Sun.vue'
import Moon from '../icons/Moon.vue'
import { type ReplStore, type VersionKey } from '@/composables/store'
import { getSupportedEpVersions, getSupportedVueVersions } from '@/utils/dependency'

const { store } = defineProps<{
  store: ReplStore
}>()
// const appVersion = import.meta.env.APP_VERSION
// const replVersion = import.meta.env.REPL_VERSION

const nightly = ref(false)
const dark = useDark()
const toggleDark = useToggle(dark)

interface Version {
  text: string
  published: ComputedRef<string[]>
  active: string
}

const versions = reactive<Record<VersionKey, Version>>({
  elementPlus: {
    text: 'OpenTiny',
    published: getSupportedEpVersions(nightly),
    active: store.versions.elementPlus,
  },
  vue: {
    text: 'Vue',
    published: getSupportedVueVersions(),
    active: store.versions.vue,
  },
})

async function setVersion(key: VersionKey, v: string) {
  versions[key].active = 'loading...'
  await store.setVersion(key, v)
  versions[key].active = v
}

// function toggleNightly() {
//   store.toggleNightly(nightly.value)
//   setVersion('elementPlus', 'latest')
// }

async function copyLink() {
  await navigator.clipboard.writeText(location.href)
  ElMessage.success('Sharable URL has been copied to clipboard.')
}
</script>

<template>
  <nav>
    <div leading="[var(--nav-height)]" m-0 flex items-center font-medium>
      <img h-35px relative mr-2 v="mid" top="2px" alt="logo" src="../assets/logo.png">
      <div lt-sm-hidden flex="~ gap-1" items-center>
        <div text-xl>
          OpenTiny Playground
        </div>
      </div>
    </div>

    <div flex="~ gap-2" items-center>
      <div v-for="(v, key) of versions" :key="key" flex="~ gap-2" items-center lt-lg-hidden>
        <span>{{ v.text }} Version:</span>
        <ElSelect
          :model-value="v.active"
          size="small"
          fit-input-width
          w-36
          @update:model-value="setVersion(key, $event)"
        >
          <el-option v-for="ver of v.published" :key="ver" :value="ver">
            {{ ver }}
          </el-option>
        </ElSelect>
      </div>

      <div flex="~ gap-4" class="icons">
        <!-- <el-button link :icon="Edit" /> -->
        <!-- <button text-lg i-ri-share-line @click="copyLink">
          <Share />
        </button> -->
        <!-- <button
          title="Toggle dark mode"
          class="toggle-dark"
          @click="toggleDark()"
        >
          <Sun class="light" />
          <Moon class="dark" />
        </button> -->
        <!-- <button>
          <a
            href="https://github.com/ChaiMayor/hview-ui/tree/dev"
            target="_blank"
          >
            <GitHub />
          </a>
        </button> -->
        <el-icon :size="18" @click="copyLink">
          <Share />
        </el-icon>
        <div title="Toggle dark mode" class="toggle-dark" @click="toggleDark()">
          <el-icon :size="24" class="light">
            <Sun />
          </el-icon>
          <el-icon :size="24" class="dark">
            <Moon />
          </el-icon>
        </div>
        <el-icon :size="24">
          <a href="https://github.com/mengqiuleo/opentiny-playground" target="_blank" flex hover:color-primary><GitHub /></a>
        </el-icon>
      </div>
    </div>
  </nav>
</template>

<style lang="scss">
nav {
  --bg: #fff;
  --bg-light: #fff;
  --border: #ddd;

  --at-apply: 'box-border flex justify-between px-4 z-999 relative';

  height: var(--nav-height);
  background-color: var(--bg);
  box-shadow: 0 0 6px var(--el-color-primary);
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

.links {
  display: flex;
}

.version {
  margin-right: 12px;
  position: relative;
}

.active-version {
  cursor: pointer;
  position: relative;
  display: inline-flex;
  place-items: center;
}

.active-version .number {
  color: var(--green);
  margin-left: 4px;
}

.active-version::after {
  content: '';
  width: 0;
  height: 0;
  border-left: 4px solid transparent;
  border-right: 4px solid transparent;
  border-top: 6px solid #aaa;
  margin-left: 8px;
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

.toggle-ssr span {
  background-color: var(--btn-bg);
}

.toggle-ssr.enabled span {
  color: #fff;
  background-color: var(--green);
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

.links button,
.links button a {
  color: var(--btn);
}

.links button:hover,
.links button:hover a {
  color: var(--highlight);
}

.version:hover .active-version::after {
  border-top-color: var(--btn);
}

.dark .version:hover .active-version::after {
  border-top-color: var(--highlight);
}

.versions {
  display: none;
  position: absolute;
  left: 0;
  top: 40px;
  background-color: var(--bg-light);
  border: 1px solid var(--border);
  border-radius: 4px;
  list-style-type: none;
  padding: 8px;
  margin: 0;
  width: 200px;
  max-height: calc(100vh - 70px);
  overflow: scroll;
}

.versions a {
  display: block;
  padding: 6px 12px;
  text-decoration: none;
  cursor: pointer;
  color: var(--base);
}

.versions a:hover {
  color: var(--green);
}

.versions.expanded {
  display: block;
}

.links > * {
  display: flex;
  align-items: center;
}

.links > * + * {
  margin-left: 4px;
}

.r-right {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  flex-direction: row;
}
.r-right-box {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  flex-direction: row;
}

html.dark {
  .div {
    button {
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
}

.icons {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  flex-direction: row;
  margin-top: 1px;
  svg {
    width: 16px;
    height: 16px;
    color: #242424;
  }
  div {
    font-size: 16px;
    margin-right: 6px;
    &:last-of-type {
      svg {
        width: 19px;
        height: 19px;
      }
    }
    a {
      svg {
        width: 20px;
        height: 20px;
      }
    }
    svg {
      width: 16px;
      height: 16px;
      color: #242424;
    }
  }
}
</style>
