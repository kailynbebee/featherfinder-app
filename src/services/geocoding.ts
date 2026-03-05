export type GeocodedLocation = {
  lat: number
  lng: number
  label: string
}

export type LocationSuggestion = GeocodedLocation

export type SuggestionBias = { lat: number; lng: number }

type SearchLocationSuggestionsOptions = {
  bias?: SuggestionBias | null
  countryHint?: string | null
}

const REQUEST_TIMEOUT_MS = 3500
const NOMINATIM_SEARCH_URL = 'https://nominatim.openstreetmap.org/search'
const PHOTON_SEARCH_URL = 'https://photon.komoot.io/api/'
const US_ZIP_QUERY_REGEX = /^\d{5}(?:-\d{4})?$/
const PARTIAL_US_ZIP_QUERY_REGEX = /^\d{2,5}$/

type NominatimResult = {
  lat: string
  lon: string
  display_name: string
}

function toErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message
  return 'Location search is unavailable right now. Please try again.'
}

async function fetchWithTimeout(url: string, init?: RequestInit): Promise<Response> {
  const timeoutController = new AbortController()
  const mergedSignal = init?.signal
  const timeoutId = setTimeout(() => timeoutController.abort(), REQUEST_TIMEOUT_MS)

  if (mergedSignal) {
    mergedSignal.addEventListener('abort', () => timeoutController.abort(), { once: true })
  }

  try {
    return await fetch(url, {
      ...init,
      signal: timeoutController.signal,
      headers: {
        Accept: 'application/json',
        ...(init?.headers ?? {}),
      },
    })
  } finally {
    clearTimeout(timeoutId)
  }
}

