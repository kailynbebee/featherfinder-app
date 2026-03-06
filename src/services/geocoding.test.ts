import { afterEach, describe, expect, it, vi } from 'vitest'
import { geocodeLocation, searchLocationSuggestions } from './geocoding'

describe('searchLocationSuggestions', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns suggestions from backend api', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({
        suggestions: [
          { lat: 45.52, lng: -122.67, label: 'Portland, Oregon, United States' },
          { lat: 43.66, lng: -70.25, label: 'Portland, Maine, United States' },
        ],
      }),
    } as Response)

    const results = await searchLocationSuggestions('Portland', 2)
    expect(results).toHaveLength(2)
    expect(results[0]?.label).toContain('Portland')
  })

  it('returns empty list for short query', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch')
    await expect(searchLocationSuggestions('p')).resolves.toEqual([])
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('returns a direct suggestion for valid coordinate input', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch')
    const results = await searchLocationSuggestions('19.4326, -99.1332', 5, { countryHint: 'us' })
    expect(results).toEqual([
      { lat: 19.4326, lng: -99.1332, label: '19.4326, -99.1332' },
    ])
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('passes bias and country to backend', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({ suggestions: [] }),
    } as Response)

    await searchLocationSuggestions('forest', 5, { bias: { lat: 45.5, lng: -122.6 }, countryHint: 'us' })
    const url = String(fetchMock.mock.calls[0]?.[0] ?? '')
    expect(url).toContain('/api/location/suggest')
    expect(url).toContain('country=us')
    expect(url).toContain('lat=45.5')
  })

  it('falls back to direct nominatim when backend returns empty list', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ suggestions: [] }),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [
          { lat: '45.52', lon: '-122.67', display_name: 'Portland, Oregon, United States' },
        ],
      } as Response)

    const results = await searchLocationSuggestions('portland', 5, { countryHint: 'us' })
    expect(results[0]?.label).toContain('Portland, Oregon')
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('does not force US filter for explicit multi-region query text', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ suggestions: [] }),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ features: [] }),
      } as Response)

    await searchLocationSuggestions('Mexico City, Mexico', 5, { countryHint: 'us' })
    const nominatimUrl = String(fetchMock.mock.calls[1]?.[0] ?? '')
    expect(nominatimUrl).toContain('nominatim.openstreetmap.org/search')
    expect(nominatimUrl).not.toContain('countrycodes=us')
  })
})

describe('geocodeLocation', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns a location from backend api', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        location: { lat: 40.7128, lng: -74.006, label: 'New York, New York, United States' },
      }),
    } as Response)

    await expect(geocodeLocation('New York')).resolves.toEqual({
      lat: 40.7128,
      lng: -74.006,
      label: 'New York, New York, United States',
    })
  })

  it('throws no-results error for 404', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: false,
      status: 404,
      json: async () => ({}),
    } as Response)

    await expect(geocodeLocation('unknown')).rejects.toThrow(
      'No matching location found. Try a city, postal code, or full address.'
    )
  })

  it('throws validation error for short query', async () => {
    await expect(geocodeLocation('a')).rejects.toThrow('Please enter a more specific location.')
  })

  it('accepts coordinate input directly', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch')
    await expect(geocodeLocation('19.4326, -99.1332')).resolves.toEqual({
      lat: 19.4326,
      lng: -99.1332,
      label: '19.4326, -99.1332',
    })
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('throws range validation for invalid coordinates', async () => {
    await expect(geocodeLocation('190.4, -99.1')).rejects.toThrow(
      'Latitude must be between -90 and 90.'
    )
  })
})
