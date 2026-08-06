export type Mood = 'rough' | 'low' | 'okay' | 'good' | 'great'

export interface Turn {
  role: 'you' | 'mira'
  text: string
  kind?: 'text' | 'mood'
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
}

export const MOODS: { key: Mood; emoji: string; label: string }[] = [
  { key: 'rough', emoji: '🌧️', label: 'Rough' },
  { key: 'low', emoji: '☁️', label: 'Low' },
  { key: 'okay', emoji: '⛅', label: 'Okay' },
  { key: 'good', emoji: '🌤️', label: 'Good' },
  { key: 'great', emoji: '☀️', label: 'Great' },
]
