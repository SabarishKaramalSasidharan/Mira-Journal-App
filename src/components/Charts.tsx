import { useMemo, useState } from 'react'
import { ChevronRight } from 'lucide-react'
import { MOODS, type Mood } from '../types'
import type { Entry } from '../types'
import { moodSeriesRange, type MoodRange, type ThemeCount } from '../lib/ai'
import { emotionCounts } from '../lib/emotions'
import { EmotionFace } from './MoodFace'

const SCORE_MOOD: Mood[] = ['rough', 'low', 'okay', 'good', 'great']
const moodForScore = (s: number) => SCORE_MOOD[Math.max(0, Math.min(4, Math.round(s) - 1))]
const labelForScore = (s: number) => MOODS.find((m) => m.key === moodForScore(s))?.label ?? ''
const emojiFor = (k: Mood) => MOODS.find((m) => m.key === k)?.emoji ?? ''

const RANGES: { key: MoodRange; label: string }[] = [
  { key: 7, label: '7D' },
  { key: 30, label: '30D' },
  { key: 90, label: '90D' },
  { key: 'all', label: 'All' },
]

function moodSentiment(avg: number): string {
  if (avg >= 4) return 'Mostly bright — a good stretch.'
  if (avg >= 3) return 'Steady overall.'
  if (avg >= 2) return 'A heavier stretch — be gentle with yourself.'
  return 'A tough stretch. Reaching out can help.'
}

