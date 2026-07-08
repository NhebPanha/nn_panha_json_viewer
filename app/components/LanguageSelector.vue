<script setup lang="ts">
import { useGeneratorStore, LANGUAGES } from '~/stores/generator.store'
import { ChevronsUpDown } from 'lucide-vue-next'

const generatorStore = useGeneratorStore()
</script>

<template>
  <div class="flex flex-col">
    <label class="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5">Language</label>
    <div class="relative">
      <select
        v-model="generatorStore.selectedLanguage"
        class="w-full bg-slate-50 dark:bg-slate-900/55 border border-slate-200 dark:border-slate-800/80 text-slate-800 dark:text-slate-100 rounded-xl pl-3.5 pr-10 py-2.5 text-sm font-medium focus:outline-none focus:border-brand-primary/50 appearance-none cursor-pointer transition-all"
      >
        <option v-for="lang in LANGUAGES" :key="lang.id" :value="lang.id" class="dark:bg-slate-950">
          {{ lang.name }}
        </option>
      </select>
      <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 dark:text-slate-500">
        <ChevronsUpDown class="w-4 h-4" />
      </div>
    </div>
  </div>
</template>
