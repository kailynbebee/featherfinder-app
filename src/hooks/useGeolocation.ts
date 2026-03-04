import { useState, useCallback } from 'react'

export type GeolocationStatus = 'idle' | 'loading' | 'success' | 'denied' | 'unavailable' | 'error'

export type GeolocationResult = {
  status: GeolocationStatus
  coords: { lat: number; lng: number } | null
  error: string | null
  requestLocation: () => void
}

export function useGeolocation(): GeolocationResult {
  const [status, setStatus] = useState<GeolocationStatus>('idle')
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [error, setError] = useState<string | null>(null)

  const requestLocation = useCallback(() => {
    if (!('geolocation' in navigator)) {
      setStatus('unavailable')
      setError('Geolocation is not supported by your browser')
      return
    }

    setStatus('loading')
    setError(null)

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        })
        setStatus('success')
      },
      (err) => {
        if (err.code === 1) {
          setStatus('denied')
          setError('Location access was denied.')
        } else if (err.code === 2) {
          setStatus('error')
          setError('Could not determine your location.')
        } else if (err.code === 3) {
          setStatus('error')
          setError('Location request timed out.')
        } else {
          setStatus('error')
          setError('Could not get your location.')
        }
      },
      {
        enableHighAccuracy: false, // Faster on desktop; uses IP/WiFi instead of GPS
        timeout: 20000, // 20s to reduce timeout errors
        maximumAge: 60000, // Allow 1min cached position for instant response
      }
    )
  }, [])

  return { status, coords, error, requestLocation }
}
