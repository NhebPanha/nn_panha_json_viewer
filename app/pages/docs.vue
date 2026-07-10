<script setup lang="ts">
import { SITE } from '~/constants/site'
import { LANGUAGES } from '~/constants/languages'

useHead({
  title: `Documentation — ${SITE.name}`,
  meta: [{ name: 'description', content: `How to use ${SITE.name}: paste or upload JSON, pick a target language, and export strongly-typed models.` }]
})

const steps = [
  { title: 'Provide JSON', body: 'Paste JSON into the editor, upload a .json / .txt file, drag & drop a file, or load it straight from a URL with the link button.' },
  { title: 'Validate & format', body: 'The editor validates as you type and shows the failing line. Use Format to prettify or Minify to compact.' },
  { title: 'Choose a target', body: 'Pick a language and generation style (e.g. TypeScript Interface, Flutter Freezed, Python Pydantic, Zod schema) in the settings panel.' },
  { title: 'Export or share', body: 'Models regenerate instantly. Copy, download the file, or copy a shareable link that reproduces the exact input and settings. Everything runs in your browser.' }
]

const shortcuts = [
  { keys: 'Ctrl / Cmd + Enter', action: 'Generate models' },
  { keys: 'Ctrl / Cmd + Shift + F', action: 'Format JSON' },
  { keys: 'Ctrl / Cmd + Shift + C', action: 'Copy generated code' }
]

// Features that are live in the app today.
const features = [
  { title: 'Smart type inference', body: 'QuickType-style engine: merges array-element shapes, deduplicates identical structures into one type, infers optional & nullable fields, and detects UUID, date, and color strings.' },
  { title: 'Union types', body: 'When a field has different types across samples (e.g. number vs string), a real union is emitted instead of falling back to “any”.' },
  { title: `${LANGUAGES.length} languages & frameworks`, body: 'From Flutter, Laravel, and Swift to TypeScript, Go, Kotlin, Python, Rust, Zod, Prisma, and JSON Schema — each with multiple generation styles.' },
  { title: 'Load JSON from a URL', body: 'Fetch a live API response directly into the editor via a built-in server proxy — no CORS headaches.' },
  { title: 'Shareable permalinks', body: 'Copy a link that encodes your JSON, language, style, and class name so a teammate opens the exact same result.' },
  { title: 'Instant, private, offline-friendly', body: 'Generation happens entirely client-side. Your JSON is never stored on a server. Format, minify, validate, copy, and download in one click.' }
]

// Recommended features on the roadmap (not yet shipped).
const roadmap = [
  { title: 'Multiple JSON samples', body: 'Add several example payloads and merge them into one schema to capture optional fields and unions a single sample would miss.' },
  { title: 'Enum detection', body: 'Recurring string values (e.g. role: ADMIN | USER | GUEST) become real enums / union literals.' },
  { title: 'Generation options', body: 'Toggle naming convention (camelCase ↔ snake_case), date-as-string vs Date, all-fields-optional, and immutability per target.' },
  { title: 'JSON tree view', body: 'A collapsible tree beside the editor with expand/collapse-all and copy-path on any node.' },
  { title: 'Multi-file / ZIP export', body: 'For languages that split one class per file (Java, C#, Freezed), download everything as a .zip.' },
  { title: 'Public generation API', body: 'A POST /api/generate endpoint so the tool is scriptable from CI and other apps.' },
  { title: 'Command palette (⌘K)', body: 'Jump to any language, action, or sample from the keyboard.' },
  { title: 'Offline PWA', body: 'Install the generator and use it fully offline.' },
  { title: 'Schema diff mode', body: 'Compare two payloads and see added, removed, and changed fields — great for API versioning.' }
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
      <h2 class="text-lg font-bold text-slate-900 dark:text-white mb-1">Features</h2>
      <p class="text-xs text-slate-400 dark:text-slate-500 mb-4">Available now</p>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div
          v-for="f in features"
          :key="f.title"
          class="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-2xl p-4"
        >
          <div class="flex items-center gap-2">
            <span class="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide bg-green-500/10 text-green-600 dark:text-green-400">Live</span>
            <h3 class="text-sm font-semibold text-slate-900 dark:text-white">{{ f.title }}</h3>
          </div>
          <p class="text-sm text-slate-500 dark:text-slate-400 mt-1.5">{{ f.body }}</p>
        </div>
      </div>
    </section>

    <section>
      <h2 class="text-lg font-bold text-slate-900 dark:text-white mb-1">Roadmap</h2>
      <p class="text-xs text-slate-400 dark:text-slate-500 mb-4">Recommended features we're planning next</p>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div
          v-for="r in roadmap"
          :key="r.title"
          class="bg-white dark:bg-slate-900/40 border border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-4"
        >
          <div class="flex items-center gap-2">
            <span class="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide bg-slate-400/10 text-slate-500 dark:text-slate-400">Planned</span>
            <h3 class="text-sm font-semibold text-slate-900 dark:text-white">{{ r.title }}</h3>
          </div>
          <p class="text-sm text-slate-500 dark:text-slate-400 mt-1.5">{{ r.body }}</p>
        </div>
      </div>
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
