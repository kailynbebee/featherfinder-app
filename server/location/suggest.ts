import { TTLCache } from './cache'
import { searchNominatim } from './nominatimClient'
import { searchPhoton } from './photonClient'
import { rankSuggestions } from './ranking'
import type { LocationSuggestion, SuggestRequest, SuggestionBias } from './types'

const SUGGEST_CACHE = new TTLCache<LocationSuggestion[]>(3 * 60 * 1000)
const inFlightSuggestionRequests = new Map<string, Promise<LocationSuggestion[]>>()
const SECOND_SOURCE_GRACE_MS = 120

function parseBias(latRaw: string | null, lngRaw: string | null): SuggestionBias | null {
  if (!latRaw || !lngRaw) return null
  const lat = Number(latRaw)
  const lng = Number(lngRaw)
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null
  return { lat, lng }
}

function makeSuggestCacheKey(request: SuggestRequest): string {
  const biasKey = request.bias ? `${request.bias.lat.toFixed(2)},${request.bias.lng.toFixed(2)}` : 'none'
  return `q:${request.query.toLowerCase()}|l:${request.limit}|c:${request.countryHint ?? 'none'}|b:${biasKey}`
}

export function parseSuggestRequest(url: URL): SuggestRequest {
  const query = (url.searchParams.get('q') ?? '').trim()
  const limitRaw = Number(url.searchParams.get('limit') ?? '5')
  const limit = Number.isFinite(limitRaw) ? Math.max(1, Math.min(Math.floor(limitRaw), 8)) : 5
  const country = url.searchParams.get('country')
  const bias = parseBias(url.searchParams.get('lat'), url.searchParams.get('lng'))
  return {
    query,
    limit,
    countryHint: country?.trim().toLowerCase() ?? null,
    bias,
  }
}

export async function getSuggestions(request: SuggestRequest): Promise<LocationSuggestion[]> {
  if (request.query.length < 2) return []

  const cacheKey = makeSuggestCacheKey(request)
  const cached = SUGGEST_CACHE.get(cacheKey)
  if (cached) return cached
  const existingRequest = inFlightSuggestionRequests.get(cacheKey)
  if (existingRequest) return existingRequest

  const suggestionRequest = (async () => {
    const fetchLimit = Math.min(12, request.limit * 2 + 2)
    const nominatimRequest = searchNominatim({
      query: request.query,
      limit: fetchLimit,
      countryHint: request.countryHint,
      bias: request.bias,
    }).then((values) => ({ source: 'nominatim' as const, values }))
    const photonRequest = searchPhoton(request.query, fetchLimit, request.bias)
      .then((values) => ({ source: 'photon' as const, values }))

    const firstFinished = await Promise.race([nominatimRequest, photonRequest])
    const otherRequest =
      firstFinished.source === 'nominatim' ? photonRequest : nominatimRequest
    let candidates = firstFinished.values
    if (candidates.length === 0) {
      candidates = (await otherRequest).values
    } else {
      // Keep p95 latency low: merge second provider only if it returns almost immediately.
      const secondFinishedOrTimeout = await Promise.race([
        otherRequest,
        new Promise<null>((resolve) => {
          setTimeout(() => resolve(null), SECOND_SOURCE_GRACE_MS)
        }),
      ])
      if (secondFinishedOrTimeout?.values?.length) {
        candidates = [...candidates, ...secondFinishedOrTimeout.values]
      }
    }

    const ranked = rankSuggestions(candidates, request.query, request.bias).slice(0, request.limit)
    if (ranked.length > 0) SUGGEST_CACHE.set(cacheKey, ranked)
    return ranked
  })()
  inFlightSuggestionRequests.set(cacheKey, suggestionRequest)
  try {
    return await suggestionRequest
  } finally {
    inFlightSuggestionRequests.delete(cacheKey)
  }
}

export async function geocodeOne(query: string, countryHint?: string | null): Promise<LocationSuggestion | null> {
  const trimmed = query.trim()
  if (trimmed.length < 2) return null
  let suggestions = await searchNominatim({
    query: trimmed,
    limit: 1,
    countryHint: countryHint ?? null,
  })
  if (suggestions.length === 0) {
    suggestions = await searchPhoton(trimmed, 1)
  }
  return suggestions[0] ?? null
}
