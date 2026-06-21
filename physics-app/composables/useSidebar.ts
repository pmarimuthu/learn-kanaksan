const STORAGE_KEY = 'pc-sidebar'

export function useSidebar() {
  const open = useState<boolean>('sidebar', () => true)

  function toggle() {
    open.value = !open.value
    if (import.meta.client) {
      localStorage.setItem(STORAGE_KEY, open.value ? 'open' : 'closed')
    }
  }

  function init() {
    if (import.meta.client) {
      const saved = localStorage.getItem(STORAGE_KEY)
      // On mobile: default closed
      const isMobile = window.innerWidth < 960
      open.value = isMobile ? false : (saved !== 'closed')
    }
  }

  return { open, toggle, init }
}
