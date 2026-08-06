import type { Entry } from '../types'

/**
 * Native IndexedDB wrapper for Mira. No external dependencies.
 *
 * Two stores:
 *  - `entries`  keyPath `id`  — one record per journal entry. Entries are stored
 *    by structured clone, so the ENTIRE object round-trips (no field whitelist);
 *    any new optional fields on `Entry` (e.g. `note`) survive automatically.
 *  - `kv`       keyPath `key` — small app data (app-lock config, future flags).
 *
 * Everything is best-effort: callers that need graceful degradation (e.g. when a
 * browser blocks IndexedDB in private mode) should catch and fall back. See
 * `storage.ts`, which mirrors writes to localStorage as a backup/fallback.
 */

const DB_NAME = 'mira'
const DB_VERSION = 1
export const ENTRY_STORE = 'entries'
export const KV_STORE = 'kv'

/** True when IndexedDB is usable in this environment. */
export function idbAvailable(): boolean {
  try {
    return typeof indexedDB !== 'undefined' && indexedDB !== null
  } catch {
    return false
  }
}

let dbPromise: Promise<IDBDatabase> | null = null

function openDB(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise
  dbPromise = new Promise<IDBDatabase>((resolve, reject) => {
    if (!idbAvailable()) {
      reject(new Error('IndexedDB unavailable'))
      return
    }
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onupgradeneeded = () => {
      const db = req.result
      if (!db.objectStoreNames.contains(ENTRY_STORE)) {
        db.createObjectStore(ENTRY_STORE, { keyPath: 'id' })
      }
      if (!db.objectStoreNames.contains(KV_STORE)) {
        db.createObjectStore(KV_STORE, { keyPath: 'key' })
      }
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error ?? new Error('IndexedDB open failed'))
  })
  // Reset the cached promise on failure so a later call can retry.
  dbPromise.catch(() => {
    dbPromise = null
  })
  return dbPromise
}

function tx<T>(
  store: string,
  mode: IDBTransactionMode,
  run: (s: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  return openDB().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const t = db.transaction(store, mode)
        const req = run(t.objectStore(store))
        t.oncomplete = () => resolve(req.result)
        t.onerror = () => reject(t.error ?? new Error('IndexedDB transaction failed'))
        t.onabort = () => reject(t.error ?? new Error('IndexedDB transaction aborted'))
      }),
  )
}

// ---------- Entries ----------

export function idbGetAllEntries(): Promise<Entry[]> {
  return tx<Entry[]>(ENTRY_STORE, 'readonly', (s) => s.getAll() as IDBRequest<Entry[]>)
}

/** Store the whole entry (spread so no field is dropped) under its id. */
export function idbPutEntry(entry: Entry): Promise<void> {
  return openDB().then(
    (db) =>
      new Promise<void>((resolve, reject) => {
        const t = db.transaction(ENTRY_STORE, 'readwrite')
        t.objectStore(ENTRY_STORE).put({ ...entry })
        t.oncomplete = () => resolve()
        t.onerror = () => reject(t.error ?? new Error('put failed'))
        t.onabort = () => reject(t.error ?? new Error('put aborted'))
      }),
  )
}

/** Bulk write in a single transaction (used for migration / import). */
export function idbPutEntries(entries: Entry[]): Promise<void> {
  return openDB().then(
    (db) =>
      new Promise<void>((resolve, reject) => {
        const t = db.transaction(ENTRY_STORE, 'readwrite')
        const store = t.objectStore(ENTRY_STORE)
        for (const e of entries) store.put({ ...e })
        t.oncomplete = () => resolve()
        t.onerror = () => reject(t.error ?? new Error('bulk put failed'))
        t.onabort = () => reject(t.error ?? new Error('bulk put aborted'))
      }),
  )
}

export function idbDeleteEntry(id: string): Promise<void> {
  return openDB().then(
    (db) =>
      new Promise<void>((resolve, reject) => {
        const t = db.transaction(ENTRY_STORE, 'readwrite')
        t.objectStore(ENTRY_STORE).delete(id)
        t.oncomplete = () => resolve()
        t.onerror = () => reject(t.error ?? new Error('delete failed'))
        t.onabort = () => reject(t.error ?? new Error('delete aborted'))
      }),
  )
}

/** Replace the entire entries store with the given list (single transaction). */
export function idbReplaceEntries(entries: Entry[]): Promise<void> {
  return openDB().then(
    (db) =>
      new Promise<void>((resolve, reject) => {
        const t = db.transaction(ENTRY_STORE, 'readwrite')
        const store = t.objectStore(ENTRY_STORE)
        store.clear()
        for (const e of entries) store.put({ ...e })
        t.oncomplete = () => resolve()
        t.onerror = () => reject(t.error ?? new Error('replace failed'))
        t.onabort = () => reject(t.error ?? new Error('replace aborted'))
      }),
  )
}

// ---------- Key/Value app data ----------

interface KVRecord {
  key: string
  value: unknown
}

export function idbGetKV<T>(key: string): Promise<T | null> {
  return tx<KVRecord | undefined>(KV_STORE, 'readonly', (s) => s.get(key) as IDBRequest<KVRecord | undefined>).then(
    (rec) => (rec ? (rec.value as T) : null),
  )
}

export function idbSetKV(key: string, value: unknown): Promise<void> {
  return openDB().then(
    (db) =>
      new Promise<void>((resolve, reject) => {
        const t = db.transaction(KV_STORE, 'readwrite')
        t.objectStore(KV_STORE).put({ key, value })
        t.oncomplete = () => resolve()
        t.onerror = () => reject(t.error ?? new Error('kv set failed'))
        t.onabort = () => reject(t.error ?? new Error('kv set aborted'))
      }),
  )
}

export function idbDeleteKV(key: string): Promise<void> {
  return openDB().then(
    (db) =>
      new Promise<void>((resolve, reject) => {
        const t = db.transaction(KV_STORE, 'readwrite')
        t.objectStore(KV_STORE).delete(key)
        t.oncomplete = () => resolve()
        t.onerror = () => reject(t.error ?? new Error('kv delete failed'))
        t.onabort = () => reject(t.error ?? new Error('kv delete aborted'))
      }),
  )
}
