import { defineStore } from 'pinia'
import { ref, watch, onMounted } from 'vue'
import { parseLoose } from '~/composables/useJsonParser'

const DEFAULT_JSON = `{
  "id": "f81d4fae-7dec-11d0-a765-00a0c91e6bf6",
  "name": "Acme SaaS Platform",
  "version": 1.2,
  "isActive": true,
  "createdAt": "2026-07-08T09:00:00Z",
  "owner": {
    "name": "Jane Doe",
    "email": "jane.doe@acme.com",
    "role": "ADMIN"
  },
  "tags": [
    "cloud",
    "developer-tools",
    "json"
  ],
  "recentEvents": [
    {
      "eventId": "evt_101",
      "timestamp": "2026-07-08T09:10:00Z",
      "payload": null
    }
  ]
}`

export const useEditorStore = defineStore('editor', () => {
  const rawJson = ref(DEFAULT_JSON)
  const isValid = ref(true)
  const errorMessage = ref<string | null>(null)
  const lineError = ref<number | null>(null)
  const autoSave = ref(true)
  const isFullscreen = ref(false)

  // Validate the JSON and locate line errors if any
  function validateJson(): boolean {
    const trimmed = rawJson.value.trim()
    if (!trimmed) {
      isValid.value = true
      errorMessage.value = null
      lineError.value = null
      return true
    }

    try {
      JSON.parse(trimmed)
      isValid.value = true
      errorMessage.value = null
      lineError.value = null
      return true
    } catch (e: any) {
      // Relaxed fallbacks: JSON embedded in log output, printed maps, or input
      // with repairable syntax mistakes still counts as usable.
      if (parseLoose(trimmed)) {
        isValid.value = true
        errorMessage.value = null
        lineError.value = null
        return true
      }

      isValid.value = false
      errorMessage.value = e.message

      // Parse the error message to find line number
      const lineMatch = e.message.match(/line\s+(\d+)/i)
      if (lineMatch && lineMatch[1]) {
        lineError.value = parseInt(lineMatch[1], 10)
      } else {
        const posMatch = e.message.match(/position\s+(\d+)/i)
        if (posMatch && posMatch[1]) {
          const pos = parseInt(posMatch[1], 10)
          const linesUpToPos = rawJson.value.slice(0, pos).split('\n')
          lineError.value = linesUpToPos.length
        } else {
          lineError.value = null
        }
      }

      console.error('[JSON Model Generator] Invalid JSON input', {
        message: e.message,
        line: lineError.value
      })
      return false
    }
  }

  function formatJson() {
    const trimmed = rawJson.value.trim()
    if (!trimmed) return
    try {
      const parsed = JSON.parse(trimmed)
      rawJson.value = JSON.stringify(parsed, null, 2)
      isValid.value = true
      errorMessage.value = null
      lineError.value = null
    } catch (e) {
      const loose = parseLoose(trimmed)
      if (loose) {
        rawJson.value = JSON.stringify(loose.data, null, 2)
        isValid.value = true
        errorMessage.value = null
        lineError.value = null
        return
      }
      validateJson()
    }
  }

  function minifyJson() {
    const trimmed = rawJson.value.trim()
    if (!trimmed) return
    try {
      const parsed = JSON.parse(trimmed)
      rawJson.value = JSON.stringify(parsed)
      isValid.value = true
      errorMessage.value = null
      lineError.value = null
    } catch (e) {
      const loose = parseLoose(trimmed)
      if (loose) {
        rawJson.value = JSON.stringify(loose.data)
        isValid.value = true
        errorMessage.value = null
        lineError.value = null
        return
      }
      validateJson()
    }
  }

  function clearJson() {
    rawJson.value = ''
    isValid.value = true
    errorMessage.value = null
    lineError.value = null
  }

  // Load from local storage on store mount
  onMounted(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('json_model_gen_input')
      if (saved !== null) {
        rawJson.value = saved
      }
      const savedAuto = localStorage.getItem('json_model_gen_autosave')
      if (savedAuto !== null) {
        autoSave.value = savedAuto === 'true'
      }
      validateJson()
    }
  })

  // Watch for changes and save to local storage
  watch([rawJson, autoSave], () => {
    if (typeof window !== 'undefined') {
      if (autoSave.value) {
        localStorage.setItem('json_model_gen_input', rawJson.value)
      } else {
        localStorage.removeItem('json_model_gen_input')
      }
      localStorage.setItem('json_model_gen_autosave', String(autoSave.value))
    }
  })

  return {
    rawJson,
    isValid,
    errorMessage,
    lineError,
    autoSave,
    isFullscreen,
    validateJson,
    formatJson,
    minifyJson,
    clearJson
  }
})
