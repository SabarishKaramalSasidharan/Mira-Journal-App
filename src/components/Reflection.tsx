import { useEffect, useState } from 'react'
import type { Entry } from '../types'
import { getWeeklyInsight, themeCounts, weeklyReflection } from '../lib/ai'
import { MoodTrend, ThemeBars } from './Charts'
import WeeklyRecap from './WeeklyRecap'
import Mascot from './Mascot'

interface Props {
  entries: Entry[]
  onSelectTheme?: (theme: string) => void
}

export default function Reflection({ entries, onSelectTheme }: Props) {
  const r = weeklyReflection(entries)
  const themes = themeCounts(entries, 7)

  const [insight, setInsight] = useState(r.insight)
  const [loadingInsight, setLoadingInsight] = useState(false)

  useEffect(() => {
    let alive = true
    if (r.entryCount === 0) {
      setInsight(r.insight)
      return
    }
    setLoadingInsight(true)
    getWeeklyInsight(entries)
      .then((text) => alive && setInsight(text))
      .finally(() => alive && setLoadingInsight(false))
    return () => {
      alive = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entries.length])

  return (
    <div className="no-scrollbar h-full overflow-y-auto px-5 py-6">
      <h2 className="mb-1 font-display text-2xl font-bold text-content">Your reflection</h2>
      <p className="mb-6 font-medium text-soft">The mirror — what your entries are quietly telling you.</p>

      {r.entryCount === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl bg-surface p-8 text-center shadow-sm">
          <Mascot size={64} mood="calm" className="animate-bob" decorative />
          <p className="font-medium text-soft">
            Write a few entries this week and your reflection will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Lead with the mirror — it's the heart of Reflect. */}
          <InsightCard loading={loadingInsight} text={insight} />

          {/* One mood section: trend chart with a built-in range filter. */}
          <MoodTrend entries={entries} />

          {/* One theme section — tap a theme to see the entries behind it. */}
          <ThemeBars data={themes} onSelect={onSelectTheme} />

          {/* Warm weekly recap — one cohesive summary of the last 7 days. */}
          <WeeklyRecap entries={entries} onSelectTheme={onSelectTheme} />
        </div>
      )}
    </div>
  )
}

function InsightCard({ loading, text }: { loading: boolean; text: string }) {
  return (
    <div className="flex gap-3 rounded-2xl bg-accent-soft p-4 shadow-sm">
      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-surface">
        <Mascot size={28} decorative />
      </div>
      <div>
        <div className="mb-0.5 text-xs font-extrabold uppercase tracking-wide text-accent-text">
          The pattern
        </div>
        <div className="font-semibold leading-relaxed text-content">
          {loading ? <span className="text-mute">Reflecting…</span> : text}
        </div>
      </div>
    </div>
  )
}

