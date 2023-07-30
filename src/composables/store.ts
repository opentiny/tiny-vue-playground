import { File, type Store, type StoreState } from '@vue/repl'
import { computed, reactive, ref, shallowRef, watch, watchEffect } from 'vue'
import { useToggle } from '@vueuse/core'
import { Modal, Notify } from '@opentiny/vue'
import mainCode from '../template/main.vue?raw'
import welcomeCode from '../template/welcome.vue?raw'
import openTinyCode from '../template/opentiny.js?raw'
import tsconfigCode from '../template/tsconfig.json?raw'
import { compileFile, getVs } from './compile'
import { atou, utoa } from '@/utils/encode'
import { genImportMap, genVueLink } from '@/utils/dependency'
import { type ImportMap, mergeImportMap } from '@/utils/import-map'
import LocalStorageService from '@/utils/localStorage'

type StoreInstance = typeof Store
type StoreStateInstance = typeof StoreState
export interface Initial {
  serializedState?: string
  versions?: Versions
  userOptions?: UserOptions
}
export type VersionKey = 'vue' | 'openTiny'
export type Versions = Record<VersionKey, string>
export interface UserOptions {
  styleSource?: string
  showHidden?: boolean
}
export type SerializeState = Record<string, string> & {
  _o?: UserOptions
}

const MAIN_FILE = 'src/PlaygroundMain.vue'
const APP_FILE = 'src/App.vue'
const OpenTiny_FILE = 'src/opentiny.js'
const LEGACY_IMPORT_MAP = 'src/import_map.json'
export const IMPORT_MAP = 'import-map.json'
export const TSCONFIG = 'tsconfig.json'

const refresh = ref(false)

