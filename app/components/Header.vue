<script setup lang="ts">
import { Code, Github } from 'lucide-vue-next'
import ThemeSwitcher from './ThemeSwitcher.vue'
import { SITE } from '~/constants/site'

const nav = [
  { label: 'Home', to: '/' },
  { label: 'Documentation', to: '/docs' },
  { label: 'Languages', to: '/languages' }
]
</script>

<template>
  <header class="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md transition-colors">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
      <NuxtLink to="/" class="flex items-center gap-3 group">
        <div class="p-2 bg-brand-primary/10 dark:bg-brand-primary/20 text-brand-primary rounded-xl flex items-center justify-center">
          <Code class="w-5 h-5" />
        </div>
        <div class="flex flex-col">
          <span class="text-sm font-bold text-slate-900 dark:text-white tracking-tight">{{ SITE.name }}</span>
          <span class="text-[10px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none">{{ SITE.tagline }}</span>
        </div>
      </NuxtLink>

      <nav class="hidden md:flex items-center gap-1" aria-label="Primary">
        <NuxtLink
          v-for="item in nav"
          :key="item.to"
          :to="item.to"
          class="px-3 py-1.5 text-sm font-medium text-slate-600 dark:text-slate-300 rounded-lg hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors"
          active-class="text-brand-primary bg-brand-primary/10"
        >
          {{ item.label }}
        </NuxtLink>
      </nav>

      <div class="flex items-center gap-2">
        <a
          :href="SITE.githubUrl"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="GitHub repository"
          class="p-2 text-slate-600 dark:text-slate-300 rounded-lg hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors"
        >
          <Github class="w-5 h-5" />
        </a>
        <ThemeSwitcher />
      </div>
    </div>
  </header>
</template>
