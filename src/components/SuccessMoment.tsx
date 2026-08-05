import { useEffect, useId, useRef, type RefObject } from 'react'
import type { StreakStats } from '../lib/storage'
import type { Entry } from '../types'
import { MOOD_SCORE } from '../lib/ai'
import Mascot from './Mascot'
import Button from './Button'
import Celebration from './Celebration'

interface Props {
  entry: Entry
  stats: StreakStats
  /** 'quiet' = simple positive confirmation. 'milestone' = earned celebration. */
  kind: 'quiet' | 'milestone'
  /** Achievement headline for milestone mode. */
  headline: string | null
  /** Element to return focus to when the modal closes (the Finish button). */
  trigger: HTMLElement | null
  /** Primary "Close" — dismiss and stay on the Journal tab. */
  onDone: () => void
  /** Secondary "Write again" — start a fresh entry on the Write tab. */
  onWriteAnother: () => void
}

const NOOP = () => {}

/**
 * Modal focus management shared by both confirmations: move focus into the
 * card, trap Tab, close on Esc, and return focus to the trigger on unmount.
 */
function useModalFocus(
  ref: RefObject<HTMLDivElement | null>,
  onClose: () => void,
  trigger: HTMLElement | null,
) {
  useEffect(() => {
    const sheet = ref.current
    sheet?.focus()

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
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
  }, [ref, onClose, trigger])
}

export default function SuccessMoment({
  entry,
  stats,
  kind,
  headline,
  trigger,
  onDone,
  onWriteAnother,
}: Props) {
  if (kind === 'quiet') {
    return (
      <QuietMoment trigger={trigger} onDone={onDone} onWriteAnother={onWriteAnother} />
    )
  }

  // Milestone keeps a warm, mood-aware one-liner under the achievement headline.
  const score = entry.mood ? MOOD_SCORE[entry.mood] : 3
  const moodLine =
    score >= 4
      ? 'Nice one to keep.'
      : score === 3
        ? 'Noted — thanks for checking in.'
        : 'That took something. Rest easy tonight.'

  return (
    <MilestoneMoment
      moodLine={moodLine}
      stats={stats}
      headline={headline ?? 'Nice work.'}
      trigger={trigger}
      onDone={onDone}
      onWriteAnother={onWriteAnother}
    />
  )
}

interface QuietProps {
  trigger: HTMLElement | null
  onDone: () => void
  onWriteAnother: () => void
}

/** The ordinary-finish confirmation — a calm, centered popup over the Journal. */
function QuietMoment({ trigger, onDone, onWriteAnother }: QuietProps) {
  const headlineId = useId()
  const sheetRef = useRef<HTMLDivElement>(null)
  useModalFocus(sheetRef, onDone, trigger)

  return (
    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center px-8">
      {/* Light scrim */}
      <button
        aria-label="Close"
        onClick={onDone}
        className="animate-fade-up absolute inset-0 cursor-default bg-black/30 backdrop-blur-sm"
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

        <h2 id={headlineId} className="font-display text-2xl font-semibold text-content">
          Saved to your journal
        </h2>

        <p className="mt-1 text-sm font-medium text-soft">
          Another moment captured — nicely done.
        </p>

        <div className="mt-6 flex flex-col gap-2">
          <Button size="lg" onClick={onDone}>
            Close
          </Button>
          <Button variant="ghost" size="md" onClick={onWriteAnother}>
            Write again
          </Button>
        </div>
      </div>
    </div>
  )
}

interface MilestoneProps {
  moodLine: string
  stats: StreakStats
  headline: string
  trigger: HTMLElement | null
  onDone: () => void
  onWriteAnother: () => void
}

/** The earned celebration — a real modal: focus trap, Esc, confetti, mascot joy. */
function MilestoneMoment({
  moodLine,
  stats,
  headline,
  trigger,
  onDone,
  onWriteAnother,
}: MilestoneProps) {
  const headlineId = useId()
  const sheetRef = useRef<HTMLDivElement>(null)
  useModalFocus(sheetRef, onDone, trigger)

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

        <h2 id={headlineId} className="font-display text-2xl font-semibold text-content">
          {headline}
        </h2>

        <p className="mt-1 text-sm font-medium text-soft">{moodLine}</p>

        {/* Last 7 days — the visual proof of the streak (the headline already names it). */}
        <div className="mt-5 flex justify-between px-1">
          {stats.days.map((d, i) => (
            <div key={i} className="flex flex-col items-center gap-1.5">
              <span
                className={`grid h-7 w-7 place-items-center rounded-full text-xs font-semibold ${
                  d.hasEntry
                    ? 'bg-accent text-on-accent'
                    : d.isToday
                      ? 'bg-surface-2 text-soft ring-2 ring-accent'
                      : 'bg-surface-2 text-mute'
                }`}
              >
                {d.hasEntry ? '\u2713' : ''}
              </span>
              <span className="text-[10px] font-semibold text-mute">{d.label}</span>
            </div>
          ))}
        </div>

        <div className="mt-6 flex flex-col gap-2">
          <Button size="lg" onClick={onDone}>
            Close
          </Button>
          <Button variant="ghost" size="md" onClick={onWriteAnother}>
            Write again
          </Button>
        </div>
      </div>

      {/* Confetti rains over the whole card (suppressed under reduced motion). */}
      <Celebration show onDone={NOOP} />
    </div>
  )
}
