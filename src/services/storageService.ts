/**
 * Thin IndexedDB wrapper for browser-local prototype persistence.
 * Falls back to an in-memory store if IndexedDB is unavailable
 * (private mode, blocked storage), so the app never crashes.
 */

const DB_NAME = 'kalsync'
const DB_VERSION = 1
export const STORES = {
  reports: 'reports', // user-submitted reports (keyPath: id)
  overrides: 'overrides', // status changes on demo reports (keyPath: id)
  images: 'images', // photo Blobs (out-of-line keys)
} as const
type StoreName = (typeof STORES)[keyof typeof STORES]

let dbPromise: Promise<IDBDatabase | null> | null = null
const memory: Record<StoreName, Map<string, unknown>> = {
  reports: new Map(),
  overrides: new Map(),
  images: new Map(),
}

function openDb(): Promise<IDBDatabase | null> {
  if (dbPromise) return dbPromise
  dbPromise = new Promise((resolve) => {
    try {
      if (typeof indexedDB === 'undefined') return resolve(null)
      const req = indexedDB.open(DB_NAME, DB_VERSION)
      req.onupgradeneeded = () => {
        const db = req.result
        if (!db.objectStoreNames.contains(STORES.reports)) db.createObjectStore(STORES.reports, { keyPath: 'id' })
        if (!db.objectStoreNames.contains(STORES.overrides)) db.createObjectStore(STORES.overrides, { keyPath: 'id' })
        if (!db.objectStoreNames.contains(STORES.images)) db.createObjectStore(STORES.images)
      }
      req.onsuccess = () => resolve(req.result)
      req.onerror = () => resolve(null)
      req.onblocked = () => resolve(null)
    } catch {
      resolve(null)
    }
  })
  return dbPromise
}

function wrap<T>(req: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

export async function getAll<T>(store: StoreName): Promise<T[]> {
  const db = await openDb()
  if (!db) return [...memory[store].values()] as T[]
  return wrap(db.transaction(store, 'readonly').objectStore(store).getAll()) as Promise<T[]>
}

export async function get<T>(store: StoreName, key: string): Promise<T | undefined> {
  const db = await openDb()
  if (!db) return memory[store].get(key) as T | undefined
  return wrap(db.transaction(store, 'readonly').objectStore(store).get(key)) as Promise<T | undefined>
}

export async function put<T extends object>(store: StoreName, value: T, key?: string): Promise<void> {
  const db = await openDb()
  if (!db) {
    const k = key ?? (value as { id: string }).id
    memory[store].set(k, value)
    return
  }
  const os = db.transaction(store, 'readwrite').objectStore(store)
  await wrap(key ? os.put(value, key) : os.put(value))
}

export async function remove(store: StoreName, key: string): Promise<void> {
  const db = await openDb()
  if (!db) {
    memory[store].delete(key)
    return
  }
  await wrap(db.transaction(store, 'readwrite').objectStore(store).delete(key))
}

export async function clear(store: StoreName): Promise<void> {
  const db = await openDb()
  if (!db) {
    memory[store].clear()
    return
  }
  await wrap(db.transaction(store, 'readwrite').objectStore(store).clear())
}

/** Small JSON values (e.g. confirmation flags) in localStorage, failure-tolerant. */
export const local = {
  read<T>(key: string, fallback: T): T {
    try {
      const raw = localStorage.getItem(key)
      return raw ? (JSON.parse(raw) as T) : fallback
    } catch {
      return fallback
    }
  },
  write(key: string, value: unknown) {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      /* storage blocked — keep in memory only */
    }
  },
}
