import { useThemeStore } from '~/stores/theme.store'

/**
 * Thin composable wrapper around the theme store, matching the composable API
 * surface listed in the project spec. Prefer this in components that only need
 * theme read/toggle without pulling in the full store.
 */
export function useTheme() {
  const store = useThemeStore()
  return {
    theme: computed(() => store.currentTheme),
    isDark: computed(() => store.isDark),
    toggleTheme: store.toggleTheme,
    setTheme: store.setTheme
  }
}
