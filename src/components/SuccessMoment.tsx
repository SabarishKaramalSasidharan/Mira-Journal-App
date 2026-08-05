import { useEffect } from 'react'
import { Flame } from 'lucide-react'
import type { StreakStats } from '../lib/storage'
import Mascot from './Mascot'
import Button from './Button'
import Celebration from './Celebration'

interface Props {
  stats: StreakStats
  extended: boolean
  firstEver: boolean
  onWriteAnother: () => void
  onSeeJournal: () => void
}

const NOOP = () => {}

export default function SuccessMoment({
  stats,
  extended,
  firstEver,
  onWriteAnother,
  onSeeJournal,
}: Props) {
  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onSeeJournal()
    }
    window.addEventListener('keydown', onEsc)
    return () => window.removeEventListener('keydown', onEsc)
  }, [onSeeJournal])

  const headline = firstEver
    ? 'Your first entry!'
    : extended
      ? 'Nice — streak extended!'
      : 'Saved'
  const sub = firstEver
    ? 'This is the start of something good.'
    : extended
      ? 'Showing up is the whole game.'
      : 'Another moment captured.'

  return (
    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center px-8">
      {/* Scrim */}
      <button
        aria-label="Close"
        onClick={onSeeJournal}
        className="animate-fade-up absolute inset-0 cursor-default bg-black/40 backdrop-blur-sm"
        style={{ animationDuration: '0.2s' }}
      />

      {/* Card */}
      <div
        role="dialog"
        aria-label="Entry saved"
        className="animate-pop relative w-full max-w-[320px] rounded-3xl bg-surface px-6 pb-6 pt-7 text-center"
        style={{ boxShadow: 'var(--shadow-lg)' }}
      >
        <div className="mx-auto mb-3 grid h-20 w-20 place-items-center rounded-full bg-accent-soft">
          <Mascot size={64} mood="joy" decorative />
        </div>

        <h2 className="font-display text-2xl font-bold text-content">{headline}</h2>
        <p className="mt-1 font-medium text-soft">{sub}</p>

        {/* Streak */}
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

        <div className="mt-6 flex flex-col gap-2">
          <Button size="lg" onClick={onWriteAnother}>
            Write another
          </Button>
          <Button variant="ghost" size="md" onClick={onSeeJournal}>
            See journal
          </Button>
        </div>
      </div>

      {/* Confetti rains over the whole card. */}
      <Celebration show onDone={NOOP} />
    </div>
  )
}
