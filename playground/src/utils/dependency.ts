import { gte } from 'semver'
import { type Ref, computed, unref } from 'vue'
import { type MaybeRef, useFetch, useLocalStorage } from '@vueuse/core'
import { type Versions } from '@/composables/store'
import { type ImportMap } from '@/utils/import-map'

export interface Dependency {
  pkg?: string
  version?: string
  path: string
}

export type Cdn = 'unpkg' | 'jsdelivr' | 'jsdelivr-fastly'
export const cdn = useLocalStorage<Cdn>('setting-cdn', 'jsdelivr-fastly')

export function genCdnLink(pkg: string, version: string | undefined, path: string) {
  version = version ? `@${version}` : ''
  switch (cdn.value) {
    case 'jsdelivr':
      return `https://cdn.jsdelivr.net/npm/${pkg}${version}${path}`
    case 'jsdelivr-fastly':
      return `https://fastly.jsdelivr.net/npm/${pkg}${version}${path}`
    case 'unpkg':
      return `https://unpkg.com/${pkg}${version}${path}`
  }
}

export function genVueLink(version: string) {
  let compilerSfc, runtimeDom

  if (version.split('.')[0] === '3') {
    compilerSfc = genCdnLink('@vue/compiler-sfc', version, '/dist/compiler-sfc.esm-browser.js')
    runtimeDom = genCdnLink('@vue/runtime-dom', version, '/dist/runtime-dom.esm-browser.js')
  } else {
    compilerSfc = genCdnLink('vue', version, '/dist/vue.esm.browser.js')
    runtimeDom = genCdnLink('vue', version, '/dist/vue.esm.browser.js')
  }

  return {
    compilerSfc,
    runtimeDom
  }
}

export function genImportMap({ vue, openTiny }: Partial<Versions> = {}, _nightly: boolean): ImportMap {
  const isV3Path = vue
    ? vue.split('.')[0] === '3'
      ? '/dist/vue.esm-browser.js'
      : '/dist/vue.esm.browser.js'
    : '/dist/vue.esm-browser.js'
  const deps: Record<string, Dependency> = {
    'vue': {
      pkg: 'vue',
      version: vue,
      path: isV3Path
    },
    '@vue/shared': {
      version: vue,
      path: '/dist/shared.esm-bundler.js'
    },
    '@opentiny/vue': {
      pkg: '@opentiny/vue',
      version: openTiny,
      path: '/runtime/tiny-vue.mjs'
    },
    '@opentiny/vue-common': {
      pkg: '@opentiny/vue',
      version: openTiny,
      path: '/runtime/tiny-vue-common.mjs'
    },
    '@opentiny/vue-icon': {
      pkg: '@opentiny/vue',
      version: openTiny,
      path: '/runtime/tiny-vue-icon.mjs'
    },
    '@opentiny/vue-locale': {
      pkg: '@opentiny/vue',
      version: openTiny,
      path: '/runtime/tiny-vue-locale.mjs'
    }
  }

  const map = {
    imports: Object.fromEntries(
      Object.entries(deps).map(([key, dep]) => [key, genCdnLink(dep.pkg ?? key, dep.version, dep.path)])
    )
  }

  return map
}

export function getVersions(pkg: MaybeRef<string>) {
  const url = computed(() => `https://data.jsdelivr.com/v1/package/npm/${unref(pkg)}`)
  return useFetch(url, {
    initialData: [],
    // eslint-disable-next-line no-sequences
    afterFetch: (ctx) => ((ctx.data = ctx.data.versions), ctx),
    refetch: true
  }).json<string[]>().data as Ref<string[]>
}

function isStableVersion(version) {
  const preReleaseIdentifiers = ['-alpha', '-beta', '-rc'] // 预发布标识符列表

  // 检查版本号中是否包含预发布标识符
  for (const identifier of preReleaseIdentifiers) {
    if (version.includes(identifier)) return false
  }

  // 包含预发布标识符，不是稳定版本
  return true // 不包含预发布标识符，是稳定版本
}

export function getSupportedVueVersions() {
  const versions = getVersions('vue')
  return computed(() =>
    versions.value.filter((version) => {
      if (version.startsWith('2.')) {
        // 对于 Vue 2，只保留稳定版本
        return isStableVersion(version) && gte(version, '2.6.0')
      } else if (version.startsWith('3.')) {
        // 对于 Vue 3，只保留版本号高于等于 3.2.0 的稳定版本
        return isStableVersion(version) && gte(version, '3.2.0')
      } else {
        // 其他版本不符合条件，过滤掉
        return false
      }
    })
  )
}

export function getSupportedEpVersions(nightly: MaybeRef<boolean>) {
  const pkg = '@opentiny/vue'
  const versions = getVersions(pkg)
  return computed(() => {
    if (unref(nightly)) return versions.value
    return versions.value.filter((version) => gte(version, '1.1.0-beta.18'))
  })
}
