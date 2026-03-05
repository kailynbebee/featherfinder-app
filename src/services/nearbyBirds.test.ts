import { afterEach, describe, expect, it, vi } from 'vitest'
import { getNearbyBirds } from './nearbyBirds'

const location = {
  source: 'query' as const,
  lat: 40.7128,
  lng: -74.006,
  label: 'New York, NY',
}

describe('getNearbyBirds', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('calls /api/birds/nearby with lat and lng', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => [],
    } as Response)

    await getNearbyBirds(location)

    expect(fetchMock).toHaveBeenCalledTimes(1)
    const url = String(fetchMock.mock.calls[0]?.[0] ?? '')
    expect(url).toContain('/api/birds/nearby')
    expect(url).toContain('lat=40.7128')
    expect(url).toContain('lng=-74.006')
  })

  it('maps eBird observations to NearbyBird format', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => [
        {
          speciesCode: 'norcar',
          comName: 'Northern Cardinal',
          sciName: 'Cardinalis cardinalis',
          obsDt: '2025-03-01 08:30',
          locId: 'L123',
          lat: 40.72,
          lng: -74.01,
        },
      ],
    } as Response)

    const birds = await getNearbyBirds(location)

    expect(birds).toHaveLength(1)
    expect(birds[0]).toMatchObject({
      id: 'norcar',
      commonName: 'Northern Cardinal',
      scientificName: 'Cardinalis cardinalis',
      group: 'other',
      lat: 40.72,
      lng: -74.01,
    })
    expect(typeof birds[0]?.distanceMiles).toBe('number')
    expect(typeof birds[0]?.lastSeenHoursAgo).toBe('number')
  })

  it('picks closest observation when same species appears multiple times', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => [
        {
          speciesCode: 'norcar',
          comName: 'Northern Cardinal',
          sciName: 'Cardinalis cardinalis',
          obsDt: '2025-03-01 08:30',
          locId: 'L1',
          lat: 40.72,
          lng: -74.01,
        },
        {
          speciesCode: 'norcar',
          comName: 'Northern Cardinal',
          sciName: 'Cardinalis cardinalis',
          obsDt: '2025-03-02 10:00',
          locId: 'L2',
          lat: 40.75,
          lng: -74.02,
        },
      ],
    } as Response)

    const birds = await getNearbyBirds(location)

    expect(birds).toHaveLength(1)
    expect(birds[0]?.id).toBe('norcar')
  })

  it('sorts birds by distance', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => [
        {
          speciesCode: 'far',
          comName: 'Far Bird',
          sciName: 'Farus birdus',
          obsDt: '2025-03-01',
          locId: 'L1',
          lat: 41.5,
          lng: -74.5,
        },
        {
          speciesCode: 'near',
          comName: 'Near Bird',
          sciName: 'Nearus birdus',
          obsDt: '2025-03-01',
          locId: 'L2',
          lat: 40.72,
          lng: -74.01,
        },
      ],
    } as Response)

    const birds = await getNearbyBirds(location)

    expect(birds[0]?.id).toBe('near')
    expect(birds[1]?.id).toBe('far')
  })

  it('throws with API error message when response is not ok', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: false,
      json: async () => ({ error: 'eBird API key not configured. Set EBIRD_API_KEY in .env' }),
    } as Response)

    await expect(getNearbyBirds(location)).rejects.toThrow(
      'eBird API key not configured. Set EBIRD_API_KEY in .env'
    )
  })

  it('throws generic message when error response has no error field', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: false,
      json: async () => ({}),
    } as Response)

    await expect(getNearbyBirds(location)).rejects.toThrow('Could not load nearby birds.')
  })

  it('skips observations missing required fields', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => [
        {
          speciesCode: 'valid',
          comName: 'Valid Bird',
          sciName: 'Validus birdus',
          obsDt: '2025-03-01',
          locId: 'L1',
          lat: 40.72,
          lng: -74.01,
        },
        { comName: 'No speciesCode', sciName: 'X', obsDt: '2025-03-01', locId: 'L2', lat: 40, lng: -74 },
        null,
      ],
    } as Response)

    const birds = await getNearbyBirds(location)

    expect(birds).toHaveLength(1)
    expect(birds[0]?.id).toBe('valid')
  })
})
