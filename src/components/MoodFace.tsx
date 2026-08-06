import { useId, type ReactNode } from 'react'
import type { Mood } from '../types'
import { getEmotion } from '../lib/emotions'

/**
 * Mira mascot-droplet faces — the approved "Style 1" art, ported faithfully
 * from the design canvas into a reusable, prop-driven component.
 *
 * The brand water-drop IS the emotion: one identity, a distinct expression per
 * feeling (brow / eye / mouth shape), a subtle emotion-tinted radial glow, a
 * soft body gradient and the signature "mirror" shine for premium depth. The
 * SAME renderer draws the 1–5 valence ladder (level → expression, mood-tinted
 * glow) AND the categorical emotion tags (emotion → expression + color glow),
 * so both layers share one shape-driven, color-blind-safe look.
 *
 * Geometry mirrors `Mascot.tsx`; the teal body themes via brand tokens so it's
 * correct in light + dark. Feature shapes (not color) carry the feeling, and
 * every consumer pairs the face with a visible text label.
 */

// The mascot ink — the same dark teal used by the existing Mascot, kept as a
// constant so eyes/mouth read crisply on the teal body in both themes.
const INK = '#0b3b36'

// The droplet body path — identical to Mascot.tsx so the family stays on-model.
const DROP = 'M50 8 C74 30 86 46 86 62 A36 36 0 1 1 14 62 C14 46 26 30 50 8 Z'

type EyeType = 'open' | 'happy' | 'closed' | 'wide' | 'droopy'
type MouthType = 'grin' | 'smile' | 'smallSmile' | 'neutral' | 'smallFrown' | 'frown' | 'wavy'
type BrowType = 'none' | 'worried' | 'raised'

interface Expr {
  eyes: EyeType
  mouth: MouthType
  brow: BrowType
  tear: boolean
  blush: boolean
  heart: boolean
}

const BASE: Expr = { eyes: 'open', mouth: 'neutral', brow: 'none', tear: false, blush: false, heart: false }

// Valence ladder expressions, rough(0) → great(4). Matches the canvas l0–l4.
// Expressions are deliberately EXAGGERATED so the five read apart at ~24px and
// in grayscale: mouth curvature marches monotonically (deep frown → mild frown
// → flat → smile → big open grin), the extremes add eye + brow cues (droopy
// eyes + worried brows at Rough, happy squint + blush at Great).
const LADDER: Expr[] = [
  { ...BASE, eyes: 'droopy', mouth: 'frown', brow: 'worried' }, // rough
  { ...BASE, eyes: 'open', mouth: 'smallFrown' }, // low
  { ...BASE, eyes: 'open', mouth: 'neutral' }, // okay
  { ...BASE, eyes: 'open', mouth: 'smile' }, // good
  { ...BASE, eyes: 'happy', mouth: 'grin', blush: true }, // great
]

// Emotion-tag expressions. Shape (brow/eye/mouth) does the disambiguating work
// so nothing relies on the color glow alone.
const EXPRESSIONS: Record<string, Expr> = {
  joy: { ...BASE, eyes: 'happy', mouth: 'grin', blush: true },
  calm: { ...BASE, eyes: 'closed', mouth: 'smallSmile' },
  sad: { ...BASE, eyes: 'droopy', mouth: 'frown', brow: 'worried', tear: true },
  anxious: { ...BASE, eyes: 'wide', mouth: 'wavy', brow: 'raised' },
  love: { ...BASE, eyes: 'happy', mouth: 'smile', blush: true, heart: true },
  hope: { ...BASE, eyes: 'open', mouth: 'smallSmile', brow: 'raised' },
  gratitude: { ...BASE, eyes: 'happy', mouth: 'smile', blush: true },
  excited: { ...BASE, eyes: 'wide', mouth: 'grin', brow: 'raised', blush: true },
  content: { ...BASE, eyes: 'closed', mouth: 'smile' },
  lonely: { ...BASE, eyes: 'droopy', mouth: 'smallFrown' },
  guilt: { ...BASE, eyes: 'droopy', mouth: 'smallFrown', brow: 'worried' },
  empty: { ...BASE, eyes: 'droopy', mouth: 'neutral' },
  envy: { ...BASE, eyes: 'open', mouth: 'smallFrown', brow: 'worried' },
  frustrated: { ...BASE, eyes: 'open', mouth: 'frown', brow: 'worried' },
  embarrassed: { ...BASE, eyes: 'wide', mouth: 'wavy', brow: 'raised', blush: true },
  bored: { ...BASE, eyes: 'droopy', mouth: 'neutral' },
}

