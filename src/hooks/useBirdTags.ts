import { useEffect, useMemo, useState } from 'react'
import type { LocationValue } from '@/context/LocationContext'
import type { BirdTag, NearbyBird } from '@/services/nearbyBirds'
import { COUNTRY_BIRDS } from '@/data/countryBirds'
import { SUBNATIONAL_BIRDS } from '@/data/subnationalBirds'

type RegionContext = {
  countryCode: string | null
  regionCode: string | null
}

export function useBirdTags(location: LocationValue | null, birds: NearbyBird[]): Map<string, BirdTag[]> {
  const [region, setRegion] = useState<RegionContext>({ countryCode: null, regionCode: null })
  const [notableSpecies, setNotableSpecies] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (!location) {
      setRegion({ countryCode: null, regionCode: null })
      setNotableSpecies(new Set())
      return
    }

    let cancelled = false

    const load = async () => {
      try {
        const reverseRes = await fetch(
          `/api/location/reverse?lat=${location.lat}&lng=${location.lng}`
        )
        if (cancelled) return

        const reverseData = (await reverseRes.json()) as {
          countryCode?: string | null
          regionCode?: string | null
        }
        const regionCode = reverseData.regionCode ?? null
        const countryCode = reverseData.countryCode ?? null
        setRegion({ countryCode, regionCode })

        if (regionCode) {
          try {
            const notableRes = await fetch(`/api/birds/notable?region=${regionCode}`)
            if (cancelled) return
            if (notableRes.ok) {
              const notableData = (await notableRes.json()) as Array<{ speciesCode?: string }>
              const codes = new Set(
                notableData
                  .map((o) => o.speciesCode)
                  .filter((c): c is string => typeof c === 'string')
              )
              setNotableSpecies(codes)
            } else {
              setNotableSpecies(new Set())
            }
          } catch {
            setNotableSpecies(new Set())
          }
        } else {
          setNotableSpecies(new Set())
        }
      } catch {
        if (!cancelled) {
          setRegion({ countryCode: null, regionCode: null })
          setNotableSpecies(new Set())
        }
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [location?.lat, location?.lng])

  return useMemo(() => {
    const map = new Map<string, BirdTag[]>()
    const { countryCode, regionCode } = region

    for (const bird of birds) {
      const tags: BirdTag[] = []

      const country = COUNTRY_BIRDS[bird.id]
      if (country && (!countryCode || country === countryCode.toUpperCase())) {
        tags.push({ type: 'country_bird', country })
      }

      const subnational = SUBNATIONAL_BIRDS[bird.id]
      if (subnational && regionCode) {
        const match = subnational.find((r) => r.regionCode === regionCode)
        if (match) {
          tags.push({ type: 'subnational_bird', regionCode: match.regionCode, regionName: match.regionName })
        }
      }

      if (notableSpecies.has(bird.id)) {
        tags.push({ type: 'rare_sighting' })
      }

      const prioritized = tags.slice(0, 2)
      if (prioritized.length > 0) {
        map.set(bird.id, prioritized)
      }
    }

    return map
  }, [birds, region, notableSpecies])
}
