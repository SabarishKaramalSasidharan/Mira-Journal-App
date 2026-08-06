import type { Entry } from '../types'
import {
  idbAvailable,
  idbDeleteEntry,
  idbDeleteKV,
  idbGetAllEntries,
  idbGetKV,
  idbPutEntries,
  idbPutEntry,
  idbReplaceEntries,
  idbSetKV,
} from './db'

/**
 * Persistence facade for Mira.
 *
 * Entries live in IndexedDB (durable, large-capacity, survives more than
 * localStorage). Every write is also mirrored to localStorage as a lightweight
 * backup/fallback so nothing is lost if IndexedDB is unavailable (private mode,
 * quota, etc.). On first run we migrate any existing localStorage entries into
 * IndexedDB without deleting the localStorage copy.
 *
 * The persistence functions are async, but the pure streak helpers below stay
 * synchronous — only `App.tsx` awaits the async ones, keeping child components
 * (which receive entries via props) unchanged.
 */

const KEY = 'mira.entries.v1'

// ---------- localStorage fallback/backup ----------

function readLocal(): Entry[] {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as Entry[]) : []
  } catch {
    return []
  }
}

function writeLocal(entries: Entry[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(entries))
  } catch {
    /* best-effort backup only */
  }
}

/** Newest first — deterministic order regardless of the IndexedDB key order. */
function sortByNewest(entries: Entry[]): Entry[] {
  return [...entries].sort((a, b) => b.createdAt - a.createdAt)
}

// One-time migration guard: ensures localStorage entries are seeded into IDB.
let readyPromise: Promise<void> | null = null

async function ensureReady(): Promise<void> {
  if (readyPromise) return readyPromise
  readyPromise = (async () => {
    if (!idbAvailable()) return
    try {
      const existing = await idbGetAllEntries()
      if (existing.length === 0) {
        const local = readLocal()
        if (local.length > 0) {
          // First run after upgrade: import legacy localStorage entries.
          // localStorage is intentionally kept as a backup (not cleared).
          await idbPutEntries(local)
        }
      }
    } catch {
      /* fall back to localStorage silently */
    }
  })()
  return readyPromise
}

/** All entries, newest first. Runs the one-time localStorage→IDB migration. */
export async function loadEntries(): Promise<Entry[]> {
  await ensureReady()
  if (idbAvailable()) {
    try {
      const all = await idbGetAllEntries()
      // Keep the localStorage backup in sync with what's durable.
      writeLocal(sortByNewest(all))
      return sortByNewest(all)
    } catch {
      /* fall through to localStorage */
    }
  }
  return sortByNewest(readLocal())
}

/** Replace all entries (kept for API compatibility). */
export async function saveEntries(entries: Entry[]): Promise<void> {
  writeLocal(sortByNewest(entries))
  if (idbAvailable()) {
    try {
      await idbReplaceEntries(entries)
    } catch {
      /* localStorage backup already written */
    }
  }
}

/** Insert or update a single entry; returns the full list, newest first. */
export async function upsertEntry(entry: Entry): Promise<Entry[]> {
  await ensureReady()
  if (idbAvailable()) {
    try {
      await idbPutEntry(entry)
      const all = sortByNewest(await idbGetAllEntries())
      writeLocal(all)
      return all
    } catch {
      /* fall through to localStorage */
    }
  }
  const list = readLocal()
  const idx = list.findIndex((e) => e.id === entry.id)
  if (idx >= 0) list[idx] = entry
  else list.unshift(entry)
  const sorted = sortByNewest(list)
  writeLocal(sorted)
  return sorted
}

/** Delete an entry by id; returns the remaining list, newest first. */
export async function deleteEntry(id: string): Promise<Entry[]> {
  await ensureReady()
  if (idbAvailable()) {
    try {
      await idbDeleteEntry(id)
      const all = sortByNewest(await idbGetAllEntries())
      writeLocal(all)
      return all
    } catch {
      /* fall through to localStorage */
    }
  }
  const sorted = sortByNewest(readLocal().filter((e) => e.id !== id))
  writeLocal(sorted)
  return sorted
}

// ---------- Backup: export / import ----------

export interface BackupData {
  app: 'mira'
  version: 1
  exportedAt: number
  entries: Entry[]
}

/** Snapshot of all app data for a downloadable backup file. */
export async function exportBackup(): Promise<BackupData> {
  const entries = await loadEntries()
  return { app: 'mira', version: 1, exportedAt: Date.now(), entries }
}

