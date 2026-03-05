import type { LocationSuggestion, ReverseGeocodeContext, SuggestionBias } from './types'

const NOMINATIM_SEARCH_URL = 'https://nominatim.openstreetmap.org/search'
const NOMINATIM_MIN_INTERVAL_MS = 1100 // Nominatim policy: max 1 req/sec; use 1.1s to be safe
const NOMINATIM_REVERSE_URL = 'https://nominatim.openstreetmap.org/reverse'
const US_ZIP_QUERY_REGEX = /^\d{5}(?:-\d{4})?$/
const PARTIAL_US_ZIP_QUERY_REGEX = /^\d{2,5}$/
const SHORT_QUERY_LENGTH = 6
const REQUEST_TIMEOUT_MS = 3500
const NOMINATIM_USER_AGENT = 'FeatherFinder/0.0.1 (location autocomplete)'

type NominatimResult = {
  lat: string
  lon: string
  display_name: string
}

type SearchArgs = {
  query: string
  limit: number
  countryHint?: string | null
  bias?: SuggestionBias | null
  bounded?: boolean
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

function applyBiasViewbox(url: URL, bias: SuggestionBias): void {
  const latDelta = 1.5
  const lngDelta = 2.5
  const left = clamp(bias.lng - lngDelta, -180, 180)
  const right = clamp(bias.lng + lngDelta, -180, 180)
  const top = clamp(bias.lat + latDelta, -90, 90)
  const bottom = clamp(bias.lat - latDelta, -90, 90)
  url.searchParams.set('viewbox', `${left},${top},${right},${bottom}`)
}

function sanitizeCountryCode(countryHint?: string | null): string | null {
  if (!countryHint) return null
  const normalized = countryHint.trim().toLowerCase()
  if (!/^[a-z]{2}$/.test(normalized)) return null
  return normalized
}

function hasLikelyUsBias(bias?: SuggestionBias | null): boolean {
  if (!bias) return false
  return bias.lat >= 18 && bias.lat <= 72 && bias.lng >= -179 && bias.lng <= -66
}

function parseResults(results: unknown): LocationSuggestion[] {
  if (!Array.isArray(results)) return []
  return results.flatMap((item) => {
    const result = item as Partial<NominatimResult>
    const lat = Number(result.lat)
    const lng = Number(result.lon)
    const label = result.display_name?.trim() ?? ''
    if (!Number.isFinite(lat) || !Number.isFinite(lng) || !label) {
      return []
    }
    return [{ lat, lng, label }]
  })
}

let lastNominatimRequestMs = 0

async function waitForRateLimit(): Promise<void> {
  const now = Date.now()
  const elapsed = now - lastNominatimRequestMs
  if (elapsed < NOMINATIM_MIN_INTERVAL_MS) {
    await new Promise((r) => setTimeout(r, NOMINATIM_MIN_INTERVAL_MS - elapsed))
  }
  lastNominatimRequestMs = Date.now()
}

async function fetchJsonWithTimeout(url: string, retryOn429 = true): Promise<unknown> {
  await waitForRateLimit()
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
        // Nominatim usage policy expects identifying User-Agent/Referer.
        'User-Agent': NOMINATIM_USER_AGENT,
      },
    })
    if (response.status === 429 && retryOn429) {
      await new Promise((r) => setTimeout(r, 2000))
      return fetchJsonWithTimeout(url, false)
    }
    if (!response.ok) return null
    return await response.json()
  } catch {
    return null
  } finally {
    clearTimeout(timeoutId)
  }
}

export async function searchNominatim(args: SearchArgs): Promise<LocationSuggestion[]> {
  const { query, limit, countryHint, bias, bounded } = args
  const url = new URL(NOMINATIM_SEARCH_URL)
  url.searchParams.set('q', query)
  url.searchParams.set('format', 'jsonv2')
  url.searchParams.set('limit', String(limit))

  const sanitizedCountry = sanitizeCountryCode(countryHint)
  const useUsByNumeric = US_ZIP_QUERY_REGEX.test(query) || PARTIAL_US_ZIP_QUERY_REGEX.test(query)
  const useUsByContext = query.length <= SHORT_QUERY_LENGTH && (sanitizedCountry === 'us' || hasLikelyUsBias(bias))
  if (useUsByNumeric || useUsByContext) {
    url.searchParams.set('countrycodes', 'us')
  } else if (sanitizedCountry) {
    url.searchParams.set('countrycodes', sanitizedCountry)
  }

  if (bias) {
    applyBiasViewbox(url, bias)
    if (bounded) {
      url.searchParams.set('bounded', '1')
    }
  }

  const json = await fetchJsonWithTimeout(url.toString())
  return parseResults(json)
}

export async function reverseNominatimContext(bias: SuggestionBias): Promise<ReverseGeocodeContext | null> {
  const url = new URL(NOMINATIM_REVERSE_URL)
  url.searchParams.set('lat', String(bias.lat))
  url.searchParams.set('lon', String(bias.lng))
  url.searchParams.set('format', 'jsonv2')
  url.searchParams.set('addressdetails', '1')

  const json = await fetchJsonWithTimeout(url.toString())
  if (!json || typeof json !== 'object') return null
  const address = (json as { address?: Record<string, string> }).address
  if (!address) return null
  return {
    state: address.state ?? null,
    county: address.county ?? null,
    countryCode: address.country_code?.toLowerCase() ?? null,
  }
}
