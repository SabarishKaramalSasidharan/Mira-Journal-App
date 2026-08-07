import {
  Callout,
  Code,
  Divider,
  Grid,
  H1,
  H3,
  Row,
  Stack,
  Text,
  useHostTheme,
} from 'cursor/canvas'
import { useState, type CSSProperties, type ReactNode } from 'react'

// Stable-per-instance unique id (the canvas React types don't expose `useId`).
let __mfSeq = 0

/* ============================================================================
 * Mira — where should the OPTIONAL "add a feeling" tag live? (EXPLORATION ONLY)
 *
 * Three interactive, phone-sized mockups that compare three entry points for
 * the optional categorical emotion tag, so the orphaned floating
 * "＋ Add a feeling (optional)" pill can be replaced with something that feels
 * intentional. Nothing under src/ is modified — this is a throwaway decision aid.
 *
 * Everything is recreated inline (no imports from src/) to match the established
 * canvas pattern (see mira-mood-selector-options / mira-emotion-grouping-options):
 *   • the droplet mascot faces are ported 1:1 from src/components/MoodFace.tsx
 *   • the emotion catalog + Pleasant/Unpleasant groups from src/lib/emotions.ts
 *   • the composer/chat layout from src/components/Capture.tsx
 *   • the brand tokens (teal accent, --eg-* group colors, --mf-l* face colors,
 *     radius ladder) from src/index.css (LIGHT theme values)
 * ========================================================================== */

/* ---------------- Faithful Mira LIGHT-theme brand tokens ------------------- */
const MIRA = {
  bg: '#eef4f2',
  surface: '#ffffff',
  surface2: '#f2f7f5',
  content: '#10221f',
  contentSoft: '#3f524e',
  contentMute: '#556764',
  border: '#dbe6e2',
  accent: '#10c4a9',
  accentStrong: '#0ba593',
  accentSoft: '#dcf6f1',
  onAccent: '#ffffff',
  accentText: '#0a6d61',
  flame: '#ff8a3d',
  display: "'Fredoka', ui-sans-serif, system-ui, sans-serif",
  sans: "'Nunito', ui-sans-serif, system-ui, -apple-system, sans-serif",
}

// Emotion GROUP body gradients (src/index.css --eg-* light values). Color = KIND
// of feeling; expression + label carry the specific emotion (colorblind-safe).
const GROUP_COLORS = {
  pleasant: { top: '#7ede9a', bottom: '#41c268' },
  unpleasant: { top: '#a3afc6', bottom: '#93a1ba' },
} as const

// Valence ladder body gradient + glow (src/index.css --mf-l* / --mood-* light).
const MOOD_BODY_TOP = ['#a5adf7', '#8ec2f9', '#3ad8bf', '#7ede9a', '#ffcf57']
const MOOD_BODY_BOTTOM = ['#7b88f2', '#5a9cf2', '#12b7a1', '#41c268', '#f6a81f']
const MOOD_GLOW = ['#6c7bf0', '#63a4f4', '#10c4a9', '#4ecb71', '#ffc53d']
const MOOD_LABELS = ['Rough', 'Low', 'Okay', 'Good', 'Great']

/* ---------------- Mascot droplet art (ported 1:1 from MoodFace.tsx) -------- */
const INK = '#0b3b36'
const DROP = 'M50 8 C74 30 86 46 86 62 A36 36 0 1 1 14 62 C14 46 26 30 50 8 Z'

type EyeType =
  | 'open'
  | 'happy'
  | 'closed'
  | 'wide'
  | 'droopy'
  | 'flat'
  | 'blank'
  | 'sideEye'
  | 'lookAway'
type MouthType =
  | 'grin'
  | 'smile'
  | 'smallSmile'
  | 'neutral'
  | 'smallFrown'
  | 'frown'
  | 'wavy'
  | 'smirk'
  | 'grimace'
type BrowType = 'none' | 'worried' | 'raised' | 'angry'

interface Expr {
  eyes: EyeType
  mouth: MouthType
  brow: BrowType
  tear: boolean
  blush: boolean
  heart: boolean
}
const BASE: Expr = { eyes: 'open', mouth: 'neutral', brow: 'none', tear: false, blush: false, heart: false }

// rough(0) → great(4)
const LADDER: Expr[] = [
  { ...BASE, eyes: 'droopy', mouth: 'frown', brow: 'worried' },
  { ...BASE, eyes: 'open', mouth: 'smallFrown' },
  { ...BASE, eyes: 'open', mouth: 'neutral' },
  { ...BASE, eyes: 'open', mouth: 'smile' },
  { ...BASE, eyes: 'happy', mouth: 'grin', blush: true },
]

