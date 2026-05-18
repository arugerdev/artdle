// Theme system: light / dark / system.
//
// Stored under 'artdle.theme' as one of 'light' | 'dark' | 'system'.
// When 'system', we follow prefers-color-scheme and re-react to changes.
// In every case we toggle a `dark` class on <html> so Tailwind's
// dark: variant works everywhere.

import { useEffect, useState, useCallback } from 'react'

const STORAGE_KEY = 'artdle.theme'

function getStored () {
  if (typeof window === 'undefined') return 'system'
  try {
    const v = localStorage.getItem(STORAGE_KEY)
    if (v === 'light' || v === 'dark' || v === 'system') return v
  } catch { /* noop */ }
  return 'system'
}

function systemDark () {
  if (typeof window === 'undefined' || !window.matchMedia) return false
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

function applyTheme (preference) {
  if (typeof document === 'undefined') return
  const root = document.documentElement
  const wantDark = preference === 'dark' || (preference === 'system' && systemDark())
  root.classList.toggle('dark', wantDark)
  // Hint to UA-styled controls (scrollbars, form fields, etc.)
  root.style.colorScheme = wantDark ? 'dark' : 'light'
}

// Run synchronously at module load so first paint already has the
// correct class — avoids a light flash on dark-mode users.
if (typeof document !== 'undefined') applyTheme(getStored())

export function useTheme () {
  const [preference, setPreferenceState] = useState(() => getStored())
  const [resolved, setResolved] = useState(() =>
    getStored() === 'system' ? (systemDark() ? 'dark' : 'light') : getStored()
  )

  // Apply on every preference change.
  useEffect(() => {
    applyTheme(preference)
    setResolved(preference === 'system' ? (systemDark() ? 'dark' : 'light') : preference)
  }, [preference])

  // When in system mode, react to OS-level changes.
  useEffect(() => {
    if (preference !== 'system') return
    const mql = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = e => {
      applyTheme('system')
      setResolved(e.matches ? 'dark' : 'light')
    }
    mql.addEventListener?.('change', handler)
    return () => mql.removeEventListener?.('change', handler)
  }, [preference])

  const setPreference = useCallback(next => {
    try { localStorage.setItem(STORAGE_KEY, next) } catch { /* noop */ }
    setPreferenceState(next)
  }, [])

  return { preference, resolved, setPreference }
}