function parseNominatimResults(payload: unknown): LocationSuggestion[] {
  if (!Array.isArray(payload)) return []
  return payload.flatMap((item) => {
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

function buildNominatimUrl(query: string, limit: number, options?: SearchLocationSuggestionsOptions): string {
  const url = new URL(NOMINATIM_SEARCH_URL)
  url.searchParams.set('q', query)
  url.searchParams.set('format', 'jsonv2')
  url.searchParams.set('limit', String(limit))
  const countryHint = options?.countryHint?.trim().toLowerCase()
  const useUsByZip = US_ZIP_QUERY_REGEX.test(query) || PARTIAL_US_ZIP_QUERY_REGEX.test(query)
  if (useUsByZip || countryHint === 'us') {
    url.searchParams.set('countrycodes', 'us')
  } else if (countryHint && /^[a-z]{2}$/.test(countryHint)) {
    url.searchParams.set('countrycodes', countryHint)
  }
  if (options?.bias) {
    const latDelta = 1.5
    const lngDelta = 2.5
    const left = Math.max(-180, options.bias.lng - lngDelta)
    const right = Math.min(180, options.bias.lng + lngDelta)
    const top = Math.min(90, options.bias.lat + latDelta)
    const bottom = Math.max(-90, options.bias.lat - latDelta)
    url.searchParams.set('viewbox', `${left},${top},${right},${bottom}`)
  }
  return url.toString()
}

async function searchDirectNominatim(
  query: string,
  limit: number,
  options?: SearchLocationSuggestionsOptions,
  signal?: AbortSignal
): Promise<LocationSuggestion[]> {
  const response = await fetchWithTimeout(buildNominatimUrl(query, limit, options), { signal })
  if (!response.ok) return []
  try {
    const payload = await response.json()
    return parseNominatimResults(payload)
  } catch {
    return []
  }
}

type PhotonFeature = {
  geometry?: { coordinates?: [number, number] }
  properties?: { name?: string; country?: string; state?: string; city?: string; postcode?: string }
}

function parsePhotonResults(payload: unknown): LocationSuggestion[] {
  const fc = payload as { features?: PhotonFeature[] }
  if (!Array.isArray(fc?.features)) return []
  return fc.features.flatMap((f) => {
    const coords = f.geometry?.coordinates
    if (!coords || coords.length < 2) return []
    const lng = Number(coords[0])
    const lat = Number(coords[1])
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return []
    const p = f.properties ?? {}
    const parts = [p.name, p.city, p.state, p.country].filter(Boolean)
    const label = parts.length > 0 ? parts.join(', ') : `${lat}, ${lng}`
    return [{ lat, lng, label }]
  })
}

async function searchPhoton(
  query: string,
  limit: number,
  _options?: SearchLocationSuggestionsOptions,
  signal?: AbortSignal
): Promise<LocationSuggestion[]> {
  const url = new URL(PHOTON_SEARCH_URL)
  url.searchParams.set('q', query)
  url.searchParams.set('limit', String(limit))
  const response = await fetchWithTimeout(url.toString(), { signal })
  if (!response.ok) return []
  try {
    const payload = await response.json()
    return parsePhotonResults(payload)
  } catch {
    return []
  }
}

export async function searchLocationSuggestions(
  rawQuery: string,
  limit = 5,
  options?: SearchLocationSuggestionsOptions,
  signal?: AbortSignal
): Promise<LocationSuggestion[]> {
  const query = rawQuery.trim()
  if (query.length < 2) return []

  const clampedLimit = Math.max(1, Math.min(limit, 8))
  const url = new URL('/api/location/suggest', window.location.origin)
  url.searchParams.set('q', query)
  url.searchParams.set('limit', String(clampedLimit))
  if (options?.countryHint) {
    url.searchParams.set('country', options.countryHint)
  }
  if (options?.bias) {
    url.searchParams.set('lat', String(options.bias.lat))
    url.searchParams.set('lng', String(options.bias.lng))
  }

  try {
    const response = await fetchWithTimeout(url.toString(), { signal })
    if (!response.ok) {
      const fromNominatim = await searchDirectNominatim(query, clampedLimit, options, signal)
      if (fromNominatim.length > 0) return fromNominatim
      return await searchPhoton(query, clampedLimit, options, signal)
    }
    const data = await response.json() as { suggestions?: LocationSuggestion[] }
    const suggestions = Array.isArray(data.suggestions) ? data.suggestions : []
    if (suggestions.length > 0) return suggestions
    const fromNominatim = await searchDirectNominatim(query, clampedLimit, options, signal)
    if (fromNominatim.length > 0) return fromNominatim
    return await searchPhoton(query, clampedLimit, options, signal)
  } catch {
    try {
      const fromNominatim = await searchDirectNominatim(query, clampedLimit, options, signal)
      if (fromNominatim.length > 0) return fromNominatim
      return await searchPhoton(query, clampedLimit, options, signal)
    } catch {
      try {
        return await searchPhoton(query, clampedLimit, options, signal)
      } catch {
        return []
      }
    }
  }
}

export async function geocodeLocation(rawQuery: string, countryHint?: string | null): Promise<GeocodedLocation> {
  const query = rawQuery.trim()
  if (query.length < 2) {
    throw new Error('Please enter a more specific location.')
  }

  const url = new URL('/api/location/geocode', window.location.origin)
  url.searchParams.set('q', query)
  if (countryHint) {
    url.searchParams.set('country', countryHint)
  }

  try {
    const response = await fetchWithTimeout(url.toString())
    if (response.ok) {
      const data = await response.json() as { location?: GeocodedLocation }
      if (data.location) {
        return data.location
      }
    }
    const fromNominatim = await searchDirectNominatim(query, 1, { countryHint: countryHint ?? null })
    if (fromNominatim[0]) return fromNominatim[0]
    const fromPhoton = await searchPhoton(query, 1, { countryHint: countryHint ?? null })
    if (fromPhoton[0]) return fromPhoton[0]
    throw new Error('No matching location found. Try a city, postal code, or full address.')
  } catch (error) {
    if (error instanceof Error && error.message.includes('No matching location found')) {
      throw error
    }
    throw new Error(toErrorMessage(error))
  }
}