const MOOD_ORDER: Mood[] = ['rough', 'low', 'okay', 'good', 'great']
const MOOD_GLOW: string[] = [
  'var(--mood-rough)',
  'var(--mood-low)',
  'var(--mood-okay)',
  'var(--mood-good)',
  'var(--mood-great)',
]
// Per-level droplet BODY gradient (top = lighter, bottom = deeper). This is the
// primary valence cue — the fill itself carries meaning, not just the glow.
const MOOD_BODY_TOP: string[] = [
  'var(--mf-l0-top)',
  'var(--mf-l1-top)',
  'var(--mf-l2-top)',
  'var(--mf-l3-top)',
  'var(--mf-l4-top)',
]
const MOOD_BODY_BOTTOM: string[] = [
  'var(--mf-l0-bottom)',
  'var(--mf-l1-bottom)',
  'var(--mf-l2-bottom)',
  'var(--mf-l3-bottom)',
  'var(--mf-l4-bottom)',
]
const LADDER_LABELS = ['Rough', 'Low', 'Okay', 'Good', 'Great']

/* ---------------- shared facial-feature primitives (ported 1:1) ---------------- */

function renderEyes(type: EyeType): ReactNode {
  const sw = 4.2
  switch (type) {
    case 'happy':
      // Big upward "squint" arcs — raised, joyful cheeks. Wider than before so
      // Great reads as clearly delighted even at tiny sizes.
      return (
        <>
          <path d="M30 46 q7 7 14 0" fill="none" stroke={INK} strokeWidth={sw} strokeLinecap="round" />
          <path d="M56 46 q7 7 14 0" fill="none" stroke={INK} strokeWidth={sw} strokeLinecap="round" />
        </>
      )
    case 'closed':
      return (
        <>
          <path d="M32 47 q5 4.5 10 0" fill="none" stroke={INK} strokeWidth={sw} strokeLinecap="round" />
          <path d="M58 47 q5 4.5 10 0" fill="none" stroke={INK} strokeWidth={sw} strokeLinecap="round" />
        </>
      )
    case 'wide':
      return (
        <>
          <circle cx={37} cy={47} r={6.5} fill="#ffffff" stroke={INK} strokeWidth={2.4} />
          <circle cx={63} cy={47} r={6.5} fill="#ffffff" stroke={INK} strokeWidth={2.4} />
          <circle cx={37} cy={48} r={2.8} fill={INK} />
          <circle cx={63} cy={48} r={2.8} fill={INK} />
        </>
      )
    case 'droopy':
      // Smaller, more downturned ∩ arcs — a heavier, sadder lid than before.
      return (
        <>
          <path d="M32 50 q5.5 -6.5 11 0" fill="none" stroke={INK} strokeWidth={sw} strokeLinecap="round" />
          <path d="M57 50 q5.5 -6.5 11 0" fill="none" stroke={INK} strokeWidth={sw} strokeLinecap="round" />
        </>
      )
    default: // open — with the mascot's signature catch-light
      return (
        <>
          <circle cx={37} cy={47} r={5.5} fill={INK} />
          <circle cx={63} cy={47} r={5.5} fill={INK} />
          <circle cx={38.8} cy={45.2} r={1.7} fill="#ffffff" />
          <circle cx={64.8} cy={45.2} r={1.7} fill="#ffffff" />
        </>
      )
  }
}

function renderMouth(type: MouthType): ReactNode {
  const sw = 5
  switch (type) {
    case 'grin':
      // Big open, upturned grin — sits lower and opens wider for Great/joy.
      return <path d="M33 61 Q50 85 67 61 Z" fill={INK} />
    case 'smile':
      // Clear, confident upcurve for Good.
      return <path d="M36 62 q14 15 28 0" fill="none" stroke={INK} strokeWidth={sw} strokeLinecap="round" />
    case 'smallSmile':
      return <path d="M39 64 q11 9 22 0" fill="none" stroke={INK} strokeWidth={sw} strokeLinecap="round" />
    case 'neutral':
      // Deliberately flat line for Okay.
      return <line x1={40} y1={67} x2={60} y2={67} stroke={INK} strokeWidth={sw} strokeLinecap="round" />
    case 'smallFrown':
      // Clearly visible medium downturn for Low (was near-flat before).
      return <path d="M39 70 q11 -7 22 0" fill="none" stroke={INK} strokeWidth={sw} strokeLinecap="round" />
    case 'frown':
      // Pronounced deep frown for Rough — wide, low, unmistakable.
      return <path d="M35 73 q15 -13 30 0" fill="none" stroke={INK} strokeWidth={sw} strokeLinecap="round" />
    case 'wavy':
      return <path d="M38 68 q5 -6 10 0 q5 6 10 0" fill="none" stroke={INK} strokeWidth={sw} strokeLinecap="round" />
  }
}

function renderBrow(type: BrowType): ReactNode {
  const sw = 3.8
  if (type === 'worried')
    return (
      <>
        <path d="M29 42 L45 36.5" stroke={INK} strokeWidth={sw} strokeLinecap="round" />
        <path d="M71 42 L55 36.5" stroke={INK} strokeWidth={sw} strokeLinecap="round" />
      </>
    )
  if (type === 'raised')
    return (
      <>
        <path d="M30 39 q7 -3.5 14 0" fill="none" stroke={INK} strokeWidth={sw} strokeLinecap="round" />
        <path d="M56 39 q7 -3.5 14 0" fill="none" stroke={INK} strokeWidth={sw} strokeLinecap="round" />
      </>
    )
  return null
}

