// 去除代码块顶层的import语句
export function extractVueImport(sourceCode) {
  // 正则表达式模式，用于匹配 import 语句
  const importPattern = /^import\s*{[^}]*}\s*from\s*["']vue["'];?/gm

  // 匹配结果数组
  const importMatches = sourceCode.match(importPattern)

  // 用于存储提取出的 import 语句
  const imports = importMatches ? importMatches.map((match) => match.trim())[0] : ''

  // 删除源代码中的 import 语句
  const cleanedCode = sourceCode.replace(importPattern, '')

  return {
    cleanedCode,
    imports
  }
}
// eg
// const sourceCode = `
// import { resolveComponent as _resolveComponent, createVNode as _createVNode, withCtx as _withCtx, openBlock as _openBlock, createBlock as _createBlock } from "vue";
// // 引入 @opentiny/vue 组件
// import { Button, Link } from '@opentiny/vue';
// function render(_ctx, _cache, \$props, \$setup, \$data, \$options) {
//   // ...
// }
// sfc.render = render;
// `

// const { cleanedCode, imports } = extractVueImport(sourceCode)

// console.log('Cleaned code:')
// console.log(cleanedCode)

// console.log('\nExtracted imports:')
// console.log(imports)

// 合并 vue 和 jsx 的 import语句
export function mergeVueImports(imports1, imports2) {
  // 通过正则表达式提取每个 import 语句中的花括号内的内容
  const importPattern = /{([\s\S]*?)}/

  // 提取 imports1 的花括号内的内容
  const matches1 = imports1.match(importPattern)
  const content1 = matches1 ? matches1[1].trim() : ''

  // 提取 imports2 的花括号内的内容
  const matches2 = imports2.match(importPattern)
  const content2 = matches2 ? matches2[1].trim() : ''
  console.log('code2-impoJSX', content1)
  console.log('code2-impoVUE', content2)
  // console.log('merge', new Set(content1.split(',').trim().concat(content2.split(',').trim())))
  // 合并花括号内的内容并去重
  // const mergedContent = Array.from(new Set(content1.split(',').concat(content2.split(','))))
  //   .map(item => item.trim()) // 去除每个项的多余空格
  //   .join(', ');
  const mergedContent = Array.from(
    new Set(
      content1
        .split(',')
        .map((item) => item.trim())
        .concat(content2.split(',').map((item) => item.trim()))
    )
  ).join(', ')

  // 创建新的 import 语句
  const mergedImport = `import { ${mergedContent} } from 'vue';`

  return mergedImport
}
// eg
// const imports1 = 'import { createVNode as _createVNode } from "vue";'
// const imports2 =
//   'import { resolveComponent as _resolveComponent, createVNode as _createVNode, withCtx as _withCtx, openBlock as _openBlock, createBlock as _createBlock } from "vue";'

// const mergedImport = mergeVueImports(imports1, imports2)

// console.log('Merged import:')
// console.log(mergedImport)
