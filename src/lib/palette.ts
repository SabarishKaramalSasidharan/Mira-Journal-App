/**
 * Accent palettes. Each defines the brand accent tokens for light and dark
 * themes. Mood colors stay constant (weather semantics) — only the accent
 * changes. `on` (text/icon color on the accent) is chosen for AA-large contrast.
 */
export interface AccentSet {
  accent: string
  strong: string // darker edge / hover
  soft: string // tinted background
  on: string // content on top of accent
  text: string // accent-colored TEXT on the app background (AA >= 4.5)
}

export interface Palette {
  id: string
  name: string
  swatch: string // representative color for the picker
  light: AccentSet
  dark: AccentSet
}

export const PALETTES: Palette[] = [
  {
    id: 'teal',
    name: 'Lagoon',
    swatch: '#0e9e8c',
    light: { accent: '#0e9e8c', strong: '#0b8072', soft: '#d7f3ee', on: '#ffffff', text: '#0a6d61' },
    dark: { accent: '#2dd4bf', strong: '#14b8a6', soft: '#0f302c', on: '#04241f', text: '#2dd4bf' },
  },
  {
    id: 'indigo',
    name: 'Twilight',
    swatch: '#6366f1',
    light: { accent: '#5b5bf0', strong: '#4747d6', soft: '#e5e6fe', on: '#ffffff', text: '#4a44d6' },
    dark: { accent: '#a5a6fb', strong: '#8688f6', soft: '#1e1f42', on: '#0f1030', text: '#b6b7fc' },
  },
  {
    id: 'rose',
    name: 'Blossom',
    swatch: '#e23a6d',
    light: { accent: '#e23a6d', strong: '#c22a58', soft: '#fde0e9', on: '#ffffff', text: '#b62350' },
    dark: { accent: '#fb7aa1', strong: '#f2588a', soft: '#3a1522', on: '#2a0c15', text: '#fb8fb0' },
  },
  {
    id: 'amber',
    name: 'Honey',
    swatch: '#e08a00',
    light: { accent: '#f59e0b', strong: '#d97f06', soft: '#fdefcf', on: '#3a2500', text: '#875600' },
    dark: { accent: '#fbbf24', strong: '#e5a413', soft: '#3a2a06', on: '#2a1c00', text: '#fcc63a' },
  },
  {
    id: 'grove',
    name: 'Grove',
    swatch: '#2f9e44',
    light: { accent: '#2f9e44', strong: '#268038', soft: '#dcf5e1', on: '#ffffff', text: '#217a32' },
    dark: { accent: '#69db7c', strong: '#40c057', soft: '#123320', on: '#062712', text: '#74e087' },
  },
  {
    id: 'plum',
    name: 'Orchid',
    swatch: '#9333ea',
    light: { accent: '#9333ea', strong: '#7c22ce', soft: '#f0defc', on: '#ffffff', text: '#8021d1' },
    dark: { accent: '#c88af9', strong: '#b062f2', soft: '#2c1140', on: '#1e0a30', text: '#cf97fa' },
  },
]

const KEY = 'mira.palette.v1'

export function loadPalette(): string {
  // Brand locked to teal for now. PALETTES/savePalette retained so the picker can be re-enabled later.
  return 'teal'
}

export function savePalette(id: string) {
  localStorage.setItem(KEY, id)
}

export function applyPalette(id: string, isDark: boolean) {
  const p = PALETTES.find((x) => x.id === id) ?? PALETTES[0]
  const set = isDark ? p.dark : p.light
  const root = document.documentElement.style
  root.setProperty('--accent', set.accent)
  root.setProperty('--accent-strong', set.strong)
  root.setProperty('--accent-soft', set.soft)
  root.setProperty('--on-accent', set.on)
  root.setProperty('--accent-text', set.text)
}
