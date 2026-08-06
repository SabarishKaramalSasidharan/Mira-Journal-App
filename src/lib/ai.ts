import type { Entry, Mood, Turn } from '../types'
import { isConfigured, llmFollowUp, llmJournalNote, llmWeeklyInsight, loadSettings } from './llm'

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
  'Hey, good morning. How are you waking up today?',
  'Before the day runs off — what matters most today?',
  'How did you sleep? And how are you arriving into today?',
  'New day. What are you carrying into it?',
  'Morning. Anything you’re looking forward to today?',
]
const MIDDAY = [
  'Hey — how’s the day treating you so far?',
  'Quick check-in. Where’s your head at right now?',
  'What’s taking up the most space in your head today?',
  'Pause for a sec — what are you feeling right now?',
  'Middle of the day. How are you holding up?',
  'What’s the day been like so far?',
]
const EVENING = [
  'Hey. How was today, really?',
  'What’s still on your mind from today?',
  'One moment from today you want to hold onto?',
  'How are you landing at the end of the day?',
  'So — how’d today go?',
  'What stuck with you from today?',
]
const LATE = [
  'Still up? What’s on your mind?',
  'Can’t switch off? What’s looping in there?',
  'What do you want to put down before sleep?',
  'How are you, honestly, right now?',
  'Late one. What’s keeping you company tonight?',
  'What’s the last thing you’re thinking about tonight?',
]

/**
 * Pick from a list, avoiding an immediate repeat of the last choice for that
 * same list — so consecutive sessions don't feel canned.
 */
const lastPick = new WeakMap<object, number>()
function vary<T>(arr: T[]): T {
  if (arr.length <= 1) return arr[0]
  const prev = lastPick.get(arr as object)
  let i = Math.floor(Math.random() * arr.length)
  if (i === prev) i = (i + 1) % arr.length
  lastPick.set(arr as object, i)
  return arr[i]
}

export function openingPrompt(): string {
  const h = new Date().getHours()
  if (h < 11) return vary(MORNING)
  if (h < 16) return vary(MIDDAY)
  if (h < 22) return vary(EVENING)
  return vary(LATE)
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
    'Oh I love that. What’s got today feeling so good?',
    'Yes! What’s behind the great mood?',
    'That’s wonderful to hear. What made today shine?',
    'Amazing. What’s the best part been so far?',
    'Ooh, tell me — what’s going right today?',
  ],
  good: [
    'Nice. What’s been going well?',
    'Good to hear. What lifted you today?',
    'Love that. What’s one thing that’s felt good?',
    'That’s lovely. What’s put you in a good spot?',
    'Glad today’s treating you kindly. What’s helped?',
  ],
  okay: [
    'An okay kind of day. What’s it been like?',
    'Somewhere in the middle, huh. What’s going on?',
    'Fair enough. What would’ve tipped it toward good?',
    'Okay days count too. What’s on your mind?',
    'Mm, a middling one. Anything pulling at you?',
  ],
  low: [
    'Sounds like a bit of a grey one. What’s weighing on you?',
    'I hear you. What’s been dragging today down?',
    'A low day. Want to tell me what’s going on?',
    'That’s tough. What’s sitting heavy right now?',
    'Sorry it’s a rough patch. What’s behind it?',
  ],
  rough: [
    'Oh, I’m sorry. What happened today?',
    'That sounds really hard. What’s going on?',
    'Hey, I’m here. What made today so rough?',
    'Ugh, a rough one. Want to get into it?',
    'That’s a lot. What’s hit you hardest today?',
  ],
}

