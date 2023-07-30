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
