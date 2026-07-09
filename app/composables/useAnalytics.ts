/**
 * Provider-agnostic analytics facade.
 *
 * The active provider is chosen at runtime from `NUXT_PUBLIC_ANALYTICS_PROVIDER`
 * ('plausible' | 'google' | 'umami' | '' to disable). Call sites never reference
 * a specific vendor, so switching providers requires zero code changes — only env.
 */
export interface AnalyticsProvider {
  /** Track a custom event with optional key/value properties. */
  track(event: string, props?: Record<string, unknown>): void
  /** Track a page view (SPA navigation). */
  pageview(path: string): void
}

export function useAnalytics(): AnalyticsProvider {
  const track = (event: string, props?: Record<string, unknown>) => {
    if (!import.meta.client) return
    const w = window as any
    // Plausible
    if (typeof w.plausible === 'function') w.plausible(event, { props })
    // Umami
    if (w.umami && typeof w.umami.track === 'function') w.umami.track(event, props)
    // Google Analytics (gtag)
    if (typeof w.gtag === 'function') w.gtag('event', event, props)
  }

  const pageview = (path: string) => {
    if (!import.meta.client) return
    const w = window as any
    if (typeof w.gtag === 'function') {
      const config = useRuntimeConfig()
      w.gtag('config', config.public.analyticsId, { page_path: path })
    }
    // Plausible & Umami track pageviews automatically via their scripts.
  }

  return { track, pageview }
}
