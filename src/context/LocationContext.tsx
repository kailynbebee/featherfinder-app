import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react'
import { useLocation as useRouterLocation, useNavigate } from 'react-router-dom'
import { buildBirdsUrl, useLocationFromUrl } from './useLocationFromUrl'

export type LocationSource = 'query' | 'geo'

export type LocationValue = {
  source: LocationSource
  lat: number
  lng: number
  label: string
  query?: string
}

type LocationContextValue = {
  location: LocationValue | null
  setQueryLocation: (query: string, lat: number, lng: number, label: string) => void
  setGeoLocation: (lat: number, lng: number) => void
  clearLocation: () => void
}

const LocationContext = createContext<LocationContextValue | null>(null)

export function LocationProvider({
  children,
  initialLocation = null,
}: {
  children: ReactNode
  initialLocation?: LocationValue | null
}) {
  const [internalLocation, setInternalLocation] = useState<LocationValue | null>(initialLocation ?? null)
  const urlLocation = useLocationFromUrl()
  const location = internalLocation ?? urlLocation
  const navigate = useNavigate()
  const { pathname } = useRouterLocation()

  useEffect(() => {
    if (!location || pathname !== '/birds') return
    const params = new URLSearchParams(window.location.search)
    const currentLat = params.get('lat')
    const currentLng = params.get('lng')
    const currentQ = params.get('q')
    const latMatch = currentLat && Math.abs(parseFloat(currentLat) - location.lat) < 1e-6
    const lngMatch = currentLng && Math.abs(parseFloat(currentLng) - location.lng) < 1e-6
    const qMatch = currentQ === (location.source === 'query' ? (location.query ?? location.label) : 'nearby')
    if (latMatch && lngMatch && qMatch) return
    navigate(buildBirdsUrl(location), { replace: true })
  }, [location, pathname, navigate])

  const setQueryLocation = useCallback((query: string, lat: number, lng: number, label: string) => {
    setInternalLocation({ source: 'query', query, lat, lng, label })
  }, [])

  const setGeoLocation = useCallback((lat: number, lng: number) => {
    setInternalLocation({
      source: 'geo',
      lat,
      lng,
      label: `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
    })
  }, [])

  const clearLocation = useCallback(() => {
    setInternalLocation(null)
  }, [])

  return (
    <LocationContext.Provider
      value={{ location, setQueryLocation, setGeoLocation, clearLocation }}
    >
      {children}
    </LocationContext.Provider>
  )
}

export function useLocation() {
  const ctx = useContext(LocationContext)
  if (!ctx) throw new Error('useLocation must be used within LocationProvider')
  return ctx
}
