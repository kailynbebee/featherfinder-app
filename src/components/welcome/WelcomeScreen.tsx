import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLocation } from '@/context/LocationContext'
import { GEOLOCATION_TIMEOUT_MS, useGeolocation } from '@/hooks/useGeolocation'
import { isValidZip, formatZipInput } from '@/lib/zipValidation'

function InfoIcon() {
  return (
    <svg className="size-full" fill="none" viewBox="0 0 21 20" stroke="#006E63" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="10.43" cy="10" r="8.7" />
      <path d="M10.4355 9.58337V13.75" />
      <path d="M10.4355 6.25667L10.4423 6.24913" />
    </svg>
  )
}

function SearchIcon() {
  return (
    <svg className="size-full" fill="none" viewBox="0 0 24 24" stroke="#006E63" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 17L21 21" />
      <circle cx="11" cy="11" r="8" />
    </svg>
  )
}

function LogInIcon() {
  return (
    <svg className="size-full" fill="none" viewBox="0 0 19 19" stroke="#006E63" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15.0417 9.5H9.5M9.5 9.5L11.875 11.875M9.5 9.5L11.875 7.125" />
      <path d="M15.0417 4.75V3.95833C15.0417 3.08388 14.3328 2.375 13.4583 2.375H5.54167C4.66722 2.375 3.95833 3.08388 3.95833 3.95833V15.0417C3.95833 15.9161 4.66722 16.625 5.54167 16.625H13.4583C14.3328 16.625 15.0417 15.9161 15.0417 15.0417V14.25" />
    </svg>
  )
}

export function WelcomeScreen() {
  const navigate = useNavigate()
  const { setZipLocation, setGeoLocation } = useLocation()
  const { status: geoStatus, coords, error: geoError, requestLocation } = useGeolocation()

  const [zipCode, setZipCode] = useState('')
  const [zipError, setZipError] = useState<string | null>(null)

  const validZip = isValidZip(zipCode)
  const isGeoLoading = geoStatus === 'loading'
  const isGeoSuccess = geoStatus === 'success'
  const isGeoDenied = geoStatus === 'denied'
  const isGeoUnavailable = geoStatus === 'unavailable' || geoStatus === 'error'
  const timeoutSeconds = Math.floor(GEOLOCATION_TIMEOUT_MS / 1000)

  const handleZipSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setZipError(null)
    if (!validZip) {
      setZipError('Please enter a valid 5-digit zip code')
      return
    }
    setZipLocation(zipCode.trim())
    navigate('/birds')
  }

  const handleDiscoverNearby = () => {
    requestLocation()
  }

  // When geolocation succeeds, store and navigate
  useEffect(() => {
    if (isGeoSuccess && coords) {
      setGeoLocation(coords.lat, coords.lng)
      navigate('/birds')
    }
  }, [isGeoSuccess, coords, setGeoLocation, navigate])

  const handleInfo = () => {
    // Placeholder for future about/explainer overlay
    console.log('Show app info')
  }

  const handleLogin = () => {
    // Placeholder for future login flow
    console.log('Navigate to login')
  }

  return (
    <div className="flex min-h-screen flex-col bg-linear-to-t from-[#f6f0e7] from-35% to-[rgba(200,178,146,0.8)]">
      {/* Header */}
      <header className="fixed left-0 right-0 top-0 z-50 flex items-start justify-between px-5 pt-10">
        <button
          type="button"
          onClick={handleInfo}
          className="size-6 cursor-pointer transition-opacity hover:opacity-80"
          aria-label="App info"
        >
          <InfoIcon />
        </button>
        <button
          type="button"
          onClick={handleLogin}
          className="flex cursor-pointer items-center gap-2 transition-opacity hover:opacity-80"
        >
          <span className="font-kodchasan text-[19px] font-bold text-[#006e63] underline">
            Log in
          </span>
          <span className="size-4.75">
            <LogInIcon />
          </span>
        </button>
      </header>

      {/* Hero - static gradient placeholder (no bird carousel for now) */}
      <div className="flex-1 min-h-0" aria-hidden />

      {/* Bottom content - fixed at bottom */}
      <div className="relative z-10 flex flex-col items-center gap-4 px-5 pb-8 pt-4">
        {/* Bird name placeholder (static for simplified hero) */}
        <p className="font-kodchasan text-[14px] font-medium text-[#4e3626]">
          Tropical Royal Flycatcher
        </p>

        {/* Carousel indicator placeholder (static dots) */}
        <div className="flex items-center gap-2.25">
          <div className="h-1.75 w-10.5 shrink-0 rounded-lg bg-[rgba(200,178,146,0.8)]">
            <div className="h-1.75 w-1/4 rounded-bl-lg rounded-tl-lg bg-[#c8b292]" />
          </div>
          <div className="h-1.75 w-2.5 shrink-0 rounded-lg bg-[rgba(200,178,146,0.5)]" />
          <div className="h-1.75 w-2.5 shrink-0 rounded-lg bg-[rgba(200,178,146,0.5)]" />
        </div>

        {/* Zip code search */}
        <form onSubmit={handleZipSubmit} className="w-full max-w-200">
          <div className="flex items-center gap-4 rounded-[14px] bg-white px-6 py-4 shadow-[0px_0px_33px_3px_rgba(74,55,40,0.05)]">
            <input
              type="text"
              inputMode="numeric"
              value={zipCode}
              onChange={(e) => setZipCode(formatZipInput(e.target.value))}
              placeholder="Search by zip code"
              className="min-w-0 flex-1 bg-transparent font-kodchasan text-[19px] text-[#4e3626] outline-none placeholder:text-[rgba(78,54,38,0.6)]"
              aria-label="Zip code"
              disabled={isGeoLoading}
            />
            <button
              type="submit"
              className="shrink-0 size-6 cursor-pointer transition-opacity hover:opacity-80 disabled:opacity-50"
              aria-label="Search"
            >
              <SearchIcon />
            </button>
          </div>
          {zipError && (
            <p className="mt-2 text-sm text-red-600">{zipError}</p>
          )}
        </form>

        {/* Discover nearby CTA */}
        <div className="flex w-full max-w-200 flex-col items-center gap-2">
          <button
            type="button"
            onClick={handleDiscoverNearby}
            disabled={isGeoLoading}
            className={`flex items-center justify-center gap-2 font-kodchasan text-[20px] font-bold text-[#006e63] transition-opacity hover:opacity-80 disabled:opacity-50 ${isGeoLoading ? 'no-underline' : 'underline'}`}
          >
            {isGeoLoading && (
              <span className="size-5 animate-spin rounded-full border-2 border-[#006e63] border-t-transparent" aria-hidden />
            )}
            {isGeoLoading ? 'Finding your location...' : 'Discover birds near you'}
          </button>
          {isGeoLoading && (
            <p className="text-center text-sm text-[#4e3626]/80">
              Check your browser for a location permission prompt. If nothing appears, use a zip code while we wait ({timeoutSeconds}s).
            </p>
          )}
          {isGeoDenied && (
            <p className="text-center text-sm text-[#4e3626]/80">
              Location access was denied. Allow location in your browser settings, or enter a zip code instead.
            </p>
          )}
          {isGeoUnavailable && geoError && (
            <p className="text-center text-sm text-[#4e3626]/80">
              {geoError}{' '}You can retry with Discover birds near you, or enter a zip code instead.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
