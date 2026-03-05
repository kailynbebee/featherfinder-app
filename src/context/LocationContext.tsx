import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'

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

export function LocationProvider({ children }: { children: ReactNode }) {
  const [location, setLocation] = useState<LocationValue | null>(null)

  const setQueryLocation = useCallback((query: string, lat: number, lng: number, label: string) => {
    setLocation({ source: 'query', query, lat, lng, label })
  }, [])

  const setGeoLocation = useCallback((lat: number, lng: number) => {
    setLocation({
      source: 'geo',
      lat,
      lng,
      label: `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
    })
  }, [])

  const clearLocation = useCallback(() => {
    setLocation(null)
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
