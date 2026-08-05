import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface Props {
  value: Date
  max?: Date
  onSelect: (d: Date) => void
  onClose: () => void
}

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

const midnight = (d: Date) => {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x
}
const sameDay = (a: Date, b: Date) => midnight(a).getTime() === midnight(b).getTime()
const startOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1)

/**
 * A compact month-grid calendar shown in a popover. Selected day and today are
 * highlighted; days after `max` are disabled so you can't journal the future.
 */
export default function DatePicker({ value, max, onSelect, onClose }: Props) {
  const today = midnight(new Date())
  const maxDay = max ? midnight(max) : today
  const [view, setView] = useState(() => startOfMonth(value))

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const year = view.getFullYear()
  const month = view.getMonth()
  const firstWeekday = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const canPrev = true
  const canNext = startOfMonth(view).getTime() < startOfMonth(maxDay).getTime()

  const cells: (Date | null)[] = []
  for (let i = 0; i < firstWeekday; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d))

  return (
    <>
      {/* Click-away layer */}
      <button
        aria-label="Close calendar"
        onClick={onClose}
        className="fixed inset-0 z-40 cursor-default"
        tabIndex={-1}
      />

      <div
        role="dialog"
        aria-label="Choose a date"
        className="absolute left-1/2 top-full z-50 mt-2 w-[280px] -translate-x-1/2 rounded-2xl border border-border bg-surface p-3"
        style={{ boxShadow: 'var(--shadow-lg)' }}
      >
        {/* Month header */}
        <div className="mb-2 flex items-center justify-between">
          <button
            onClick={() => setView(new Date(year, month - 1, 1))}
            disabled={!canPrev}
            aria-label="Previous month"
            className="grid h-8 w-8 place-items-center rounded-full text-soft transition hover:bg-surface-2 active:scale-90 disabled:opacity-30"
          >
            <ChevronLeft size={18} aria-hidden="true" />
          </button>
          <div className="text-sm font-extrabold text-content">
            {MONTHS[month]} {year}
          </div>
          <button
            onClick={() => setView(new Date(year, month + 1, 1))}
            disabled={!canNext}
            aria-label="Next month"
            className="grid h-8 w-8 place-items-center rounded-full text-soft transition hover:bg-surface-2 active:scale-90 disabled:opacity-30"
          >
            <ChevronRight size={18} aria-hidden="true" />
          </button>
        </div>

        {/* Weekday labels */}
        <div className="mb-1 grid grid-cols-7 gap-1">
          {WEEKDAYS.map((w, i) => (
            <div key={i} className="grid h-7 place-items-center text-[11px] font-bold text-mute">
              {w}
            </div>
          ))}
        </div>

        {/* Day grid */}
        <div className="grid grid-cols-7 gap-1">
          {cells.map((d, i) => {
            if (!d) return <div key={i} />
            const isSelected = sameDay(d, value)
            const isToday = sameDay(d, today)
            const isFuture = midnight(d).getTime() > maxDay.getTime()
            return (
              <button
                key={i}
                onClick={() => !isFuture && onSelect(d)}
                disabled={isFuture}
                aria-label={d.toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
                aria-current={isSelected ? 'date' : undefined}
                className={`relative grid h-9 w-9 place-items-center rounded-full text-sm font-bold transition active:scale-90 disabled:cursor-not-allowed disabled:opacity-25 ${
                  isSelected
                    ? 'bg-accent text-on-accent shadow-sm'
                    : 'text-content hover:bg-surface-2'
                }`}
              >
                {d.getDate()}
                {isToday && !isSelected && (
                  <span className="absolute bottom-1 h-1 w-1 rounded-full bg-accent" aria-hidden="true" />
                )}
              </button>
            )
          })}
        </div>
      </div>
    </>
  )
}
