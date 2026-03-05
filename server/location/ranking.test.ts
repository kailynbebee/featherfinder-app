import { describe, expect, it } from 'vitest'
import { dedupeSuggestions, rankSuggestions } from './ranking'

describe('dedupeSuggestions', () => {
  it('removes duplicates by label and rounded coords', () => {
    const deduped = dedupeSuggestions([
      { label: 'Forest Grove, Oregon, United States', lat: 45.51999, lng: -122.98999 },
      { label: 'Forest Grove, Oregon, United States', lat: 45.519991, lng: -122.989991 },
      { label: 'Forest Grove, Pennsylvania, United States', lat: 41.0, lng: -75.0 },
    ])
    expect(deduped).toHaveLength(2)
  })
})

describe('rankSuggestions', () => {
  it('prefers nearest city-like result for same text match', () => {
    const ranked = rankSuggestions(
      [
        { label: 'Forest, Louisiana, United States', lat: 30.0, lng: -91.0 },
        { label: 'Forest Grove, Oregon, United States', lat: 45.52, lng: -122.98 },
      ],
      'forest',
      { lat: 45.58, lng: -123.0 }
    )
    expect(ranked[0]?.label).toContain('Forest Grove')
  })
})
