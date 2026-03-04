import type { LocationValue } from '@/context/LocationContext'

export type NearbyBird = {
  id: string
  commonName: string
  scientificName: string
  distanceMiles: number
}

const MOCK_BIRDS: Array<Omit<NearbyBird, 'distanceMiles'>> = [
  { id: 'northern-cardinal', commonName: 'Northern Cardinal', scientificName: 'Cardinalis cardinalis' },
  { id: 'american-robin', commonName: 'American Robin', scientificName: 'Turdus migratorius' },
  { id: 'black-capped-chickadee', commonName: 'Black-capped Chickadee', scientificName: 'Poecile atricapillus' },
  { id: 'downy-woodpecker', commonName: 'Downy Woodpecker', scientificName: 'Dryobates pubescens' },
  { id: 'house-finch', commonName: 'House Finch', scientificName: 'Haemorhous mexicanus' },
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

export async function getNearbyBirds(location: LocationValue): Promise<NearbyBird[]> {
  await sleep(MOCK_LATENCY_MS)

  if (location.type === 'zip') {
    if (location.value === '00000') return []
    if (location.value === '99999') {
      throw new Error('Nearby bird service is temporarily unavailable.')
    }
  }

  const seed = getSeedFromLocation(location)
  return MOCK_BIRDS.map((bird, index) => {
    const distanceMiles = Number((((seed % 11) + 0.5) + index * 1.3).toFixed(1))
    return { ...bird, distanceMiles }
  })
}
