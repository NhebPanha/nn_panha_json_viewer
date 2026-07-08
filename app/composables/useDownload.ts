import { useToast } from './useToast'

export function useDownload() {
  const toast = useToast()

  function download(content: string, filename: string) {
    if (!content.trim()) {
      toast.error('No content to download')
      return false
    }
    try {
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      a.click()
      
      // Clean up URL object
      setTimeout(() => {
        URL.revokeObjectURL(url)
      }, 100)
      
      toast.success(`Downloaded ${filename}`)
      return true
    } catch (e) {
      toast.error('Failed to trigger download')
      return false
    }
  }

  return {
    download
  }
}
