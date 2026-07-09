<script setup lang="ts">
import { SITE } from '~/constants/site'

useHead({
  title: `Documentation — ${SITE.name}`,
  meta: [{ name: 'description', content: `How to use ${SITE.name}: paste or upload JSON, pick a target language, and export strongly-typed models.` }]
})

const steps = [
  { title: 'Provide JSON', body: 'Paste JSON into the editor, upload a .json / .txt file, or drag & drop a file anywhere on the page.' },
  { title: 'Validate & format', body: 'The editor validates as you type and shows the failing line. Use Format to prettify or Minify to compact.' },
  { title: 'Choose a target', body: 'Pick a language and generation style (e.g. TypeScript Interface, Flutter Freezed, Laravel Resource) in the settings panel.' },
  { title: 'Export', body: 'Models regenerate instantly. Copy to clipboard or download the file. Everything runs in your browser — nothing is uploaded.' }
]

const shortcuts = [
  { keys: 'Ctrl / Cmd + Enter', action: 'Generate models' },
  { keys: 'Ctrl / Cmd + Shift + F', action: 'Format JSON' },
  { keys: 'Ctrl / Cmd + Shift + C', action: 'Copy generated code' }
]
</script>

<template>
  <div class="max-w-3xl space-y-10">
    <div>
      <h1 class="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">Documentation</h1>
      <p class="text-sm text-slate-500 dark:text-slate-400 mt-2">
        {{ SITE.name }} turns JSON into production-ready, strongly-typed models entirely in the browser.
      </p>
    </div>

    <section>
      <h2 class="text-lg font-bold text-slate-900 dark:text-white mb-4">Getting started</h2>
      <ol class="space-y-4">
        <li v-for="(step, i) in steps" :key="step.title" class="flex gap-4">
          <span class="flex-none w-7 h-7 rounded-full bg-brand-primary/10 text-brand-primary text-sm font-bold flex items-center justify-center">{{ i + 1 }}</span>
          <div>
            <h3 class="text-sm font-semibold text-slate-900 dark:text-white">{{ step.title }}</h3>
            <p class="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{{ step.body }}</p>
          </div>
        </li>
      </ol>
    </section>

    <section>
      <h2 class="text-lg font-bold text-slate-900 dark:text-white mb-4">Keyboard shortcuts</h2>
      <div class="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden divide-y divide-slate-200 dark:divide-slate-800">
        <div v-for="s in shortcuts" :key="s.keys" class="flex items-center justify-between px-4 py-3 bg-white dark:bg-slate-900/40">
          <span class="text-sm text-slate-600 dark:text-slate-300">{{ s.action }}</span>
          <kbd class="px-2 py-1 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200">{{ s.keys }}</kbd>
        </div>
      </div>
    </section>

    <section>
      <h2 class="text-lg font-bold text-slate-900 dark:text-white mb-2">Supported targets</h2>
      <p class="text-sm text-slate-500 dark:text-slate-400">
        See the full list on the <NuxtLink to="/languages" class="text-brand-primary font-medium hover:underline">Languages</NuxtLink> page.
      </p>
    </section>
  </div>
</template>
