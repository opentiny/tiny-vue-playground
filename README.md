# tinyvue-playground
基于自定义封装的`tinyvue-repl`实现, 支持 vue2、vue3

## 技术栈
- vue3.x
- vite
- typescript
- unocss
- pnpm

 

## TODO
- 改进对 vue2 的支持
- fix: vue2 对 less 的支持
- fix: vue3&vue2 对 sass/scss 的支持
- feat: 在 header 区域实现切换 CDN: `'unpkg' | 'jsdelivr' | 'jsdelivr-fastly'`
- fix: 调整 header 右侧 icon style


## 开发
repl 文件夹下存放自定义封装的`tinyvue-repl`, 在 playground 中引入`tinyvue-repl`打包后的 dist 文件夹

`@vue/repl`的使用参考: https://github.com/vuejs/repl

### 关于 repl
// todo
