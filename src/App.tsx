import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { BookOpen, Flame, Moon, PenLine, Settings as SettingsIcon, Sparkles, Sun, SunMoon } from 'lucide-react'
import type { Entry } from './types'
import { computeStreak, deleteEntry, loadEntries, streakStats, upsertEntry, type StreakStats } from './lib/storage'
import { loadSettings } from './lib/llm'
import { applyTheme, loadTheme, setTheme, watchSystem, type ThemeMode } from './lib/theme'
import Capture from './components/Capture'
import Timeline from './components/Timeline'
import Reflection from './components/Reflection'
import Settings from './components/Settings'
import Mascot from './components/Mascot'
import StreakSheet from './components/StreakSheet'
import SuccessMoment from './components/SuccessMoment'
import EntryDetail from './components/EntryDetail'

type Tab = 'write' | 'journal' | 'reflect'

// Streak lengths worth an earned celebration. Mirrors the (unexported) list in
// lib/storage.ts; kept in sync here since storage.ts is owned by another change.
const MILESTONES = [3, 7, 14, 30, 60, 100, 180, 365]
// Journaling this many distinct days in the current calendar week "hits the week".
const WEEKLY_GOAL = 5

/** Distinct days journaled in the current calendar week (Sunday start). */
function distinctDaysThisWeek(entries: Entry[]): number {
  const start = new Date()
  start.setHours(0, 0, 0, 0)
  start.setDate(start.getDate() - start.getDay())
  const startT = start.getTime()
  return new Set(
    entries.filter((e) => e.createdAt >= startT).map((e) => new Date(e.createdAt).toDateString()),
  ).size
}

/** Longest run EXCLUDING the current active streak — i.e. the record to beat. */
function bestBeforeCurrentRun(entries: Entry[], currentRun: number): number {
  if (currentRun === 0) return streakStats(entries).best
  const dayStrings = new Set(entries.map((e) => new Date(e.createdAt).toDateString()))
  const cursor = new Date()
  if (!dayStrings.has(cursor.toDateString())) cursor.setDate(cursor.getDate() - 1)
  const runDates = new Set<string>()
  for (let i = 0; i < currentRun; i++) {
    runDates.add(cursor.toDateString())
    cursor.setDate(cursor.getDate() - 1)
  }
  const rest = entries.filter((e) => !runDates.has(new Date(e.createdAt).toDateString()))
  return streakStats(rest).best
}

interface SuccessState {
  entry: Entry
  stats: StreakStats
  kind: 'quiet' | 'milestone'
  headline: string | null
  trigger: HTMLElement | null
}

