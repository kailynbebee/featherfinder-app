import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'

export type LocationType = 'zip' | 'geo'

export type LocationValue =
  | { type: 'zip'; value: string }
  | { type: 'geo'; value: { lat: number; lng: number } }

type LocationContextValue = {
  location: LocationValue | null
  setZipLocation: (zip: string) => void
  setGeoLocation: (lat: number, lng: number) => void
  clearLocation: () => void
}

const LocationContext = createContext<LocationContextValue | null>(null)

export function LocationProvider({ children }: { children: ReactNode }) {
  const [location, setLocation] = useState<LocationValue | null>(null)

  const setZipLocation = useCallback((zip: string) => {
    setLocation({ type: 'zip', value: zip })
  }, [])

  const setGeoLocation = useCallback((lat: number, lng: number) => {
    setLocation({ type: 'geo', value: { lat, lng } })
  }, [])

  const clearLocation = useCallback(() => {
    setLocation(null)
  }, [])

  return (
    <LocationContext.Provider
      value={{ location, setZipLocation, setGeoLocation, clearLocation }}
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
