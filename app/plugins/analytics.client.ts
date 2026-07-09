/**
 * Injects the configured analytics provider's script tag on the client.
 *
 * Controlled entirely by public runtime config (env), so a new provider can be
 * enabled without touching application code:
 *   NUXT_PUBLIC_ANALYTICS_PROVIDER = plausible | google | umami | (empty = off)
 *   NUXT_PUBLIC_ANALYTICS_ID       = GA measurement id | Umami website id
 *   NUXT_PUBLIC_ANALYTICS_DOMAIN   = Plausible domain
 *   NUXT_PUBLIC_ANALYTICS_HOST     = self-hosted script origin (Plausible/Umami)
 */
export default defineNuxtPlugin(() => {
  const { public: cfg } = useRuntimeConfig()
  const provider = cfg.analyticsProvider
  if (!provider) return

  const scripts: { src: string; attrs?: Record<string, string>; inline?: string }[] = []

  if (provider === 'plausible' && cfg.analyticsDomain) {
    const host = cfg.analyticsHost || 'https://plausible.io'
    scripts.push({
      src: `${host}/js/script.js`,
      attrs: { 'data-domain': cfg.analyticsDomain, defer: '' }
    })
  } else if (provider === 'umami' && cfg.analyticsId) {
    const host = cfg.analyticsHost || 'https://cloud.umami.is'
    scripts.push({
      src: `${host}/script.js`,
      attrs: { 'data-website-id': cfg.analyticsId, defer: '' }
    })
  } else if (provider === 'google' && cfg.analyticsId) {
    scripts.push({ src: `https://www.googletagmanager.com/gtag/js?id=${cfg.analyticsId}`, attrs: { async: '' } })
    scripts.push({
      src: '',
      inline: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${cfg.analyticsId}');`
    })
  }

  for (const s of scripts) {
    const el = document.createElement('script')
    if (s.inline) el.textContent = s.inline
    if (s.src) el.src = s.src
    for (const [k, v] of Object.entries(s.attrs || {})) el.setAttribute(k, v)
    document.head.appendChild(el)
  }
})
