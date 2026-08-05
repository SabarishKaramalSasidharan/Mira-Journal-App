import type { Entry, Mood } from '../types'
import { MOODS } from '../types'
import { MOOD_SCORE } from '../lib/ai'

interface Props {
  entries: Entry[]
  onSelectTheme?: (theme: string) => void
}

const WEEK_MS = 7 * 24 * 60 * 60 * 1000
const SCORE_MOOD: Mood[] = ['rough', 'low', 'okay', 'good', 'great']

// Warm, non-clinical word for each mood band — derived from the average MOOD_SCORE.
const SENTIMENT_WORD: Record<Mood, string> = {
  rough: 'Tender',
  low: 'Heavy',
  okay: 'Steady',
  good: 'Warm',
  great: 'Bright',
}

const moodForScore = (score: number): Mood =>
  SCORE_MOOD[Math.max(0, Math.min(4, Math.round(score) - 1))]

const emojiForMood = (m: Mood): string => MOODS.find((x) => x.key === m)?.emoji ?? ''

export default function WeeklyRecap({ entries, onSelectTheme }: Props) {
  const weekAgo = Date.now() - WEEK_MS
  const recent = entries.filter((e) => e.createdAt >= weekAgo)
  const count = recent.length

  // Low/empty data: never shame a quiet week — offer an encouraging nudge instead.
  if (count <= 1) {
    return (
      <section
        aria-labelledby="recap-heading"
        className="rounded-2xl bg-accent-soft p-5 shadow-sm"
      >
        <h3 id="recap-heading" className="font-display text-lg font-bold text-content">
          Your week, gently
        </h3>
        <p className="mt-1.5 font-medium leading-relaxed text-soft">
          {count === 0
            ? 'A quiet week so far — one entry starts the story.'
            : 'One entry this week — a gentle start. Whenever you’re ready, there’s room for more.'}
        </p>
      </section>
    )
  }

  // Average mood across entries that logged one, mapped to a warm word + weather emoji.
  const moods = recent.map((e) => e.mood).filter(Boolean) as Mood[]
  const avg = moods.length
    ? moods.reduce((s, m) => s + MOOD_SCORE[m], 0) / moods.length
    : null
  const avgMood = avg != null ? moodForScore(avg) : null

  // Top theme: most frequent value across this week's entries' themes.
  const themeTally = new Map<string, number>()
  recent.flatMap((e) => e.themes).forEach((t) => themeTally.set(t, (themeTally.get(t) ?? 0) + 1))
  const topTheme = [...themeTally.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null

  // One "win": the highest-mood entry that carries a summary. Only celebrate it when
  // the week actually had a bright-ish moment (okay or above) — don't force positivity.
  const win = [...recent]
    .filter((e) => e.mood && e.summary?.trim())
    .sort(
      (a, b) =>
        MOOD_SCORE[b.mood as Mood] - MOOD_SCORE[a.mood as Mood] || b.createdAt - a.createdAt,
    )[0]
  const winQuote = win && MOOD_SCORE[win.mood as Mood] >= 3 ? win.summary.trim() : null

  return (
    <section aria-labelledby="recap-heading" className="rounded-2xl bg-surface p-5 shadow-sm">
      <h3 id="recap-heading" className="font-display text-lg font-bold text-content">
        Your week, gently
      </h3>
      <p className="mt-0.5 text-xs font-semibold text-mute">A soft look at your last 7 days.</p>

      <dl className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-lg bg-surface-2 p-3">
          <dt className="text-xs font-semibold text-mute">
            {count === 1 ? 'Entry this week' : 'Entries this week'}
          </dt>
          <dd className="mt-1 font-display text-2xl font-bold text-content">{count}</dd>
        </div>
        <div className="rounded-lg bg-surface-2 p-3">
          <dt className="text-xs font-semibold text-mute">Average mood</dt>
          <dd className="mt-1 flex items-center gap-1.5 font-display text-2xl font-bold text-content">
            {avgMood ? (
              <>
                <span aria-hidden="true" className="text-xl">
                  {emojiForMood(avgMood)}
                </span>
                <span>{SENTIMENT_WORD[avgMood]}</span>
              </>
            ) : (
              <span className="text-base font-semibold text-mute">Not logged yet</span>
            )}
          </dd>
        </div>
      </dl>

      {topTheme && (
        <div className="mt-4">
          <div className="mb-1.5 text-xs font-semibold text-mute">Top theme</div>
          {onSelectTheme ? (
            <button
              onClick={() => onSelectTheme(topTheme)}
              aria-label={`Show journal entries about ${topTheme}`}
              className="inline-flex items-center gap-1 rounded-full bg-accent-soft px-3 py-1.5 text-sm font-bold text-accent-text transition hover:brightness-95 active:scale-95"
            >
              #{topTheme}
            </button>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full bg-accent-soft px-3 py-1.5 text-sm font-bold text-accent-text">
              #{topTheme}
            </span>
          )}
        </div>
      )}

      {winQuote && (
        <figure className="mt-4 rounded-lg bg-surface-2 p-3">
          <figcaption className="mb-1 flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wide text-accent-text">
            <span aria-hidden="true">✨</span>A bright spot
          </figcaption>
          <blockquote className="font-semibold leading-relaxed text-content">
            “{winQuote}”
          </blockquote>
        </figure>
      )}
    </section>
  )
}
