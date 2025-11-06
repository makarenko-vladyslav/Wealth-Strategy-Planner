"use client"
import { useEffect } from 'react'

export const ThemeInit = () => {
  useEffect(() => {
    const t = (typeof window !== 'undefined' && (window.localStorage.getItem('ws.theme') as 'light' | 'dark' | null)) || 'light'
    document.documentElement.classList.toggle('dark', t === 'dark')
  }, [])
  return null
}

