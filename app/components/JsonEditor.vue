<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { useEditorStore } from '~/stores/editor.store'
import { useThemeStore } from '~/stores/theme.store'

const editorStore = useEditorStore()
const themeStore = useThemeStore()

const containerRef = ref<HTMLDivElement | null>(null)
let editor: any = null
const isLoading = ref(true)

// Watch for store changes to update editor (e.g. format, minify, clear)
watch(() => editorStore.rawJson, (newVal) => {
  if (editor && editor.getValue() !== newVal) {
    editor.setValue(newVal)
  }
})

// Watch for theme changes to update editor theme
watch(() => themeStore.isDark, (isDark) => {
  if (editor) {
    editor.updateOptions({
      theme: isDark ? 'vs-dark' : 'vs'
    })
  }
})

onMounted(async () => {
  if (typeof window !== 'undefined') {
    try {
      const monaco = await import('monaco-editor')
      isLoading.value = false
      
      // Short delay to ensure container is fully rendered and has correct dimensions
      setTimeout(() => {
        if (!containerRef.value) return
        
        editor = monaco.editor.create(containerRef.value, {
          value: editorStore.rawJson,
          language: 'json',
          theme: themeStore.isDark ? 'vs-dark' : 'vs',
          automaticLayout: true,
          minimap: { enabled: false },
          fontSize: 13,
          fontFamily: 'JetBrains Mono, Fira Code, Menlo, Monaco, Consolas, monospace',
          lineHeight: 20,
          lineNumbers: 'on',
          roundedSelection: true,
          scrollBeyondLastLine: false,
          readOnly: false,
          cursorBlinking: 'smooth',
          cursorSmoothCaretAnimation: 'on',
          wordWrap: 'on',
          padding: { top: 12, bottom: 12 },
          scrollbar: {
            verticalScrollbarSize: 8,
            horizontalScrollbarSize: 8
          }
        })

        // Listen for user typing
        editor.onDidChangeModelContent(() => {
          const content = editor.getValue()
          editorStore.rawJson = content
          editorStore.validateJson()
        })
      }, 50)
    } catch (e) {
      console.error('Failed to load Monaco Editor, falling back to textarea:', e)
      isLoading.value = false
    }
  }
})

onBeforeUnmount(() => {
  if (editor) {
    editor.dispose()
  }
})
</script>

<template>
  <div class="relative w-full h-full min-h-[560px] border border-t-0 border-slate-200 dark:border-slate-800 rounded-b-2xl overflow-hidden bg-white dark:bg-[#1e1e1e]">
    <!-- Loading state / Fallback -->
    <div v-if="isLoading" class="absolute inset-0 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900/40 text-slate-400 gap-2">
      <div class="w-6 h-6 border-2 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
      <span class="text-xs">Loading Editor...</span>
    </div>

    <!-- Monaco container -->
    <div ref="containerRef" class="w-full h-[calc(100vh-300px)] min-h-[560px]"></div>
  </div>
</template>
