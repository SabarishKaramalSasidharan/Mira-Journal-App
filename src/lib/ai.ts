import type { Entry, Mood, Turn } from '../types'
import { isConfigured, llmFollowUp, llmWeeklyInsight, loadSettings } from './llm'

/**
 * Conversational + reflection engine.
 *
 * If the user has configured an LLM provider (Settings → free Gemini/Groq/etc.),
 * we use it. Otherwise everything falls back to a fast, offline, rule-based
 * engine so the prototype always works with zero setup.
 */

// ---------- Opening prompt (never a blank page) ----------

const MORNING = [
  'Morning. What’s the first thing on your mind?',
  'Before the day runs off — what matters most today?',
  'How did you sleep, and how are you arriving into today?',
]
const MIDDAY = [
  'Quick check-in — how’s the day treating you so far?',
  'What’s taking up the most space in your head right now?',
  'Pause for a second. What are you feeling?',
]
const EVENING = [
  'How was today, really?',
  'What’s still on your mind from today?',
  'One moment from today worth remembering?',
]
const LATE = [
  'Can’t switch off? What’s looping in your head?',
  'What do you need to put down before sleep?',
  'How are you, honestly, right now?',
]

function pick<T>(arr: T[], seed = Date.now()): T {
  return arr[Math.floor((seed / 60000) % arr.length)]
}

export function openingPrompt(): string {
  const h = new Date().getHours()
  if (h < 11) return pick(MORNING)
  if (h < 16) return pick(MIDDAY)
  if (h < 22) return pick(EVENING)
  return pick(LATE)
}

// ---------- Day context (so the conversation matches the chosen date) ----------

export type DayWhen = 'today' | 'yesterday' | 'past'
export interface DayContext {
  when: DayWhen
  label: string // 'today' | 'yesterday' | 'Mon, Jul 27'
}

const TODAY_CTX: DayContext = { when: 'today', label: 'today' }

function midnight(d: Date): Date {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x
}

/** Build a conversational context from the date the user is journaling for. */
export function dayContext(date: Date): DayContext {
  const diff = Math.round((midnight(new Date()).getTime() - midnight(date).getTime()) / 864e5)
  if (diff <= 0) return TODAY_CTX
  if (diff === 1) return { when: 'yesterday', label: 'yesterday' }
  return {
    when: 'past',
    label: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
  }
}

/** A phrase that reads naturally mid-sentence for the chosen day. */
function dayRef(ctx: DayContext): string {
  return ctx.when === 'today' ? 'today' : ctx.when === 'yesterday' ? 'yesterday' : 'that day'
}

// ---------- Mood-triggered openers (one-tap start) ----------

const MOOD_OPENERS: Record<Mood, string[]> = {
  great: [
    'Love that. What’s behind the good mood today?',
    'That’s great to hear — what made today shine?',
  ],
  good: [
    'Nice. What’s going well for you today?',
    'Good to hear. What’s one thing that lifted you?',
  ],
  okay: [
    'An okay day. What’s sitting in the middle for you?',
    'Fair enough. What would tip today toward good?',
  ],
  low: [
    'Sounds like a bit of a grey day. What’s weighing on you?',
    'I hear you. What’s been dragging today down?',
  ],
  rough: [
    'That sounds hard. What happened today?',
    'I’m here. What’s making today feel rough?',
  ],
}

// Past-tense variants for when the user is journaling about an earlier day.
// `%d` is replaced with a natural day reference ("yesterday" / "that day").
const MOOD_OPENERS_PAST: Record<Mood, string[]> = {
  great: [
    'Love that. What was behind the good mood %d?',
    'Nice — what made %d shine?',
  ],
  good: [
    'What was going well for you %d?',
    'What’s one thing that lifted you %d?',
  ],
  okay: [
    'An okay day. What sat in the middle for you %d?',
    'What would’ve tipped %d toward good?',
  ],
  low: [
    'Sounds like a grey day. What was weighing on you %d?',
    'What was dragging %d down?',
  ],
  rough: [
    'That sounds hard. What happened %d?',
    'What made %d feel rough?',
  ],
}

const MOOD_ADJECTIVE: Record<Mood, string> = {
  great: 'great',
  good: 'good',
  okay: 'just okay',
  low: 'a bit low',
  rough: 'pretty rough',
}