const EXPRESSIONS: Record<string, Expr> = {
  joy: { ...BASE, eyes: 'happy', mouth: 'grin', blush: true },
  gratitude: { ...BASE, eyes: 'closed', mouth: 'smile', blush: true },
  calm: { ...BASE, eyes: 'closed', mouth: 'smallSmile' },
  content: { ...BASE, eyes: 'open', mouth: 'smile' },
  sad: { ...BASE, eyes: 'droopy', mouth: 'frown', brow: 'worried', tear: true },
  lonely: { ...BASE, eyes: 'droopy', mouth: 'smallFrown' },
  bored: { ...BASE, eyes: 'flat', mouth: 'neutral' },
  empty: { ...BASE, eyes: 'blank', mouth: 'neutral' },
  anxious: { ...BASE, eyes: 'wide', mouth: 'wavy', brow: 'worried' },
  excited: { ...BASE, eyes: 'wide', mouth: 'grin', brow: 'raised', blush: true },
  love: { ...BASE, eyes: 'happy', mouth: 'smile', blush: true, heart: true },
  embarrassed: { ...BASE, eyes: 'wide', mouth: 'grimace', brow: 'raised', blush: true },
  hope: { ...BASE, eyes: 'open', mouth: 'smallSmile', brow: 'raised' },
  guilt: { ...BASE, eyes: 'lookAway', mouth: 'smallFrown', brow: 'worried' },
  envy: { ...BASE, eyes: 'sideEye', mouth: 'smirk' },
  frustrated: { ...BASE, eyes: 'open', mouth: 'frown', brow: 'angry' },
}

function renderEyes(type: EyeType): ReactNode {
  const sw = 4.2
  switch (type) {
    case 'happy':
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
      return (
        <>
          <path d="M32 50 q5.5 -6.5 11 0" fill="none" stroke={INK} strokeWidth={sw} strokeLinecap="round" />
          <path d="M57 50 q5.5 -6.5 11 0" fill="none" stroke={INK} strokeWidth={sw} strokeLinecap="round" />
        </>
      )
    case 'flat':
      return (
        <>
          <line x1={31} y1={46.5} x2={43} y2={46.5} stroke={INK} strokeWidth={4} strokeLinecap="round" />
          <line x1={57} y1={46.5} x2={69} y2={46.5} stroke={INK} strokeWidth={4} strokeLinecap="round" />
          <line x1={33} y1={50.5} x2={41} y2={50.5} stroke={INK} strokeWidth={3} strokeLinecap="round" opacity={0.55} />
          <line x1={59} y1={50.5} x2={67} y2={50.5} stroke={INK} strokeWidth={3} strokeLinecap="round" opacity={0.55} />
        </>
      )
    case 'blank':
      return (
        <>
          <circle cx={37} cy={47} r={4.6} fill={INK} opacity={0.72} />
          <circle cx={63} cy={47} r={4.6} fill={INK} opacity={0.72} />
        </>
      )
    case 'sideEye':
      return (
        <>
          <circle cx={37} cy={47} r={6.5} fill="#ffffff" stroke={INK} strokeWidth={2.4} />
          <circle cx={63} cy={47} r={6.5} fill="#ffffff" stroke={INK} strokeWidth={2.4} />
          <circle cx={40.4} cy={47} r={2.8} fill={INK} />
          <circle cx={66.4} cy={47} r={2.8} fill={INK} />
        </>
      )
    case 'lookAway':
      return (
        <>
          <circle cx={37} cy={47} r={6.5} fill="#ffffff" stroke={INK} strokeWidth={2.4} />
          <circle cx={63} cy={47} r={6.5} fill="#ffffff" stroke={INK} strokeWidth={2.4} />
          <circle cx={34.2} cy={49.4} r={2.8} fill={INK} />
          <circle cx={60.2} cy={49.4} r={2.8} fill={INK} />
        </>
      )
    default:
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
      return <path d="M33 61 Q50 85 67 61 Z" fill={INK} />
    case 'smile':
      return <path d="M36 62 q14 15 28 0" fill="none" stroke={INK} strokeWidth={sw} strokeLinecap="round" />
    case 'smallSmile':
      return <path d="M39 64 q11 9 22 0" fill="none" stroke={INK} strokeWidth={sw} strokeLinecap="round" />
    case 'neutral':
      return <line x1={40} y1={67} x2={60} y2={67} stroke={INK} strokeWidth={sw} strokeLinecap="round" />
    case 'smallFrown':
      return <path d="M39 70 q11 -7 22 0" fill="none" stroke={INK} strokeWidth={sw} strokeLinecap="round" />
    case 'frown':
      return <path d="M35 73 q15 -13 30 0" fill="none" stroke={INK} strokeWidth={sw} strokeLinecap="round" />
    case 'wavy':
      return <path d="M38 68 q5 -6 10 0 q5 6 10 0" fill="none" stroke={INK} strokeWidth={sw} strokeLinecap="round" />
    case 'smirk':
      return <path d="M37 69 Q49 68 64 61" fill="none" stroke={INK} strokeWidth={sw} strokeLinecap="round" />
    case 'grimace':
      return (
        <>
          <rect x={37} y={62} width={26} height={9} rx={3.5} fill="#ffffff" stroke={INK} strokeWidth={3} />
          <line x1={39} y1={66.5} x2={61} y2={66.5} stroke={INK} strokeWidth={2.6} strokeLinecap="round" />
          <line x1={45} y1={62.5} x2={45} y2={70.5} stroke={INK} strokeWidth={2.2} />
          <line x1={55} y1={62.5} x2={55} y2={70.5} stroke={INK} strokeWidth={2.2} />
        </>
      )
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
  if (type === 'angry')
    return (
      <>
        <path d="M29 37 L45 42" stroke={INK} strokeWidth={sw} strokeLinecap="round" />
        <path d="M71 37 L55 42" stroke={INK} strokeWidth={sw} strokeLinecap="round" />
      </>
    )
  return null
}

function DropletFace({
  expr,
  glow,
  bodyTop = MIRA.accent,
  bodyBottom = MIRA.accentStrong,
  size,
  selected,
}: {
  expr: Expr
  glow: string
  bodyTop?: string
  bodyBottom?: string
  size: number
  selected?: boolean
}) {
  const [uid] = useState(() => (__mfSeq++).toString(36))
  const bodyId = `mf-body-${uid}`
  const glowId = `mf-glow-${uid}`
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden>
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
          fill="#ff3f6c"
          stroke="#ffffff"
          strokeWidth={1.2}
        />
      )}
      <path d="M40 22 q-10 8 -10 20" fill="none" stroke="#ffffff" strokeWidth={5} strokeLinecap="round" opacity={0.7} />
    </svg>
  )
}

