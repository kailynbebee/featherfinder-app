import { describe, expect, it, vi } from 'vitest'
import { TTLCache } from './cache'

describe('TTLCache', () => {
  it('returns cached value before expiry and null after expiry', () => {
    vi.useFakeTimers()
    const cache = new TTLCache<string>(1000)
    cache.set('k', 'v')
    expect(cache.get('k')).toBe('v')
    vi.advanceTimersByTime(1001)
    expect(cache.get('k')).toBeNull()
    vi.useRealTimers()
  })
})
