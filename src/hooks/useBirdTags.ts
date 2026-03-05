import { useEffect, useMemo, useState } from 'react'
import type { LocationValue } from '@/context/LocationContext'
import type { BirdTag, NearbyBird, RarityTier } from '@/services/nearbyBirds'
import { COUNTRY_BIRDS } from '@/data/countryBirds'
import { SUBNATIONAL_BIRDS } from '@/data/subnationalBirds'

type RegionContext = {
  countryCode: string | null
  regionCode: string | null
}

export type UseBirdTagsResult = {
  tagsByBirdId: Map<string, BirdTag[]>
  rarityByBirdId: Map<string, RarityTier>
}

/**
 * Rarity: notable = rare. Otherwise use Status and Trends frequency (abundance_mean).
 * Falls back to uncommon when no ST data.
 */
function deriveRarity(
  birdId: string,
  notableSpecies: Set<string>,
  stRarity: RarityTier | undefined
): RarityTier {
  if (notableSpecies.has(birdId)) return 'rare'
  return stRarity ?? 'uncommon'
}

export function useBirdTags(
  location: LocationValue | null,
  birds: NearbyBird[]
): UseBirdTagsResult {
  const [region, setRegion] = useState<RegionContext>({ countryCode: null, regionCode: null })
  const [notableSpecies, setNotableSpecies] = useState<Set<string>>(new Set())
  const [stRarityByBirdId, setStRarityByBirdId] = useState<Map<string, RarityTier>>(new Map())

  useEffect(() => {
    if (!location) {
      setRegion({ countryCode: null, regionCode: null })
      setNotableSpecies(new Set())
      setStRarityByBirdId(new Map())
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

        if (birds.length > 0) {
          const params = new URLSearchParams({
            species: birds.map((b) => b.id).join(','),
            lat: String(location.lat),
          })
          if (regionCode) params.set('regionCode', regionCode)
          if (countryCode) params.set('countryCode', countryCode)
          try {
            const stRes = await fetch(`/api/birds/st/rarity?${params.toString()}`)
            if (cancelled) return
            if (stRes.ok) {
              const stData = (await stRes.json()) as Record<
                string,
                { rarity?: RarityTier }
              >
              const map = new Map<string, RarityTier>()
              for (const [code, val] of Object.entries(stData)) {
                if (val?.rarity && ['common', 'uncommon', 'rare'].includes(val.rarity)) {
                  map.set(code, val.rarity as RarityTier)
                }
              }
              setStRarityByBirdId(map)
            } else {
              setStRarityByBirdId(new Map())
            }
          } catch {
            setStRarityByBirdId(new Map())
          }
        } else {
          setStRarityByBirdId(new Map())
        }
      } catch {
        if (!cancelled) {
          setRegion({ countryCode: null, regionCode: null })
          setNotableSpecies(new Set())
          setStRarityByBirdId(new Map())
        }
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [location?.lat, location?.lng, birds])

  return useMemo(() => {
    const tagsByBirdId = new Map<string, BirdTag[]>()
    const rarityByBirdId = new Map<string, RarityTier>()
    const { countryCode, regionCode } = region

    for (const bird of birds) {
      const tags: BirdTag[] = []

      rarityByBirdId.set(
        bird.id,
        deriveRarity(bird.id, notableSpecies, stRarityByBirdId.get(bird.id))
      )

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

      // Seasonal tag: same for all birds (regional "current season"). Hide for now—
      // it adds noise when identical on every card. Re-enable when we have species-specific data.
      // if (seasonInfo) {
      //   tags.push({
      //     type: 'season',
      //     season: seasonInfo.season,
      //     isNow: seasonInfo.isNow,
      //     dateRange: seasonInfo.dateRange,
      //   })
      // }

      tagsByBirdId.set(bird.id, tags)
    }

    return { tagsByBirdId, rarityByBirdId }
  }, [birds, region, notableSpecies, stRarityByBirdId])
}
