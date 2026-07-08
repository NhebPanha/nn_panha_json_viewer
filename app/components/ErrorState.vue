<script setup lang="ts">
import { AlertCircle } from 'lucide-vue-next'

defineProps<{
  message?: string | null
  line?: number | null
}>()
</script>

<template>
  <div class="flex items-start gap-3 p-4 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/60 rounded-xl text-rose-800 dark:text-rose-300">
    <AlertCircle class="w-5 h-5 shrink-0 mt-0.5" />
    <div class="flex-1">
      <h4 class="text-sm font-semibold">Invalid JSON Input</h4>
      <p class="text-xs mt-1 text-rose-700 dark:text-rose-400 font-mono leading-relaxed break-words">
        {{ message || 'JSON parsing failed. Please check for syntax errors, missing brackets, or quotes.' }}
      </p>
      <div v-if="line" class="mt-2 text-[10px] font-bold uppercase tracking-wider text-rose-500">
        Error detected near Line {{ line }}
      </div>
    </div>
  </div>
</template>