/* ---------------- Emotion catalog (subset, from src/lib/emotions.ts) ------- */
type Group = 'pleasant' | 'unpleasant'
interface Emo {
  id: string
  label: string
  group: Group
  expression: string
}
const EMOTIONS: Emo[] = [
  { id: 'calm', label: 'Calm', group: 'pleasant', expression: 'calm' },
  { id: 'content', label: 'Content', group: 'pleasant', expression: 'content' },
  { id: 'joy', label: 'Joy', group: 'pleasant', expression: 'joy' },
  { id: 'gratitude', label: 'Gratitude', group: 'pleasant', expression: 'gratitude' },
  { id: 'hope', label: 'Hope', group: 'pleasant', expression: 'hope' },
  { id: 'sad', label: 'Sad', group: 'unpleasant', expression: 'sad' },
  { id: 'anxious', label: 'Anxious', group: 'unpleasant', expression: 'anxious' },
  { id: 'lonely', label: 'Lonely', group: 'unpleasant', expression: 'lonely' },
  { id: 'frustrated', label: 'Frustrated', group: 'unpleasant', expression: 'frustrated' },
  { id: 'envy', label: 'Envy', group: 'unpleasant', expression: 'envy' },
]
const EMO_BY_ID = new Map(EMOTIONS.map((e) => [e.id, e]))
const getEmo = (id: string | null): Emo | undefined => (id ? EMO_BY_ID.get(id) : undefined)

function EmotionFace({ id, size = 24, selected }: { id: string; size?: number; selected?: boolean }) {
  const meta = getEmo(id)
  const expr = (meta && EXPRESSIONS[meta.expression]) ?? BASE
  const colors = meta ? GROUP_COLORS[meta.group] : GROUP_COLORS.pleasant
  return <DropletFace expr={expr} glow={colors.bottom} bodyTop={colors.top} bodyBottom={colors.bottom} size={size} selected={selected} />
}

// Mira's little avatar (a happy teal droplet) — mirrors Capture's Mascot chip.
function MiraAvatar({ size = 26 }: { size?: number }) {
  return (
    <span
      style={{
        display: 'grid',
        placeItems: 'center',
        width: size + 6,
        height: size + 6,
        borderRadius: 999,
        background: MIRA.accentSoft,
        flex: '0 0 auto',
      }}
    >
      <DropletFace expr={LADDER[3]} glow={MIRA.accent} size={size} />
    </span>
  )
}