export default function App() {
  const [entries, setEntries] = useState<Entry[]>(() => loadEntries())
  const [tab, setTab] = useState<Tab>('write')
  const [captureKey, setCaptureKey] = useState(0)
  const [showSettings, setShowSettings] = useState(false)
  const [settings, setSettings] = useState(() => loadSettings())
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => loadTheme())
  const [success, setSuccess] = useState<SuccessState | null>(null)
  const [showStreak, setShowStreak] = useState(false)
  const [journalTheme, setJournalTheme] = useState<string | null>(null)
  const [openEntry, setOpenEntry] = useState<Entry | null>(null)

  const streak = useMemo(() => computeStreak(entries), [entries])
  const streaks = useMemo(() => streakStats(entries), [entries])
  const llmOn = settings.provider !== 'local'

  useEffect(() => watchSystem(() => themeMode), [themeMode])

  const cycleTheme = () => {
    const order: ThemeMode[] = ['light', 'dark', 'system']
    const next = order[(order.indexOf(themeMode) + 1) % order.length]
    setThemeMode(next)
    setTheme(next)
  }

  const changeTheme = (m: ThemeMode) => {
    setThemeMode(m)
    setTheme(m)
  }

  useEffect(() => {
    applyTheme(themeMode)
  }, [themeMode])

  // Silent save as the conversation grows — never interrupts the flow.
  const handleAutoSave = (entry: Entry) => {
    setEntries(upsertEntry(entry))
  }

  // Explicit "Finish" — save (idempotent), then either a quiet reflect-back close
  // (ordinary finish) or an earned celebration (milestone). See milestone rules below.
  const handleFinish = (entry: Entry) => {
    // Remember what was focused (the Finish button) so a modal celebration can
    // return focus there on close.
    const trigger = (document.activeElement as HTMLElement) ?? null

    const updated = upsertEntry(entry)
    setEntries(updated)

    const prev = updated.filter((e) => e.id !== entry.id)
    const after = computeStreak(updated)
    const before = computeStreak(prev)
    const stats = streakStats(updated)
    const firstEver = updated.length === 1
    const priorBest = bestBeforeCurrentRun(updated, after)

    // Celebration is GATED to these milestones — a routine streak +1 stays quiet.
    let headline: string | null = null
    if (firstEver) {
      headline = 'Your first entry.'
    } else if (after > before && MILESTONES.includes(after)) {
      headline = `${after} days in a row.`
    } else if (after > before && before <= priorBest && after > priorBest) {
      // First day the current run overtakes the previous record.
      headline = `New best — ${after} days.`
    } else if (
      distinctDaysThisWeek(updated) >= WEEKLY_GOAL &&
      distinctDaysThisWeek(prev) < WEEKLY_GOAL
    ) {
      headline = 'You hit your week.'
    }

    setSuccess({
      entry,
      stats,
      kind: headline ? 'milestone' : 'quiet',
      headline,
      trigger,
    })
  }

  const writeAnother = () => {
    setSuccess(null)
    startNew()
  }

  const seeJournal = () => {
    setSuccess(null)
    setJournalTheme(null)
    setTab('journal')
  }

  // Plain dismiss — a calm return to where they were (no navigation).
  const dismissSuccess = () => setSuccess(null)

  const startNew = () => {
    setCaptureKey((k) => k + 1)
    setJournalTheme(null)
    setTab('write')
  }

  const openTheme = (theme: string) => {
    setJournalTheme(theme)
    setTab('journal')
  }

  const handleEditSaved = (entry: Entry) => {
    setEntries(upsertEntry(entry))
    setOpenEntry(entry)
  }

  const handleDelete = (id: string) => {
    setEntries(deleteEntry(id))
    setOpenEntry(null)
  }

  const ThemeIcon = themeMode === 'light' ? Sun : themeMode === 'dark' ? Moon : SunMoon

  return (
    <div className="flex min-h-full items-center justify-center p-0 sm:p-6">
      <div className="relative flex h-[100dvh] w-full flex-col overflow-hidden bg-bg sm:h-[820px] sm:max-w-[420px] sm:rounded-[2.25rem] sm:shadow-lg sm:ring-1 sm:ring-border">
        {/* Header */}
        <header className="flex items-center justify-between px-5 pt-[max(0.75rem,env(safe-area-inset-top))]">
          <div className="flex items-center gap-2 pt-3">
            <Mascot size={34} className="animate-bob" />
            <span className="font-display text-xl font-bold tracking-tight text-content">Mira</span>
          </div>
          <div className="flex items-center gap-2 pt-3">
            <button
              onClick={() => setShowStreak(true)}
              className="flex items-center gap-1 rounded-full bg-surface px-2.5 py-1 text-sm shadow-sm transition active:scale-90"
              aria-label={`${streak}-day streak. Tap for details.`}
              title={`${streak}-day streak`}
            >
              <Flame size={16} className="text-flame" aria-hidden="true" />
              <span className="font-display font-bold text-content">
                {streak}
                <span className="sr-only"> day streak</span>
              </span>
            </button>
            <button
              onClick={cycleTheme}
              className="grid h-9 w-9 place-items-center rounded-full bg-surface text-soft shadow-sm transition active:scale-90"
              aria-label={`Theme: ${themeMode}. Tap to change.`}
              title={`Theme: ${themeMode}`}
            >
              <ThemeIcon size={17} aria-hidden="true" />
            </button>
            <button
              onClick={() => setShowSettings(true)}
              className="relative grid h-9 w-9 place-items-center rounded-full bg-surface text-soft shadow-sm transition active:scale-90"
              aria-label="Settings"
            >
              <SettingsIcon size={17} aria-hidden="true" />
              {llmOn && (
                <span
                  className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-mood-good ring-2 ring-bg"
                  aria-hidden="true"
                />
              )}
            </button>
          </div>
        </header>

        {/* Body */}
        <main className="min-h-0 flex-1">
          {tab === 'write' && (
            <Capture key={captureKey} onAutoSave={handleAutoSave} onFinish={handleFinish} />
          )}
          {tab === 'journal' && (
            <Timeline
              entries={entries}
              onNew={startNew}
              onOpen={setOpenEntry}
              filterTheme={journalTheme}
              onSelectTheme={setJournalTheme}
              onClearFilter={() => setJournalTheme(null)}
            />
          )}
          {tab === 'reflect' && <Reflection entries={entries} onSelectTheme={openTheme} />}
        </main>

        {/* Bottom nav */}
        <nav className="flex items-center justify-around border-t border-border bg-surface/80 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur">
          <NavBtn active={tab === 'write'} onClick={startNew} icon={<PenLine size={20} aria-hidden="true" />} label="Write" />
          <NavBtn active={tab === 'journal'} onClick={() => { setJournalTheme(null); setTab('journal') }} icon={<BookOpen size={20} aria-hidden="true" />} label="Journal" />
          <NavBtn active={tab === 'reflect'} onClick={() => setTab('reflect')} icon={<Sparkles size={20} aria-hidden="true" />} label="Reflect" />
        </nav>

        {success && (
          <SuccessMoment
            entry={success.entry}
            stats={success.stats}
            kind={success.kind}
            headline={success.headline}
            trigger={success.trigger}
            onDone={dismissSuccess}
            onWriteAnother={writeAnother}
            onSeeJournal={seeJournal}
          />
        )}

        {showStreak && <StreakSheet stats={streaks} onClose={() => setShowStreak(false)} />}

        {openEntry && (
          <EntryDetail
            entry={openEntry}
            onClose={() => setOpenEntry(null)}
            onSave={handleEditSaved}
            onDelete={handleDelete}
          />
        )}

        {showSettings && (
          <Settings
            initial={settings}
            themeMode={themeMode}
            onThemeChange={changeTheme}
            onClose={() => setShowSettings(false)}
            onSaved={setSettings}
          />
        )}
      </div>
    </div>
  )
}

function NavBtn({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean
  onClick: () => void
  icon: ReactNode
  label: string
}) {
  return (
    <button
      onClick={onClick}
      aria-current={active ? 'page' : undefined}
      className={`flex flex-1 flex-col items-center gap-0.5 rounded-2xl py-1.5 text-[11px] font-bold transition ${
        active ? 'text-accent-text' : 'text-soft'
      }`}
    >
      <span
        className={`grid h-9 w-14 place-items-center rounded-lg transition-all ${
          active ? 'scale-105 bg-accent-soft' : ''
        }`}
      >
        {icon}
      </span>
      {label}
    </button>
  )
}
