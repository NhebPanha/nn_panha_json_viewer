import tailwindcss from '@tailwindcss/vite'
import { SITE } from './app/constants/site'
import { buildStructuredData } from './app/utils/seo'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2026-07-08',
  devtools: { enabled: false },

  // Public runtime config — analytics is env-driven and provider-agnostic.
  runtimeConfig: {
    public: {
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || SITE.url,
      analyticsProvider: process.env.NUXT_PUBLIC_ANALYTICS_PROVIDER || '',
      analyticsId: process.env.NUXT_PUBLIC_ANALYTICS_ID || '',
      analyticsDomain: process.env.NUXT_PUBLIC_ANALYTICS_DOMAIN || '',
      analyticsHost: process.env.NUXT_PUBLIC_ANALYTICS_HOST || ''
    }
  },

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

  // App head settings — meta, Open Graph, Twitter cards, canonical, structured data
  app: {
    head: {
      title: `${SITE.name} — ${SITE.tagline}`,
      htmlAttrs: { lang: 'en' },
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: SITE.description },
        // Open Graph
        { property: 'og:type', content: 'website' },
        { property: 'og:site_name', content: SITE.name },
        { property: 'og:title', content: `${SITE.name} — ${SITE.tagline}` },
        { property: 'og:description', content: SITE.description },
        { property: 'og:url', content: SITE.url },
        { property: 'og:image', content: SITE.url + SITE.ogImage },
        // Twitter cards
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:site', content: SITE.twitterHandle },
        { name: 'twitter:title', content: `${SITE.name} — ${SITE.tagline}` },
        { name: 'twitter:description', content: SITE.description },
        { name: 'twitter:image', content: SITE.url + SITE.ogImage }
      ],
      link: [
        { rel: 'canonical', href: SITE.url },
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }
      ],
      script: [
        { type: 'application/ld+json', innerHTML: buildStructuredData() }
      ]
    }
  }
})