/* ---------------- Inline icons (recreated, lucide-style) ------------------- */
function Svg({ children, size = 20, color }: { children: ReactNode; size?: number; color: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {children}
    </svg>
  )
}
const MicIcon = ({ color }: { color: string }) => (
  <Svg color={color}>
    <rect x={9} y={2} width={6} height={11} rx={3} />
    <path d="M5 10a7 7 0 0 0 14 0" />
    <line x1={12} y1={19} x2={12} y2={22} />
  </Svg>
)
const ArrowUpIcon = ({ color }: { color: string }) => (
  <Svg color={color}>
    <path d="M12 19V5" />
    <path d="m5 12 7-7 7 7" />
  </Svg>
)
const CheckIcon = ({ color, size = 18 }: { color: string; size?: number }) => (
  <Svg color={color} size={size}>
    <path d="M20 6 9 17l-5-5" />
  </Svg>
)
const SmileIcon = ({ color, size = 20 }: { color: string; size?: number }) => (
  <Svg color={color} size={size}>
    <circle cx={12} cy={12} r={10} />
    <path d="M8 14s1.5 2 4 2 4-2 4-2" />
    <line x1={9} y1={9} x2={9.01} y2={9} />
    <line x1={15} y1={9} x2={15.01} y2={9} />
  </Svg>
)
const ChevronUpIcon = ({ color, size = 16 }: { color: string; size?: number }) => (
  <Svg color={color} size={size}>
    <path d="m18 15-6-6-6 6" />
  </Svg>
)
const PlusIcon = ({ color, size = 14 }: { color: string; size?: number }) => (
  <Svg color={color} size={size}>
    <line x1={12} y1={5} x2={12} y2={19} />
    <line x1={5} y1={12} x2={19} y2={12} />
  </Svg>
)

/* ---------------- Shared mockup primitives (faithful to Capture.tsx) ------- */
const phoneText: CSSProperties = { fontFamily: MIRA.sans }

// Phone-sized Mira surface the mockups sit inside.
function Phone({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        width: 320,
        background: MIRA.bg,
        border: `1px solid ${MIRA.border}`,
        borderRadius: 28,
        padding: 12,
        ...phoneText,
      }}
    >
      {children}
    </div>
  )
}

// A Mira / You chat bubble.
function Bubble({ from, children }: { from: 'mira' | 'you'; children: ReactNode }) {
  const isMira = from === 'mira'
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, justifyContent: isMira ? 'flex-start' : 'flex-end' }}>
      {isMira && <MiraAvatar size={24} />}
      <div
        style={{
          maxWidth: '78%',
          padding: '9px 13px',
          fontSize: 14,
          fontWeight: 500,
          lineHeight: 1.45,
          color: isMira ? MIRA.content : MIRA.onAccent,
          background: isMira ? MIRA.surface : MIRA.accent,
          border: isMira ? `1px solid ${MIRA.border}` : 'none',
          borderRadius: 18,
          borderBottomLeftRadius: isMira ? 6 : 18,
          borderBottomRightRadius: isMira ? 18 : 6,
        }}
      >
        {children}
      </div>
    </div>
  )
}

// A posted emotion tag (right-aligned accent pill, droplet on a soft chip) —
// mirrors Capture's `kind: 'emotion'` user bubble.
function EmotionBubble({ id }: { id: string }) {
  const meta = getEmo(id)
  if (!meta) return null
  return (
    <div className="canvas-rise" style={{ display: 'flex', justifyContent: 'flex-end' }}>
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          padding: '6px 14px 6px 6px',
          borderRadius: 999,
          background: MIRA.accent,
          color: MIRA.onAccent,
          fontSize: 14,
          fontWeight: 700,
        }}
      >
        <span style={{ display: 'grid', placeItems: 'center', width: 28, height: 28, borderRadius: 999, background: MIRA.accentSoft }}>
          <EmotionFace id={id} size={22} />
        </span>
        {meta.label}
      </div>
    </div>
  )
}

// Compact emotion chip: droplet face BESIDE its label (Capture's EmotionOption).
function Chip({ e, selected, onClick }: { key?: string | number; e: Emo; selected: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      aria-label={e.label}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '4px 12px 4px 4px',
        borderRadius: 999,
        cursor: 'pointer',
        background: selected ? MIRA.accentSoft : MIRA.surface2,
        border: `1px solid ${selected ? MIRA.accent : 'transparent'}`,
        transition: 'background 0.12s ease, border-color 0.12s ease',
      }}
    >
      <EmotionFace id={e.id} size={22} selected={selected} />
      <span style={{ ...phoneText, fontSize: 12, fontWeight: 600, color: selected ? MIRA.accentText : MIRA.contentSoft }}>
        {e.label}
      </span>
    </button>
  )
}

// Grouped Pleasant / Unpleasant chip sections (the compact picker just shipped).
function GroupedChips({ value, onPick }: { value: string | null; onPick: (id: string) => void }) {
  const groups: { key: Group; label: string }[] = [
    { key: 'pleasant', label: 'Pleasant' },
    { key: 'unpleasant', label: 'Unpleasant' },
  ]
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {groups.map((g) => {
        const items = EMOTIONS.filter((e) => e.group === g.key)
        return (
          <section key={g.key}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6, paddingLeft: 2 }}>
              <span style={{ width: 9, height: 9, borderRadius: 999, background: GROUP_COLORS[g.key].bottom, flex: '0 0 auto' }} />
              <span style={{ ...phoneText, fontSize: 10.5, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: MIRA.contentMute }}>
                {g.label}
              </span>
              <span style={{ ...phoneText, fontSize: 10.5, fontWeight: 700, color: MIRA.contentMute, opacity: 0.7 }}>{items.length}</span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {items.map((e) => (
                <Chip key={e.id} e={e} selected={value === e.id} onClick={() => onPick(e.id)} />
              ))}
            </div>
          </section>
        )
      })}
    </div>
  )
}