// Past-tense variants for when the user is journaling about an earlier day.
// `%d` is replaced with a natural day reference ("yesterday" / "that day").
const MOOD_OPENERS_PAST: Record<Mood, string[]> = {
  great: [
    'Love that. What made %d so good?',
    'Nice — what was behind the great mood %d?',
    'That’s lovely. What stood out about %d?',
    'Ooh, what made %d shine?',
  ],
  good: [
    'What was going well for you %d?',
    'What’s one thing that lifted you %d?',
    'Sounds like a good one. What made %d feel that way?',
    'What went right %d?',
  ],
  okay: [
    'An okay day. What was %d like?',
    'What sat in the middle for you %d?',
    'What would’ve tipped %d toward good?',
    'Mm, a middling one. What was on your mind %d?',
  ],
  low: [
    'Sounds like %d was a grey one. What was weighing on you?',
    'What was dragging %d down?',
    'A low day. What was going on %d?',
    'What sat heavy %d?',
  ],
  rough: [
    'I’m sorry — what happened %d?',
    'That sounds hard. What made %d so rough?',
    'What hit you hardest %d?',
    'Rough one. Want to tell me about %d?',
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
  if (ctx.when === 'today') return vary(MOOD_OPENERS[mood])
  return vary(MOOD_OPENERS_PAST[mood]).replaceAll('%d', dayRef(ctx))
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

/** Grab one salient word from the user's text so Mira can echo it back. */
function reflectWord(text: string): string | null {
  return extractThemes(text, 1)[0] ?? null
}

function localFollowUp(turns: Turn[], mood: Mood | null, ctx: DayContext = TODAY_CTX): string {
  const text = lastYou(turns)
  const youCount = turns.filter((t) => t.role === 'you').length
  const words = text.split(/\s+/).filter(Boolean)
  const past = ctx.when !== 'today'

  // Wrap up gently after a few exchanges — a friend knows when to let it rest.
  if (youCount >= 3) {
    return vary([
      'Thanks for letting me in on all that. Anything else you want to get down before you go?',
      'I’m really glad you wrote this out. Anything else sitting with you?',
      'That’s a lot to carry — thanks for sharing it. Anything you want to leave here?',
      'Good on you for putting words to it. Anything else on your mind?',
    ])
  }

  // Very short reply — coax a little more, warmly.
  if (words.length <= 4) {
    return vary([
      'Tell me a bit more?',
      'Say more — what’s going on there?',
      'Go on, I’m listening.',
      'What’s the story behind that?',
      'Mm — what’s that about?',
    ])
  }

  const feeling = FEELING_WORDS.find((w) => text.includes(w))
  const person = PEOPLE_HINTS.find((w) => text.includes(w))
  const word = reflectWord(text)

  if (feeling) {
    return vary([
      `${feeling.charAt(0).toUpperCase() + feeling.slice(1)} — yeah. What’s bringing that up?`,
      `Where’s the ${feeling} coming from, do you think?`,
      `That ${feeling} feeling — when did it creep in?`,
      `Makes sense you’d feel ${feeling}. What’s underneath it?`,
    ])
  }
  if (person) {
    return vary([
      past
        ? `How were things with your ${person} that day?`
        : `How are things with your ${person} right now?`,
      `What’s your ${person} got to do with how you’re feeling?`,
      `Tell me more about your ${person} in all this.`,
    ])
  }
  if (text.includes('work') || text.includes('meeting') || text.includes('project')) {
    return vary([
      'Sounds like work’s taking up space. What part’s weighing on you most?',
      `What’s the hardest bit of that to ${past ? 'have sat' : 'sit'} with?`,
      'Is this a one-off, or has it been building for a while?',
    ])
  }
  if (text.includes('because') || text.includes('so ')) {
    return vary([
      'And how are you feeling about that now?',
      'Where does that leave you?',
      'How’s that sitting with you?',
      'Yeah — what does that stir up?',
    ])
  }
  if (mood === 'rough' || mood === 'low') {
    return vary([
      past
        ? 'That sounds like a lot to have gone through. What helped you get through it?'
        : 'That sounds like a lot. What’s one small thing that might help right now?',
      'I’m sorry — that’s heavy. What do you need most right now?',
      'That’s hard. Is there anything that’d make it feel a little lighter?',
    ])
  }
  if (mood === 'great' || mood === 'good') {
    return vary([
      'Love that. What made it feel so good?',
      'That’s lovely. What made it land the way it did?',
      'Nice — what do you want to remember about it?',
    ])
  }
  // Neutral default — reflect a word back when we can, otherwise stay curious.
  if (word) {
    return vary([
      `“${word}” stands out there. Say more about that?`,
      `What’s the ${word} part really about for you?`,
      `Tell me more about the ${word} side of it.`,
    ])
  }
  return vary([
    'What else is there, if you keep going?',
    'What part do you keep coming back to?',
    'What stands out most about that?',
    'And then what?',
  ])
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

// ---------- Journal note (first-person narrative recap) ----------

// Mood-aware opening line for a note, in the user's own voice. `%D` is replaced
// with a sentence-start day word ("Today" / "Yesterday" / "That day").
const NOTE_LEAD: Record<Mood, { now: string[]; past: string[] }> = {
  great: {
    now: ['%D has been a really good one.', '%D feels great.', 'Honestly, %D has been lovely.'],
    past: ['%D was a really good one.', '%D was great.', 'Looking back, %D was lovely.'],
  },
  good: {
    now: ['%D is a good day.', '%D has been treating me kindly.', 'A good %D so far.'],
    past: ['%D was a good day.', '%D treated me kindly.', 'A good one, %D.'],
  },
  okay: {
    now: ['%D is an okay day — nothing dramatic.', '%D sits somewhere in the middle.'],
    past: ['%D was an okay day — nothing dramatic.', '%D sat somewhere in the middle.'],
  },
  low: {
    now: ['%D has been a bit of a low one.', '%D feels heavier than I’d like.'],
    past: ['%D was a bit of a low one.', '%D felt heavy.'],
  },
  rough: {
    now: ['%D has been rough.', '%D has been a hard one.'],
    past: ['%D was rough.', '%D was a hard one.'],
  },
}

// Optional closing line by mood. Empty strings mean "sometimes no closer".
const NOTE_CLOSE: Record<Mood, string[]> = {
  great: ['Want to hold onto this one.', 'Days like this are worth remembering.', ''],
  good: ['A good note to end on.', 'Quietly grateful for it.', ''],
  okay: ['', 'Onward.', ''],
  low: ['Trying to be gentle with myself.', 'Hoping the next one feels lighter.', ''],
  rough: ['Just glad I got it down.', 'Being kind to myself where I can.', ''],
}

/** Stitch the user's own sentences into a clean, readable body (max 3 sentences). */
function userBody(text: string): string {
  const sentences = text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 3)
  let body = sentences.join(' ')
  if (!body) return ''
  body = body.charAt(0).toUpperCase() + body.slice(1)
  if (!/[.!?]$/.test(body)) body += '.'
  return body
}

/** Offline, first-person note composed from the user's own words + mood. */
function localNote(turns: Turn[], mood: Mood | null, ctx: DayContext): string {
  const userText = turns
    .filter((t) => t.role === 'you' && t.kind !== 'mood')
    .map((t) => t.text.trim())
    .filter(Boolean)
    .join(' ')

  const dayWord = ctx.when === 'today' ? 'Today' : ctx.when === 'yesterday' ? 'Yesterday' : 'That day'
  const past = ctx.when !== 'today'
  const parts: string[] = []

  if (mood) {
    parts.push(vary(NOTE_LEAD[mood][past ? 'past' : 'now']).replaceAll('%D', dayWord))
  }

  if (userText) {
    parts.push(userBody(userText))
  } else if (mood) {
    parts.push(
      vary([
        'I didn’t have many words for it, but I wanted to check in.',
        'Not much to put into words today, but I noticed how I felt.',
        'I’ll leave it at that for now.',
      ]),
    )
  }

  if (mood) {
    const close = vary(NOTE_CLOSE[mood])
    if (close) parts.push(close)
  }

  const note = parts.join(' ').trim()
  if (note) return note
  return userText ? userBody(userText) : 'A quiet check-in.'
}

/**
 * Build a warm, first-person "journal note" for an entry.
 * Uses the configured LLM when available, otherwise a solid offline composer.
 */
export async function generateNote(
  turns: Turn[],
  mood: Mood | null,
  ctx: DayContext = TODAY_CTX,
): Promise<string> {
  const settings = loadSettings()
  if (isConfigured(settings)) {
    try {
      const note = await llmJournalNote(settings, turns, pastContext(ctx))
      const clean = note.replace(/^["']|["']$/g, '').trim()
      if (clean) return clean
    } catch {
      /* fall through to the offline composer */
    }
  }
  return localNote(turns, mood, ctx)
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
