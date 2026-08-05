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
}

export const MOODS: { key: Mood; emoji: string; label: string }[] = [
  { key: 'rough', emoji: '🌧️', label: 'Rough' },
  { key: 'low', emoji: '☁️', label: 'Low' },
  { key: 'okay', emoji: '⛅', label: 'Okay' },
  { key: 'good', emoji: '🌤️', label: 'Good' },
  { key: 'great', emoji: '☀️', label: 'Great' },
]
