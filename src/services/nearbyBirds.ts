import type { LocationValue } from '@/context/LocationContext'

export type NearbyBird = {
  id: string
  commonName: string
  scientificName: string
  distanceMiles: number
  lat: number
  lng: number
  group: 'songbird' | 'woodpecker' | 'raptor'
  lastSeenHoursAgo: number
}

const MOCK_BIRDS: Array<Omit<NearbyBird, 'distanceMiles' | 'lat' | 'lng'>> = [
  { id: 'northern-cardinal', commonName: 'Northern Cardinal', scientificName: 'Cardinalis cardinalis', group: 'songbird', lastSeenHoursAgo: 4 },
  { id: 'american-robin', commonName: 'American Robin', scientificName: 'Turdus migratorius', group: 'songbird', lastSeenHoursAgo: 9 },
  { id: 'black-capped-chickadee', commonName: 'Black-capped Chickadee', scientificName: 'Poecile atricapillus', group: 'songbird', lastSeenHoursAgo: 12 },
  { id: 'downy-woodpecker', commonName: 'Downy Woodpecker', scientificName: 'Dryobates pubescens', group: 'woodpecker', lastSeenHoursAgo: 30 },
  { id: 'red-tailed-hawk', commonName: 'Red-tailed Hawk', scientificName: 'Buteo jamaicensis', group: 'raptor', lastSeenHoursAgo: 20 },
  { id: 'house-finch', commonName: 'House Finch', scientificName: 'Haemorhous mexicanus', group: 'songbird', lastSeenHoursAgo: 2 },
]

const MOCK_LATENCY_MS = 900

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function getSeedFromLocation(location: LocationValue): number {
  if (location.type === 'zip') {
    return Number(location.value)
  }

  const { lat, lng } = location.value
  return Math.round(Math.abs(lat * 1000) + Math.abs(lng * 1000))
}

function getCenterFromLocation(location: LocationValue): { lat: number; lng: number } {
  if (location.type === 'geo') {
    return location.value
  }

  const zipSeed = Number(location.value)
  const lat = 45.40 + ((zipSeed % 90) / 1000)
  const lng = -122.85 + ((zipSeed % 120) / 1000)
  return { lat, lng }
}

export async function getNearbyBirds(location: LocationValue): Promise<NearbyBird[]> {
  await sleep(MOCK_LATENCY_MS)

  if (location.type === 'zip') {
    if (location.value === '00000') return []
    if (location.value === '99999') {
      throw new Error('Nearby bird service is temporarily unavailable.')
    }
  }

  const seed = getSeedFromLocation(location)
  const center = getCenterFromLocation(location)
  return MOCK_BIRDS.map((bird, index) => {
    const distanceMiles = Number((((seed % 11) + 0.5) + index * 1.3).toFixed(1))
    const lat = Number((center.lat + (index - 2) * 0.012).toFixed(6))
    const lng = Number((center.lng + ((index % 2 === 0 ? 1 : -1) * (index + 1)) * 0.01).toFixed(6))
    return { ...bird, distanceMiles, lat, lng }
  })
}
