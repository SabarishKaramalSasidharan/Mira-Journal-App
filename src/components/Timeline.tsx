import { useEffect, useState } from 'react'
import { ChevronDown, Search, X } from 'lucide-react'
import type { Entry, Mood } from '../types'
import { MOODS } from '../types'
import Mascot from './Mascot'
import Button from './Button'

interface Props {
  entries: Entry[]
  onNew: () => void
  onOpen?: (entry: Entry) => void
  filterTheme?: string | null
  onSelectTheme?: (theme: string) => void
  onClearFilter?: () => void
}

function matches(e: Entry, q: string) {
  const hay = [e.summary, ...e.themes, ...e.turns.map((t) => t.text)].join(' ').toLowerCase()
  return hay.includes(q)
}

const MOOD_VAR: Record<Mood, string> = {
  rough: 'var(--mood-rough)',
  low: 'var(--mood-low)',
  okay: 'var(--mood-okay)',
  good: 'var(--mood-good)',
  great: 'var(--mood-great)',
}

function moodEmoji(entry: Entry) {
  return MOODS.find((m) => m.key === entry.mood)?.emoji ?? '📝'
}

function when(ts: number) {
  const d = new Date(ts)
  const today = new Date().toDateString()
  const yest = new Date(Date.now() - 864e5).toDateString()
  const day =
    d.toDateString() === today
      ? 'Today'
      : d.toDateString() === yest
        ? 'Yesterday'
        : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  return `${day} · ${d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`
}

function monthKey(ts: number) {
  const d = new Date(ts)
  return `${d.getFullYear()}-${d.getMonth()}`
}

function monthLabel(ts: number) {
  return new Date(ts).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}

function monthPill(ts: number) {
  const d = new Date(ts)
  return `${d.toLocaleDateString('en-US', { month: 'short' })} '${String(d.getFullYear()).slice(2)}`
}

interface Group {
  key: string
  label: string
  pill: string
  entries: Entry[]
}

function groupByMonth(list: Entry[]): Group[] {
  const groups: Group[] = []
  const index = new Map<string, number>()
  for (const e of list) {
    const k = monthKey(e.createdAt)
    let i = index.get(k)
    if (i === undefined) {
      i = groups.length
      index.set(k, i)
      groups.push({ key: k, label: monthLabel(e.createdAt), pill: monthPill(e.createdAt), entries: [] })
    }
    groups[i].entries.push(e)
  }
  return groups
}

function parseMonthKey(key: string) {
  const [year, month] = key.split('-').map(Number)
  return { year, month }
}

