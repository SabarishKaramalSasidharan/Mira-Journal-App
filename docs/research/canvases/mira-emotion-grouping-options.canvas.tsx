import {
  Callout,
  Card,
  CardBody,
  CardHeader,
  Code,
  Divider,
  H1,
  H2,
  Row,
  Stack,
  Text,
  useCanvasState,
  useHostTheme,
} from 'cursor/canvas'

/* ============================================================================
 * Mira — "Add a feeling?" emotion grouping options (EXPLORATION ONLY)
 *
 * A visual preview comparing two ways to color the emotion droplets by GROUP
 * instead of by 16 distinct hues. The color tells the KIND of feeling; the
 * ported mascot expression + the always-visible text label carry the specific
 * emotion (so it stays colorblind-safe). Nothing under src/ is touched — this
 * is a throwaway decision aid.
 *
 * The droplet + per-emotion expressions below are ported faithfully from
 * src/components/MoodFace.tsx; the 16 emotions/labels from src/lib/emotions.ts;
 * the Mira brand tokens (bg, surfaces, teal) from src/index.css.
 * ========================================================================== */

// ---- Mascot art constants (ported 1:1 from MoodFace.tsx) --------------------
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
  tear?: boolean
  blush?: boolean
  heart?: boolean
}

const BASE: Expr = { eyes: 'open', mouth: 'neutral', brow: 'none' }

// Per-emotion expressions, keyed by emotion id (ported from MoodFace.tsx).
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

const LABELS: Record<string, string> = {
  joy: 'Joy',
  excited: 'Excited',
  love: 'Love',
  hope: 'Hope',
  gratitude: 'Gratitude',
  content: 'Content',
  calm: 'Calm',
  sad: 'Sad',
  anxious: 'Anxious',
  lonely: 'Lonely',
  guilt: 'Guilt',
  frustrated: 'Frustrated',
  embarrassed: 'Embarrassed',
  envy: 'Envy',
  empty: 'Empty',
  bored: 'Ennui / Bored',
}

// ---- shared facial-feature primitives (ported 1:1 from MoodFace.tsx) --------