/** When a user one-taps a mood before writing, Mira opens with a subtle question. */
export async function getMoodOpener(mood: Mood, ctx: DayContext = TODAY_CTX): Promise<string> {
  const think = new Promise((r) => setTimeout(r, 350 + Math.random() * 250))
  const settings = loadSettings()
  if (isConfigured(settings)) {
    try {
      const verb = ctx.when === 'today' ? "I'm feeling" : 'I was feeling'
      const whenPhrase =
        ctx.when === 'today' ? 'today' : ctx.when === 'yesterday' ? 'yesterday' : `on ${ctx.label}`
      const [q] = await Promise.all([
        llmFollowUp(
          settings,
          [{ role: 'you', text: `${verb} ${MOOD_ADJECTIVE[mood]} ${whenPhrase}.` }],
          pastContext(ctx),
        ),
        think,
      ])
      return q.replace(/^["']|["']$/g, '')
    } catch {
      /* fall through */
    }
  }
  await think
  if (ctx.when === 'today') return pick(MOOD_OPENERS[mood])
  return pick(MOOD_OPENERS_PAST[mood]).replaceAll('%d', dayRef(ctx))
}

/** A note for the LLM so it answers in the right tense for a past day. */
function pastContext(ctx: DayContext): string | undefined {
  if (ctx.when === 'today') return undefined
  return `The user is journaling about ${ctx.label} (a past day), not right now. Use past tense and refer to it as "${dayRef(ctx)}".`
}

// ---------- Follow-up questions (the conversation) ----------

const FEELING_WORDS = [
  'anxious', 'stressed', 'tired', 'exhausted', 'happy', 'excited', 'sad',
  'angry', 'frustrated', 'grateful', 'lonely', 'proud', 'scared', 'calm',
  'overwhelmed', 'hopeful', 'guilty', 'nervous', 'content', 'drained',
]

const PEOPLE_HINTS = ['mom', 'dad', 'friend', 'boss', 'partner', 'team', 'wife', 'husband', 'kid', 'manager', 'colleague']

function lastYou(turns: Turn[]): string {
  const t = [...turns].reverse().find((x) => x.role === 'you')
  return (t?.text ?? '').toLowerCase()
}

function localFollowUp(turns: Turn[], mood: Mood | null, ctx: DayContext = TODAY_CTX): string {
  const text = lastYou(turns)
  const youCount = turns.filter((t) => t.role === 'you').length
  const words = text.split(/\s+/).filter(Boolean)
  const ref = dayRef(ctx)
  const past = ctx.when !== 'today'

  // Wrap up gracefully after a couple of exchanges.
  if (youCount >= 3) {
    return 'Thanks for putting that into words. Anything you want to leave here before you go?'
  }

  const feeling = FEELING_WORDS.find((w) => text.includes(w))
  const person = PEOPLE_HINTS.find((w) => text.includes(w))

  if (words.length <= 4) {
    return 'Say a little more — what’s behind that?'
  }
  if (feeling) {
    return `You mentioned feeling ${feeling}. When did that start ${ref}?`
  }
  if (person) {
    return past
      ? `What role did your ${person} play in how you felt?`
      : `What role did your ${person} play in how you’re feeling?`
  }
  if (text.includes('work') || text.includes('meeting') || text.includes('project')) {
    return `What part of that ${past ? 'was' : 'is'} actually in your control?`
  }
  if (text.includes('because') || text.includes('so ')) {
    return past
      ? 'And how do you feel about that now, looking back?'
      : 'And how do you feel about that now, sitting with it?'
  }
  if (mood === 'rough' || mood === 'low') {
    return past
      ? `That sounds heavy. What would’ve made ${ref} 1% lighter?`
      : 'That sounds heavy. What would make tonight 1% lighter?'
  }
  if (mood === 'great' || mood === 'good') {
    return 'Love that. What made it land the way it did?'
  }
  return 'What’s underneath that, if you dig a little?'
}

// ---------- Reflection / summary ----------

const STOPWORDS = new Set([
  'the', 'and', 'was', 'were', 'that', 'this', 'with', 'have', 'from', 'they',
  'what', 'when', 'your', 'you', 'for', 'are', 'but', 'not', 'had', 'has',
  'about', 'just', 'like', 'really', 'today', 'feel', 'felt', 'been', 'its',
  'i’m', 'im', 'a', 'to', 'of', 'in', 'it', 'is', 'my', 'me', 'so', 'on',
  // filler / intensifiers that aren't meaningful themes
  'honestly', 'pretty', 'gonna', 'wanna', 'kinda', 'sorta', 'maybe', 'actually',
  'basically', 'literally', 'stuff', 'thing', 'things', 'much', 'very', 'more',
  'some', 'being', 'cant', 'dont', 'didnt', 'wont', 'still', 'even', 'also',
  'because', 'there', 'here', 'them', 'then', 'than', 'over', 'into', 'out',
  'want', 'need', 'know', 'think', 'going', 'lot', 'bit', 'day', 'get', 'got',
])

export function extractThemes(text: string, max = 3): string[] {
  const counts = new Map<string, number>()
  text
    .toLowerCase()
    .replace(/[^a-z\s’']/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 3 && !STOPWORDS.has(w))
    .forEach((w) => counts.set(w, (counts.get(w) ?? 0) + 1))
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, max)
    .map(([w]) => w)
}

export function summarize(turns: Turn[]): string {
  const youText = turns
    .filter((t) => t.role === 'you' && t.kind !== 'mood')
    .map((t) => t.text)
    .join(' ')
  const first = youText.split(/(?<=[.!?])\s/)[0] ?? youText
  return first.length > 120 ? first.slice(0, 117) + '…' : first
}

export interface WeeklyReflection {
  entryCount: number
  topThemes: string[]
  moodTrend: string
  insight: string
}

export function weeklyReflection(entries: Entry[]): WeeklyReflection {
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
  const recent = entries.filter((e) => e.createdAt >= weekAgo)

  const allText = recent
    .flatMap((e) => e.turns.filter((t) => t.role === 'you').map((t) => t.text))
    .join(' ')
  const topThemes = extractThemes(allText, 4)

  const moodScore: Record<Mood, number> = { rough: 1, low: 2, okay: 3, good: 4, great: 5 }
  const scored = recent.map((e) => e.mood).filter(Boolean) as Mood[]
  const avg = scored.length
    ? scored.reduce((s, m) => s + moodScore[m], 0) / scored.length
    : 0

  let moodTrend = 'Not enough mood data yet.'
  if (avg >= 4) moodTrend = 'Mostly bright weeks — you’ve been in a good place.'
  else if (avg >= 3) moodTrend = 'A balanced week, steady overall.'
  else if (avg > 0) moodTrend = 'A heavier week. Be gentle with yourself.'

  // A "mirror" style insight — pattern spotting across days.
  const byDay = new Map<string, Mood[]>()
  recent.forEach((e) => {
    if (!e.mood) return
    const d = new Date(e.createdAt).toLocaleDateString('en-US', { weekday: 'long' })
    byDay.set(d, [...(byDay.get(d) ?? []), e.mood])
  })
  let insight = 'Keep going — patterns show up after about a week of entries.'
  let worstDay = ''
  let worstAvg = 6
  byDay.forEach((moods, day) => {
    const a = moods.reduce((s, m) => s + moodScore[m], 0) / moods.length
    if (a < worstAvg) {
      worstAvg = a
      worstDay = day
    }
  })
  if (worstDay && worstAvg <= 2.5) {
    insight = `${worstDay}s look consistently harder for you this week. Worth protecting some energy there.`
  } else if (topThemes.length) {
    insight = `“${topThemes[0]}” came up the most this week — it clearly has your attention.`
  }

  return { entryCount: recent.length, topThemes, moodTrend, insight }
}

// ---------- Chart data helpers ----------

export const MOOD_SCORE: Record<Mood, number> = { rough: 1, low: 2, okay: 3, good: 4, great: 5 }

export interface DayPoint {
  label: string // short axis label e.g. "Mon" or "12" or "Aug 4"
  full: string // human-readable label for captions e.g. "Mon, Aug 4"
  date: string
  score: number | null // 1..5 average, null if no mood logged
}

export type MoodRange = 7 | 30 | 90 | 'all'

export interface MoodSeries {
  points: DayPoint[]
  avg: number | null
  logged: number // buckets that have at least one mood
  bucket: 'day' | 'week'
  rangeDays: number
}

const mean = (xs: number[]) => xs.reduce((s, n) => s + n, 0) / xs.length

/**
 * Mood over an arbitrary range. Uses daily buckets for short ranges and
 * auto-switches to weekly averages past ~a month so long views stay legible.
 */
export function moodSeriesRange(entries: Entry[], range: MoodRange): MoodSeries {
  const moods = entries.filter((e) => e.mood)
  const now = new Date()
  now.setHours(0, 0, 0, 0)

  let rangeDays: number
  if (range === 'all') {
    if (moods.length === 0) rangeDays = 7
    else {
      const earliest = Math.min(...moods.map((e) => e.createdAt))
      const d0 = new Date(earliest)
      d0.setHours(0, 0, 0, 0)
      rangeDays = Math.max(7, Math.round((now.getTime() - d0.getTime()) / 864e5) + 1)
    }
  } else {
    rangeDays = range
  }

  const bucket: 'day' | 'week' = rangeDays > 31 ? 'week' : 'day'
  const points: DayPoint[] = []

  if (bucket === 'day') {
    for (let i = rangeDays - 1; i >= 0; i--) {
      const d = new Date(now)
      d.setDate(now.getDate() - i)
      const key = d.toDateString()
      const dayMoods = moods
        .filter((e) => new Date(e.createdAt).toDateString() === key)
        .map((e) => MOOD_SCORE[e.mood as Mood])
      points.push({
        label:
          rangeDays <= 7
            ? d.toLocaleDateString('en-US', { weekday: 'short' }).slice(0, 3)
            : d.toLocaleDateString('en-US', { day: 'numeric' }),
        full: d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
        date: key,
        score: dayMoods.length ? mean(dayMoods) : null,
      })
    }
  } else {
    const weeks = Math.ceil(rangeDays / 7)
    for (let w = weeks - 1; w >= 0; w--) {
      const end = new Date(now)
      end.setDate(now.getDate() - w * 7)
      const start = new Date(end)
      start.setDate(end.getDate() - 6)
      const startT = start.getTime()
      const endT = end.getTime() + 864e5 - 1
      const wkMoods = moods
        .filter((e) => e.createdAt >= startT && e.createdAt <= endT)
        .map((e) => MOOD_SCORE[e.mood as Mood])
      points.push({
        label: start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        full: `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
        date: start.toDateString(),
        score: wkMoods.length ? mean(wkMoods) : null,
      })
    }
  }

  const scored = points.filter((p) => p.score != null).map((p) => p.score as number)
  return {
    points,
    avg: scored.length ? mean(scored) : null,
    logged: scored.length,
    bucket,
    rangeDays,
  }
}

export interface ThemeCount {
  theme: string
  count: number
}

/** Frequency of themes across the last `days` days. */
export function themeCounts(entries: Entry[], days = 7, max = 6): ThemeCount[] {
  const since = Date.now() - days * 864e5
  const counts = new Map<string, number>()
  entries
    .filter((e) => e.createdAt >= since)
    .flatMap((e) => e.themes)
    .forEach((t) => counts.set(t, (counts.get(t) ?? 0) + 1))
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, max)
    .map(([theme, count]) => ({ theme, count }))
}

// ---------- Public async API ----------

export async function getFollowUp(
  turns: Turn[],
  mood: Mood | null,
  ctx: DayContext = TODAY_CTX,
): Promise<string> {
  const think = new Promise((r) => setTimeout(r, 350 + Math.random() * 300))
  const settings = loadSettings()
  if (isConfigured(settings)) {
    try {
      const [q] = await Promise.all([llmFollowUp(settings, turns, pastContext(ctx)), think])
      return q.replace(/^["']|["']$/g, '')
    } catch {
      /* fall through to local engine */
    }
  }
  await think
  return localFollowUp(turns, mood, ctx)
}

/** Weekly insight, LLM-enhanced when configured, else local pattern-spotting. */
export async function getWeeklyInsight(entries: Entry[]): Promise<string> {
  const settings = loadSettings()
  const base = weeklyReflection(entries)
  if (base.entryCount === 0) return base.insight
  if (isConfigured(settings)) {
    try {
      const excerpts = entries
        .filter((e) => e.createdAt >= Date.now() - 7 * 864e5)
        .flatMap((e) => e.turns.filter((t) => t.role === 'you').map((t) => t.text))
      if (excerpts.length) return await llmWeeklyInsight(settings, excerpts)
    } catch {
      /* fall through */
    }
  }
  return base.insight
}