export interface ImportResult {
  entries: Entry[]
  added: number
  updated: number
  total: number
}

function isEntry(v: unknown): v is Entry {
  if (!v || typeof v !== 'object') return false
  const e = v as Record<string, unknown>
  return typeof e.id === 'string' && typeof e.createdAt === 'number' && Array.isArray(e.turns)
}

/**
 * Merge backup entries into the store, deduping by id. For a colliding id we
 * keep whichever version looks "newer": more conversation turns wins, then a
 * longer summary — a heuristic so we don't clobber richer/edited data.
 */
export async function importBackup(raw: unknown): Promise<ImportResult> {
  const incoming: unknown[] = Array.isArray(raw)
    ? raw
    : raw && typeof raw === 'object' && Array.isArray((raw as BackupData).entries)
      ? (raw as BackupData).entries
      : []

  const valid = incoming.filter(isEntry)
  if (valid.length === 0 && incoming.length > 0) {
    throw new Error('No valid Mira entries found in that file.')
  }

  const current = await loadEntries()
  const byId = new Map<string, Entry>(current.map((e) => [e.id, e]))
  let added = 0
  let updated = 0

  for (const entry of valid) {
    const existing = byId.get(entry.id)
    if (!existing) {
      byId.set(entry.id, entry)
      added++
    } else if (isNewer(entry, existing)) {
      byId.set(entry.id, entry)
      updated++
    }
  }

  const merged = sortByNewest([...byId.values()])
  await saveEntries(merged)
  return { entries: merged, added, updated, total: merged.length }
}

function isNewer(candidate: Entry, existing: Entry): boolean {
  if (candidate.turns.length !== existing.turns.length) {
    return candidate.turns.length > existing.turns.length
  }
  return (candidate.summary?.length ?? 0) > (existing.summary?.length ?? 0)
}

// ---------- App lock (hashed PIN) ----------
//
// SECURITY NOTE: This is a UI gate for a local-first app, NOT at-rest
// encryption. We store only a random salt + SHA-256(salt + pin) — never the raw
// PIN. Someone with direct disk/devtools access can still read the (unencrypted)
// entries; the lock deters casual access to an unlocked device.

export interface LockConfig {
  salt: string // hex
  hash: string // hex, SHA-256 of salt + pin
  length: number // digit count (4–6)
  createdAt: number
}

const LOCK_KEY = 'mira.lock.v1'

function toHex(buf: ArrayBuffer): string {
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

async function hashPin(pin: string, saltHex: string): Promise<string> {
  const data = new TextEncoder().encode(`${saltHex}:${pin}`)
  const digest = await crypto.subtle.digest('SHA-256', data)
  return toHex(digest)
}

/** Build (but do not persist) a lock config for the given PIN. */
export async function makeLock(pin: string): Promise<LockConfig> {
  const salt = toHex(crypto.getRandomValues(new Uint8Array(16)).buffer)
  const hash = await hashPin(pin, salt)
  return { salt, hash, length: pin.length, createdAt: Date.now() }
}

export async function verifyPin(pin: string, config: LockConfig): Promise<boolean> {
  const hash = await hashPin(pin, config.salt)
  return timingSafeEqual(hash, config.hash)
}

// Constant-time-ish string compare (both are fixed-length hex here).
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let mismatch = 0
  for (let i = 0; i < a.length; i++) mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return mismatch === 0
}

export async function loadLock(): Promise<LockConfig | null> {
  if (idbAvailable()) {
    try {
      const fromIdb = await idbGetKV<LockConfig>(LOCK_KEY)
      if (fromIdb) return fromIdb
    } catch {
      /* fall through to localStorage */
    }
  }
  try {
    const raw = localStorage.getItem(LOCK_KEY)
    return raw ? (JSON.parse(raw) as LockConfig) : null
  } catch {
    return null
  }
}

export async function saveLock(config: LockConfig): Promise<void> {
  try {
    localStorage.setItem(LOCK_KEY, JSON.stringify(config))
  } catch {
    /* best-effort mirror */
  }
  if (idbAvailable()) {
    try {
      await idbSetKV(LOCK_KEY, config)
    } catch {
      /* localStorage mirror already written */
    }
  }
}

export async function clearLock(): Promise<void> {
  try {
    localStorage.removeItem(LOCK_KEY)
  } catch {
    /* ignore */
  }
  if (idbAvailable()) {
    try {
      await idbDeleteKV(LOCK_KEY)
    } catch {
      /* ignore */
    }
  }
}

// ---------- Streak helpers (pure, synchronous) ----------

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
