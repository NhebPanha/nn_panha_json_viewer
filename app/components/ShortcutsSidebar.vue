<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { X, Keyboard } from 'lucide-vue-next'

const isOpen = ref(false)
const isMac = ref(false)

onMounted(() => {
  if (typeof window !== 'undefined' && navigator) {
    isMac.value = /Mac|iPod|iPhone|iPad/.test(navigator.platform || '')
  }
  
  const handleKeyDown = (e: KeyboardEvent) => {
    // Avoid triggering when focused inside editable text areas
    if (e.key === '?' && !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || (e.target as HTMLElement).isContentEditable)) {
      isOpen.value = !isOpen.value
    }
  }
  window.addEventListener('keydown', handleKeyDown)
  onBeforeUnmount(() => {
    window.removeEventListener('keydown', handleKeyDown)
  })
})
</script>

<template>
  <div>
    <!-- Floating Trigger Button -->
    <button
      @click="isOpen = true"
      class="fixed bottom-6 right-6 z-40 flex items-center gap-2 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-slate-200 text-white dark:text-slate-900 px-4 py-2.5 rounded-full shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer font-medium text-xs border border-slate-800 dark:border-slate-200"
    >
      <Keyboard class="w-4 h-4" />
      <span>Shortcuts</span>
      <kbd class="ml-1 px-1 py-0.5 bg-slate-800 dark:bg-slate-200 border border-slate-700 dark:border-slate-300 rounded text-[9px] font-mono opacity-80">?</kbd>
    </button>

    <!-- Backdrop Overlay -->
    <div
      v-if="isOpen"
      @click="isOpen = false"
      class="fixed inset-0 z-50 bg-slate-950/20 dark:bg-slate-950/40 backdrop-blur-xs transition-opacity duration-300"
    ></div>

    <!-- Aside Sidebar Panel -->
    <aside
      class="fixed top-0 right-0 z-50 h-full w-80 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl transition-transform duration-350 ease-out transform"
      :class="isOpen ? 'translate-x-0' : 'translate-x-full'"
    >
      <!-- Header -->
      <div class="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800">
        <div class="flex items-center gap-2">
          <Keyboard class="w-5 h-5 text-brand-primary" />
          <h3 class="text-sm font-bold text-slate-800 dark:text-slate-200">Keyboard Shortcuts</h3>
        </div>
        <button
          @click="isOpen = false"
          class="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
        >
          <X class="w-4 h-4" />
        </button>
      </div>

      <!-- Content -->
      <div class="p-6 space-y-6 overflow-y-auto h-[calc(100%-70px)]">
        <!-- Editor Actions -->
        <div>
          <h4 class="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">JSON Editor</h4>
          <div class="space-y-3">
            <div class="flex items-center justify-between text-xs">
              <span class="text-slate-600 dark:text-slate-300">Format JSON</span>
              <kbd class="px-1.5 py-0.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-[10px] font-mono text-slate-500 dark:text-slate-400">
                {{ isMac ? '⌘+Shift+F' : 'Ctrl+Shift+F' }}
              </kbd>
            </div>
            <div class="flex items-center justify-between text-xs">
              <span class="text-slate-600 dark:text-slate-300">Validate JSON</span>
              <span class="text-[10px] text-slate-400 dark:text-slate-500 font-medium">Automatic</span>
            </div>
            <div class="flex items-center justify-between text-xs">
              <span class="text-slate-600 dark:text-slate-300">Paste Clipboard</span>
              <span class="text-[10px] text-slate-400 dark:text-slate-500 font-medium">Click icon / Ctrl+V</span>
            </div>
          </div>
        </div>

        <!-- Generator Actions -->
        <div>
          <h4 class="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">Model Generator</h4>
          <div class="space-y-3">
            <div class="flex items-center justify-between text-xs">
              <span class="text-slate-600 dark:text-slate-300">Generate Model</span>
              <kbd class="px-1.5 py-0.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-[10px] font-mono text-slate-500 dark:text-slate-400">
                {{ isMac ? '⌘+Enter' : 'Ctrl+Enter' }}
              </kbd>
            </div>
            <div class="flex items-center justify-between text-xs">
              <span class="text-slate-600 dark:text-slate-300">Copy Code</span>
              <kbd class="px-1.5 py-0.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-[10px] font-mono text-slate-500 dark:text-slate-400">
                {{ isMac ? '⌘+Shift+C' : 'Ctrl+Shift+C' }}
              </kbd>
            </div>
          </div>
        </div>

        <!-- Inputs & Gestures -->
        <div>
          <h4 class="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">Gestures</h4>
          <div class="space-y-3">
            <div class="flex items-center justify-between text-xs">
              <span class="text-slate-600 dark:text-slate-300">File Import</span>
              <span class="text-[10px] text-slate-500 dark:text-slate-400">Drag & Drop any file</span>
            </div>
            <div class="flex items-center justify-between text-xs">
              <span class="text-slate-600 dark:text-slate-300">Toggle Sidebar</span>
              <kbd class="px-1.5 py-0.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-[10px] font-mono text-slate-500 dark:text-slate-400">?</kbd>
            </div>
          </div>
        </div>
      </div>
    </aside>
  </div>
</template>
