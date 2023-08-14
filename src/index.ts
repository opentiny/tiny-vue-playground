// 导出关键变量，用于构建和发包 @opentiny/tiny-repl ！
import { File, Repl, type SFCOptions } from '@vue/repl'
import { type UserOptions, useStore } from './composables/store'
import '@vue/repl/style.css'

export { Repl, type SFCOptions, File, useStore, type UserOptions }