// The composer row: [mic] [text field] [optional trailing] [Finish/send].
function Composer({ trailing, finish = true }: { trailing?: ReactNode; finish?: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
      <button
        type="button"
        aria-label="Record voice"
        style={{
          display: 'grid',
          placeItems: 'center',
          width: 42,
          height: 42,
          flex: '0 0 auto',
          borderRadius: 16,
          background: MIRA.surface,
          border: `1px solid ${MIRA.border}`,
          borderBottomWidth: 3,
          cursor: 'pointer',
        }}
      >
        <MicIcon color={MIRA.contentSoft} />
      </button>
      <div
        style={{
          flex: 1,
          minWidth: 0,
          minHeight: 42,
          display: 'flex',
          alignItems: 'center',
          borderRadius: 16,
          background: MIRA.surface,
          border: `1px solid ${MIRA.border}`,
          padding: '0 14px',
          fontSize: 14,
          fontWeight: 500,
          color: MIRA.contentMute,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        Write or hold the mic…
      </div>
      {trailing}
      {finish ? (
        <button
          type="button"
          aria-label="Finish entry"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 5,
            height: 42,
            flex: '0 0 auto',
            padding: '0 14px',
            borderRadius: 16,
            background: MIRA.accent,
            color: MIRA.onAccent,
            border: 'none',
            borderBottom: `3px solid ${MIRA.accentStrong}`,
            fontFamily: MIRA.display,
            fontSize: 13.5,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          <CheckIcon color={MIRA.onAccent} /> Finish
        </button>
      ) : (
        <button
          type="button"
          aria-label="Send"
          style={{
            display: 'grid',
            placeItems: 'center',
            width: 42,
            height: 42,
            flex: '0 0 auto',
            borderRadius: 16,
            background: MIRA.accent,
            border: 'none',
            borderBottom: `3px solid ${MIRA.accentStrong}`,
            cursor: 'pointer',
          }}
        >
          <ArrowUpIcon color={MIRA.onAccent} />
        </button>
      )}
    </div>
  )
}

// The floating "reset" affordance the mockups use to replay their interaction.
function Replay({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        ...phoneText,
        alignSelf: 'flex-start',
        marginTop: 2,
        background: 'transparent',
        border: 'none',
        padding: 0,
        cursor: 'pointer',
        fontSize: 11,
        fontWeight: 700,
        color: MIRA.accentText,
        textDecoration: 'underline',
        textUnderlineOffset: 2,
      }}
    >
      ↺ Replay
    </button>
  )
}

function Caption({ children }: { children: ReactNode }) {
  return <div style={{ ...phoneText, fontSize: 11.5, fontWeight: 600, color: MIRA.contentMute, lineHeight: 1.4 }}>{children}</div>
}

/* ============================ OPTION A ==================================== */
// Emoji button in the composer → popover picker anchored above it.
function OptionAMockup() {
  const [open, setOpen] = useState(false)
  const [sel, setSel] = useState<string | null>(null)
  const chosen = getEmo(sel)
  return (
    <Phone>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: 6 }}>
        <Bubble from="mira">How are you feeling today?</Bubble>
        <Bubble from="you">Honestly a bit wired, big day tomorrow.</Bubble>

        <div style={{ position: 'relative', marginTop: 2 }}>
          {open && (
            <div
              className="canvas-rise"
              role="dialog"
              aria-label="Add a feeling"
              style={{
                position: 'absolute',
                right: 0,
                bottom: '100%',
                marginBottom: 8,
                width: 264,
                background: MIRA.surface,
                border: `1px solid ${MIRA.border}`,
                borderRadius: 20,
                padding: 12,
                zIndex: 2,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, paddingLeft: 2 }}>
                <span style={{ ...phoneText, fontSize: 12, fontWeight: 700, color: MIRA.contentSoft }}>Add a feeling? (optional)</span>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Close"
                  style={{ display: 'grid', placeItems: 'center', width: 22, height: 22, borderRadius: 999, background: 'transparent', border: 'none', cursor: 'pointer' }}
                >
                  <ChevronUpIcon color={MIRA.contentMute} />
                </button>
              </div>
              <GroupedChips
                value={sel}
                onPick={(id) => {
                  setSel(id)
                  setOpen(false)
                }}
              />
              {/* little pointer toward the smiley button */}
              <div
                style={{
                  position: 'absolute',
                  right: 16,
                  top: '100%',
                  width: 12,
                  height: 12,
                  background: MIRA.surface,
                  borderRight: `1px solid ${MIRA.border}`,
                  borderBottom: `1px solid ${MIRA.border}`,
                  transform: 'translateY(-6px) rotate(45deg)',
                }}
              />
            </div>
          )}

          <Composer
            finish
            trailing={
              <button
                type="button"
                onClick={() => setOpen((o) => !o)}
                aria-label={chosen ? `Feeling tagged: ${chosen.label}. Change it` : 'Add a feeling'}
                aria-expanded={open}
                style={{
                  display: 'grid',
                  placeItems: 'center',
                  width: 42,
                  height: 42,
                  flex: '0 0 auto',
                  borderRadius: 16,
                  background: open || chosen ? MIRA.accentSoft : MIRA.surface,
                  border: `1px solid ${open ? MIRA.accent : MIRA.border}`,
                  borderBottomWidth: 3,
                  cursor: 'pointer',
                }}
              >
                {chosen ? <EmotionFace id={chosen.id} size={24} /> : <SmileIcon color={MIRA.contentSoft} />}
              </button>
            }
          />
        </div>

        <Caption>
          {chosen ? (
            <>
              Tagged <b style={{ color: MIRA.accentText }}>{chosen.label}</b> — it rides along with this entry. Tap the face to change it.
            </>
          ) : (
            <>Tap the smiley any time to name a feeling — always one tap away, no floating chrome.</>
          )}
        </Caption>
      </div>
    </Phone>
  )
}

