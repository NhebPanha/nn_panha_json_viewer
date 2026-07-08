<script setup lang="ts">
import { Code } from 'lucide-vue-next'
import ThemeSwitcher from './ThemeSwitcher.vue'
</script>

<template>
  <header class="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md transition-colors">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div class="p-2 bg-brand-primary/10 dark:bg-brand-primary/20 text-brand-primary rounded-xl flex items-center justify-center">
          <Code class="w-5 h-5" />
        </div>
        <div class="flex flex-col">
          <span class="text-sm font-bold text-slate-900 dark:text-white tracking-tight">JSON Model Generator</span>
          <span class="text-[10px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none">Next-Gen QuickType Alternative</span>
        </div>
      </div>

      <div class="flex items-center gap-4">
        <ThemeSwitcher />
      </div>
    </div>
  </header>
</template>