/**
 * The droplet face itself. `glow` is the emotion/valence-tinted color for the
 * soft radial halo; `selected` nudges the glow a touch brighter for feedback.
 */
function DropletFace({
  expr,
  glow,
  bodyTop = 'var(--accent)',
  bodyBottom = 'var(--accent-strong)',
  size,
  selected,
  ariaLabel,
  decorative,
  className,
}: {
  expr: Expr
  glow: string
  /** Droplet body gradient stops. Defaults to brand teal (emotion faces). The
   *  valence ladder overrides these with a per-level color so the fill carries
   *  the mood — shape stays constant (brand), color signals valence. */
  bodyTop?: string
  bodyBottom?: string
  size: number
  selected?: boolean
  ariaLabel: string
  decorative?: boolean
  className?: string
}) {
  const uid = useId().replace(/:/g, '')
  const bodyId = `mf-body-${uid}`
  const glowId = `mf-glow-${uid}`
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={className}
      role={decorative ? undefined : 'img'}
      aria-label={decorative ? undefined : ariaLabel}
      aria-hidden={decorative || undefined}
    >
      <defs>
        <linearGradient id={bodyId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={bodyTop} />
          <stop offset="100%" stopColor={bodyBottom} />
        </linearGradient>
        <radialGradient id={glowId} cx="50%" cy="28%" r="72%">
          <stop offset="0%" stopColor={glow} stopOpacity={selected ? 0.75 : 0.55} />
          <stop offset="70%" stopColor={glow} stopOpacity={0} />
        </radialGradient>
      </defs>
      <path d={DROP} fill={`url(#${bodyId})`} />
      <path d={DROP} fill={`url(#${glowId})`} />
      {expr.blush && (
        <>
          <ellipse cx={30} cy={64} rx={6} ry={3.6} fill="#ffffff" opacity={0.3} />
          <ellipse cx={70} cy={64} rx={6} ry={3.6} fill="#ffffff" opacity={0.3} />
        </>
      )}
      {renderBrow(expr.brow)}
      {renderEyes(expr.eyes)}
      {renderMouth(expr.mouth)}
      {expr.tear && <path d="M30 54 q-3 5 0 8 q3 -3 0 -8 Z" fill="#bfe0ff" />}
      {expr.heart && (
        <path
          d="M75 24 c-1.6 -2.6 -6 -1 -6 2.4 c0 2.6 3.2 4.4 6 6.6 c2.8 -2.2 6 -4 6 -6.6 c0 -3.4 -4.4 -5 -6 -2.4 Z"
          fill={glow}
        />
      )}
      {/* the "mirror" shine — Mira's signature highlight */}
      <path d="M40 22 q-10 8 -10 20" fill="none" stroke="#ffffff" strokeWidth={5} strokeLinecap="round" opacity={0.7} />
    </svg>
  )
}

/* ---------------- public API ---------------- */

interface MoodFaceProps {
  /** Ladder level 0–4 (rough→great). Provide this OR `mood`. */
  level?: number
  /** Convenience: a `Mood` value, resolved to the matching ladder level. */
  mood?: Mood
  size?: number
  selected?: boolean
  /** Decorative faces (inside a labeled control) are hidden from screen readers. */
  decorative?: boolean
  className?: string
}

/** A valence face for the 1–5 mascot ladder (rough → great). */
export function MoodFace({ level, mood, size = 40, selected, decorative, className }: MoodFaceProps) {
  const idx = mood ? MOOD_ORDER.indexOf(mood) : (level ?? 2)
  const clamped = Math.max(0, Math.min(4, idx))
  return (
    <DropletFace
      expr={LADDER[clamped]}
      glow={MOOD_GLOW[clamped]}
      bodyTop={MOOD_BODY_TOP[clamped]}
      bodyBottom={MOOD_BODY_BOTTOM[clamped]}
      size={size}
      selected={selected}
      decorative={decorative}
      className={className}
      ariaLabel={`${LADDER_LABELS[clamped]} mood`}
    />
  )
}

interface EmotionFaceProps {
  /** Emotion tag id (see `lib/emotions.ts`). */
  emotion: string
  size?: number
  selected?: boolean
  decorative?: boolean
  className?: string
}

/** A face for a categorical emotion tag (expression + color-tinted glow). */
export function EmotionFace({ emotion, size = 40, selected, decorative, className }: EmotionFaceProps) {
  const meta = getEmotion(emotion)
  const expr = (meta && EXPRESSIONS[meta.expression]) ?? BASE
  const glow = meta?.color ?? 'var(--accent)'
  return (
    <DropletFace
      expr={expr}
      glow={glow}
      size={size}
      selected={selected}
      decorative={decorative}
      className={className}
      ariaLabel={meta ? `${meta.label} feeling` : 'Feeling'}
    />
  )
}
