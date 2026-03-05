import type { LocationValue } from '@/context/LocationContext'

export type BirdTag =
  | { type: 'country_bird'; country: string }
  | { type: 'subnational_bird'; regionCode: string; regionName: string }
  | { type: 'rare_sighting' }

export type NearbyBird = {
  id: string
  commonName: string
  scientificName: string
  distanceMiles: number
  lat: number
  lng: number
  group: 'songbird' | 'woodpecker' | 'raptor' | 'other'
  lastSeenHoursAgo: number
}

type EBirdObservation = {
  speciesCode: string
  comName: string
  sciName: string
  obsDt: string
  howMany?: number
  locId: string
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
  const R = 6371 // Earth radius in km
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

function hoursSinceObsDt(obsDt: string): number {
  const match = obsDt.match(/^(\d{4})-(\d{2})-(\d{2})(?:\s+(\d{1,2}):(\d{2}))?/)
  if (!match) return 0
  const [, y, m, d, h, min] = match
  const date = new Date(
    parseInt(y!, 10),
    parseInt(m!, 10) - 1,
    parseInt(d!, 10),
    h ? parseInt(h, 10) : 12,
    min ? parseInt(min, 10) : 0
  )
  return Math.max(0, (Date.now() - date.getTime()) / (1000 * 60 * 60))
}

function mapObservationToNearbyBird(
  obs: EBirdObservation,
  userLat: number,
  userLng: number
): NearbyBird {
  const raw = haversineMiles(userLat, userLng, obs.lat, obs.lng)
  const distanceMiles = Math.max(0, raw)
  const lastSeenHoursAgo = Math.round(hoursSinceObsDt(obs.obsDt))
  return {
    id: obs.speciesCode,
    commonName: obs.comName,
    scientificName: obs.sciName,
    distanceMiles: Number(distanceMiles.toFixed(1)),
    lat: obs.lat,
    lng: obs.lng,
    group: 'other',
    lastSeenHoursAgo,
  }
}

function deduplicateBySpecies(observations: EBirdObservation[]): EBirdObservation[] {
  const bySpecies = new Map<string, EBirdObservation>()
  for (const obs of observations) {
    const existing = bySpecies.get(obs.speciesCode)
    if (!existing) {
      bySpecies.set(obs.speciesCode, obs)
    }
  }
  return Array.from(bySpecies.values())
}

export async function getNearbyBirds(location: LocationValue): Promise<NearbyBird[]> {
  const params = new URLSearchParams({
    lat: String(location.lat),
    lng: String(location.lng),
    dist: '25',
    back: '14',
  })
  const url = `/api/birds/nearby?${params.toString()}`
  const res = await fetch(url)
  const data = await res.json()

  if (!res.ok) {
    const msg = typeof data?.error === 'string' ? data.error : 'Could not load nearby birds.'
    throw new Error(msg)
  }

  const observations = Array.isArray(data) ? data : []
  const valid = observations
    .filter(
      (o: unknown): o is EBirdObservation =>
        o != null &&
        typeof o === 'object' &&
        typeof (o as EBirdObservation).speciesCode === 'string' &&
        typeof (o as EBirdObservation).comName === 'string' &&
        typeof (o as EBirdObservation).sciName === 'string' &&
        typeof (o as EBirdObservation).obsDt === 'string'
    )
    .map((o) => ({
      ...o,
      lat: typeof o.lat === 'number' ? o.lat : parseFloat(String(o.lat)),
      lng: typeof o.lng === 'number' ? o.lng : parseFloat(String(o.lng)),
    }))
    .filter((o) => !Number.isNaN(o.lat) && !Number.isNaN(o.lng))

  const deduped = deduplicateBySpecies(valid)
  const birds = deduped.map((obs) =>
    mapObservationToNearbyBird(obs, location.lat, location.lng)
  )
  birds.sort((a, b) => a.distanceMiles - b.distanceMiles)
  return birds
}
