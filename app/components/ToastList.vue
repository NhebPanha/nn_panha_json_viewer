<script setup lang="ts">
import { useToast } from '../composables/useToast'
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-vue-next'

const { toasts, removeToast } = useToast()
</script>

<template>
  <div class="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
    <TransitionGroup
      name="toast"
      enter-active-class="transition duration-300 ease-out transform"
      enter-from-class="translate-y-2 opacity-0 scale-95"
      enter-to-class="translate-y-0 opacity-100 scale-100"
      leave-active-class="transition duration-200 ease-in transform"
      leave-from-class="translate-y-0 opacity-100 scale-100"
      leave-to-class="translate-y-2 opacity-0 scale-95"
    >
      <div
        v-for="toast in toasts"
        :key="toast.id"
        class="pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-lg backdrop-blur-md"
        :class="{
          'bg-white/95 dark:bg-slate-900/95 border-emerald-200 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400': toast.type === 'success',
          'bg-white/95 dark:bg-slate-900/95 border-rose-200 dark:border-rose-500/20 text-rose-600 dark:text-rose-400': toast.type === 'error',
          'bg-white/95 dark:bg-slate-900/95 border-amber-200 dark:border-amber-500/20 text-amber-600 dark:text-amber-400': toast.type === 'warning',
          'bg-white/95 dark:bg-slate-900/95 border-blue-200 dark:border-blue-500/20 text-blue-600 dark:text-blue-400': toast.type === 'info'
        }"
      >
        <div class="flex-shrink-0 mt-0.5">
          <CheckCircle2 v-if="toast.type === 'success'" class="w-5 h-5" />
          <XCircle v-else-if="toast.type === 'error'" class="w-5 h-5" />
          <AlertTriangle v-else-if="toast.type === 'warning'" class="w-5 h-5" />
          <Info v-else class="w-5 h-5" />
        </div>

        <div class="flex-1 text-sm font-semibold text-slate-800 dark:text-slate-200">
          {{ toast.message }}
        </div>

        <button
          @click="removeToast(toast.id)"
          class="flex-shrink-0 text-slate-455 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-0.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5"
        >
          <X class="w-4 h-4" />
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.toast-move {
  transition: transform 0.3s ease;
}
</style>
