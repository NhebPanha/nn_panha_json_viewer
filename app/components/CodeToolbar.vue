<script setup lang="ts">
import { useGeneratorStore } from '~/stores/generator.store'
import { useClipboard } from '~/composables/useClipboard'
import { useDownload } from '~/composables/useDownload'
import { useShareLink } from '~/composables/useShareLink'
import { useToast } from '~/composables/useToast'
import { Copy, Download, Maximize2, Minimize2, WrapText, Check, FileCode, Share2 } from 'lucide-vue-next'
import { computed, ref } from 'vue'

const generatorStore = useGeneratorStore()
const { copy, copied } = useClipboard()
const { download } = useDownload()
const { createShareUrl } = useShareLink()
const toast = useToast()
const sharing = ref(false)

const handleCopy = () => {
  copy(generatorStore.generatedCode)
}

const handleShare = async () => {
  if (sharing.value) return
  sharing.value = true
  try {
    const { url, short } = await createShareUrl()
    await navigator.clipboard.writeText(url)
    toast.success(
      short
        ? 'Short share link copied to clipboard'
        : 'Share link copied (short links unavailable — using full link)'
    )
  } catch {
    toast.error('Could not copy the share link')
  } finally {
    sharing.value = false
  }
}

const fileExtension = computed(() => {
  const lang = generatorStore.selectedLanguage
  switch (lang) {
    case 'typescript':
    case 'nodejs':
    case 'nestjs':
    case 'typeorm':
      return 'ts'
    case 'flutter':
      return 'dart'
    case 'laravel':
    case 'php':
      return 'php'
    case 'java':
    case 'spring_boot':
      return 'java'
    case 'kotlin':
      return 'kt'
    case 'swift':
      return 'swift'
    case 'go':
      return 'go'
    case 'csharp':
    case 'asp_net':
      return 'cs'
    case 'javascript':
    case 'mongoose':
    case 'sequelize':
      return 'js'
    case 'prisma':
      return 'prisma'
    case 'graphql':
      return 'graphql'
    case 'python':
      return 'py'
    case 'rust':
      return 'rs'
    case 'zod':
      return 'ts'
    case 'openapi':
    case 'json_schema':
      return 'json'
    default:
      return 'txt'
  }
})

const handleDownload = () => {
  const name = `models.${fileExtension.value}`
  download(generatorStore.generatedCode, name)
}
</script>

<template>
  <div class="flex items-center justify-between px-4 py-2 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 rounded-t-2xl transition-colors">
    <div class="flex items-center gap-3">
      <div class="flex items-center gap-2 shrink-0">
        <FileCode class="w-4 h-4 text-brand-primary" />
        <span class="text-xs font-bold text-slate-800 dark:text-slate-200 hidden sm:inline">Generated Code</span>
      </div>
      <div class="flex items-center gap-1.5">
        <span class="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider">Model:</span>
        <input
          v-model="generatorStore.rootClassName"
          type="text"
          placeholder="Rename class..."
          class="bg-white dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/80 px-2 py-0.5 rounded-md text-xs font-semibold text-slate-700 dark:text-slate-200 placeholder-slate-400/80 focus:outline-hidden focus:border-brand-primary focus:ring-1 focus:ring-brand-primary w-28 sm:w-36 transition-all"
        />
      </div>
    </div>

    <div class="flex items-center gap-1.5">
      <button
        @click="generatorStore.wordWrap = !generatorStore.wordWrap"
        title="Toggle Word Wrap"
        class="p-1.5 rounded-lg transition-all cursor-pointer"
        :class="generatorStore.wordWrap ? 'text-brand-primary bg-brand-primary/10' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-850'"
      >
        <WrapText class="w-4 h-4" />
      </button>

      <button
        @click="generatorStore.isFullscreen = !generatorStore.isFullscreen"
        title="Toggle Fullscreen"
        class="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-850 transition-all cursor-pointer"
      >
        <Minimize2 v-if="generatorStore.isFullscreen" class="w-4 h-4" />
        <Maximize2 v-else class="w-4 h-4" />
      </button>

      <div class="h-4 w-px bg-slate-200 dark:bg-slate-800 mx-1"></div>

      <button
        @click="handleShare"
        title="Copy shareable link"
        class="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-850 transition-all cursor-pointer"
      >
        <Share2 class="w-4 h-4" />
      </button>

      <button
        @click="handleDownload"
        title="Download Code File"
        class="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-850 transition-all cursor-pointer"
      >
        <Download class="w-4 h-4" />
      </button>

      <button
        @click="handleCopy"
        title="Copy Code"
        class="p-1.5 rounded-lg transition-all flex items-center gap-1 cursor-pointer"
        :class="copied ? 'text-green-600 bg-green-500/10' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-850'"
      >
        <Check v-if="copied" class="w-4 h-4" />
        <Copy v-else class="w-4 h-4" />
      </button>
    </div>
  </div>
</template>
