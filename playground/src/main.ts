import 'uno.css'
import { createApp } from 'vue'
import 'opentiny-repl/style.css'
import 'element-plus/dist/index.css'
import 'element-plus/theme-chalk/dark/css-vars.css'
import ElementPlus from 'element-plus'

import App from './App.vue'

const app = createApp(App)
app.use(ElementPlus)
app.mount('#app')
