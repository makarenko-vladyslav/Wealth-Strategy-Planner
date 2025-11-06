import { create } from 'zustand'

type Theme = 'light' | 'dark'

type ThemeState = { theme: Theme; setTheme: (t: Theme) => void; toggle: () => void }

const getInitial = (): Theme => {
  if (typeof window === 'undefined') return 'light'
  const saved = window.localStorage.getItem('ws.theme') as Theme | null
  return saved ?? 'light'
}

const apply = (t: Theme): void => {
  if (typeof document === 'undefined') return
  document.documentElement.classList.toggle('dark', t === 'dark')
  window.localStorage.setItem('ws.theme', t)
}

export const useTheme = create<ThemeState>((set, get) => ({
  theme: getInitial(),
  setTheme: (t) => {
    apply(t)
    set({ theme: t })
  },
  toggle: () => {
    const next = get().theme === 'dark' ? 'light' : 'dark'
    apply(next)
    set({ theme: next })
  }
}))

