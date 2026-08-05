import { applyPalette, loadPalette } from './palette'

export type ThemeMode = 'light' | 'dark' | 'system'

const KEY = 'mira.theme.v1'

export function loadTheme(): ThemeMode {
  const v = localStorage.getItem(KEY)
  return v === 'light' || v === 'dark' || v === 'system' ? v : 'system'
}

function systemPrefersDark(): boolean {
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false
}

export function resolveIsDark(mode: ThemeMode): boolean {
  return mode === 'dark' || (mode === 'system' && systemPrefersDark())
}

export function applyTheme(mode: ThemeMode) {
  const isDark = resolveIsDark(mode)
  document.documentElement.classList.toggle('dark', isDark)
  applyPalette(loadPalette(), isDark)
}

export function setTheme(mode: ThemeMode) {
  localStorage.setItem(KEY, mode)
  applyTheme(mode)
}

/** Keep 'system' mode in sync with OS changes. Returns an unsubscribe fn. */
export function watchSystem(getMode: () => ThemeMode): () => void {
  const mq = window.matchMedia('(prefers-color-scheme: dark)')
  const handler = () => {
    if (getMode() === 'system') applyTheme('system')
  }
  mq.addEventListener('change', handler)
  return () => mq.removeEventListener('change', handler)
}
