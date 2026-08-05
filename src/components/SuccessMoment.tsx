import { useEffect, useId, useRef } from 'react'
import { Flame } from 'lucide-react'
import type { StreakStats } from '../lib/storage'
import type { Entry } from '../types'
import { MOOD_SCORE } from '../lib/ai'
import { moodToExpression } from '../lib/mascotMood'
import Mascot from './Mascot'
import Button from './Button'
import Celebration from './Celebration'

interface Props {
  entry: Entry
  stats: StreakStats
  /** 'quiet' = calm, non-blocking reflect-back. 'milestone' = earned celebration. */
  kind: 'quiet' | 'milestone'
  /** Achievement headline for milestone mode. */
  headline: string | null
  /** Element to return focus to when a modal celebration closes (the Finish button). */
  trigger: HTMLElement | null
  onDone: () => void
  onWriteAnother: () => void
  onSeeJournal: () => void
}

const NOOP = () => {}

export default function SuccessMoment({
  entry,
  stats,
  kind,
  headline,
  trigger,
  onDone,
  onWriteAnother,
  onSeeJournal,
}: Props) {
  // The core payoff: reflect the entry back. Fall back to a warm generic line.
  const summary = entry.summary?.trim() || 'Thanks for checking in.'
  const themes = entry.themes.slice(0, 3)

  // Mood-aware, but the WORDS carry meaning — never color/expression alone.
  const score = entry.mood ? MOOD_SCORE[entry.mood] : 3
  const moodLine =
    score >= 4
      ? 'Nice one to keep.'
      : score === 3
        ? 'Noted — thanks for checking in.'
        : 'That took something. Rest easy tonight.'
  const expression = entry.mood ? moodToExpression(entry.mood) : 'calm'
  const streakLine = `Day ${stats.current} · kept`

  if (kind === 'quiet') {
    // Calm, NON-BLOCKING bottom sheet: no scrim, no confetti, no focus trap.
    return (
      <div className="absolute inset-x-0 bottom-0 z-40 px-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <div
          role="status"
          aria-live="polite"
          className="animate-rise rounded-3xl bg-surface px-5 pb-5 pt-4"
          style={{ boxShadow: 'var(--shadow-lg)' }}
        >
          <div className="flex items-center gap-2.5">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-accent-soft">
              <Mascot size={34} mood={expression} decorative />
            </div>
            <span className="text-xs font-extrabold uppercase tracking-wide text-mute">
              Mira heard
            </span>
          </div>

          <blockquote className="mt-3 font-display text-lg font-bold leading-snug text-content">
            &ldquo;{summary}&rdquo;
          </blockquote>

          {themes.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {themes.map((t) => (
                <span
                  key={t}
                  className="rounded-full bg-surface-2 px-3 py-1 text-xs font-bold text-soft"
                >
                  {t}
                </span>
              ))}
            </div>
          )}

          <p className="mt-3 text-sm font-medium text-soft">{moodLine}</p>
          <p className="mt-1 text-xs font-bold text-mute">{streakLine}</p>

          <div className="mt-4 flex items-center gap-2">
            <Button size="md" className="flex-1" onClick={onDone}>
              Done
            </Button>
            <Button variant="ghost" size="md" onClick={onSeeJournal}>
              See in journal
            </Button>
          </div>
          <button
            onClick={onWriteAnother}
            className="mt-2 w-full text-center text-xs font-bold text-mute transition hover:text-soft"
          >
            Write another
          </button>
        </div>
      </div>
    )
  }

  return (
    <MilestoneMoment
      summary={summary}
      themes={themes}
      moodLine={moodLine}
      stats={stats}
      headline={headline ?? 'Nice work.'}
      trigger={trigger}
      onDone={onDone}
      onWriteAnother={onWriteAnother}
      onSeeJournal={onSeeJournal}
    />
  )
}

interface MilestoneProps {
  summary: string
  themes: string[]
  moodLine: string
  stats: StreakStats
  headline: string
  trigger: HTMLElement | null
  onDone: () => void
  onWriteAnother: () => void
  onSeeJournal: () => void
}

