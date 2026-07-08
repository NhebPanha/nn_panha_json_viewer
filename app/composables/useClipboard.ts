import { useClipboard as vueuseUseClipboard } from '@vueuse/core'
import { useToast } from './useToast'

export function useClipboard() {
  const toast = useToast()
  const { copy: vueuseCopy, copied, isSupported } = vueuseUseClipboard()

  async function copy(text: string, successMsg = 'Copied to clipboard!') {
    if (!text) return false
    try {
      await vueuseCopy(text)
      toast.success(successMsg)
      return true
    } catch (err) {
      toast.error('Failed to copy content')
      return false
    }
  }

  return {
    copy,
    copied,
    isSupported
  }
}
