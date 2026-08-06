import type { Entry } from '../types'

/**
 * Emotion tag catalog for the Hybrid "Faces" selector.
 *
 * This is the CATEGORICAL tag layer that rides on top of the ordered 1–5
 * valence scale (`Mood`) — it is intentionally independent of the mood score,
 * so the mood-trend chart keeps working with zero migration.
 *
 * COLOR now signals the emotion's GROUP (its broad KIND — Pleasant vs.
 * Unpleasant), NOT a per-emotion hue. Every emotion still renders as
 * color + face + text label (never color alone); WITHIN a group the specific
 * feeling is carried by the mascot `expression` (brow / eye / mouth) plus the
 * always-visible text label, so it stays colorblind-safe. The two group
 * gradients live as `--eg-*` tokens in `index.css` (light + dark), tuned so the
 * dark mascot ink clears WCAG AA on each whole body.
 *
 * `expression` maps to a face expression in `components/MoodFace.tsx`, so the
 * same mascot-droplet renderer draws both the ladder and the tags.
 *
 * NOTE: "Depression" is intentionally excluded (a clinical condition, not a
 * momentary feeling) — the low end is covered by the valence ladder plus
 * everyday words like Low / Empty / Lonely.
 */
export type EmotionGroupKey = 'pleasant' | 'unpleasant'

export interface Emotion {
  id: string
  label: string
  /** Which color group this feeling belongs to (drives the droplet body). */
  group: EmotionGroupKey
  expression: string
}

/** A group's droplet body gradient (theme-aware; resolves to `--eg-*` tokens).
 *  `bottom` is the deeper base and also drives the subheading dot + Reflect bar. */
export interface EmotionGroupColor {
  top: string
  bottom: string
}

// The two group gradients, referenced as CSS custom properties so they follow
// the light/dark theme automatically (mirrors how the valence faces pull their
// per-level `--mf-l*` bodies). Concrete hex values + AA rationale live in
// index.css.
export const GROUP_COLORS: Record<EmotionGroupKey, EmotionGroupColor> = {
  pleasant: { top: 'var(--eg-pleasant-top)', bottom: 'var(--eg-pleasant-bottom)' },
  unpleasant: { top: 'var(--eg-unpleasant-top)', bottom: 'var(--eg-unpleasant-bottom)' },
}

// Emotions are listed in their group order so the grouped picker and the
// per-emotion expressions read as a coherent set. Group membership follows the
// approved "Option B" split.
export const EMOTIONS: Emotion[] = [
  // ---- Pleasant (green) ----
  { id: 'joy', label: 'Joy', group: 'pleasant', expression: 'joy' },
  { id: 'excited', label: 'Excited', group: 'pleasant', expression: 'excited' },
  { id: 'love', label: 'Love', group: 'pleasant', expression: 'love' },
  { id: 'hope', label: 'Hope', group: 'pleasant', expression: 'hope' },
  { id: 'gratitude', label: 'Gratitude', group: 'pleasant', expression: 'gratitude' },
  { id: 'content', label: 'Content', group: 'pleasant', expression: 'content' },
  { id: 'calm', label: 'Calm', group: 'pleasant', expression: 'calm' },

  // ---- Unpleasant (muted blue-grey) ----
  { id: 'sad', label: 'Sad', group: 'unpleasant', expression: 'sad' },
  { id: 'anxious', label: 'Anxious', group: 'unpleasant', expression: 'anxious' },
  { id: 'lonely', label: 'Lonely', group: 'unpleasant', expression: 'lonely' },
  { id: 'guilt', label: 'Guilt', group: 'unpleasant', expression: 'guilt' },
  { id: 'frustrated', label: 'Frustrated', group: 'unpleasant', expression: 'frustrated' },
  { id: 'embarrassed', label: 'Embarrassed', group: 'unpleasant', expression: 'embarrassed' },
  { id: 'envy', label: 'Envy', group: 'unpleasant', expression: 'envy' },
  { id: 'empty', label: 'Empty', group: 'unpleasant', expression: 'empty' },
  { id: 'bored', label: 'Ennui / Bored', group: 'unpleasant', expression: 'bored' },
]

const EMOTIONS_BY_ID: Map<string, Emotion> = new Map(EMOTIONS.map((e) => [e.id, e]))

/** Convenience: the group gradient for an emotion (or the group key). */
export function groupColor(group: EmotionGroupKey): EmotionGroupColor {
  return GROUP_COLORS[group]
}

export interface EmotionGroup {
  key: EmotionGroupKey
  label: string
  color: EmotionGroupColor
  emotions: Emotion[]
}

// The picker renders these two clustered sections, each under an uppercase
// subheading (group-color dot + name + count).
export const EMOTION_GROUPS: EmotionGroup[] = [
  {
    key: 'pleasant',
    label: 'Pleasant',
    color: GROUP_COLORS.pleasant,
    emotions: EMOTIONS.filter((e) => e.group === 'pleasant'),
  },
  {
    key: 'unpleasant',
    label: 'Unpleasant',
    color: GROUP_COLORS.unpleasant,
    emotions: EMOTIONS.filter((e) => e.group === 'unpleasant'),
  },
]

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
