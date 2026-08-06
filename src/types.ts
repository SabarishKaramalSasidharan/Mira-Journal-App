export type Mood = 'rough' | 'low' | 'okay' | 'good' | 'great'

export interface Turn {
  role: 'you' | 'mira'
  text: string
  kind?: 'text' | 'mood' | 'emotion'
  /**
   * For `kind: 'emotion'` turns — the emotion tag id (see `lib/emotions.ts`) so
   * the chat bubble can draw the matching droplet face. Transient/display-only:
   * the persisted `Entry.emotion` field is the source of truth, so these turns
   * are stripped before saving (see Capture `buildEntry`).
   */
  emotion?: string
}

export interface Entry {
  id: string
  createdAt: number
  mood: Mood | null
  turns: Turn[]
  // Derived by the reflection layer:
  themes: string[]
  summary: string
  /**
   * A warm, first-person "journal note" — a short narrative recap of the entry
   * written as if the user wrote it (not a transcript, not Mira's questions).
   * Generated lazily when an entry is opened and persisted with the entry.
   */
  note?: string
  /**
   * OPTIONAL categorical emotion tag id (see `lib/emotions.ts`), captured in the
   * Hybrid "Faces" selector as a layer ON TOP of the 1–5 valence `mood`. It is
   * independent of the mood score, so the trend chart is unaffected. Persists
   * automatically via whole-object IndexedDB storage. Undefined when untagged.
   */
  emotion?: string
}

export const MOODS: { key: Mood; emoji: string; label: string }[] = [
  { key: 'rough', emoji: '🌧️', label: 'Rough' },
  { key: 'low', emoji: '☁️', label: 'Low' },
  { key: 'okay', emoji: '⛅', label: 'Okay' },
  { key: 'good', emoji: '🌤️', label: 'Good' },
  { key: 'great', emoji: '☀️', label: 'Great' },
]
