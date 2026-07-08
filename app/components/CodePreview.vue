<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch, computed } from 'vue'
import { useGeneratorStore } from '~/stores/generator.store'
import { useThemeStore } from '~/stores/theme.store'

const generatorStore = useGeneratorStore()
const themeStore = useThemeStore()

const containerRef = ref<HTMLDivElement | null>(null)
let editor: any = null
const isLoading = ref(true)

// Map app language to Monaco language identifiers
const monacoLanguage = computed(() => {
  const lang = generatorStore.selectedLanguage
  switch (lang) {
    case 'typescript':
    case 'nodejs':
    case 'nestjs':
    case 'typeorm':
      return 'typescript'
    case 'javascript':
    case 'mongoose':
    case 'sequelize':
      return 'javascript'
    case 'laravel':
    case 'php':
      return 'php'
    case 'java':
    case 'spring_boot':
      return 'java'
    case 'kotlin':
      return 'kotlin'
    case 'swift':
      return 'swift'
    case 'go':
      return 'go'
    case 'csharp':
    case 'asp_net':
      return 'csharp'
    case 'graphql':
      return 'graphql'
    case 'openapi':
    case 'prisma':
      return 'json' // Fallback for schema definitions
    default:
      return 'plaintext'
  }
})

// Watch for code changes
watch(() => generatorStore.generatedCode, (newCode) => {
  if (editor && editor.getValue() !== newCode) {
    editor.setValue(newCode)
  }
})

// Watch for wrap text changes
watch(() => generatorStore.wordWrap, (wrap) => {
  if (editor) {
    editor.updateOptions({
      wordWrap: wrap ? 'on' : 'off'
    })
  }
})

// Watch for language changes
watch(monacoLanguage, (newLang) => {
  if (editor) {
    const model = editor.getModel()
    if (model) {
      const monaco = (window as any).monaco
      if (monaco) {
        monaco.editor.setModelLanguage(model, newLang)
      }
    }
  }
})

// Watch for theme changes
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
      // Save monaco reference globally for setModelLanguage helper
      ;(window as any).monaco = monaco
      isLoading.value = false

      setTimeout(() => {
        if (!containerRef.value) return

        editor = monaco.editor.create(containerRef.value, {
          value: generatorStore.generatedCode,
          language: monacoLanguage.value,
          theme: themeStore.isDark ? 'vs-dark' : 'vs',
          automaticLayout: true,
          minimap: { enabled: true },
          fontSize: 13,
          fontFamily: 'JetBrains Mono, Fira Code, Menlo, Monaco, Consolas, monospace',
          lineHeight: 20,
          lineNumbers: 'on',
          roundedSelection: true,
          scrollBeyondLastLine: false,
          readOnly: true,
          wordWrap: generatorStore.wordWrap ? 'on' : 'off',
          padding: { top: 12, bottom: 12 },
          scrollbar: {
            verticalScrollbarSize: 8,
            horizontalScrollbarSize: 8
          }
        })
      }, 50)
    } catch (e) {
      console.error('Failed to load Monaco preview editor:', e)
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
  <div class="relative w-full h-full min-h-[400px] border border-t-0 border-slate-200 dark:border-slate-800 rounded-b-2xl overflow-hidden bg-white dark:bg-[#1e1e1e]">
    <!-- Loading state / Fallback -->
    <div v-if="isLoading" class="absolute inset-0 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900/40 text-slate-400 gap-2">
      <div class="w-6 h-6 border-2 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
      <span class="text-xs">Loading Preview...</span>
    </div>

    <!-- Monaco container -->
    <div ref="containerRef" class="w-full h-[500px]"></div>
  </div>
</template>
