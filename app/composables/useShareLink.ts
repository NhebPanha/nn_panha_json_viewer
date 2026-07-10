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

  function buildShareUrl(): string {
    const { origin, pathname } = window.location
    return `${origin}${pathname}?s=${encodeState()}`
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

  return { buildShareUrl, applyStateFromQuery }
}
