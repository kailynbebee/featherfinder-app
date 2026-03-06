export type BirdingPlaceSource = 'hotspot' | 'natural'

export type BirdingPlace = {
  id: string
  name: string
  lat: number
  lng: number
  distanceMiles: number
  source: BirdingPlaceSource
}

type EBirdHotspot = {
  locId: string
  locName: string
  lat: number
  lng: number
}

type NaturalPlace = {
  name: string
  lat: number
  lng: number
}

const KM_PER_MILE = 1.60934
const PLACES_CACHE_TTL_MS = 2 * 60 * 1000
const placesCache = new Map<string, { value: BirdingPlace[]; expiresAtMs: number }>()

function haversineMiles(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return (R * c) / KM_PER_MILE
}

function toDistanceMiles(
  lat: number,
  lng: number,
  centerLat: number,
  centerLng: number
): number {
  return Number(haversineMiles(centerLat, centerLng, lat, lng).toFixed(1))
}

function toPlaceDedupKey(place: BirdingPlace): string {
  return `${place.name.toLowerCase()}::${place.lat.toFixed(3)}::${place.lng.toFixed(3)}`
}

function mergeAndRankPlaces(places: BirdingPlace[], maxPlaces: number): BirdingPlace[] {
  const byKey = new Map<string, BirdingPlace>()
  for (const place of places) {
    const key = toPlaceDedupKey(place)
    if (!byKey.has(key)) byKey.set(key, place)
  }
  const ranked = Array.from(byKey.values()).sort((a, b) => {
    if (a.source !== b.source) return a.source === 'hotspot' ? -1 : 1
    return a.distanceMiles - b.distanceMiles
  })
  return ranked.slice(0, maxPlaces)
}

function parseHotspots(
  payload: unknown,
  centerLat: number,
  centerLng: number,
  distMiles: number
): BirdingPlace[] {
  const list = Array.isArray(payload) ? payload : []
  const hotspots: BirdingPlace[] = []
  for (const item of list) {
    const h = item as Partial<EBirdHotspot>
    if (!h.locId || !h.locName || typeof h.lat !== 'number' || typeof h.lng !== 'number') continue
    const distanceMiles = toDistanceMiles(h.lat, h.lng, centerLat, centerLng)
    if (distanceMiles > distMiles) continue
    hotspots.push({
      id: `hotspot:${h.locId}`,
      name: h.locName,
      lat: h.lat,
      lng: h.lng,
      distanceMiles,
      source: 'hotspot',
    })
  }
  return hotspots
}

function parseNaturals(
  payload: unknown,
  centerLat: number,
  centerLng: number,
  distMiles: number
): BirdingPlace[] {
  const list = Array.isArray(payload) ? payload : []
  const naturals: BirdingPlace[] = []
  for (const item of list) {
    const n = item as Partial<NaturalPlace>
    if (!n.name || typeof n.lat !== 'number' || typeof n.lng !== 'number') continue
    const distanceMiles = toDistanceMiles(n.lat, n.lng, centerLat, centerLng)
    if (distanceMiles > distMiles) continue
    naturals.push({
      id: `natural:${n.name}:${n.lat.toFixed(4)}:${n.lng.toFixed(4)}`,
      name: n.name,
      lat: n.lat,
      lng: n.lng,
      distanceMiles,
      source: 'natural',
    })
  }
  return naturals
}

function toPlacesCacheKey(
  centerLat: number,
  centerLng: number,
  distMiles: number,
  maxPlaces: number,
  includeNatural: boolean
): string {
  return [
    centerLat.toFixed(3),
    centerLng.toFixed(3),
    distMiles.toFixed(1),
    maxPlaces,
    includeNatural ? 'all' : 'hotspots',
  ].join(':')
}

type NearbyPlacesOptions = {
  distMiles?: number
  maxPlaces?: number
  includeNatural?: boolean
  signal?: AbortSignal
  forceRefresh?: boolean
}

export async function getNearbyBirdingPlaces(
  centerLat: number,
  centerLng: number,
  options?: NearbyPlacesOptions
): Promise<BirdingPlace[]> {
  const distMiles = options?.distMiles ?? 25
  const maxPlaces = options?.maxPlaces ?? 12
  const includeNatural = options?.includeNatural ?? true
  const cacheKey = toPlacesCacheKey(centerLat, centerLng, distMiles, maxPlaces, includeNatural)
  if (!options?.forceRefresh) {
    const cached = placesCache.get(cacheKey)
    if (cached && Date.now() <= cached.expiresAtMs) {
      return cached.value
    }
  }

  const hotspotsUrl = new URL('/api/birds/hotspots', window.location.origin)
  hotspotsUrl.searchParams.set('lat', String(centerLat))
  hotspotsUrl.searchParams.set('lng', String(centerLng))
  hotspotsUrl.searchParams.set('dist', String(distMiles))
  const hotspotRes = await fetch(hotspotsUrl.toString(), { signal: options?.signal })
  const hotspotPayload = hotspotRes.ok ? await hotspotRes.json() : []
  const hotspots = parseHotspots(hotspotPayload, centerLat, centerLng, distMiles)
  if (!includeNatural) {
    const rankedHotspots = mergeAndRankPlaces(hotspots, maxPlaces)
    placesCache.set(cacheKey, {
      value: rankedHotspots,
      expiresAtMs: Date.now() + PLACES_CACHE_TTL_MS,
    })
    return rankedHotspots
  }

  const naturalUrl = new URL('/api/location/natural-places', window.location.origin)
  naturalUrl.searchParams.set('lat', String(centerLat))
  naturalUrl.searchParams.set('lng', String(centerLng))
  naturalUrl.searchParams.set('dist', String(distMiles))
  naturalUrl.searchParams.set('limit', String(Math.max(maxPlaces, 8)))
  const naturalRes = await fetch(naturalUrl.toString(), { signal: options?.signal })
  const naturalPayload = naturalRes.ok ? await naturalRes.json() : []
  const naturals = parseNaturals(naturalPayload, centerLat, centerLng, distMiles)
  const ranked = mergeAndRankPlaces([...hotspots, ...naturals], maxPlaces)
  placesCache.set(cacheKey, {
    value: ranked,
    expiresAtMs: Date.now() + PLACES_CACHE_TTL_MS,
  })
  return ranked
}
