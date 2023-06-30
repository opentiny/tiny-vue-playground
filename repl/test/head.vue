<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Sun from './icons/Sun.vue'
import Moon from './icons/Moon.vue'
import Share from './icons/Share.vue'

//@ts-ignore
const props = defineProps(['store', 'dev', 'ssr'])
const { store } = props

const expanded = ref(false)
const publishedVersions = ref<string[]>()
const activeVersion = ref(`${store.vueVersion}`)

const fetchVersions2 = async (pkg?: string) => {
  const res = await fetch(`https://registry.npmjs.org/vue`)
  const data = await res.json()
  const versions = Object.keys(data.versions)
    .filter(version => {
      // 只保留2.6.x和2.7.x版本，且不包括alpha和beta版本
      return version.match(/^2\.[67]\./) && !version.includes('alpha') && !version.includes('beta');
    })
    .sort((a, b) => {
      // 倒序排列
      return b.localeCompare(a, undefined, {numeric: true, sensitivity: 'base'});
    });
  return versions
}

fetchVersions2('vue')

//---vue3--------------
async function fetchVersions(): Promise<string[]> {
  const v2 = await fetchVersions2()
  const res = await fetch(
    `https://api.github.com/repos/vuejs/core/releases?per_page=100`
  )
  const releases: any[] = await res.json()
  const versions = releases.map(r =>
    /^v/.test(r.tag_name) ? r.tag_name.slice(1) : r.tag_name
  )
  let isInPreRelease = versions[0].includes('-')
  const filteredVersions: string[] = []
  for (const v of versions) {
    if (v.includes('-')) {
      if (isInPreRelease) {
        filteredVersions.push(v)
      }
    } else {
      filteredVersions.push(v)
      isInPreRelease = false
    }
    if (filteredVersions.length >= 30 || v === '3.0.10') {
      break
    }
  }
  filteredVersions.push(...v2)
  return filteredVersions
}
async function setVersion(v: string) {
  activeVersion.value = `loading...`
  await store.setVueVersion(v)
  activeVersion.value = `v${v}`
  expanded.value = false
}
async function toggle() {
  expanded.value = !expanded.value
  if (!publishedVersions.value) {
    publishedVersions.value = await fetchVersions()
  }
}


async function copyLink() {
  await navigator.clipboard.writeText(location.href)
  alert('Sharable URL has been copied to clipboard.')
}

function toggleDark() {
  const cls = document.documentElement.classList
  cls.toggle('dark')
  localStorage.setItem(
      'vue-sfc-playground-prefer-dark',
      String(cls.contains('dark'))
  )
}

onMounted(async () => {
  window.addEventListener('click', () => {
      expanded.value = false
  })
  window.addEventListener('blur', () => {
      if (document.activeElement?.tagName === 'IFRAME') {
          expanded.value = false
      }
  });
})
</script>

<template>
    <nav>
        <div>
            <!-- <img alt="logo" src="/vue.svg" /> -->
            <span>Vue2&Vue3 SFC Playground</span>
        </div>
        <div class="links">
            <div class="version" @click.stop>
                <span class="active-version" @click="toggle">
                Version
                <span class="number">{{ activeVersion }}</span>
                </span>
                <ul class="versions" :class="{ expanded }">
                    <li v-if="!publishedVersions"><a>loading versions...</a></li>
                    <li v-for="version of publishedVersions">
                        <a @click="setVersion(version)">v{{ version }}</a>
                    </li>
                </ul>
            </div>
            <button title="Toggle dark mode" class="toggle-dark" @click="toggleDark">
                <Sun class="light" />
                <Moon class="dark" />
            </button>
            <button title="Copy sharable URL" class="share" @click="copyLink">
                <Share />
            </button>
        </div>
    </nav>
</template>

<style scoped>
nav {
    --bg: #fff;
    --bg-light: #fff;
    --border: #ddd;
    --btn: #666;
    --highlight: #333;
    --green: #3ca877;
    --purple: #904cbc;
    --btn-bg: #eee;

    color: var(--base);
    height: var(--nav-height);
    box-sizing: border-box;
    padding: 0 1em;
    background-color: var(--bg);
    box-shadow: 0 0 4px rgba(0, 0, 0, 0.33);
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

div {
    height: 30px;
    padding: 7px;
    font-weight: 500;
    display: inline-flex;
    place-items: center;
}

div img {
    height: 24px;
    margin-right: 10px;
}

@media (max-width: 560px) {
  div span {
        font-size: 0.9em;
    }
}

@media (max-width: 520px) {
  div span {
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
    overflow-y: scroll;
    overflow-x: hidden;
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

.links>* {
    display: flex;
    align-items: center;
}

.links>*+* {
    margin-left: 4px;
}
</style>
