import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLocation } from '@/context/LocationContext'
import { GEOLOCATION_TIMEOUT_MS, useGeolocation } from '@/hooks/useGeolocation'
import { useLocationSearchController } from '@/features/location-search/useLocationSearchController'
import { FeatherFinderMark } from '@/components/branding/FeatherFinderMark'
import { AppHeader } from '@/components/layout/AppHeader'
import { palette } from '@/theme/palette'

function SearchIcon() {
  return (
    <svg className="size-full" fill="none" viewBox="0 0 24 24" stroke={palette.accentSecondary} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 17L21 21" />
      <circle cx="11" cy="11" r="8" />
    </svg>
  )
}

function LogInIcon() {
  return (
    <svg className="size-full" fill="none" viewBox="0 0 19 19" stroke={palette.accentSecondary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15.0417 9.5H9.5M9.5 9.5L11.875 11.875M9.5 9.5L11.875 7.125" />
      <path d="M15.0417 4.75V3.95833C15.0417 3.08388 14.3328 2.375 13.4583 2.375H5.54167C4.66722 2.375 3.95833 3.08388 3.95833 3.95833V15.0417C3.95833 15.9161 4.66722 16.625 5.54167 16.625H13.4583C14.3328 16.625 15.0417 15.9161 15.0417 15.0417V14.25" />
    </svg>
  )
}

function splitSuggestionLabel(label: string): { primary: string; scope: string | null } {
  const parts = label.split(',').map((part) => part.trim()).filter(Boolean)
  if (parts.length === 0) return { primary: label, scope: null }
  return {
    primary: parts[0] ?? label,
    scope: parts.length > 1 ? parts.slice(1).join(', ') : null,
  }
}

function renderPrimarySuggestionText(primary: string, rawQuery: string) {
  const query = rawQuery.trim()
  if (!query) return <span>{primary}</span>

  const primaryLower = primary.toLowerCase()
  const queryLower = query.toLowerCase()
  const matchIndex = primaryLower.indexOf(queryLower)

  if (matchIndex === 0) {
    const typed = primary.slice(0, query.length)
    const predicted = primary.slice(query.length)
    return (
      <span>
        <span className="text-app-text/70">{typed}</span>
        {predicted && <span className="font-semibold text-app-text">{predicted}</span>}
      </span>
    )
  }

  if (matchIndex > 0) {
    const before = primary.slice(0, matchIndex)
    const matched = primary.slice(matchIndex, matchIndex + query.length)
    const after = primary.slice(matchIndex + query.length)
    return (
      <span>
        {before}
        <span className="font-semibold text-app-text">{matched}</span>
        {after}
      </span>
    )
  }

  return <span>{primary}</span>
}

export function WelcomeScreen() {
  const navigate = useNavigate()
  const { setQueryLocation, setGeoLocation } = useLocation()
  const { status: geoStatus, coords, error: geoError, requestLocation } = useGeolocation()
  const search = useLocationSearchController({
    onCommitLocation: (location, query) => {
      setQueryLocation(query, location.lat, location.lng, location.label)
      navigate('/birds')
    },
  })

  const isGeoLoading = geoStatus === 'loading'
  const isGeoSuccess = geoStatus === 'success'
  const isGeoDenied = geoStatus === 'denied'
  const isGeoUnavailable = geoStatus === 'unavailable' || geoStatus === 'error'
  const timeoutSeconds = Math.floor(GEOLOCATION_TIMEOUT_MS / 1000)

  const handleLocationSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await search.handleSubmit()
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
        <form onSubmit={handleLocationSubmit} className="relative w-full max-w-200">
          {search.isOpen && (search.isLoading || search.suggestions.length > 0) && (
            <div className="absolute inset-x-0 bottom-[calc(100%+8px)] z-20 overflow-hidden rounded-xl border border-app-border-muted/60 bg-white shadow-[0_8px_20px_rgba(74,55,40,0.16)]">
              {search.isLoading && (
                <p className="px-4 py-2 text-sm text-app-text/70">Searching locations...</p>
              )}
              {search.suggestions.length > 0 && (
                <ul
                  id={search.listboxId}
                  role="listbox"
                  aria-label="Location suggestions"
                  className="divide-y divide-app-border-muted/35"
                >
                  {search.suggestions.map((suggestion, index) => (
                    <li key={`${suggestion.label}-${suggestion.lat}-${suggestion.lng}`}>
                      <button
                        type="button"
                        id={`${search.listboxId}-option-${index}`}
                        role="option"
                        aria-selected={search.activeIndex === index}
                        onMouseEnter={() => search.setActiveIndex(index)}
                        onMouseDown={(e) => {
                          e.preventDefault()
                          search.selectSuggestion(suggestion)
                        }}
                        aria-label={suggestion.label}
                        className={`w-full px-4 py-2 text-left transition-colors hover:bg-app-background ${search.activeIndex === index ? 'bg-app-background' : ''}`}
                      >
                        {(() => {
                          const { primary, scope } = splitSuggestionLabel(suggestion.label)
                          return (
                            <>
                              <p className="font-kodchasan text-sm text-app-text">
                                {renderPrimarySuggestionText(primary, search.query)}
                              </p>
                              {scope && (
                                <p className="mt-0.5 pl-2 font-kodchasan text-xs italic text-app-text/60">
                                  in {scope}
                                </p>
                              )}
                            </>
                          )
                        })()}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
          <div className="flex items-center gap-4 rounded-[14px] bg-white px-6 py-4 shadow-[0px_0px_33px_3px_rgba(74,55,40,0.05)]">
            <input
              type="text"
              role="combobox"
              aria-autocomplete="list"
              aria-controls={search.listboxId}
              aria-expanded={search.isOpen && search.suggestions.length > 0}
              aria-activedescendant={search.activeDescendantId}
              value={search.query}
              onChange={(e) => search.handleInputChange(e.target.value)}
              onKeyDown={search.handleKeyDown}
              onBlur={() => window.setTimeout(() => search.setIsOpen(false), 120)}
              onFocus={() => search.setIsOpen(true)}
              placeholder="Search by city, postal code, or address"
              className="min-w-0 flex-1 bg-transparent font-kodchasan text-[19px] text-app-text outline-none placeholder:text-app-text/60"
              aria-label="Location search"
              disabled={isGeoLoading || search.isSubmitting}
            />
            <button
              type="submit"
              className="shrink-0 size-6 cursor-pointer transition-opacity hover:opacity-80 disabled:opacity-50"
              aria-label="Search"
              disabled={isGeoLoading || search.isSubmitting}
            >
              <SearchIcon />
            </button>
          </div>
          {search.error && (
            <p className="mt-2 text-sm text-red-600">{search.error}</p>
          )}
        </form>

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
