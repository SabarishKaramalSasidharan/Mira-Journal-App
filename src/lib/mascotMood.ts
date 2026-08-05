import type { Mood } from '../types'
import { MOOD_SCORE } from './ai'

/** The expressions Mira (the mascot) can wear. */
export type MascotMood = 'happy' | 'thinking' | 'calm' | 'joy' | 'down'

/**
 * Map a logged app mood to the expression Mira empathetically wears.
 * Driven by MOOD_SCORE so the sentiment thresholds live in one place:
 * bright moods → happy, neutral → calm, low/negative → a gentle, caring face.
 */
export function moodToExpression(mood: Mood): MascotMood {
  const score = MOOD_SCORE[mood]
  if (score >= 4) return 'happy'
  if (score === 3) return 'calm'
  return 'down'
}