export function MoodTrend({ entries }: { entries: Entry[] }) {
  const [range, setRange] = useState<MoodRange>(7)
  const [sel, setSel] = useState<number | null>(null)

  const { points, avg, logged, bucket } = useMemo(
    () => moodSeriesRange(entries, range),
    [entries, range],
  )

  const pickRange = (r: MoodRange) => {
    setRange(r)
    setSel(null)
  }

  const W = 320
  const H = 128
  const padX = 26
  const padY = 16
  const innerW = W - padX * 2
  const innerH = H - padY * 2
  const step = points.length > 1 ? innerW / (points.length - 1) : 0

  const x = (i: number) => padX + i * step
  const y = (score: number) => padY + innerH - ((score - 1) / 4) * innerH

  const pts = points
    .map((d, i) => (d.score == null ? null : { x: x(i), y: y(d.score) }))
    .filter(Boolean) as { x: number; y: number }[]

  const line = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ')
  const area =
    pts.length > 1
      ? `${line} L${pts[pts.length - 1].x},${padY + innerH} L${pts[0].x},${padY + innerH} Z`
      : ''

  // Thin the axis labels so long ranges don't collide.
  const n = points.length
  const labelEvery = Math.max(1, Math.ceil(n / 6))
  const showLabel = (i: number) => i === 0 || i === n - 1 || i % labelEvery === 0
  const dotR = n > 20 ? 2.5 : n > 10 ? 3 : 4

  const unit = bucket === 'week' ? 'week' : 'day'
  const loggedLabel = `${logged} ${unit}${logged === 1 ? '' : 's'} logged`

  return (
    <div className="rounded-2xl bg-surface p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="text-xs font-semibold uppercase tracking-wide text-mute">Mood</div>
        {/* Range filter */}
        <div className="flex gap-0.5 rounded-lg bg-surface-2 p-0.5" role="group" aria-label="Time range">
          {RANGES.map((r) => (
            <button
              key={String(r.key)}
              onClick={() => pickRange(r.key)}
              aria-pressed={range === r.key}
              className={`rounded-md px-2.5 py-1 text-xs font-semibold transition ${
                range === r.key
                  ? 'bg-surface text-content shadow-sm'
                  : 'text-mute hover:text-soft'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {logged === 0 ? (
        <p className="py-8 text-center font-medium text-mute">
          No moods logged in this range yet.
        </p>
      ) : (
        <>
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Mood trend">
            <defs>
              <linearGradient id="moodFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.28" />
                <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
              </linearGradient>
            </defs>
            {[1, 3, 5].map((g) => (
              <line key={g} x1={padX} x2={W - padX} y1={y(g)} y2={y(g)} stroke="var(--border)" />
            ))}
            {/* Mood scale so vertical position has meaning */}
            <text x={4} y={y(5) + 4} fontSize={11}>
              {emojiFor('great')}
            </text>
            <text x={4} y={y(1) + 4} fontSize={11}>
              {emojiFor('rough')}
            </text>
            {area && <path d={area} fill="url(#moodFill)" />}
            {line && (
              <path
                d={line}
                fill="none"
                stroke="var(--accent)"
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}
            {points.map((d, i) =>
              d.score == null ? null : (
                <circle
                  key={i}
                  cx={x(i)}
                  cy={y(d.score)}
                  r={sel === i ? dotR + 3 : dotR}
                  fill={sel === i ? `var(--mood-${moodForScore(d.score)})` : 'var(--surface)'}
                  stroke={`var(--mood-${moodForScore(d.score)})`}
                  strokeWidth={2.5}
                  style={{ cursor: 'pointer' }}
                  onClick={() => setSel(sel === i ? null : i)}
                >
                  <title>{`${d.full}: ${labelForScore(d.score)}`}</title>
                </circle>
              ),
            )}
            {points.map((d, i) =>
              showLabel(i) ? (
                <text
                  key={i}
                  x={x(i)}
                  y={H - 3}
                  textAnchor="middle"
                  fontSize={9}
                  fontWeight={700}
                  fill={sel === i ? 'var(--content)' : 'var(--content-mute)'}
                >
                  {d.label}
                </text>
              ) : null,
            )}
          </svg>

          {/* Summary row + tap-to-inspect caption */}
          <div className="mt-1 border-t border-border pt-3">
            {sel != null && points[sel]?.score != null ? (
              <p className="flex items-center gap-2 text-sm font-medium text-content">
                <span className="text-base">{emojiFor(moodForScore(points[sel].score as number))}</span>
                {points[sel].full} · felt {labelForScore(points[sel].score as number).toLowerCase()}
              </p>
            ) : (
              <div className="flex items-center justify-between gap-3">
                <p className="flex items-center gap-2 text-sm font-medium text-content">
                  {avg != null && (
                    <span className="text-base">{emojiFor(moodForScore(avg))}</span>
                  )}
                  {avg != null ? moodSentiment(avg) : 'Tap a point to see that day.'}
                </p>
                <span className="shrink-0 text-xs font-semibold text-mute">{loggedLabel}</span>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

/**
 * "Emotions you felt" — a simple frequency breakdown of the optional emotion
 * tags (independent of the 1–5 valence trend above). Renders nothing until at
 * least one entry carries an emotion, so it stays out of the way otherwise.
 * Each row pairs the mascot face + text label + count (never color alone).
 */
export function EmotionBreakdown({ entries }: { entries: Entry[] }) {
  const data = emotionCounts(entries)
  if (data.length === 0) return null
  const maxCount = Math.max(...data.map((d) => d.count))

  return (
    <div className="rounded-2xl bg-surface p-4 shadow-sm">
      <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-mute">
        Emotions you felt
      </div>
      <p className="mb-3 text-xs font-medium text-mute">The feelings you tagged, most often first.</p>
      <div className="space-y-1">
        {data.map((d) => (
          <div key={d.emotion.id} className="flex items-center gap-3 px-1.5 py-1">
            <EmotionFace emotion={d.emotion.id} size={26} decorative />
            <span className="w-24 shrink-0 truncate text-sm font-semibold text-content">
              {d.emotion.label}
            </span>
            <div className="h-3 flex-1 overflow-hidden rounded-full bg-surface-2">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${12 + (d.count / maxCount) * 88}%`, background: d.emotion.color }}
              />
            </div>
            <span className="w-4 text-right text-xs font-semibold text-mute">{d.count}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function ThemeBars({
  data,
  onSelect,
}: {
  data: ThemeCount[]
  onSelect?: (theme: string) => void
}) {
  if (data.length === 0) return null
  const maxCount = Math.max(...data.map((d) => d.count))
  const minCount = Math.min(...data.map((d) => d.count))
  // Bars only communicate when counts differ. If everything came up the same
  // number of times, show honest tappable chips instead of misleading full bars.
  const hasVariance = maxCount > minCount

  return (
    <div className="rounded-2xl bg-surface p-4 shadow-sm">
      <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-mute">
        What kept coming up
      </div>
      <p className="mb-3 text-xs font-medium text-mute">Tap a theme to read those entries.</p>

      {hasVariance ? (
        <div className="space-y-1">
          {data.map((d) => (
            <button
              key={d.theme}
              onClick={() => onSelect?.(d.theme)}
              disabled={!onSelect}
              className="flex w-full items-center gap-3 rounded-lg px-1.5 py-1.5 text-left transition hover:bg-surface-2 active:scale-[0.99] disabled:pointer-events-none"
            >
              <span className="w-24 shrink-0 truncate text-sm font-semibold text-content">#{d.theme}</span>
              <div className="h-3 flex-1 overflow-hidden rounded-full bg-surface-2">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${12 + (d.count / maxCount) * 88}%`,
                    background: 'linear-gradient(90deg, var(--accent-strong), var(--accent))',
                  }}
                />
              </div>
              <span className="w-4 text-right text-xs font-semibold text-mute">{d.count}</span>
              {onSelect && <ChevronRight size={15} className="text-mute" aria-hidden="true" />}
            </button>
          ))}
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {data.map((d) => (
            <button
              key={d.theme}
              onClick={() => onSelect?.(d.theme)}
              disabled={!onSelect}
              className="flex items-center gap-1 rounded-full bg-accent-soft px-3 py-1.5 text-sm font-semibold text-accent-text transition hover:brightness-95 active:scale-95 disabled:pointer-events-none"
            >
              #{d.theme}
              {d.count > 1 && <span className="text-xs opacity-70">×{d.count}</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
