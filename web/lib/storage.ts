export const safeLocalStorage = {
  get: <T>(key: string, fallback: T): T => {
    try {
      const v = typeof window === 'undefined' ? null : window.localStorage.getItem(key)
      return v ? (JSON.parse(v) as T) : fallback
    } catch {
      return fallback
    }
  },
  set: (key: string, value: unknown): void => {
    try {
      if (typeof window === 'undefined') return
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch {}
  }
}

