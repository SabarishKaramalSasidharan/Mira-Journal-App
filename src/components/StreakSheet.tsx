import { useEffect } from 'react'
import { Flame, X } from 'lucide-react'
import { nextMilestone, type StreakStats } from '../lib/storage'

interface Props {
  stats: StreakStats
  onClose: () => void
}

/** A bottom sheet that gives the streak a real home: current run, personal
 *  best, the last 7 days at a glance, and the next milestone to aim for. */
export default function StreakSheet({ stats, onClose }: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const { current, best, loggedToday, days } = stats
  const target = nextMilestone(current)
  const progress = Math.min(100, Math.round((current / target) * 100))

  const headline =
    current === 0
      ? 'Start your streak'
      : loggedToday
        ? 'You’re on a roll'
        : 'Keep it alive today'
  const sub =
    current === 0
      ? 'Write one entry today to light the flame.'
      : loggedToday
        ? `Come back tomorrow to make it ${current + 1}.`
        : 'One entry today keeps your streak going.'

  return (
    <div className="absolute inset-0 z-40 flex flex-col justify-end">
      {/* Scrim */}
      <button
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-black/40 animate-fade-up"
        style={{ animationDuration: '0.2s' }}
      />

      {/* Sheet */}
      <div
        role="dialog"
        aria-label="Your streak"
        className="animate-fade-up relative rounded-t-3xl bg-surface px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-3"
        style={{ boxShadow: 'var(--shadow-lg)' }}
      >
        <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-border" aria-hidden="true" />
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 grid h-8 w-8 place-items-center rounded-full text-soft transition hover:bg-surface-2 active:scale-90"
        >
          <X size={18} aria-hidden="true" />
        </button>

        {/* Hero */}
        <div className="flex flex-col items-center pb-5 pt-2 text-center">
          <div
            className="mb-3 grid h-20 w-20 place-items-center rounded-full"
            style={{ background: 'color-mix(in srgb, var(--flame) 16%, transparent)' }}
          >
            <Flame size={40} className="text-flame" aria-hidden="true" />
          </div>
          <div className="font-display text-5xl font-bold text-content">
            {current}
            <span className="sr-only"> day streak</span>
          </div>
          <div className="mt-0.5 text-sm font-bold text-soft">
            day{current === 1 ? '' : 's'} in a row
          </div>
          <h2 className="mt-3 font-display text-lg font-bold text-content">{headline}</h2>
          <p className="mt-0.5 max-w-[16rem] text-sm font-medium text-soft">{sub}</p>
        </div>

        {/* Last 7 days */}
        <div className="mb-3 rounded-2xl bg-surface-2 p-4">
          <div className="mb-3 text-xs font-extrabold uppercase tracking-wide text-mute">
            Last 7 days
          </div>
          <div className="flex justify-between">
            {days.map((d, i) => (
              <div key={i} className="flex flex-col items-center gap-1.5">
                <div
                  className={`grid h-9 w-9 place-items-center rounded-full transition ${
                    d.hasEntry ? 'text-on-accent' : 'text-mute'
                  } ${d.isToday && !d.hasEntry ? 'ring-2 ring-accent' : ''}`}
                  style={{ background: d.hasEntry ? 'var(--flame)' : 'var(--surface)' }}
                >
                  {d.hasEntry ? (
                    <Flame size={16} aria-hidden="true" />
                  ) : (
                    <span className="h-1.5 w-1.5 rounded-full bg-border" aria-hidden="true" />
                  )}
                </div>
                <span className="text-[11px] font-bold text-mute">{d.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Best + next milestone */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-surface-2 p-4">
            <div className="font-display text-2xl font-bold text-content">{best}</div>
            <div className="mt-0.5 text-xs font-semibold text-mute">personal best</div>
          </div>
          <div className="rounded-2xl bg-surface-2 p-4">
            <div className="font-display text-2xl font-bold text-content">{target}</div>
            <div className="mt-0.5 text-xs font-semibold text-mute">next milestone</div>
          </div>
        </div>
        <div className="mt-3">
          <div className="h-2.5 overflow-hidden rounded-full bg-surface-2">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${progress}%`,
                background: 'linear-gradient(90deg, var(--flame), var(--gold))',
              }}
            />
          </div>
          <p className="mt-2 text-center text-xs font-semibold text-mute">
            {current >= target
              ? 'Milestone reached — incredible.'
              : `${target - current} more day${target - current === 1 ? '' : 's'} to ${target}`}
          </p>
        </div>
      </div>
    </div>
  )
}
