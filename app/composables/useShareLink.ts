import { useEditorStore } from '~/stores/editor.store'
import { useGeneratorStore } from '~/stores/generator.store'

/**
 * Encodes the current JSON + language/style/root selection into a shareable URL
 * (base64 in the `?s=` query param) and restores it on load. Client-only.
 */
export function useShareLink() {
  const editorStore = useEditorStore()
  const generatorStore = useGeneratorStore()

  function encodeState(): string {
    const payload = {
      j: editorStore.rawJson,
      l: generatorStore.selectedLanguage,
      s: generatorStore.selectedFramework,
      r: generatorStore.rootClassName
    }
    // encodeURIComponent + escape keeps unicode safe through btoa.
    return btoa(unescape(encodeURIComponent(JSON.stringify(payload))))
  }

  /** Self-contained fallback link — long, but needs no server storage. */
  function buildShareUrl(): string {
    const { origin, pathname } = window.location
    return `${origin}${pathname}?s=${encodeState()}`
  }

  /**
   * Preferred link: stores the payload server-side and returns a short
   * `/s/<id>` URL (~43 chars). Falls back to the long self-contained URL when
   * the share store isn't configured or is unreachable.
   */
  async function createShareUrl(): Promise<{ url: string; short: boolean }> {
    try {
      const { id } = await $fetch<{ id: string }>('/api/share', {
        method: 'POST',
        body: { payload: encodeState() }
      })
      return { url: `${window.location.origin}/s/${id}`, short: true }
    } catch (err) {
      console.warn('[JSON Model Generator] Short link unavailable, using long URL.', err)
      return { url: buildShareUrl(), short: false }
    }
  }

  /** Resolves a `?id=` short link back into editor state. */
  async function applyStateFromId(id: string): Promise<boolean> {
    try {
      const { payload } = await $fetch<{ payload: string }>(`/api/share/${id}`)
      return applyStateFromQuery(payload)
    } catch (err) {
      console.error('[JSON Model Generator] Could not load share link:', err)
      return false
    }
  }

  function applyStateFromQuery(encoded: string): boolean {
    try {
      const payload = JSON.parse(decodeURIComponent(escape(atob(encoded))))
      if (typeof payload.j === 'string') editorStore.rawJson = payload.j
      if (payload.l) generatorStore.selectedLanguage = payload.l
      if (payload.s) generatorStore.selectedFramework = payload.s
      if (payload.r) generatorStore.rootClassName = payload.r
      editorStore.validateJson()
      return true
    } catch {
      return false
    }
  }

  return { buildShareUrl, createShareUrl, applyStateFromQuery, applyStateFromId }
}
