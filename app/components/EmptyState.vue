<script setup lang="ts">
import { Code2, Sparkles, Upload, Clipboard } from 'lucide-vue-next'

const emit = defineEmits(['loadSample', 'triggerUpload', 'triggerPaste'])
</script>

<template>
  <div class="flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl h-full min-h-[300px] bg-slate-50/40 dark:bg-slate-900/10">
    <div class="p-3 bg-brand-primary/10 dark:bg-brand-primary/20 text-brand-primary rounded-2xl mb-4">
      <Code2 class="w-8 h-8" />
    </div>
    
    <h3 class="text-base font-bold text-slate-800 dark:text-slate-200">No JSON Loaded</h3>
    <p class="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
      Paste your JSON string directly into the editor, drag & drop a file, or choose an action below to start.
    </p>

    <div class="flex flex-wrap items-center justify-center gap-3 mt-6">
      <button
        @click="emit('loadSample')"
        class="flex items-center gap-1.5 bg-brand-primary hover:bg-brand-primary/90 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xs transition-all cursor-pointer"
      >
        <Sparkles class="w-3.5 h-3.5" />
        Load Sample JSON
      </button>
      <button
        @click="emit('triggerUpload')"
        class="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold px-4 py-2.5 rounded-xl transition-all cursor-pointer border border-slate-200 dark:border-slate-700"
      >
        <Upload class="w-3.5 h-3.5" />
        Upload File
      </button>
      <button
        @click="emit('triggerPaste')"
        class="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold px-4 py-2.5 rounded-xl transition-all cursor-pointer border border-slate-200 dark:border-slate-700"
      >
        <Clipboard class="w-3.5 h-3.5" />
        Paste from Clipboard
      </button>
    </div>
  </div>
</template>
