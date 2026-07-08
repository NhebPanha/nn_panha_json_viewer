<script setup lang="ts">
import { useThemeStore } from '~/stores/theme.store'
import { Sun, Moon, Monitor } from 'lucide-vue-next'

const themeStore = useThemeStore()
</script>

<template>
  <div class="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1 rounded-xl">
    <button
      @click="themeStore.setTheme('light')"
      title="Light Mode"
      class="p-2 rounded-lg transition-all"
      :class="themeStore.currentTheme === 'light' ? 'bg-white dark:bg-slate-800 text-brand-primary shadow-sm scale-100' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'"
    >
      <Sun class="w-4 h-4" />
    </button>
    <button
      @click="themeStore.setTheme('dark')"
      title="Dark Mode"
      class="p-2 rounded-lg transition-all"
      :class="themeStore.currentTheme === 'dark' ? 'bg-white dark:bg-slate-800 text-brand-primary shadow-sm scale-100' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'"
    >
      <Moon class="w-4 h-4" />
    </button>
    <button
      @click="themeStore.setTheme('system')"
      title="System Theme"
      class="p-2 rounded-lg transition-all"
      :class="themeStore.currentTheme === 'system' ? 'bg-white dark:bg-slate-800 text-brand-primary shadow-sm scale-100' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'"
    >
      <Monitor class="w-4 h-4" />
    </button>
  </div>
</template>
