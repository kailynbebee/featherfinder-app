import { useCallback, useEffect, useRef, useState } from 'react'

export type GeolocationStatus = 'idle' | 'loading' | 'success' | 'denied' | 'unavailable' | 'error' | 'canceled'
export const GEOLOCATION_TIMEOUT_MS = 15000
export const GEOLOCATION_MAX_AGE_MS = 300000

export type GeolocationResult = {
  status: GeolocationStatus
  coords: { lat: number; lng: number } | null
  error: string | null
  requestLocation: () => void
  cancelLocationRequest: () => void
}

export function useGeolocation(): GeolocationResult {
  const [status, setStatus] = useState<GeolocationStatus>('idle')
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const watchIdRef = useRef<number | null>(null)
  const timeoutIdRef = useRef<number | null>(null)

  const clearInFlightRequest = useCallback(() => {
    if (!('geolocation' in navigator)) return
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current)
      watchIdRef.current = null
    }
    if (timeoutIdRef.current !== null) {
      window.clearTimeout(timeoutIdRef.current)
      timeoutIdRef.current = null
    }
  }, [])

  const requestLocation = useCallback(() => {
    if (status === 'loading') return

    if (!('geolocation' in navigator)) {
      setStatus('unavailable')
      setError('Geolocation is not supported by your browser')
      return
    }

    setStatus('loading')
    setCoords(null)
    setError(null)
    clearInFlightRequest()

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        clearInFlightRequest()
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
        timeout: GEOLOCATION_TIMEOUT_MS,
        maximumAge: GEOLOCATION_MAX_AGE_MS,
      }
    )
    watchIdRef.current = watchId
    timeoutIdRef.current = window.setTimeout(() => {
      clearInFlightRequest()
      setStatus('error')
      setError('Location request timed out.')
    }, GEOLOCATION_TIMEOUT_MS)
  }, [clearInFlightRequest, status])

  const cancelLocationRequest = useCallback(() => {
    if (status !== 'loading') return
    clearInFlightRequest()
    setStatus('canceled')
    setError('Location request canceled.')
  }, [clearInFlightRequest, status])

  useEffect(() => {
    return () => {
      clearInFlightRequest()
    }
  }, [clearInFlightRequest])

  return { status, coords, error, requestLocation, cancelLocationRequest }
}
