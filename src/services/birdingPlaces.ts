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

export async function getNearbyBirdingPlaces(
  centerLat: number,
  centerLng: number,
  options?: {
    distMiles?: number
    maxPlaces?: number
  }
): Promise<BirdingPlace[]> {
  const distMiles = options?.distMiles ?? 25
  const maxPlaces = options?.maxPlaces ?? 12
  const hotspotsUrl = new URL('/api/birds/hotspots', window.location.origin)
  hotspotsUrl.searchParams.set('lat', String(centerLat))
  hotspotsUrl.searchParams.set('lng', String(centerLng))
  hotspotsUrl.searchParams.set('dist', String(distMiles))

  const naturalUrl = new URL('/api/location/natural-places', window.location.origin)
  naturalUrl.searchParams.set('lat', String(centerLat))
  naturalUrl.searchParams.set('lng', String(centerLng))
  naturalUrl.searchParams.set('dist', String(distMiles))
  naturalUrl.searchParams.set('limit', String(Math.max(maxPlaces, 8)))

  const [hotspotRes, naturalRes] = await Promise.allSettled([
    fetch(hotspotsUrl.toString()),
    fetch(naturalUrl.toString()),
  ])

  const hotspots: BirdingPlace[] = []
  if (hotspotRes.status === 'fulfilled' && hotspotRes.value.ok) {
    const payload = await hotspotRes.value.json()
    const list = Array.isArray(payload) ? payload : []
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
  }

  const naturals: BirdingPlace[] = []
  if (naturalRes.status === 'fulfilled' && naturalRes.value.ok) {
    const payload = await naturalRes.value.json()
    const list = Array.isArray(payload) ? payload : []
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
  }

  const byKey = new Map<string, BirdingPlace>()
  for (const place of [...hotspots, ...naturals]) {
    const key = `${place.name.toLowerCase()}::${place.lat.toFixed(3)}::${place.lng.toFixed(3)}`
    if (!byKey.has(key)) byKey.set(key, place)
  }

  const ranked = Array.from(byKey.values()).sort((a, b) => {
    if (a.source !== b.source) return a.source === 'hotspot' ? -1 : 1
    return a.distanceMiles - b.distanceMiles
  })

  return ranked.slice(0, maxPlaces)
}
