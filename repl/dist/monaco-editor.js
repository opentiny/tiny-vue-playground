import { defineComponent, ref, shallowRef, inject, computed, onMounted, nextTick, watch, onBeforeUnmount, openBlock, createElementBlock, createBlock } from 'vue';
import { C as CancellationTokenSource, E as Emitter, K as KeyCode, a as KeyMod, M as MarkerSeverity, b as MarkerTag, P as Position, R as Range, S as Selection, c as SelectionDirection, T as Token, U as Uri, e as editor, l as languages, i as initMonaco, g as getOrCreateModel } from './chunks/env-dbc8554e.js';
import './chunks/_commonjsHelpers-24198af3.js';

/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

const monaco = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  CancellationTokenSource,
  Emitter,
  KeyCode,
  KeyMod,
  MarkerSeverity,
  MarkerTag,
  Position,
  Range,
  Selection,
  SelectionDirection,
  Token,
  Uri,
  editor,
  languages
}, Symbol.toStringTag, { value: 'Module' }));

const loadTheme = async (editor) => {
  const themes = await import('./chunks/index2-e2619112.js');
  return themes.loadTheme(editor);
};
const loadGrammars = async (monaco, editor) => {
  const grammars = await import('./chunks/index3-cb096805.js');
  return grammars.loadGrammars(monaco, editor);
};

const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "Monaco",
  props: {
    filename: {},
    value: {},
    readonly: { type: Boolean, default: false },
    mode: {}
  },
  emits: ["change"],
  setup(__props, { emit }) {
    const props = __props;
    const containerRef = ref();
    const ready = ref(false);
    const editor$1 = shallowRef();
    const store = inject("store");
    initMonaco(store);
    const lang = computed(() => props.mode === "css" ? "css" : "javascript");
    const replTheme = inject("theme");
    onMounted(async () => {
      const theme = await loadTheme(editor);
      ready.value = true;
      await nextTick();
      if (!containerRef.value) {
        throw new Error("Cannot find containerRef");
      }
      const editorInstance = editor.create(containerRef.value, {
        ...props.readonly ? { value: props.value, language: lang.value } : { model: null },
        fontSize: 13,
        theme: replTheme.value === "light" ? theme.light : theme.dark,
        readOnly: props.readonly,
        automaticLayout: true,
        scrollBeyondLastLine: false,
        minimap: {
          enabled: false
        },
        inlineSuggest: {
          enabled: false
        },
        "semanticHighlighting.enabled": true,
        fixedOverflowWidgets: true
      });
      editor$1.value = editorInstance;
      const t = editorInstance._themeService._theme;
      t.getTokenStyleMetadata = (type, modifiers, _language) => {
        const _readonly = modifiers.includes("readonly");
        switch (type) {
          case "function":
          case "method":
            return { foreground: 12 };
          case "class":
            return { foreground: 11 };
          case "variable":
          case "property":
            return { foreground: _readonly ? 21 : 9 };
          default:
            return { foreground: 0 };
        }
      };
      if (props.readonly) {
        watch(
          () => props.value,
          (value) => {
            editorInstance.setValue(value || "");
            editor.setModelLanguage(editorInstance.getModel(), lang.value);
          }
        );
      } else {
        watch(
          () => props.filename,
          () => {
            if (!editorInstance)
              return;
            const file = store.state.files[props.filename];
            if (!file)
              return null;
            const model = getOrCreateModel(
              Uri.parse(`file:///${props.filename}`),
              file.language,
              file.code
            );
            editorInstance.setModel(model);
            if (file.selection) {
              editorInstance.setSelection(file.selection);
              editorInstance.focus();
            }
          },
          { immediate: true }
        );
      }
      await loadGrammars(monaco, editorInstance);
      editorInstance.addCommand(KeyMod.CtrlCmd | KeyCode.KeyS, () => {
      });
      editorInstance.onDidChangeModelContent(() => {
        emit("change", editorInstance.getValue());
      });
      editorInstance.onDidChangeCursorSelection((e) => {
        const selection = e.selection;
        const file = store.state.files[props.filename];
        if (file) {
          file.selection = selection;
        }
      });
      watch(replTheme, (n) => {
        editorInstance.updateOptions({
          theme: n === "light" ? theme.light : theme.dark
        });
      });
    });
    onBeforeUnmount(() => {
      editor$1.value?.dispose();
    });
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", {
        class: "editor",
        ref_key: "containerRef",
        ref: containerRef
      }, null, 512);
    };
  }
});

const Monaco_vue_vue_type_style_index_0_lang = '';

const __default__ = defineComponent({
  editorType: "monaco"
});
const _sfc_main = /* @__PURE__ */ defineComponent({
  ...__default__,
  __name: "MonacoEditor",
  props: {
    value: {},
    filename: {},
    readonly: { type: Boolean },
    mode: {}
  },
  emits: ["change"],
  setup(__props, { emit }) {
    const onChange = (code) => {
      emit("change", code);
    };
    return (_ctx, _cache) => {
      return openBlock(), createBlock(_sfc_main$1, {
        onChange,
        filename: _ctx.filename,
        value: _ctx.value,
        readonly: _ctx.readonly,
        mode: _ctx.mode
      }, null, 8, ["filename", "value", "readonly", "mode"]);
    };
  }
});

export { _sfc_main as default };
