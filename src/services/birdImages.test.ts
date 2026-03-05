import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  clearBirdImageCache,
  formatImageCaption,
  getBirdImage,
  getBirdImageUrl,
} from './birdImages'

describe('getBirdImage', () => {
  beforeEach(() => {
    clearBirdImageCache()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('fetches from /api/birds/image with scientific name', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({
        url: 'https://example.com/bird.jpg',
        attributionName: 'Jane Doe',
        licenseCode: 'cc-by-nc',
      }),
    } as Response)

    const result = await getBirdImage('norcar', 'Cardinalis cardinalis')

    expect(fetchMock).toHaveBeenCalledTimes(1)
    const callUrl = String(fetchMock.mock.calls[0]?.[0] ?? '')
    expect(callUrl).toContain('/api/birds/image')
    expect(callUrl).toContain('q=Cardinalis%20cardinalis')
    expect(result.url).toBe('https://example.com/bird.jpg')
    expect(result.attributionName).toBe('Jane Doe')
    expect(result.licenseCode).toBe('cc-by-nc')
  })

  it('returns null url when API returns no url', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({ url: null }),
    } as Response)

    const result = await getBirdImage('norcar', 'Cardinalis cardinalis')

    expect(result.url).toBeNull()
  })

  it('returns null on fetch error', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('Network error'))

    const result = await getBirdImage('norcar', 'Cardinalis cardinalis')

    expect(result.url).toBeNull()
  })

  it('caches results', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({ url: 'https://example.com/bird.jpg' }),
    } as Response)

    await getBirdImage('norcar', 'Cardinalis cardinalis')
    const result2 = await getBirdImage('norcar', 'Cardinalis cardinalis')

    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(result2.url).toBe('https://example.com/bird.jpg')
  })
})

describe('getBirdImageUrl', () => {
  beforeEach(() => {
    clearBirdImageCache()
  })

  it('returns url for backward compatibility', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({ url: 'https://example.com/bird.jpg' }),
    } as Response)

    const url = await getBirdImageUrl('norcar', 'Cardinalis cardinalis')

    expect(url).toBe('https://example.com/bird.jpg')
  })
})

describe('formatImageCaption', () => {
  it('formats caption with author and license', () => {
    const result = formatImageCaption({
      url: 'https://example.com/bird.jpg',
      attribution: null,
      attributionName: 'Richard Wottrich',
      licenseCode: 'cc-by-nc',
    })
    expect(result).toBe('Photo by Richard Wottrich · (CC BY NC)')
  })

  it('returns null when url is null', () => {
    const result = formatImageCaption({
      url: null,
      attribution: null,
      attributionName: 'Jane',
      licenseCode: 'cc-by',
    })
    expect(result).toBeNull()
  })

  it('omits author when missing', () => {
    const result = formatImageCaption({
      url: 'https://example.com/bird.jpg',
      attribution: null,
      attributionName: null,
      licenseCode: 'cc-by',
    })
    expect(result).toBe('(CC BY)')
  })

  it('returns null when no attribution data', () => {
    const result = formatImageCaption({
      url: 'https://example.com/bird.jpg',
      attribution: null,
      attributionName: null,
      licenseCode: null,
    })
    expect(result).toBeNull()
  })
})
