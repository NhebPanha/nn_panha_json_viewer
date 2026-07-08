<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { useEditorStore } from '~/stores/editor.store'
import { useGeneratorStore } from '~/stores/generator.store'
import { useCodeGenerator } from '~/composables/useCodeGenerator'
import { useClipboard } from '~/composables/useClipboard'
import { useFileUpload } from '~/composables/useFileUpload'
import { useToast } from '~/composables/useToast'
import JsonToolbar from '../components/JsonToolbar.vue'
import JsonEditor from '../components/JsonEditor.vue'
import CodeToolbar from '../components/CodeToolbar.vue'
import CodePreview from '../components/CodePreview.vue'
import GenerationSettings from '../components/GenerationSettings.vue'
import ErrorState from '../components/ErrorState.vue'
import EmptyState from '../components/EmptyState.vue'
import { Sparkles, FileJson, AlertCircle } from 'lucide-vue-next'

const editorStore = useEditorStore()
const generatorStore = useGeneratorStore()
const codeGen = useCodeGenerator()
const { handleFile } = useFileUpload()
const { copy } = useClipboard()
const toast = useToast()

const isDragging = ref(false)

// Main generate wrapper
const triggerGenerate = () => {
  if (!editorStore.rawJson.trim()) {
    generatorStore.generatedCode = ''
    return
  }
  
  if (!editorStore.isValid) {
    toast.error('JSON has errors. Please format or fix them before generating.')
    return
  }

  try {
    const output = codeGen.generate(
      editorStore.rawJson,
      generatorStore.selectedLanguage,
      generatorStore.selectedFramework,
      generatorStore.rootClassName
    )
    generatorStore.generatedCode = output
  } catch (error: any) {
    toast.error(`Generation failed: ${error.message}`)
  }
}

// Watchers for instant feedback
watch([
  () => editorStore.rawJson,
  () => generatorStore.selectedLanguage,
  () => generatorStore.selectedFramework,
  () => generatorStore.rootClassName
], () => {
  if (editorStore.isValid) {
    triggerGenerate()
  }
}, { immediate: true })

// Drag & Drop handlers
const handleDragOver = (e: DragEvent) => {
  e.preventDefault()
  isDragging.value = true
}

const handleDragLeave = () => {
  isDragging.value = false
}

const handleDrop = (e: DragEvent) => {
  e.preventDefault()
  isDragging.value = false
  
  const file = e.dataTransfer?.files?.[0]
  if (file) {
    handleFile(file)
  }
}

// Load sample JSON
const loadSampleJson = () => {
  editorStore.rawJson = `{
  "id": "f81d4fae-7dec-11d0-a765-00a0c91e6bf6",
  "name": "Acme SaaS Platform",
  "version": 1.2,
  "isActive": true,
  "createdAt": "2026-07-08T09:00:00Z",
  "owner": {
    "name": "Jane Doe",
    "email": "jane.doe@acme.com",
    "role": "ADMIN"
  },
  "tags": [
    "cloud",
    "developer-tools",
    "json"
  ]
}`
  editorStore.validateJson()
  toast.success('Sample JSON loaded')
}

// Hidden file input hook for EmptyState trigger
const fileInput = ref<HTMLInputElement | null>(null)
const triggerUploadSelect = () => {
  fileInput.value?.click()
}
const onFileSelectChange = (e: Event) => {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    handleFile(file)
  }
}

const handlePaste = async () => {
  try {
    const text = await navigator.clipboard.readText()
    if (text.trim()) {
      editorStore.rawJson = text
      editorStore.validateJson()
      toast.success('Successfully pasted from clipboard')
    } else {
      toast.error('Clipboard is empty')
    }
  } catch (err) {
    toast.error('Clipboard access denied. Please use Ctrl+V (or Cmd+V on Mac) to paste.')
  }
}

