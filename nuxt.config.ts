import tailwindcss from '@tailwindcss/vite'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2026-07-08',
  devtools: { enabled: false },

  // Enable Nuxt 4 directory structure and features
  future: {
    compatibilityVersion: 4
  },

  // Modules
  modules: [
    '@pinia/nuxt',
    '@vueuse/nuxt',
    '@nuxtjs/color-mode'
  ],

  // Color Mode config for Tailwind v4 (selector-based dark mode)
  colorMode: {
    classSuffix: '',
    preference: 'system',
    fallback: 'dark'
  },

  // Vite plugins for Tailwind v4
  vite: {
    plugins: [
      tailwindcss()
    ],
    optimizeDeps: {
      include: ['monaco-editor']
    }
  },

  // Global CSS registration
  css: [
    '~/assets/css/main.css'
  ],

  // App head settings
  app: {
    head: {
      title: 'JSON Model Generator — Next-Gen Alternative to QuickType',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Instantly generate strongly-typed models, DTOs, schemas, and entities from JSON in the browser. Supports Flutter, Laravel, TS, Swift, Go, Kotlin, and more.' }
      ]
    }
  }
})
