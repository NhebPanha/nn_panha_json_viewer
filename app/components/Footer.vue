<script setup lang="ts">
import { Cpu } from 'lucide-vue-next'
</script>

<template>
  <footer class="border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 py-6 transition-colors">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
      <div class="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500">
        <Cpu class="w-4 h-4" />
        <span>100% Client-Side Generation • Your JSON stays in your browser unless you create a share link</span>
      </div>

      <div class="text-xs text-slate-400 dark:text-slate-500">
        © 2026 JSON Model Generator. Built with Nuxt 4.
      </div>
    </div>
  </footer>
</template>
