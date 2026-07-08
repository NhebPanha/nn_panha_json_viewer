<script setup lang="ts">
import { Loader2 } from 'lucide-vue-next'
</script>

<template>
  <div class="flex flex-col items-center justify-center p-12 text-center h-full min-h-[300px]">
    <Loader2 class="w-8 h-8 text-brand-primary animate-spin mb-3" />
    <p class="text-sm font-medium text-slate-600 dark:text-slate-400">Generating models...</p>
    <p class="text-xs text-slate-400 dark:text-slate-500 mt-1">This will take just a fraction of a millisecond.</p>
  </div>
</template>
