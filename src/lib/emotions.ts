import type { Entry } from '../types'

/**
 * Emotion tag catalog for the Hybrid "Faces" selector.
 *
 * This is the CATEGORICAL tag layer that rides on top of the ordered 1–5
 * valence scale (`Mood`) — it is intentionally independent of the mood score,
 * so the mood-trend chart keeps working with zero migration. Every emotion
 * always renders as color + face + text label (never color alone), and the
 * palette is de-collided and colorblind-safe (shape + label disambiguate
 * same-family hues). Colors hold against both the light and dark surfaces.
 *
 * `expression` maps to a face expression in `components/MoodFace.tsx`, so the
 * same mascot-droplet renderer draws both the ladder and the tags.
 *
 * NOTE: "Depression" is intentionally excluded (a clinical condition, not a
 * momentary feeling) — the low end is covered by the valence ladder plus
 * everyday words like Low / Empty / Lonely.
 */
export interface Emotion {
  id: string
  label: string
  color: string
  expression: string
  /** Shown in the always-visible common row; the rest live behind "More". */
  common?: boolean
}

export const EMOTIONS: Emotion[] = [
  // ---- Common row (fast, everyday feelings) ----
  { id: 'joy', label: 'Joy', color: '#f2a51c', expression: 'joy', common: true },
  { id: 'calm', label: 'Calm', color: '#10c4a9', expression: 'calm', common: true },
  { id: 'sad', label: 'Sad', color: '#4f8cf0', expression: 'sad', common: true },
  { id: 'anxious', label: 'Anxious', color: '#ef8a3c', expression: 'anxious', common: true },
  { id: 'love', label: 'Love', color: '#e05780', expression: 'love', common: true },

  // ---- Expandable "More" set ----
  { id: 'hope', label: 'Hope', color: '#4fb286', expression: 'hope' },
  { id: 'gratitude', label: 'Gratitude', color: '#d9962a', expression: 'gratitude' },
  { id: 'excited', label: 'Excited', color: '#f97316', expression: 'excited' },
  { id: 'content', label: 'Content', color: '#2bc0a6', expression: 'content' },
  { id: 'lonely', label: 'Lonely', color: '#5b7fd6', expression: 'lonely' },
  { id: 'guilt', label: 'Guilt', color: '#8a5a8f', expression: 'guilt' },
  { id: 'empty', label: 'Empty', color: '#8092b0', expression: 'empty' },
  { id: 'envy', label: 'Envy', color: '#5aa02c', expression: 'envy' },
  { id: 'frustrated', label: 'Frustrated', color: '#e5484d', expression: 'frustrated' },
  { id: 'embarrassed', label: 'Embarrassed', color: '#f06fb0', expression: 'embarrassed' },
  { id: 'bored', label: 'Ennui / Bored', color: '#6366f1', expression: 'bored' },
]

const EMOTIONS_BY_ID: Map<string, Emotion> = new Map(EMOTIONS.map((e) => [e.id, e]))

export const COMMON_EMOTIONS: Emotion[] = EMOTIONS.filter((e) => e.common)
export const MORE_EMOTIONS: Emotion[] = EMOTIONS.filter((e) => !e.common)

/** Look up an emotion by id; resilient to unknown/removed ids (returns undefined). */
export function getEmotion(id?: string | null): Emotion | undefined {
  return id ? EMOTIONS_BY_ID.get(id) : undefined
}

export interface EmotionCount {
  emotion: Emotion
  count: number
}

/**
 * Frequency of emotion tags across the last `days` days (all-time when omitted),
 * most frequent first. Unknown/removed ids are skipped so a stale tag can't
 * break the breakdown.
 */
export function emotionCounts(entries: Entry[], days?: number, max = 8): EmotionCount[] {
  const since = days ? Date.now() - days * 864e5 : 0
  const counts = new Map<string, number>()
  for (const e of entries) {
    if (!e.emotion || e.createdAt < since) continue
    if (!EMOTIONS_BY_ID.has(e.emotion)) continue
    counts.set(e.emotion, (counts.get(e.emotion) ?? 0) + 1)
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, max)
    .map(([id, count]) => ({ emotion: EMOTIONS_BY_ID.get(id)!, count }))
}
