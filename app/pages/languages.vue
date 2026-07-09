<script setup lang="ts">
import { LANGUAGES } from '~/constants/languages'
import { SITE } from '~/constants/site'

useHead({
  title: `Supported Languages — ${SITE.name}`,
  meta: [
    { name: 'description', content: `Browse all ${LANGUAGES.length} languages and frameworks supported by ${SITE.name}, from Flutter and Laravel to TypeScript, Go, and Prisma.` }
  ]
})

const totalStyles = LANGUAGES.reduce((sum, l) => sum + l.options.length, 0)
</script>

<template>
  <div class="space-y-8">
    <div>
      <h1 class="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
        Supported Languages
      </h1>
      <p class="text-sm text-slate-500 dark:text-slate-400 mt-2">
        {{ LANGUAGES.length }} languages &amp; frameworks · {{ totalStyles }} generation styles. Pick one on the
        <NuxtLink to="/" class="text-brand-primary font-medium hover:underline">home page</NuxtLink> to generate models instantly.
      </p>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <div
        v-for="lang in LANGUAGES"
        :key="lang.id"
        class="flex flex-col bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs"
      >
        <h2 class="text-sm font-bold text-slate-900 dark:text-white">{{ lang.name }}</h2>
        <div class="mt-3 flex flex-wrap gap-2">
          <span
            v-for="opt in lang.options"
            :key="opt.id"
            class="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
          >
            {{ opt.name }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
