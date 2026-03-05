import { TTLCache } from './cache'
import { searchNominatim } from './nominatimClient'
import { searchPhoton } from './photonClient'
import { rankSuggestions } from './ranking'
import type { LocationSuggestion, SuggestRequest, SuggestionBias } from './types'

const SUGGEST_CACHE = new TTLCache<LocationSuggestion[]>(3 * 60 * 1000)

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

  const fetchLimit = Math.max(request.limit * 4, 20)
  let candidates = await searchNominatim({
    query: request.query,
    limit: fetchLimit,
    countryHint: request.countryHint,
    bias: request.bias,
  })
  if (candidates.length === 0) {
    candidates = await searchPhoton(request.query, fetchLimit, request.bias)
  }

  const ranked = rankSuggestions(candidates, request.query, request.bias).slice(0, request.limit)
  if (ranked.length > 0) SUGGEST_CACHE.set(cacheKey, ranked)
  return ranked
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