/** The earned celebration — a real modal: focus trap, Esc, confetti, mascot joy. */
function MilestoneMoment({
  summary,
  themes,
  moodLine,
  stats,
  headline,
  trigger,
  onDone,
  onWriteAnother,
  onSeeJournal,
}: MilestoneProps) {
  const headlineId = useId()
  const sheetRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const sheet = sheetRef.current
    sheet?.focus()

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onDone()
        return
      }
      if (e.key !== 'Tab' || !sheet) return
      const focusables = Array.from(
        sheet.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((el) => !el.hasAttribute('disabled'))
      if (focusables.length === 0) return
      const first = focusables[0]
      const last = focusables[focusables.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }

    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      // Return focus to the triggering Finish button on close.
      trigger?.focus()
    }
  }, [onDone, trigger])

  return (
    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center px-8">
      {/* Scrim */}
      <button
        aria-label="Close"
        onClick={onDone}
        className="animate-fade-up absolute inset-0 cursor-default bg-black/40 backdrop-blur-sm"
        style={{ animationDuration: '0.2s' }}
      />

      {/* Card */}
      <div
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={headlineId}
        tabIndex={-1}
        className="animate-pop relative w-full max-w-[320px] rounded-3xl bg-surface px-6 pb-6 pt-7 text-center"
        style={{ boxShadow: 'var(--shadow-lg)' }}
      >
        <div className="mx-auto mb-3 grid h-20 w-20 place-items-center rounded-full bg-accent-soft">
          <Mascot size={64} mood="joy" decorative />
        </div>

        <h2 id={headlineId} className="font-display text-2xl font-bold text-content">
          {headline}
        </h2>

        {/* Reflect-back summary — even celebrations carry meaning. */}
        <blockquote className="mx-auto mt-2 max-w-[17rem] text-sm font-medium leading-snug text-soft">
          &ldquo;{summary}&rdquo;
        </blockquote>

        {themes.length > 0 && (
          <div className="mt-3 flex flex-wrap justify-center gap-1.5">
            {themes.map((t) => (
              <span
                key={t}
                className="rounded-full bg-surface-2 px-3 py-1 text-xs font-bold text-soft"
              >
                {t}
              </span>
            ))}
          </div>
        )}

        {/* Flame streak pill */}
        <div className="mx-auto mt-4 flex w-fit items-center gap-2 rounded-full bg-surface-2 px-4 py-2">
          <Flame size={18} className="text-flame" aria-hidden="true" />
          <span className="font-display font-bold text-content">
            {stats.current} day{stats.current === 1 ? '' : 's'} in a row
          </span>
        </div>

        {/* Last 7 days */}
        <div className="mt-4 flex justify-between px-1">
          {stats.days.map((d, i) => (
            <div key={i} className="flex flex-col items-center gap-1.5">
              <span
                className={`grid h-7 w-7 place-items-center rounded-full text-xs font-bold ${
                  d.hasEntry
                    ? 'bg-accent text-on-accent'
                    : d.isToday
                      ? 'bg-surface-2 text-soft ring-2 ring-accent'
                      : 'bg-surface-2 text-mute'
                }`}
              >
                {d.hasEntry ? '\u2713' : ''}
              </span>
              <span className="text-[10px] font-bold text-mute">{d.label}</span>
            </div>
          ))}
        </div>

        <p className="mt-4 text-sm font-medium text-soft">{moodLine}</p>

        <div className="mt-5 flex flex-col gap-2">
          <Button size="lg" onClick={onDone}>
            Done
          </Button>
          <Button variant="ghost" size="md" onClick={onSeeJournal}>
            See in journal
          </Button>
        </div>
        <button
          onClick={onWriteAnother}
          className="mt-2 w-full text-center text-xs font-bold text-mute transition hover:text-soft"
        >
          Write another
        </button>
      </div>

      {/* Confetti rains over the whole card (suppressed under reduced motion). */}
      <Celebration show onDone={NOOP} />
    </div>
  )
}
