import { useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import type { LocationValue } from './LocationContext'

const PARAM_Q = 'q'
const PARAM_LAT = 'lat'
const PARAM_LNG = 'lng'

function isValidLatLng(lat: number, lng: number): boolean {
  return (
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180
  )
}

export function useLocationFromUrl(): LocationValue | null {
  const { pathname, search } = useLocation()

  return useMemo(() => {
    if (pathname !== '/birds') return null
    const params = new URLSearchParams(search)
    const q = params.get(PARAM_Q)
    const latParam = params.get(PARAM_LAT)
    const lngParam = params.get(PARAM_LNG)
    if (!q || !latParam || !lngParam) return null
    const lat = parseFloat(latParam)
    const lng = parseFloat(lngParam)
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null
    if (!isValidLatLng(lat, lng)) return null
    return {
      source: 'query',
      query: q,
      lat,
      lng,
      label: q,
    }
  }, [pathname, search])
}

export function buildBirdsUrl(location: LocationValue): string {
  const q =
    location.source === 'query'
      ? (location.query ?? location.label)
      : 'nearby'
  return `/birds?q=${encodeURIComponent(q)}&lat=${location.lat}&lng=${location.lng}`
}