function monthKeyLabel(key: string) {
  const { year, month } = parseMonthKey(key)
  return new Date(year, month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}

function monthKeyName(key: string) {
  const { year, month } = parseMonthKey(key)
  return new Date(year, month).toLocaleDateString('en-US', { month: 'long' })
}

/**
 * Compact month + year dropdown that filters the entry list. Options are derived
 * from the months that actually have entries, grouped by year (newest first),
 * with a scrollable menu so it scales across many years.
 */
function MonthFilter({
  groups,
  value,
  onChange,
}: {
  groups: Group[]
  value: string | null
  onChange: (key: string | null) => void
}) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  const sortValue = (key: string) => {
    const { year, month } = parseMonthKey(key)
    return year * 12 + month
  }
  const sorted = [...groups].sort((a, b) => sortValue(b.key) - sortValue(a.key))

  const byYear = new Map<string, Group[]>()
  for (const g of sorted) {
    const year = String(parseMonthKey(g.key).year)
    const bucket = byYear.get(year)
    if (bucket) bucket.push(g)
    else byYear.set(year, [g])
  }
  const years = [...byYear.keys()]

  const itemClass = (active: boolean) =>
    `flex w-full items-center rounded-md px-3 py-2 text-left text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 ${
      active ? 'bg-accent text-on-accent' : 'text-content hover:bg-surface-2'
    }`

  return (
    <div className="relative mt-3">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Filter by month"
        className="flex items-center gap-1.5 rounded-lg bg-surface px-3 py-1.5 text-sm font-semibold text-soft shadow-sm transition hover:text-content active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
      >
        <span>{value ? monthKeyLabel(value) : 'All months'}</span>
        <ChevronDown
          size={15}
          aria-hidden="true"
          className={`transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <>
          {/* Click-away layer */}
          <button
            aria-label="Close month filter"
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-40 cursor-default"
            tabIndex={-1}
          />
          <div
            role="listbox"
            aria-label="Filter by month"
            className="absolute left-0 top-full z-50 mt-2 max-h-72 w-56 overflow-y-auto rounded-lg border border-border bg-surface p-1.5"
            style={{ boxShadow: 'var(--shadow-lg)' }}
          >
            <button
              role="option"
              aria-selected={value === null}
              onClick={() => {
                onChange(null)
                setOpen(false)
              }}
              className={itemClass(value === null)}
            >
              All months
            </button>
            {years.map((year) => (
              <div key={year}>
                <div className="px-3 pt-2 pb-1 text-[11px] font-semibold text-mute">{year}</div>
                {byYear.get(year)!.map((g) => (
                  <button
                    key={g.key}
                    role="option"
                    aria-selected={value === g.key}
                    onClick={() => {
                      onChange(g.key)
                      setOpen(false)
                    }}
                    className={itemClass(value === g.key)}
                  >
                    {monthKeyName(g.key)}
                  </button>
                ))}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export default function Timeline({
  entries,
  onNew,
  onOpen,
  filterTheme,
  onSelectTheme,
  onClearFilter,
}: Props) {
  const [query, setQuery] = useState('')
  const [moodFilter, setMoodFilter] = useState<Mood | null>(null)
  const [monthFilter, setMonthFilter] = useState<string | null>(null)

  if (entries.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 px-8 text-center">
        <Mascot size={88} className="animate-bob" mood="calm" decorative />
        <h2 className="font-display text-2xl font-semibold text-content">Nothing here yet</h2>
        <p className="max-w-xs font-medium text-soft">
          Your entries live here. Start your first one — it takes less than a minute.
        </p>
        <Button className="mt-2 !w-auto" onClick={onNew}>
          Start writing
        </Button>
      </div>
    )
  }

  const q = query.trim().toLowerCase()
  const byTheme = filterTheme ? entries.filter((e) => e.themes.includes(filterTheme)) : entries
  const monthGroups = groupByMonth(byTheme)
  const byMonth = monthFilter ? byTheme.filter((e) => monthKey(e.createdAt) === monthFilter) : byTheme
  const byMood = moodFilter ? byMonth.filter((e) => e.mood === moodFilter) : byMonth
  const shown = q ? byMood.filter((e) => matches(e, q)) : byMood
  const groups = groupByMonth(shown)

  return (
    <div className="flex h-full flex-col">
      <div className="shrink-0 bg-bg px-5 pt-6 pb-2">
        {filterTheme ? (
          <div className="mb-3 flex items-center justify-between gap-2">
            <div className="min-w-0">
              <div className="text-xs font-semibold text-mute">
                {shown.length} {shown.length === 1 ? 'entry' : 'entries'}
              </div>
              <h2 className="truncate font-display text-2xl font-semibold text-content">#{filterTheme}</h2>
            </div>
            <button
              onClick={onClearFilter}
              className="flex shrink-0 items-center gap-1 rounded-full bg-surface px-3 py-1.5 text-sm font-semibold text-soft shadow-sm transition active:scale-95"
            >
              <X size={15} aria-hidden="true" /> Clear
            </button>
          </div>
        ) : (
          <h2 className="mb-3 font-display text-2xl font-semibold text-content">Your journal</h2>
        )}

        <div className="flex items-center gap-2 rounded-lg bg-surface px-3 py-2.5 shadow-sm focus-within:ring-2 focus-within:ring-accent/50">
          <Search size={17} className="shrink-0 text-mute" aria-hidden="true" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search your entries…"
            aria-label="Search your entries"
            className="min-w-0 flex-1 bg-transparent text-sm font-medium text-content outline-none placeholder:text-mute"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              aria-label="Clear search"
              className="grid h-5 w-5 shrink-0 place-items-center rounded-full text-mute transition hover:bg-surface-2 active:scale-90"
            >
              <X size={14} aria-hidden="true" />
            </button>
          )}
        </div>

        <div className="mt-3 flex items-center gap-1.5" role="group" aria-label="Filter by mood">
          <button
            onClick={() => setMoodFilter(null)}
            aria-pressed={moodFilter === null}
            className={`rounded-full px-3 py-1 text-sm font-semibold transition active:scale-95 ${
              moodFilter === null ? 'bg-accent text-on-accent' : 'bg-surface text-soft shadow-sm'
            }`}
          >
            All
          </button>
          {MOODS.map((m) => (
            <button
              key={m.key}
              onClick={() => setMoodFilter((cur) => (cur === m.key ? null : m.key))}
              aria-pressed={moodFilter === m.key}
              aria-label={`Filter by ${m.label} mood`}
              className={`grid h-8 w-8 place-items-center rounded-full text-base transition active:scale-95 ${
                moodFilter === m.key ? 'bg-accent ring-2 ring-accent' : 'bg-surface shadow-sm hover:bg-surface-2'
              }`}
            >
              <span aria-hidden="true">{m.emoji}</span>
            </button>
          ))}
        </div>

        {monthGroups.length > 1 && (
          <MonthFilter groups={monthGroups} value={monthFilter} onChange={setMonthFilter} />
        )}
      </div>

      <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto pb-4">
        {shown.length === 0 ? (
          <div className="mt-16 px-5 text-center">
            <p className="font-medium text-soft">
              {monthFilter && !q && !moodFilter
                ? `No entries in ${monthKeyLabel(monthFilter)}.`
                : q || moodFilter || monthFilter
                  ? `No entries match your filters${q ? ` for "${query.trim()}"` : ''}.`
                  : 'No entries here yet.'}
            </p>
          </div>
        ) : (
          groups.map((g) => (
            <section key={g.key}>
              <div className="sticky top-0 z-10 flex items-baseline justify-between border-b border-border bg-bg px-5 py-2">
                <h3 className="font-display text-sm font-semibold text-content">{g.label}</h3>
                <span className="text-xs font-semibold text-mute">
                  {g.entries.length} {g.entries.length === 1 ? 'entry' : 'entries'}
                </span>
              </div>
              <div className="space-y-3 px-5 py-3">
                {g.entries.map((e) => (
                  <article
                    key={e.id}
                    onClick={() => onOpen?.(e)}
                    role={onOpen ? 'button' : undefined}
                    tabIndex={onOpen ? 0 : undefined}
                    onKeyDown={(ev) => {
                      if (onOpen && (ev.key === 'Enter' || ev.key === ' ')) {
                        ev.preventDefault()
                        onOpen(e)
                      }
                    }}
                    aria-label={onOpen ? `Open entry from ${when(e.createdAt)}` : undefined}
                    className={`animate-fade-up rounded-2xl bg-surface p-4 shadow-sm transition ${
                      onOpen ? 'cursor-pointer hover:shadow-md active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:outline-none' : ''
                    }`}
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-xs font-semibold text-mute">{when(e.createdAt)}</span>
                      <span
                        className="grid h-8 w-8 place-items-center rounded-xl text-lg"
                        style={{ background: e.mood ? MOOD_VAR[e.mood] : 'var(--surface-2)' }}
                      >
                        {moodEmoji(e)}
                      </span>
                    </div>
                    <p className="font-medium leading-relaxed text-content">{e.summary}</p>
                    {e.themes.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {e.themes.map((t) => (
                          <button
                            key={t}
                            onClick={(ev) => {
                              ev.stopPropagation()
                              onSelectTheme?.(t)
                            }}
                            disabled={!onSelectTheme}
                            className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold transition active:scale-95 disabled:pointer-events-none ${
                              t === filterTheme
                                ? 'bg-accent text-on-accent'
                                : 'bg-accent-soft text-accent-text'
                            }`}
                          >
                            #{t}
                          </button>
                        ))}
                      </div>
                    )}
                  </article>
                ))}
              </div>
            </section>
          ))
        )}
      </div>
    </div>
  )
}
