/**
 * Mood-selector style preference.
 *
 * "faces" (default) = the new Hybrid mascot-droplet selector (1–5 ladder + an
 * optional emotion tag). "weather" = the classic weather-glyph scale, kept
 * fully functional for A/B. Persisted in localStorage exactly like the theme /
 * palette preferences.
 */
export type SelectorStyle = 'faces' | 'weather'

const KEY = 'mira.selectorStyle.v1'

export const DEFAULT_SELECTOR_STYLE: SelectorStyle = 'faces'

export function loadSelectorStyle(): SelectorStyle {
  try {
    const v = localStorage.getItem(KEY)
    if (v === 'faces' || v === 'weather') return v
  } catch {
    /* ignore — fall back to default */
  }
  return DEFAULT_SELECTOR_STYLE
}

export function saveSelectorStyle(style: SelectorStyle) {
  try {
    localStorage.setItem(KEY, style)
  } catch {
    /* best-effort persistence */
  }
}
