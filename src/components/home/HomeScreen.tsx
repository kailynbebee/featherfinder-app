import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLocation } from '@/context/LocationContext'
import { buildBirdsUrl } from '@/context/useLocationFromUrl'
import { GEOLOCATION_TIMEOUT_MS, useGeolocation } from '@/hooks/useGeolocation'
import { FeatherFinderMark } from '@/components/branding/FeatherFinderMark'
import { LocationSearchBar } from '@/components/location/LocationSearchBar'
import { AppHeader } from '@/components/layout/AppHeader'
import { palette } from '@/theme/palette'

function LogInIcon() {
  return (
    <svg className="size-full" fill="none" viewBox="0 0 19 19" stroke={palette.accentSecondary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15.0417 9.5H9.5M9.5 9.5L11.875 11.875M9.5 9.5L11.875 7.125" />
      <path d="M15.0417 4.75V3.95833C15.0417 3.08388 14.3328 2.375 13.4583 2.375H5.54167C4.66722 2.375 3.95833 3.08388 3.95833 3.95833V15.0417C3.95833 15.9161 4.66722 16.625 5.54167 16.625H13.4583C14.3328 16.625 15.0417 15.9161 15.0417 15.0417V14.25" />
    </svg>
  )
}

export function HomeScreen() {
  const navigate = useNavigate()
  const { setQueryLocation, setGeoLocation } = useLocation()
  const { status: geoStatus, coords, error: geoError, requestLocation, cancelLocationRequest } = useGeolocation()

  const isGeoLoading = geoStatus === 'loading'
  const isGeoSuccess = geoStatus === 'success'
  const isGeoDenied = geoStatus === 'denied'
  const isGeoCanceled = geoStatus === 'canceled'
  const isGeoUnavailable = geoStatus === 'unavailable' || geoStatus === 'error'
  const initialTimeoutSeconds = Math.floor(GEOLOCATION_TIMEOUT_MS / 1000)
  const [countdownSeconds, setCountdownSeconds] = useState(initialTimeoutSeconds)

  const navigateWithTransition = useCallback((to: string) => {
    const docWithTransition = document as Document & {
      startViewTransition?: (callback: () => void) => void
    }
    if (typeof docWithTransition.startViewTransition === 'function') {
      docWithTransition.startViewTransition(() => navigate(to))
      return
    }
    navigate(to)
  }, [navigate])

  const handleDiscoverNearby = () => {
    requestLocation()
  }

  useEffect(() => {
    if (!isGeoLoading) {
      setCountdownSeconds(initialTimeoutSeconds)
      return
    }

    setCountdownSeconds(initialTimeoutSeconds)
    const timerId = window.setInterval(() => {
      setCountdownSeconds((seconds) => (seconds > 0 ? seconds - 1 : 0))
    }, 1000)

    return () => {
      window.clearInterval(timerId)
    }
  }, [isGeoLoading, initialTimeoutSeconds])

  // When geolocation succeeds, store and navigate
  useEffect(() => {
    if (isGeoSuccess && coords) {
      let isCancelled = false
      const fallbackLabel = `${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}`

      const resolveGeoLabel = async () => {
        let label = fallbackLabel
        try {
          const url = new URL('/api/location/reverse', window.location.origin)
          url.searchParams.set('lat', String(coords.lat))
          url.searchParams.set('lng', String(coords.lng))
          const response = await fetch(url.toString())
          if (response.ok) {
            const data = await response.json() as { city?: string | null; state?: string | null; countryCode?: string | null }
            const city = data.city?.trim() ?? ''
            const state = data.state?.trim() ?? ''
            const countryCode = data.countryCode?.trim().toUpperCase() ?? ''
            const parts = [city, state, countryCode].filter(Boolean)
            if (parts.length > 0) {
              label = parts.join(', ')
            }
          }
        } catch {
          // Keep coordinate fallback when reverse lookup is unavailable.
        }

        if (isCancelled) return

        setGeoLocation(coords.lat, coords.lng, label)
        navigateWithTransition(
          buildBirdsUrl({
            source: 'geo',
            lat: coords.lat,
            lng: coords.lng,
            label,
          })
        )
      }

      void resolveGeoLabel()

      return () => {
        isCancelled = true
      }
    }
  }, [isGeoSuccess, coords, setGeoLocation, navigateWithTransition])

  const handleLogin = () => {
    // Placeholder for future login flow
    console.log('Navigate to login')
  }

  return (
    <div className="flex min-h-screen flex-col bg-app-background">
      <AppHeader className="flex h-14 items-center px-5">
        <div className="flex min-w-0 flex-1 items-center">
          <h1 className="m-0">
            <FeatherFinderMark showName />
          </h1>
        </div>
        <div className="flex flex-1 items-center justify-end">
          <button
            type="button"
            onClick={handleLogin}
            className="flex cursor-pointer items-center gap-2 transition-opacity hover:opacity-80"
          >
            <span className="font-kodchasan text-base font-bold text-app-text underline">
              Log in
            </span>
            <span className="size-4">
              <LogInIcon />
            </span>
          </button>
        </div>
      </AppHeader>

      {/* Main content - flat, solid (Khroma-style) */}
      <main className="flex flex-1 flex-col items-center justify-start gap-4 bg-app-background px-5 pb-8 pt-14">
        {/* Bird name placeholder (static for simplified hero) */}
        <p className="font-kodchasan text-[14px] font-medium text-app-text">
          Tropical Royal Flycatcher
        </p>

        {/* Carousel indicator placeholder (static dots) */}
        <div className="flex items-center gap-2.25">
          <div className="h-1.75 w-10.5 shrink-0 rounded-lg bg-[rgba(200,178,146,0.8)]">
            <div className="h-1.75 w-1/4 rounded-bl-lg rounded-tl-lg bg-app-border-muted" />
          </div>
          <div className="h-1.75 w-2.5 shrink-0 rounded-lg bg-[rgba(200,178,146,0.5)]" />
          <div className="h-1.75 w-2.5 shrink-0 rounded-lg bg-[rgba(200,178,146,0.5)]" />
        </div>

        {/* Location search */}
        <div className="w-full max-w-200">
          <LocationSearchBar
            mode="home"
            onCommitLocation={(location, query) => {
              setQueryLocation(query, location.lat, location.lng, location.label)
              navigateWithTransition(buildBirdsUrl({ source: 'query', query, lat: location.lat, lng: location.lng, label: location.label }))
            }}
            disabled={isGeoLoading}
          />
        </div>

        {/* Discover nearby CTA */}
        <div className="flex w-full max-w-200 flex-col items-center gap-2">
          <button
            type="button"
            onClick={handleDiscoverNearby}
            disabled={isGeoLoading}
            className={`flex items-center justify-center gap-2 font-kodchasan text-[20px] font-bold text-app-accent underline transition-opacity hover:opacity-80 disabled:opacity-50 ${isGeoLoading ? 'no-underline' : 'underline'}`}
          >
            {isGeoLoading && (
              <span className="size-5 animate-spin rounded-full border-2 border-app-accent-secondary border-t-transparent" aria-hidden />
            )}
            {isGeoLoading ? 'Finding your location...' : 'Discover Wingspan birds near you'}
          </button>
          {isGeoLoading && (
            <>
              <p className="text-center text-sm text-app-text/80">
                Look for the location prompt in your browser. If you don't see it, enter a location while we keep trying ({countdownSeconds}s).
              </p>
              <button
                type="button"
                onClick={cancelLocationRequest}
                className="cursor-pointer font-kodchasan text-sm font-medium text-app-accent underline transition-opacity hover:opacity-80"
              >
                Cancel
              </button>
            </>
          )}
          {isGeoDenied && (
            <p className="text-center text-sm text-app-text/80">
              Location access was denied. Let's try something else — enter a location instead.
            </p>
          )}
          {isGeoUnavailable && geoError && (
            <p className="text-center text-sm text-app-text/80">
              {geoError}{' '}No worries — try again, or enter a location.
            </p>
          )}
          {isGeoCanceled && (
            <p className="text-center text-sm text-app-text/80">
              Location request canceled. Enter a location to keep going.
            </p>
          )}
        </div>
      </main>
    </div>
  )
}
