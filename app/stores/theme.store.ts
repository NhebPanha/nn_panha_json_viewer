import { defineStore } from 'pinia'
import { computed } from 'vue'

export const useThemeStore = defineStore('theme', () => {
  const colorMode = useColorMode()

  const currentTheme = computed({
    get: () => colorMode.preference,
    set: (val: string) => {
      colorMode.preference = val
    }
  })

  const isDark = computed(() => colorMode.value === 'dark')

  function toggleTheme() {
    if (colorMode.preference === 'light') {
      colorMode.preference = 'dark'
    } else if (colorMode.preference === 'dark') {
      colorMode.preference = 'system'
    } else {
      colorMode.preference = 'light'
    }
  }

  function setTheme(themeName: 'light' | 'dark' | 'system') {
    colorMode.preference = themeName
  }

  return {
    currentTheme,
    isDark,
    toggleTheme,
    setTheme
  }
})