/* ============================ OPTION B ==================================== */
// Mira invites the feeling conversationally; quick-reply chips that vanish on tap.
const QUICK_B: string[] = ['calm', 'content', 'anxious', 'sad', 'gratitude']
function OptionBMockup() {
  const [chosen, setChosen] = useState<string | null>(null)
  return (
    <Phone>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: 6 }}>
        <Bubble from="you">Tomorrow's the big presentation.</Bubble>
        <Bubble from="mira">That's a lot to hold. Want to name the feeling? (optional)</Bubble>

        {chosen ? (
          <>
            <EmotionBubble id={chosen} />
            <div className="canvas-rise">
              <Bubble from="mira">Thanks for naming it — let's sit with that for a moment.</Bubble>
            </div>
            <Replay onClick={() => setChosen(null)} />
          </>
        ) : (
          <div className="canvas-rise" style={{ display: 'flex', flexWrap: 'wrap', gap: 6, paddingLeft: 34 }}>
            {QUICK_B.map((id) => {
              const e = getEmo(id)!
              return <Chip key={id} e={e} selected={false} onClick={() => setChosen(id)} />
            })}
          </div>
        )}

        <div style={{ marginTop: 2 }}>
          <Composer finish />
        </div>

        <Caption>
          {chosen ? (
            <>The chips are gone — it posted like any reply and the thread moves on. Nothing lingers.</>
          ) : (
            <>Mira offers it in the flow; tap a chip and it posts as your reply, then the row disappears.</>
          )}
        </Caption>
      </div>
    </Phone>
  )
}

/* ============================ OPTION C ==================================== */
// Fold into the mood step: 1–5 face → optional emotion tag → collapses into chat.
type StepC = 'mood' | 'emotion' | 'done'
function OptionCMockup() {
  const [step, setStep] = useState<StepC>('mood')
  const [mood, setMood] = useState<number | null>(null)
  const [emo, setEmo] = useState<string | null>(null)

  const reset = () => {
    setStep('mood')
    setMood(null)
    setEmo(null)
  }

  return (
    <Phone>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: 6 }}>
        <Bubble from="mira">Ready when you are — how's today landing?</Bubble>

        {step === 'done' ? (
          <>
            <div className="canvas-rise" style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <div style={{ padding: '7px 14px', borderRadius: 999, background: MIRA.accent, color: MIRA.onAccent, fontSize: 14, fontWeight: 700 }}>
                Feeling {MOOD_LABELS[mood ?? 2].toLowerCase()}
              </div>
            </div>
            {emo && <EmotionBubble id={emo} />}
            <div className="canvas-rise">
              <Bubble from="mira">Got it. What's behind that today?</Bubble>
            </div>
            <Replay onClick={reset} />
          </>
        ) : (
          <div
            className="canvas-rise"
            style={{ background: MIRA.surface, border: `1px solid ${MIRA.border}`, borderRadius: 20, padding: 12 }}
          >
            {step === 'mood' ? (
              <>
                <div style={{ ...phoneText, fontSize: 11.5, fontWeight: 700, color: MIRA.accentText, marginBottom: 8, paddingLeft: 2 }}>
                  How are you feeling? Tap to begin
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 6 }}>
                  {MOOD_LABELS.map((label, i) => (
                    <button
                      key={label}
                      type="button"
                      onClick={() => {
                        setMood(i)
                        setStep('emotion')
                      }}
                      aria-label={`${label} — rate your day ${i + 1} of 5`}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 4,
                        padding: '8px 2px',
                        borderRadius: 16,
                        background: MIRA.surface2,
                        border: `1px solid ${MIRA.border}`,
                        cursor: 'pointer',
                      }}
                    >
                      <DropletFace expr={LADDER[i]} glow={MOOD_GLOW[i]} bodyTop={MOOD_BODY_TOP[i]} bodyBottom={MOOD_BODY_BOTTOM[i]} size={30} />
                      <span style={{ ...phoneText, fontSize: 10.5, fontWeight: 700, color: MIRA.content }}>{label}</span>
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                  <span style={{ ...phoneText, fontSize: 11.5, fontWeight: 700, color: MIRA.contentSoft }}>
                    Feeling {MOOD_LABELS[mood ?? 2].toLowerCase()} · add a feeling? (optional)
                  </span>
                  <button
                    type="button"
                    onClick={() => setStep('done')}
                    style={{ ...phoneText, background: 'transparent', border: 'none', padding: 0, cursor: 'pointer', fontSize: 12, fontWeight: 700, color: MIRA.accentText }}
                  >
                    Skip
                  </button>
                </div>
                <GroupedChips
                  value={emo}
                  onPick={(id) => {
                    setEmo(id)
                    setStep('done')
                  }}
                />
              </>
            )}
          </div>
        )}

        <div style={{ marginTop: 2 }}>
          <Composer finish />
        </div>

        <Caption>
          {step === 'mood' && <>It lives at the very start, once — right where the mood picker already is.</>}
          {step === 'emotion' && <>The optional tag unfolds in place, directly under the mood you just picked.</>}
          {step === 'done' && <>Both fold into the conversation and the picker is gone — the composer is clean chrome-free.</>}
        </Caption>
      </div>
    </Phone>
  )
}