// Global Keyboard Shortcuts
const handleGlobalKeydown = (e: KeyboardEvent) => {
  const isModifier = e.ctrlKey || e.metaKey

  // Ctrl+Enter / Cmd+Enter -> Generate
  if (isModifier && e.key === 'Enter') {
    e.preventDefault()
    triggerGenerate()
  }
  // Ctrl+Shift+F / Cmd+Shift+F -> Format JSON
  if (isModifier && e.shiftKey && e.key.toLowerCase() === 'f') {
    e.preventDefault()
    editorStore.formatJson()
    toast.success('JSON Formatted')
  }
  // Ctrl+Shift+C / Cmd+Shift+C -> Copy Code
  if (isModifier && e.shiftKey && e.key.toLowerCase() === 'c') {
    e.preventDefault()
    if (generatorStore.generatedCode) {
      copy(generatorStore.generatedCode)
    }
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleGlobalKeydown)
  triggerGenerate()
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleGlobalKeydown)
})
</script>

<template>
  <div
    @dragover="handleDragOver"
    @dragleave="handleDragLeave"
    @drop="handleDrop"
    class="relative space-y-6"
  >
    <!-- Drag & Drop overlay -->
    <div
      v-if="isDragging"
      class="fixed inset-0 z-50 bg-brand-primary/10 dark:bg-brand-primary/20 backdrop-blur-sm border-4 border-dashed border-brand-primary flex items-center justify-center pointer-events-none"
    >
      <div class="bg-white dark:bg-slate-900 px-8 py-6 rounded-2xl shadow-xl flex flex-col items-center gap-3">
        <FileJson class="w-10 h-10 text-brand-primary animate-bounce" />
        <span class="text-sm font-bold text-slate-800 dark:text-slate-100">Drop your JSON or TXT file here</span>
      </div>
    </div>

    <!-- Hidden input for empty state selection -->
    <input
      type="file"
      ref="fileInput"
      @change="onFileSelectChange"
      accept=".json,.txt"
      class="hidden"
    />

    <!-- Header Description -->
    <div class="flex flex-col md:flex-row justify-between md:items-center gap-4">
      <div>
        <h1 class="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          Model Studio
          <Sparkles class="w-5 h-5 text-brand-primary" />
        </h1>
        <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Paste JSON, validate formatting, and export production-ready strongly-typed models instantly.
        </p>
      </div>
    </div>

    <!-- Panels: Editor & Preview -->
    <div 
      class="grid grid-cols-1 lg:gap-6" 
      :class="(generatorStore.isFullscreen || editorStore.isFullscreen) ? 'lg:grid-cols-1' : 'lg:grid-cols-2'"
    >
      <!-- Left Panel: JSON Input -->
      <div v-if="!generatorStore.isFullscreen" class="flex flex-col h-full bg-white dark:bg-slate-950/20 border border-slate-200 dark:border-slate-800/80 rounded-2xl shadow-xs overflow-hidden">
        <JsonToolbar />
        <div class="relative flex-1">
          <JsonEditor />
        </div>
        <!-- Error Alerts Overlay -->
        <div v-if="!editorStore.isValid" class="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/10">
          <ErrorState :message="editorStore.errorMessage" :line="editorStore.lineError" />
        </div>
      </div>

      <!-- Right Panel: Generated Code -->
      <div v-if="!editorStore.isFullscreen" class="flex flex-col h-full bg-white dark:bg-slate-950/20 border border-slate-200 dark:border-slate-800/80 rounded-2xl shadow-xs overflow-hidden">
        <CodeToolbar />
        <div class="relative flex-1">
          <EmptyState
            v-if="!editorStore.rawJson.trim()"
            @loadSample="loadSampleJson"
            @triggerUpload="triggerUploadSelect"
            @triggerPaste="handlePaste"
          />
          <CodePreview v-else />
        </div>
      </div>
    </div>

    <!-- Settings Controls Panel -->
    <div id="settings">
      <GenerationSettings @generate="triggerGenerate" />
    </div>

    <!-- Help & Shortcuts Slide-over Drawer -->
    <ShortcutsSidebar />
  </div>
</template>
