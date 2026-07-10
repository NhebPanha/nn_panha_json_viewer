<script setup lang="ts">
import { useEditorStore } from '~/stores/editor.store'
import { useFileUpload } from '~/composables/useFileUpload'
import { Upload, AlignLeft, Shrink, Minimize2, Maximize2, Check, Trash2, FileJson, Clipboard, Link2, X } from 'lucide-vue-next'
import { ref } from 'vue'
import { useToast } from '~/composables/useToast'

const editorStore = useEditorStore()
const { handleFile } = useFileUpload()
const toast = useToast()
const fileInput = ref<HTMLInputElement | null>(null)

const showUrlInput = ref(false)
const urlValue = ref('')
const fetching = ref(false)

const fetchFromUrl = async () => {
  const url = urlValue.value.trim()
  if (!url) return
  fetching.value = true
  try {
    const res = await $fetch<{ data: string }>('/api/fetch-json', { query: { url } })
    editorStore.rawJson = res.data
    editorStore.validateJson()
    toast.success('Fetched JSON from URL')
    showUrlInput.value = false
    urlValue.value = ''
  } catch {
    toast.error('Failed to fetch JSON from that URL')
  } finally {
    fetching.value = false
  }
}

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
  <div>
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

      <button
        @click="showUrlInput = !showUrlInput"
        title="Load JSON from URL"
        class="p-1.5 rounded-lg transition-all cursor-pointer"
        :class="showUrlInput ? 'text-brand-primary bg-brand-primary/10' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-850'"
      >
        <Link2 class="w-4 h-4" />
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

  <!-- Load-from-URL input row -->
  <div
    v-if="showUrlInput"
    class="flex items-center gap-2 px-4 py-2 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/40"
  >
    <Link2 class="w-4 h-4 text-slate-400 shrink-0" />
    <input
      v-model="urlValue"
      @keyup.enter="fetchFromUrl"
      type="url"
      placeholder="https://api.example.com/data.json"
      class="flex-1 bg-transparent text-xs text-slate-700 dark:text-slate-200 placeholder-slate-400 focus:outline-hidden"
    />
    <button
      @click="fetchFromUrl"
      :disabled="fetching"
      class="px-3 py-1 rounded-lg text-xs font-semibold bg-brand-primary text-white hover:opacity-90 disabled:opacity-50 transition-all cursor-pointer"
    >
      {{ fetching ? 'Fetching…' : 'Fetch' }}
    </button>
    <button
      @click="showUrlInput = false"
      title="Close"
      class="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-all cursor-pointer"
    >
      <X class="w-4 h-4" />
    </button>
  </div>
  </div>
</template>
