type CacheEntry<T> = {
  value: T
  expiresAtMs: number
}

export class TTLCache<T> {
  private readonly ttlMs: number
  private readonly cache = new Map<string, CacheEntry<T>>()

  constructor(ttlMs: number) {
    this.ttlMs = ttlMs
  }

  get(key: string): T | null {
    const entry = this.cache.get(key)
    if (!entry) return null
    if (Date.now() > entry.expiresAtMs) {
      this.cache.delete(key)
      return null
    }
    return entry.value
  }

  set(key: string, value: T): void {
    this.cache.set(key, {
      value,
      expiresAtMs: Date.now() + this.ttlMs,
    })
  }
}
