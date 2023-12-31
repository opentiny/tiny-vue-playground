import { getCurrentInstance } from 'vue'

import TinyVue from '@opentiny/vue'

let installed = false
await loadStyle()

export function setupOpenTiny() {
  if (installed) return
  const instance = getCurrentInstance()
  instance.appContext.app.use(TinyVue)
  installed = true
}

export function loadStyle() {
  return new Promise((resolve, reject) => {
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = '#STYLE#'
    link.addEventListener('load', resolve)
    link.addEventListener('error', reject)
    document.body.append(link)
  })
}
