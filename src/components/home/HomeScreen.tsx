import { useEffect } from 'react'
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
  const { status: geoStatus, coords, error: geoError, requestLocation } = useGeolocation()

  const isGeoLoading = geoStatus === 'loading'
  const isGeoSuccess = geoStatus === 'success'
  const isGeoDenied = geoStatus === 'denied'
  const isGeoUnavailable = geoStatus === 'unavailable' || geoStatus === 'error'
  const timeoutSeconds = Math.floor(GEOLOCATION_TIMEOUT_MS / 1000)

  const handleDiscoverNearby = () => {
    requestLocation()
  }

  // When geolocation succeeds, store and navigate
  useEffect(() => {
    if (isGeoSuccess && coords) {
      setGeoLocation(coords.lat, coords.lng)
      navigate(
        buildBirdsUrl({
          source: 'geo',
          lat: coords.lat,
          lng: coords.lng,
          label: `${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}`,
        })
      )
    }
  }, [isGeoSuccess, coords, setGeoLocation, navigate])

  const handleLogin = () => {
    // Placeholder for future login flow
    console.log('Navigate to login')
  }

  return (
    <div className="flex min-h-screen flex-col bg-app-background">
      <AppHeader className="flex items-start justify-between px-5 pt-10 pb-4">
        <h1 className="m-0">
          <FeatherFinderMark showName />
        </h1>
        <button
          type="button"
          onClick={handleLogin}
          className="flex cursor-pointer items-center gap-2 transition-opacity hover:opacity-80"
        >
          <span className="font-kodchasan text-[19px] font-bold text-app-text underline">
            Log in
          </span>
          <span className="size-4.75">
            <LogInIcon />
          </span>
        </button>
      </AppHeader>

      {/* Main content - flat, solid (Khroma-style) */}
      <main className="flex flex-1 flex-col items-center justify-center gap-4 bg-app-background px-5 pb-8 pt-8">
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
              navigate(buildBirdsUrl({ source: 'query', query, lat: location.lat, lng: location.lng, label: location.label }))
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
            {isGeoLoading ? 'Finding your location...' : 'Discover birds near you'}
          </button>
          {isGeoLoading && (
            <p className="text-center text-sm text-app-text/80">
              Check your browser for a location permission prompt. If nothing appears, enter a location while we wait ({timeoutSeconds}s).
            </p>
          )}
          {isGeoDenied && (
            <p className="text-center text-sm text-app-text/80">
              Location access was denied. Allow location in your browser settings, or enter a location instead.
            </p>
          )}
          {isGeoUnavailable && geoError && (
            <p className="text-center text-sm text-app-text/80">
              {geoError}{' '}You can retry with Discover birds near you, or enter a location instead.
            </p>
          )}
        </div>
      </main>
    </div>
  )
}