/* ---------------- Analysis helpers (canvas chrome) ------------------------- */
function ProsCons({ pros, cons }: { pros: string[]; cons: string[] }) {
  const t = useHostTheme()
  const list = (items: string[], color: string, sign: string) => (
    <Stack gap={5}>
      {items.map((it, i) => (
        <div key={i}>
          <Row gap={8} align="start">
            <span style={{ color, fontWeight: 700, fontSize: 13, lineHeight: '18px', flex: '0 0 auto' }}>{sign}</span>
            <Text size="small" tone="secondary">
              {it}
            </Text>
          </Row>
        </div>
      ))}
    </Stack>
  )
  return (
    <Grid columns={2} gap={16}>
      <Stack gap={6}>
        <Text size="small" weight="semibold" style={{ color: t.category.green }}>
          Pros
        </Text>
        {list(pros, t.category.green, '+')}
      </Stack>
      <Stack gap={6}>
        <Text size="small" weight="semibold" style={{ color: t.category.red }}>
          Cons
        </Text>
        {list(cons, t.category.red, '–')}
      </Stack>
    </Grid>
  )
}

function OptionBlock({
  letter,
  title,
  tagline,
  mockup,
  pros,
  cons,
  bestFor,
}: {
  letter: string
  title: string
  tagline: string
  mockup: ReactNode
  pros: string[]
  cons: string[]
  bestFor: string
}) {
  const t = useHostTheme()
  return (
    <Stack gap={12}>
      <Row gap={10} align="center" wrap>
        <span
          style={{
            display: 'grid',
            placeItems: 'center',
            width: 24,
            height: 24,
            borderRadius: 12,
            background: t.accent.primary,
            color: t.text.onAccent,
            fontSize: 12,
            fontWeight: 700,
            flex: '0 0 auto',
          }}
        >
          {letter}
        </span>
        <H3>{title}</H3>
      </Row>
      <Text tone="tertiary" size="small">
        {tagline}
      </Text>
      <Grid columns="minmax(0, 344px) 1fr" gap={22} align="start">
        <div>{mockup}</div>
        <Stack gap={14}>
          <ProsCons pros={pros} cons={cons} />
          <Divider />
          <Row gap={8} align="start">
            <Text as="span" size="small" weight="semibold" style={{ width: 64, flex: '0 0 auto' }}>
              Best for
            </Text>
            <Text as="span" size="small" tone="secondary">
              {bestFor}
            </Text>
          </Row>
        </Stack>
      </Grid>
    </Stack>
  )
}

// The current "before" state — the orphaned floating pill above the composer.
function TodayStrip() {
  return (
    <Phone>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: 6 }}>
        <Bubble from="mira">What's on your mind today?</Bubble>
        <div style={{ paddingLeft: 4 }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 12px',
              borderRadius: 999,
              background: MIRA.surface2,
              border: `1px solid ${MIRA.border}`,
              fontSize: 12,
              fontWeight: 500,
              color: MIRA.contentSoft,
              ...phoneText,
            }}
          >
            <PlusIcon color={MIRA.contentSoft} />
            Add a feeling <span style={{ color: MIRA.contentMute }}>(optional)</span>
          </span>
        </div>
        <Composer finish />
      </div>
    </Phone>
  )
}

