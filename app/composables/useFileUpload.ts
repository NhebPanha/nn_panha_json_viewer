import { useEditorStore } from '~/stores/editor.store'
import { useToast } from './useToast'

export function useFileUpload() {
  const editorStore = useEditorStore()
  const toast = useToast()

  function handleFile(file: File): boolean {
    const name = file.name.toLowerCase()
    if (!name.endsWith('.json') && !name.endsWith('.txt')) {
      toast.error('Only .json and .txt files are supported')
      return false
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result
      if (typeof text === 'string') {
        editorStore.rawJson = text
        editorStore.validateJson()
        toast.success(`Successfully uploaded ${file.name}`)
      }
    }
    reader.onerror = () => {
      toast.error('Failed to read file contents')
    }
    reader.readAsText(file)
    return true
  }

  return {
    handleFile
  }
}
