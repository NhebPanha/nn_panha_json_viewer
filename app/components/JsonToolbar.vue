<script setup lang="ts">
import { useEditorStore } from '~/stores/editor.store'
import { useFileUpload } from '~/composables/useFileUpload'
import { Upload, AlignLeft, Shrink, Minimize2, Maximize2, Check, Trash2, FileJson, Clipboard } from 'lucide-vue-next'
import { ref } from 'vue'
import { useToast } from '~/composables/useToast'

const editorStore = useEditorStore()
const { handleFile } = useFileUpload()
const toast = useToast()
const fileInput = ref<HTMLInputElement | null>(null)

const triggerFileSelect = () => {
  fileInput.value?.click()
}

const onFileChange = (e: Event) => {
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
    toast.error('Clipboard access denied. Please use Ctrl+V to paste.')
  }
}
</script>

<template>
  <div class="flex items-center justify-between px-4 py-2 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 rounded-t-2xl transition-colors">
    <div class="flex items-center gap-2">
      <FileJson class="w-4 h-4 text-brand-primary" />
      <span class="text-xs font-bold text-slate-800 dark:text-slate-200">JSON Input</span>
    </div>

    <div class="flex items-center gap-1.5">
      <!-- Hidden file input -->
      <input
        type="file"
        ref="fileInput"
        @change="onFileChange"
        accept=".json,.txt"
        class="hidden"
      />
      <button
        @click="triggerFileSelect"
        title="Upload JSON/TXT"
        class="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-850 transition-all cursor-pointer"
      >
        <Upload class="w-4 h-4" />
      </button>

      <button
        @click="handlePaste"
        title="Paste JSON"
        class="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-850 transition-all cursor-pointer"
      >
        <Clipboard class="w-4 h-4" />
      </button>

      <div class="h-4 w-px bg-slate-200 dark:bg-slate-800 mx-1"></div>

      <button
        @click="editorStore.formatJson"
        title="Format JSON (Beautify)"
        class="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-850 transition-all cursor-pointer"
      >
        <AlignLeft class="w-4 h-4" />
      </button>

      <button
        @click="editorStore.minifyJson"
        title="Minify JSON (Compact)"
        class="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-850 transition-all cursor-pointer"
      >
        <Shrink class="w-4 h-4" />
      </button>

      <button
        @click="editorStore.validateJson"
        title="Validate JSON"
        class="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-850 transition-all cursor-pointer"
      >
        <Check class="w-4 h-4" />
      </button>

      <button
        @click="editorStore.isFullscreen = !editorStore.isFullscreen"
        title="Toggle Fullscreen"
        class="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-850 transition-all cursor-pointer"
      >
        <Minimize2 v-if="editorStore.isFullscreen" class="w-4 h-4" />
        <Maximize2 v-else class="w-4 h-4" />
      </button>

      <button
        @click="editorStore.clearJson"
        title="Clear Input"
        class="p-1.5 rounded-lg text-slate-500 hover:text-rose-500 hover:bg-rose-500/10 transition-all cursor-pointer"
      >
        <Trash2 class="w-4 h-4" />
      </button>
    </div>
  </div>
</template>