export function useStore(initial: Initial) {
  const vs = LocalStorageService.getItem('versions')
  const versions = reactive(vs || initial.versions)

  const compiler = shallowRef<typeof import('vue/compiler-sfc')>()
  const [nightly, toggleNightly] = useToggle(false)
  const userOptions = ref<UserOptions>(initial.userOptions || {})
  const hideFile = ref(true)

  const _files = initFiles(initial.serializedState || '')

  let activeFile = _files[APP_FILE]
  if (!activeFile) activeFile = Object.values(_files)[0]

  const state = reactive<StoreStateInstance>({
    mainFile: MAIN_FILE,
    files: _files,
    activeFile,
    errors: [],
    vueRuntimeURL: '',
    vueServerRendererURL: '',
    resetFlip: false
  })

  const bultinImportMap = computed<ImportMap>(() => genImportMap(versions))
  const userImportMap = computed<ImportMap>(() => {
    const code = state.files[IMPORT_MAP]?.code.trim()
    if (!code) return {}
    let map: ImportMap = {}
    try {
      map = JSON.parse(code)
    } catch (err) {
      console.error(err)
    }
    return map
  })
  const importMap = computed<ImportMap>(() => mergeImportMap(bultinImportMap.value, userImportMap.value))
  const vueVersion = computed<string>(() => versions.vue)

  const store: StoreInstance = reactive({
    init,
    state,
    compiler: compiler as any,
    setActive,
    addFile,
    deleteFile,
    getImportMap,
    initialShowOutput: false,
    initialOutputMode: 'preview',
    renameFile,
    getTsConfig,
    vueVersion
  })

  watch(
    () => versions.openTiny,
    () => {
      const file = new File(OpenTiny_FILE, generateOpenTinyCode().trim(), hideFile.value)
      state.files[OpenTiny_FILE] = file

      compileFile(store, file).then((errs) => (state.errors = errs))
    },
    { immediate: true }
  )

  function generateOpenTinyCode() {
    return openTinyCode.replace('#STYLE#', 'https://unpkg.com/@opentiny/vue-theme/index.css')
  }

  async function setVueVersion(version: string) {
    const { compilerSfc, runtimeDom } = genVueLink(version)

    compiler.value = await import(/* @vite-ignore */ compilerSfc)
    if (getVs(versions.vue) && !getVs(version)) refresh.value = true
    state.vueRuntimeURL = runtimeDom
    versions.vue = version
    LocalStorageService.setItem('versions', {
      openTiny: versions.openTiny,
      vue: version
    })

    console.info(`[opentiny-playground] Now using Vue version: ${version}`)
    if (refresh.value) location.reload()
  }

  async function init() {
    await setVueVersion(versions.vue)

    state.errors = []
    for (const file of Object.values(state.files)) compileFile(store, file).then((errs) => state.errors.push(...errs))

    watchEffect(() => compileFile(store, state.activeFile).then((errs) => (state.errors = errs)))
  }

  function getFiles() {
    const exported: Record<string, string> = {}
    for (const file of Object.values(state.files as { [key: string]: any })) {
      if (file.hidden) continue
      exported[file.filename] = file.code
    }
    return exported
  }

  function serialize() {
    const state: SerializeState = { ...getFiles() }
    state._o = userOptions.value
    return utoa(JSON.stringify(state))
  }
  function deserialize(text: string): SerializeState {
    const state = JSON.parse(atou(text))
    return state
  }

  function initFiles(serializedState: string) {
    const files: StoreStateInstance['files'] = {}
    if (serializedState) {
      const saved = deserialize(serializedState)
      for (let [filename, file] of Object.entries(saved)) {
        if (filename === '_o') continue
        if (![IMPORT_MAP, TSCONFIG].includes(filename) && !filename.startsWith('src/')) filename = `src/${filename}`

        if (filename === LEGACY_IMPORT_MAP) filename = IMPORT_MAP

        files[filename] = new File(filename, file as string)
      }
      userOptions.value = saved._o || {}
    } else {
      files[APP_FILE] = new File(APP_FILE, welcomeCode)
    }
    files[MAIN_FILE] = new File(MAIN_FILE, mainCode, hideFile.value)

    if (!files[IMPORT_MAP]) files[IMPORT_MAP] = new File(IMPORT_MAP, JSON.stringify({ imports: {} }, undefined, 2))

    if (!files[TSCONFIG]) files[TSCONFIG] = new File(TSCONFIG, tsconfigCode)

    return files
  }

  function setActive(filename: string) {
    const file = state.files[filename]
    if (file.hidden) return
    state.activeFile = state.files[filename]
  }

  function addFile(fileOrFilename: string | File) {
    const file = typeof fileOrFilename === 'string' ? new File(fileOrFilename) : fileOrFilename
    state.files[file.filename] = file
    setActive(file.filename)
  }

  function renameFile(oldFilename: string, newFilename: string) {
    const file = state.files[oldFilename]

    if (!file) {
      state.errors = [`Could not rename "${oldFilename}", file not found`]
      return
    }

    if (!newFilename || oldFilename === newFilename) {
      state.errors = [`Cannot rename "${oldFilename}" to "${newFilename}"`]
      return
    }

    if (file.hidden || [APP_FILE, MAIN_FILE, OpenTiny_FILE, IMPORT_MAP].includes(oldFilename)) {
      state.errors = [`Cannot rename ${oldFilename}`]
      return
    }

    file.filename = newFilename

    const newFiles: Record<string, File> = {}

    // Preserve iteration order for files
    for (const name of Object.keys(_files)) {
      if (name === oldFilename) newFiles[newFilename] = file
      else newFiles[name] = _files[name]
    }

    state.files = newFiles
    compileFile(store, file)
  }

  async function deleteFile(filename: string) {
    if ([OpenTiny_FILE, MAIN_FILE, APP_FILE, OpenTiny_FILE, IMPORT_MAP].includes(filename)) {
      Notify({
        type: 'warning',
        title: 'Cannot remove',
        message: 'You cannot remove it, because OpenTiny requires it.',
        duration: 2000
      })
      return
    }

    await Modal.confirm(`您确定要删除 ${filename.replace(/^src\//, '')}?`).then((res) => {
      if (res === 'confirm') {
        Notify({
          type: 'success',
          title: `删除 ${filename.replace(/^src\//, '')}`,
          message: '删除成功',
          duration: 2000
        })
        if (state.activeFile.filename === filename) setActive(APP_FILE)

        delete state.files[filename]
      }
    })
  }

  function getImportMap() {
    return importMap.value
  }

  function getTsConfig() {
    try {
      return JSON.parse(state.files[TSCONFIG].code)
    } catch {
      return {}
    }
  }

  async function setVersion(key: VersionKey, version: string) {
    switch (key) {
      case 'openTiny':
        setOpenTinyVersion(version)
        break
      case 'vue':
        await setVueVersion(version)
        break
    }
  }

  function setOpenTinyVersion(version: string) {
    versions.openTiny = version
    LocalStorageService.setItem('versions', {
      openTiny: version,
      vue: versions.vue
    })
  }

  return {
    ...store,
    versions,
    nightly,
    userOptions,
    init,
    serialize,
    setVersion,
    toggleNightly
  }
}

export type ReplStore = ReturnType<typeof useStore>