const RISE_CSS = `
@keyframes canvasRise { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
.canvas-rise { animation: canvasRise 0.28s ease-out both; }
@media (prefers-reduced-motion: reduce) { .canvas-rise { animation-duration: 0.001ms !important; } }
`

export default function MiraEmotionEntrypointOptions() {
  const t = useHostTheme()
  return (
    <Stack gap={24} style={{ padding: 24, maxWidth: 1080 }}>
      <style>{RISE_CSS}</style>

      <Stack gap={4}>
        <H1>Mira — where should the optional “feeling” tag live?</H1>
        <Text tone="tertiary" size="small">
          Three interactive entry points for the <Text as="span" weight="semibold">optional</Text> emotion tag, so the floating
          pill stops feeling like orphaned chrome. Exploration only · no app source changed · droplet faces, chips, and composer
          mirror <Code>src/components/*</Code>; tokens mirror <Code>src/index.css</Code>.
        </Text>
      </Stack>

      <Callout tone="warning" title="The problem — an orphaned pill">
        <Stack gap={12}>
          <Text tone="secondary" size="small">
            Today the optional tag hangs above the composer as a floating{' '}
            <Text as="span" weight="semibold">＋ Add a feeling (optional)</Text> pill. It reads as detached UI — not part of the
            conversation, not part of the composer. Each option below re-homes that same picker somewhere it feels intentional.
            Every mockup is live: tap the smiley, the chips, and the faces.
          </Text>
          <div>
            <TodayStrip />
          </div>
        </Stack>
      </Callout>

      <Divider />

      <OptionBlock
        letter="A"
        title="Emoji button in the composer"
        tagline="A smiley sits in the composer row next to Finish. Tapping it opens the grouped picker as a small popover above — always one tap away, exactly where WhatsApp / iMessage put emoji. Tap the smiley to try it."
        mockup={<OptionAMockup />}
        pros={[
          'Always available, at every point in the entry',
          'Familiar pattern — reads instantly as “add something”',
          'Zero floating chrome; the picker is summoned, not parked',
          'The chosen face replaces the smiley as a quiet confirmation',
        ]}
        cons={[
          'Adds a control to an already busy composer row',
          'A popover can crowd a small screen above the keyboard',
          'Discoverability rests on the icon being understood',
        ]}
        bestFor="People who want the feeling tag on tap at any moment, with the least new surface area and the most familiar mental model."
      />

      <Divider />

      <OptionBlock
        letter="B"
        title="Mira invites it conversationally"
        tagline="No persistent UI at all — Mira asks “Want to name the feeling? (optional)” and offers a row of quick-reply chips. Tap one and it posts as your reply, then the chips vanish. Tap a chip to see it."
        mockup={<OptionBMockup />}
        pros={[
          'Purest conversational feel — it IS the chat',
          'Ephemeral: nothing lingers once answered or ignored',
          'Feels like Mira caring, not a form to fill',
          'Naturally optional — skipping is just… not replying',
        ]}
        cons={[
          'Only offered when Mira asks — not on demand',
          'Easy to scroll past; lower capture rate likely',
          'Needs good timing logic so it isn’t naggy or repetitive',
        ]}
        bestFor="Leaning hardest into the conversational, companion feel — where the feeling is coaxed out gently rather than tracked."
      />

      <Divider />

      <OptionBlock
        letter="C"
        title="Fold into the mood step"
        tagline="It lives only at the very beginning, once. Tap a 1–5 face and an optional emotion step unfolds right there; pick one (or Skip) and the whole thing collapses into the conversation — nothing near the composer. Tap a face to walk the flow."
        mockup={<OptionCMockup />}
        pros={[
          'One clear home, next to the mood it already extends',
          'Composer stays completely clean — no persistent control',
          'Reads as step 2 of “how are you?”, a natural pairing',
          'Collapses away after — no lingering UI for the rest of the entry',
        ]}
        cons={[
          'Only offered once, up front — no later “oh, actually…”',
          'Adds a beat to the opening moment before writing',
          'Miss the window and there’s no second chance this entry',
        ]}
        bestFor="Keeping the composer pristine and treating the feeling as part of the check-in ritual, captured once at the start."
      />

      <Divider />

      <Callout tone="neutral" title="Quick read">
        <Text tone="secondary" size="small">
          <Text as="span" weight="semibold" style={{ color: t.accent.primary }}>
            A
          </Text>{' '}
          maximizes availability and familiarity;{' '}
          <Text as="span" weight="semibold" style={{ color: t.accent.primary }}>
            B
          </Text>{' '}
          maximizes the conversational, ephemeral feel;{' '}
          <Text as="span" weight="semibold" style={{ color: t.accent.primary }}>
            C
          </Text>{' '}
          maximizes a clean composer by anchoring everything to the opening mood moment. They aren’t mutually exclusive —
          A (on-demand) plus C (the ritual) pair especially well, with B’s wording as the optional nudge.
        </Text>
      </Callout>
    </Stack>
  )
}
