import type { LocationSuggestion, SuggestionBias } from './types'

const PHOTON_SEARCH_URL = 'https://photon.komoot.io/api/'
const REQUEST_TIMEOUT_MS = 4000

type PhotonFeature = {
  geometry?: { coordinates?: [number, number] }
  properties?: { name?: string; country?: string; state?: string; city?: string }
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

async function fetchJson(url: string): Promise<unknown> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    })
    if (!response.ok) return null
    return await response.json()
  } catch {
    return null
  } finally {
    clearTimeout(timeoutId)
  }
}

export async function searchPhoton(
  query: string,
  limit: number,
  _bias?: SuggestionBias | null
): Promise<LocationSuggestion[]> {
  const url = new URL(PHOTON_SEARCH_URL)
  url.searchParams.set('q', query)
  url.searchParams.set('limit', String(limit))
  const json = await fetchJson(url.toString())
  return parsePhotonResults(json)
}