function renderEyes(type: EyeType) {
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

function renderMouth(type: MouthType) {
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

function renderBrow(type: BrowType) {
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

/**
 * The droplet face. The BODY gradient is now the GROUP color (top → bottom),
 * so the fill tells the kind of feeling; the expression carries the specific
 * emotion. `idBase` keeps the SVG gradient ids unique across the two mockups.
 */
function DropletFace({
  expr,
  bodyTop,
  bodyBottom,
  size,
  selected,
  idBase,
  ariaLabel,
}: {
  expr: Expr
  bodyTop: string
  bodyBottom: string
  size: number
  selected?: boolean
  idBase: string
  ariaLabel: string
}) {
  const bodyId = `mf-body-${idBase}`
  const glowId = `mf-glow-${idBase}`
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" role="img" aria-label={ariaLabel}>
      <defs>
        <linearGradient id={bodyId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={bodyTop} />
          <stop offset="100%" stopColor={bodyBottom} />
        </linearGradient>
        <radialGradient id={glowId} cx="50%" cy="28%" r="72%">
          <stop offset="0%" stopColor={bodyBottom} stopOpacity={selected ? 0.75 : 0.5} />
          <stop offset="70%" stopColor={bodyBottom} stopOpacity={0} />
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

// ---- Mira brand tokens (ported from src/index.css) --------------------------
interface Mira {
  bg: string
  surface: string
  surface2: string
  content: string
  contentSoft: string
  contentMute: string
  border: string
  accent: string
  accentSoft: string
}
const MIRA_LIGHT: Mira = {
  bg: '#eef4f2',
  surface: '#ffffff',
  surface2: '#f2f7f5',
  content: '#10221f',
  contentSoft: '#3f524e',
  contentMute: '#556764',
  border: '#dbe6e2',
  accent: '#10c4a9',
  accentSoft: '#dcf6f1',
}
const MIRA_DARK: Mira = {
  bg: '#0d1514',
  surface: '#16211f',
  surface2: '#1e2b28',
  content: '#ecf3f1',
  contentSoft: '#b3c3c0',
  contentMute: '#8b9d99',
  border: '#2a3833',
  accent: '#2dd4bf',
  accentSoft: '#123330',
}

// ---- Group definitions ------------------------------------------------------
interface Group {
  key: string
  label: string
  top: string
  bottom: string
  ids: string[]
}

// Option A — 3 groups by valence.
const OPTION_A: Group[] = [
  { key: 'pleasant', label: 'Pleasant', top: '#7ede9a', bottom: '#41c268', ids: ['joy', 'excited', 'love', 'hope', 'gratitude', 'content', 'calm'] },
  { key: 'difficult', label: 'Difficult', top: '#8ea6f5', bottom: '#5b7fe0', ids: ['sad', 'anxious', 'lonely', 'guilt', 'frustrated', 'embarrassed', 'envy'] },
  { key: 'lownumb', label: 'Low / Numb', top: '#aab3c2', bottom: '#8a97a8', ids: ['empty', 'bored'] },
]

// Option B — 2 groups.
const OPTION_B: Group[] = [
  { key: 'pleasant', label: 'Pleasant', top: '#7ede9a', bottom: '#41c268', ids: ['joy', 'excited', 'love', 'hope', 'gratitude', 'content', 'calm'] },
  { key: 'unpleasant', label: 'Unpleasant', top: '#93a1ba', bottom: '#7c8aa3', ids: ['sad', 'anxious', 'lonely', 'guilt', 'frustrated', 'embarrassed', 'envy', 'empty', 'bored'] },
]

// ---- Chip tile (face + label), clustered under a group subheading -----------
function Chip({
  emotionId,
  group,
  mira,
  idBase,
  selected,
  onSelect,
}: {
  emotionId: string
  group: Group
  mira: Mira
  idBase: string
  selected: boolean
  onSelect: () => void
}) {
  const expr = EXPRESSIONS[emotionId] ?? BASE
  return (
    <button
      onClick={onSelect}
      aria-pressed={selected}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 4,
        width: 74,
        padding: '8px 4px',
        borderRadius: 16,
        cursor: 'pointer',
        background: selected ? mira.accentSoft : mira.surface2,
        border: `2px solid ${selected ? mira.accent : 'transparent'}`,
        transition: 'background 0.15s ease, border-color 0.15s ease',
      }}
    >
      <DropletFace
        expr={expr}
        bodyTop={group.top}
        bodyBottom={group.bottom}
        size={40}
        selected={selected}
        idBase={idBase}
        ariaLabel={`${LABELS[emotionId]} feeling`}
      />
      <span
        style={{
          fontSize: 12,
          fontWeight: 600,
          lineHeight: '14px',
          textAlign: 'center',
          color: selected ? mira.accent : mira.contentSoft,
        }}
      >
        {LABELS[emotionId]}
      </span>
    </button>
  )
}

// ---- The "Add a feeling?" picker mockup, at phone width ---------------------
function FeelingPicker({
  groups,
  mira,
  stateKey,
  width = 372,
}: {
  groups: Group[]
  mira: Mira
  stateKey: string
  width?: number
}) {
  const [selected, setSelected] = useCanvasState<string | null>(stateKey, null)
  return (
    // The phone canvas — Mira app background.
    <div style={{ width, background: mira.bg, borderRadius: 28, padding: 12, border: `1px solid ${mira.border}` }}>
      {/* The bottom-sheet surface that the picker lives in */}
      <div style={{ background: mira.surface, borderRadius: 24, padding: 16 }}>
        <div style={{ width: 36, height: 4, borderRadius: 9999, background: mira.border, margin: '0 auto 12px' }} />
        <div style={{ fontFamily: 'ui-sans-serif, system-ui', fontSize: 18, fontWeight: 700, color: mira.content, marginBottom: 14 }}>
          Add a feeling?
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {groups.map((g) => (
            <div key={g.key}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <span style={{ width: 10, height: 10, borderRadius: 9999, background: g.bottom }} />
                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: mira.contentMute }}>
                  {g.label}
                </span>
                <span style={{ fontSize: 11, color: mira.contentMute, opacity: 0.7 }}>{g.ids.length}</span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {g.ids.map((id) => (
                  <div key={id} style={{ display: 'contents' }}>
                    <Chip
                      emotionId={id}
                      group={g}
                      mira={mira}
                      idBase={`${stateKey}-${id}`}
                      selected={selected === id}
                      onSelect={() => setSelected(selected === id ? null : id)}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ---- Legend of the group colors, for the pros/cons cards --------------------
function GroupLegend({ groups }: { groups: Group[] }) {
  return (
    <Row gap={12} wrap>
      {groups.map((g) => (
        <div key={g.key} style={{ display: 'contents' }}>
          <Row gap={6} align="center">
            <span style={{ width: 12, height: 12, borderRadius: 9999, background: g.bottom, display: 'inline-block' }} />
            <Text size="small" tone="secondary">
              {g.label}
            </Text>
          </Row>
        </div>
      ))}
    </Row>
  )
}

export default function EmotionGroupingOptions() {
  const theme = useHostTheme()
  return (
    <div style={{ padding: 24, background: theme.bg.editor, minHeight: '100%' }}>
      <Stack gap={20}>
        <Stack gap={6}>
          <H1>Mira · grouping the emotion tags by color</H1>
          <Text tone="secondary">
            Instead of 16 distinct hues (noisy), color each droplet by its <Text as="span" weight="semibold">group</Text> —
            the color tells the kind of feeling, while the mascot expression and the always-visible label give the
            specific emotion. Chips are clustered under small group subheadings. Tap a chip to preview selection.
            Exploration only — nothing under <Code>src/</Code> is changed.
          </Text>
        </Stack>

        {/* The two live mockups, side by side at phone width */}
        <Row gap={24} wrap align="start">
          <Stack gap={12}>
            <H2>Option A — 3 groups (by valence)</H2>
            <GroupLegend groups={OPTION_A} />
            <FeelingPicker groups={OPTION_A} mira={MIRA_LIGHT} stateKey="optA-light" />
          </Stack>

          <Stack gap={12}>
            <H2>Option B — 2 groups</H2>
            <GroupLegend groups={OPTION_B} />
            <FeelingPicker groups={OPTION_B} mira={MIRA_LIGHT} stateKey="optB-light" />
          </Stack>
        </Row>

        {/* Pros / cons */}
        <Row gap={16} wrap align="stretch">
          <Card style={{ flex: '1 1 340px' }}>
            <CardHeader trailing="3 colors">Option A · pros &amp; cons</CardHeader>
            <CardBody>
              <Stack gap={8}>
                <Text size="small">
                  <Text as="span" weight="semibold">Pros — </Text>
                  more nuance; separates active distress (Difficult / blue) from flat low-energy (Low·Numb / grey);
                  three calm colors map cleanly onto how the feeling actually reads.
                </Text>
                <Text size="small" tone="secondary">
                  <Text as="span" weight="semibold">Cons — </Text>
                  one extra color to learn; the Difficult bucket is broad (Anxious sits beside Envy and Frustrated).
                </Text>
              </Stack>
            </CardBody>
          </Card>

          <Card style={{ flex: '1 1 340px' }}>
            <CardHeader trailing="2 colors">Option B · pros &amp; cons</CardHeader>
            <CardBody>
              <Stack gap={8}>
                <Text size="small">
                  <Text as="span" weight="semibold">Pros — </Text>
                  the calmest, cleanest scan; only two colors; a crisp Pleasant / Unpleasant split.
                </Text>
                <Text size="small" tone="secondary">
                  <Text as="span" weight="semibold">Cons — </Text>
                  lumps numb / Empty in with Anxious and Sad, so the low-energy vs. distress distinction is lost to color
                  (only the face + label carry it).
                </Text>
              </Stack>
            </CardBody>
          </Card>
        </Row>

        {/* Dark-theme preview */}
        <Stack gap={12}>
          <H2>Dark theme — Option A</H2>
          <Text tone="secondary" size="small">
            The same group bodies on Mira&apos;s dark surface; the dark mascot ink stays legible on both themes.
          </Text>
          <FeelingPicker groups={OPTION_A} mira={MIRA_DARK} stateKey="optA-dark" />
        </Stack>

        <Divider />

        {/* Accessibility / contrast note */}
        <Callout tone="info" title="Contrast &amp; colorblind safety">
          <Stack gap={6}>
            <Text size="small">
              The dark mascot ink (<Code>#0b3b36</Code>) sits on the lighter crown of each group body, where it clears
              WCAG AA (≥ 4.5:1) against the Pleasant green, the Difficult blue, the Low·Numb slate, and Option B&apos;s
              muted blue-grey — the same mid-tone rationale the app already uses for the per-emotion fills.
            </Text>
            <Text size="small" tone="secondary">
              Color never carries meaning alone: within a group, emotions are told apart by the mascot expression (brow /
              eyes / mouth) plus the always-visible text label, so the grouping stays colorblind-safe.
            </Text>
          </Stack>
        </Callout>

        {/* Recommendation */}
        <Callout tone="neutral" title="Recommendation">
          <Text size="small">
            Leaning <Text as="span" weight="semibold">Option A</Text> — three colors keep numb / low apart from active
            distress with almost no added noise. Option B is the safer pick if you want the absolute quietest picker.
            Both are solid; your call.
          </Text>
        </Callout>
      </Stack>
    </div>
  )
}
