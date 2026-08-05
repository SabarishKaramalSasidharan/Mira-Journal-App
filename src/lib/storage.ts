import type { Entry } from '../types'

const KEY = 'mira.entries.v1'

export function loadEntries(): Entry[] {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return []
    return JSON.parse(raw) as Entry[]
  } catch {
    return []
  }
}

export function saveEntries(entries: Entry[]) {
  localStorage.setItem(KEY, JSON.stringify(entries))
}

export function upsertEntry(entry: Entry): Entry[] {
  const entries = loadEntries()
  const idx = entries.findIndex((e) => e.id === entry.id)
  if (idx >= 0) entries[idx] = entry
  else entries.unshift(entry)
  saveEntries(entries)
  return entries
}

export function deleteEntry(id: string): Entry[] {
  const entries = loadEntries().filter((e) => e.id !== id)
  saveEntries(entries)
  return entries
}

/** Count of consecutive days (ending today or yesterday) with at least one entry. */
export function computeStreak(entries: Entry[]): number {
  if (entries.length === 0) return 0
  const days = new Set(entries.map((e) => new Date(e.createdAt).toDateString()))
  let streak = 0
  const cursor = new Date()
  // Allow the streak to still count if they haven't written today yet.
  if (!days.has(cursor.toDateString())) cursor.setDate(cursor.getDate() - 1)
  while (days.has(cursor.toDateString())) {
    streak++
    cursor.setDate(cursor.getDate() - 1)
  }
  return streak
}

export interface DayDot {
  label: string // single-letter weekday
  hasEntry: boolean
  isToday: boolean
}

export interface StreakStats {
  current: number
  best: number
  loggedToday: boolean
  days: DayDot[] // last 7 days, oldest → newest
}

const MILESTONES = [3, 7, 14, 30, 60, 100, 180, 365]

/** The next milestone above the current streak (caps at the largest). */
export function nextMilestone(current: number): number {
  return MILESTONES.find((m) => m > current) ?? MILESTONES[MILESTONES.length - 1]
}

/** Rich streak data for the streak sheet: current, personal best, and a 7-day strip. */
export function streakStats(entries: Entry[]): StreakStats {
  const days = new Set(entries.map((e) => new Date(e.createdAt).toDateString()))
  const current = computeStreak(entries)

  // Personal best = longest consecutive run across all logged days.
  const times = [...days].map((d) => new Date(d).getTime()).sort((a, b) => a - b)
  let best = 0
  let run = 0
  let prev = 0
  for (const t of times) {
    run = prev && Math.round((t - prev) / 864e5) === 1 ? run + 1 : 1
    best = Math.max(best, run)
    prev = t
  }
  best = Math.max(best, current)

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const strip: DayDot[] = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    strip.push({
      label: d.toLocaleDateString('en-US', { weekday: 'narrow' }),
      hasEntry: days.has(d.toDateString()),
      isToday: i === 0,
    })
  }

  return { current, best, loggedToday: days.has(today.toDateString()), days: strip }
}
