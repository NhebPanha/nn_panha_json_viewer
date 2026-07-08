<script setup lang="ts">
import { Sparkles } from 'lucide-vue-next'
import LanguageSelector from './LanguageSelector.vue'
import FrameworkSelector from './FrameworkSelector.vue'

const emit = defineEmits(['generate'])
</script>

<template>
  <div class="bg-white dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800/80 p-5 rounded-2xl transition-all shadow-xs">
    <div class="flex flex-col lg:flex-row lg:items-end justify-between gap-5">
      <div class="flex flex-col md:flex-row gap-5 flex-1 items-start md:items-end">
        <LanguageSelector class="w-full md:w-64" />
        <FrameworkSelector class="w-full md:w-auto" />
      </div>
      
      <button
        type="button"
        @click="emit('generate')"
        class="bg-brand-primary hover:bg-brand-primary/90 text-white font-semibold text-sm px-6 py-2.5 rounded-xl shadow-md shadow-brand-primary/10 transition-all flex items-center justify-center gap-2 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer h-[42px] shrink-0 w-full lg:w-auto"
      >
        <Sparkles class="w-4 h-4" />
        Generate Model
      </button>
    </div>
  </div>
</template>
