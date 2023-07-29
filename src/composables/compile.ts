import type { BindingMetadata, CompilerOptions, SFCDescriptor } from 'vue/compiler-sfc'
import {
  compileScript,
  compileStyleAsync,
  parse,
  rewriteDefault,
  shouldTransformRef,
  transformRef
} from 'vue/compiler-sfc'

import hashId from 'hash-sum'
import less from 'less'

// import sass from 'sass'
// import { compile } from 'sass'
// import { getVs } from './utils'
import type { File, Store } from '@vue/repl'

// import { transform } from 'sucrase'
import { transform } from './babel'
import { extractVueImport } from './mergeVueImport'

type IStore = typeof Store
type IFile = typeof File

export const COMP_IDENTIFIER = '__sfc__'

function testTs(lang: string | null | undefined) {
  return ['ts', 'tsx', 'jsx'].includes(lang!)
}

export function getVs(version: string) {
  if (!version) return true
  return Number(version.split('.')[0]) === 3
}

async function transformTS(src: string) {
  return transform(src, {
    // transforms: ['typescript'],
    filename: 'code.tsx',
    presets: ['react', 'typescript'],
    plugins: ['@vue/babel-plugin-jsx']
  }).code
}

function mergeVueImports(imports1, imports2) {
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

export async function compileFile(store: IStore, { filename, code, compiled }: IFile): Promise<(string | Error)[]> {
  if (!code.trim()) return []

  if (filename.endsWith('.css')) {
    compiled.css = code
    return []
  }

  // 加入 less文件判断
  if (filename.endsWith('.less')) {
    const outStyle = await less.render(code) // 使用less.render将 less code 转换成css
    compiled.css = outStyle.css
    store.state.errors = []
    return []
  }

  if (filename.endsWith('.js') || filename.endsWith('.ts')) {
    if (shouldTransformRef(code)) code = transformRef(code, { filename }).code

    if (filename.endsWith('.ts')) code = await transformTS(code)

    compiled.js = compiled.ssr = code
    return []
  }

  if (filename.endsWith('.json')) {
    let parsed
    try {
      parsed = JSON.parse(code)
    } catch (err: any) {
      console.error(`Error parsing ${filename}`, err.message)
      return [err.message]
    }
    compiled.js = compiled.ssr = `export default ${JSON.stringify(parsed)}`
    return []
  }

  if (!filename.endsWith('.vue')) return []

  const id = hashId(filename)
  const { errors, descriptor } = getVs(store.vueVersion!)
    ? store.compiler.parse(code, {
        filename,
        sourceMap: true
      })
    : parse(code, { filename, sourceMap: true })
  if (errors.length) return errors

  if (
    // descriptor.styles.some((s) => s.lang) || // 主要移除这段代码
    descriptor.template &&
    descriptor.template.lang
  )
    return ['lang="x" pre-processors for <template> or <style> are currently not ' + 'supported.']

  const scriptLang =
    (descriptor.script && descriptor.script.lang) || (descriptor.scriptSetup && descriptor.scriptSetup.lang)
  // const isTS = scriptLang === 'ts'
  const isTS = testTs(scriptLang)
  if (scriptLang && !isTS) return ['Only lang="ts" is supported for <script> blocks.']

  console.log('isTs', scriptLang)

  const hasScoped = descriptor.styles.some((s) => s.scoped)
  let clientCode = ''
  let ssrCode = ''

  const appendSharedCode = (code: string) => {
    clientCode += code
    ssrCode += code
  }

  let clientScript: string
  let bindings: BindingMetadata | undefined
  try {
    ;[clientScript, bindings] = await doCompileScript(store, descriptor, id, false, isTS)
  } catch (e: any) {
    return [e.stack.split('\n').slice(0, 12).join('\n')]
  }

  let importsJSX
  if (scriptLang !== 'tsx') {
    clientCode += clientScript
  } else {
    const { cleanedCode: cleanedCodeJSX, imports } = extractVueImport(clientScript.trim()) // 将 jsx 语法生成的 import 导入去掉
    importsJSX = imports
    const init = 'import { openBlock as _openBlock, createBlock as _createBlock } from "vue"' // this code fix init bug(don't delete)
    if (importsJSX === '' || importsJSX === init) clientCode += clientScript
    else clientCode += cleanedCodeJSX
  }
  // clientCode += clientScript

  // script ssr needs to be performed if :
  // 1.using <script setup> where the render fn is inlined.
  // 2.using cssVars, as it do not need to be injected during SSR.
  if (descriptor.scriptSetup || descriptor.cssVars.length > 0) {
    try {
      const ssrScriptResult = await doCompileScript(store, descriptor, id, true, isTS)
      ssrCode += ssrScriptResult[0]
    } catch (e) {
      ssrCode = `/* SSR compile error: ${e} */`
    }
  } else {
    // the script result will be identical.
    ssrCode += clientScript
  }

  // template
  // only need dedicated compilation if not using <script setup>
  if (descriptor.template && (!descriptor.scriptSetup || store.options?.script?.inlineTemplate === false)) {
    const clientTemplateResult = await doCompileTemplate(store, descriptor, id, bindings, false, isTS, hasScoped)
    if (Array.isArray(clientTemplateResult)) return clientTemplateResult

    // clientCode += `;${clientTemplateResult}`
    if (scriptLang !== 'tsx') {
      clientCode += `;${clientTemplateResult}`
    } else {
      const { cleanedCode: cleanedCodeVUE, imports: importsVUE } = extractVueImport(clientTemplateResult.trim())
      if (importsJSX === '') {
        clientCode += `${clientTemplateResult}`
      } else {
        const mergedImport = mergeVueImports(importsJSX.trim(), importsVUE.trim())
        clientCode += `;${mergedImport}${cleanedCodeVUE}`
      }
    }

    const ssrTemplateResult = await doCompileTemplate(store, descriptor, id, bindings, true, isTS, hasScoped)
    if (typeof ssrTemplateResult === 'string') {
      // ssr compile failure is fine
      ssrCode += `;${ssrTemplateResult}`
    } else {
      ssrCode = `/* SSR compile error: ${ssrTemplateResult[0]} */`
    }
  }

  if (hasScoped) appendSharedCode(`\n${COMP_IDENTIFIER}.__scopeId = ${JSON.stringify(`data-v-${id}`)}`)

  if (clientCode || ssrCode) {
    appendSharedCode(
      `\n${COMP_IDENTIFIER}.__file = ${JSON.stringify(filename)}` + `\nexport default ${COMP_IDENTIFIER}`
    )
    compiled.js = clientCode.trimStart()
    compiled.ssr = ssrCode.trimStart()
  }

  // styles
  let css = ''
  for (const style of descriptor.styles) {
    if (style.module) return ['<style module> is not supported in the playground.']

    // 添加新代码
    let contentStyle = style.content
    if (style.lang === 'less') {
      const outStyle = await less.render(contentStyle)
      contentStyle = outStyle.css
    }

    // const styleResult = await store.compiler.compileStyleAsync({
    //* vue2 和 vue3 统一使用vue3的css编译器，得到的结果一致
    const styleResult = await compileStyleAsync({
      ...store.options?.style,
      source: contentStyle,
      filename,
      id,
      scoped: style.scoped,
      modules: !!style.module
    })
    if (styleResult.errors.length) {
      // postcss uses pathToFileURL which isn't polyfilled in the browser
      // ignore these errors for now
      if (!styleResult.errors[0].message.includes('pathToFileURL')) store.state.errors = styleResult.errors

      // proceed even if css compile errors
    } else {
      css += `${styleResult.code}\n`
    }
  }
  if (css) compiled.css = css.trim()
  else compiled.css = '/* No <style> tags present */'

  return []
}

async function doCompileScript(
  store: IStore,
  descriptor: SFCDescriptor,
  id: string,
  ssr: boolean,
  isTS: boolean
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
): Promise<[code: string, bindings: BindingMetadata | undefined]> {
  if (getVs(store.vueVersion!)) {
    if (descriptor.script || descriptor.scriptSetup) {
      // vue3
      const expressionPlugins: CompilerOptions['expressionPlugins'] = isTS ? ['typescript'] : undefined
      const compiledScript = store.compiler.compileScript(descriptor, {
        inlineTemplate: true,
        ...store.options?.script,
        id,
        templateOptions: {
          ...store.options?.template,
          ssr,
          ssrCssVars: descriptor.cssVars,
          compilerOptions: {
            ...store.options?.template?.compilerOptions,
            expressionPlugins
          }
        }
      })
      let code = ''
      if (compiledScript?.bindings)
        code += `\n/* Analyzed bindings: ${JSON.stringify(compiledScript.bindings, null, 2)} */`

      code += `\n${store.compiler?.rewriteDefault(compiledScript.content, COMP_IDENTIFIER, expressionPlugins)}`

      // if ((descriptor.script || descriptor.scriptSetup)!.lang === 'ts')
      //   code = await transformTS(code)

      if (testTs((descriptor.script || descriptor.scriptSetup)!.lang)) code = await transformTS(code)

      return [code, compiledScript.bindings]
    }
  } else if (getVs(store.vueVersion!) === false) {
    // vue2
    if (descriptor.script) {
      const compiledScript = compileScript(descriptor, {
        inlineTemplate: true,
        ...store.options?.script,
        id,
        templateOptions: {
          ...store.options?.template,
          ssrCssVars: descriptor.cssVars,
          compilerOptions: {
            ...store.options?.template?.compilerOptions,
            expressionPlugins: isTS ? ['typescript'] : undefined
          }
        }
      })

      let code = ''
      if (compiledScript.bindings)
        code += `\n/* Analyzed bindings: ${JSON.stringify(compiledScript.bindings, null, 2)} */`

      code += `\n${rewriteDefault(compiledScript.content, COMP_IDENTIFIER, isTS ? ['typescript'] : undefined)}`

      if (descriptor.script.lang === 'ts') code = await transformTS(code)

      return [code, compiledScript.bindings]
    } else if (descriptor.scriptSetup) {
      store.state.errors = ['<script setup> is not supported']
      return [`\nconst ${COMP_IDENTIFIER} = {}`, undefined]
    }
  } else {
    return [`\nconst ${COMP_IDENTIFIER} = {}`, undefined]
  }
}

async function doCompileTemplate(
  store: IStore,
  descriptor: SFCDescriptor,
  id: string,
  bindingMetadata: BindingMetadata | undefined,
  ssr: boolean,
  isTS: boolean,
  hasScoped: boolean
) {
  console.log('store', store)
  console.log('version是3', store.vueVersion, getVs(store.vueVersion!))
  if (getVs(store.vueVersion!)) {
    // vue3
    let { code, errors } = store.compiler.compileTemplate({
      isProd: false,
      ...store.options?.template,
      source: descriptor.template!.content,
      filename: descriptor.filename,
      id,
      scoped: descriptor.styles.some((s) => s.scoped),
      slotted: descriptor.slotted,
      ssr,
      ssrCssVars: descriptor.cssVars,
      compilerOptions: {
        ...store.options?.template?.compilerOptions,
        bindingMetadata,
        expressionPlugins: isTS ? ['typescript'] : undefined
      }
    })
    if (errors.length) return errors

    const fnName = ssr ? 'ssrRender' : 'render'

    code =
      `\n${code.replace(/\nexport (function|const) (render|ssrRender)/, `$1 ${fnName}`)}` +
      `\n${COMP_IDENTIFIER}.${fnName} = ${fnName}`

    // if ((descriptor.script || descriptor.scriptSetup)?.lang === 'ts')
    //   code = await transformTS(code)

    if (testTs((descriptor.script || descriptor.scriptSetup)!.lang)) code = await transformTS(code)

    return code
  } else {
    let code = descriptor.template?.content

    if (hasScoped) {
      const node = document.createElement('div')
      node.setAttribute('id', '#app')
      node.innerHTML = descriptor.template?.content || ''
      if (node.childElementCount !== 1) store.state.errors = ['only one element on template toot allowed']

      node.querySelectorAll('*').forEach((it) => it.setAttribute(`data-v-${id}`, ''))
      code = new XMLSerializer().serializeToString(node.firstElementChild!)
    }

    code = `\n${COMP_IDENTIFIER}.template = \`${code}\``

    if (isTS) code = await transformTS(code)

    return code
  }
}
