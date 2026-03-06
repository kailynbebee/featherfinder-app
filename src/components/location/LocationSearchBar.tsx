import { useCallback, useState } from 'react'
import { useLocation } from '@/context/LocationContext'
import { useLocationSearchController } from '@/features/location-search/useLocationSearchController'
import { useRecentLocations } from '@/features/location-search/useRecentLocations'
import type { LocationSuggestion } from '@/services/geocoding'
import { palette } from '@/theme/palette'

function SearchIcon() {
  return (
    <svg className="size-full" fill="none" viewBox="0 0 24 24" stroke={palette.accentSecondary} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 17L21 21" />
      <circle cx="11" cy="11" r="8" />
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

export type LocationSearchBarMode = 'home' | 'results'

type LocationSearchBarProps = {
  mode: LocationSearchBarMode
  onCommitLocation: (location: LocationSuggestion, query: string) => void
  /** Optional className for the wrapper (e.g. results mode uses compact styling) */
  className?: string
  /** Placeholder when no location (results mode) */
  placeholder?: string
  disabled?: boolean
  /** Compact inline variant for results topbar (smaller padding, fits in single row) */
  compact?: boolean
}

export function LocationSearchBar({
  mode,
  onCommitLocation,
  className = '',
  placeholder = 'Search by city, postal code, or address',
  disabled = false,
  compact = false,
}: LocationSearchBarProps) {
  const { location } = useLocation()
  const [isFocused, setIsFocused] = useState(false)
  const [activeRecentIndex, setActiveRecentIndex] = useState(-1)
  const { recentLocations, addRecentLocation } = useRecentLocations()

  const wrappedOnCommit = useCallback(
    (loc: LocationSuggestion, query: string) => {
      addRecentLocation(loc)
      onCommitLocation(loc, query)
    },
    [addRecentLocation, onCommitLocation]
  )

  const search = useLocationSearchController({ onCommitLocation: wrappedOnCommit })

  const displayValue =
    mode === 'results' && location && !isFocused
      ? location.source === 'geo'
        ? 'Nearby'
        : location.label
      : search.query

  const handleFocus = () => {
    setIsFocused(true)
    setActiveRecentIndex(-1)
    if (mode === 'results' && location) {
      search.handleInputChange(location.source === 'geo' ? 'Nearby' : location.label)
    }
    search.setIsOpen(true)
  }

  const handleBlur = () => {
    setIsFocused(false)
    window.setTimeout(() => search.setIsOpen(false), 120)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await search.handleSubmit()
  }

  const showRecent = search.query.trim().length < 2 && recentLocations.length > 0
  const showDropdown =
    search.isOpen &&
    (showRecent || search.isLoading || search.suggestions.length > 0)
  const resultsPlaceholder = 'Search birds, locations, or hotspots'

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (showRecent && search.suggestions.length === 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setActiveRecentIndex((prev) =>
          prev < recentLocations.length - 1 ? prev + 1 : 0
        )
        return
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        setActiveRecentIndex((prev) =>
          prev <= 0 ? recentLocations.length - 1 : prev - 1
        )
        return
      }
      if (e.key === 'Enter' && activeRecentIndex >= 0 && activeRecentIndex < recentLocations.length) {
        e.preventDefault()
        const recent = recentLocations[activeRecentIndex]
        if (recent) {
          wrappedOnCommit(
            { label: recent.label, lat: recent.lat, lng: recent.lng },
            recent.label
          )
          search.setIsOpen(false)
          setActiveRecentIndex(-1)
        }
        return
      }
      if (e.key === 'Escape') {
        e.preventDefault()
        search.setIsOpen(false)
        setActiveRecentIndex(-1)
        return
      }
    }
    setActiveRecentIndex(-1)
    search.handleKeyDown(e)
  }

  const selectRecent = (recent: { label: string; lat: number; lng: number }) => {
    wrappedOnCommit(
      { label: recent.label, lat: recent.lat, lng: recent.lng },
      recent.label
    )
    search.setIsOpen(false)
    setActiveRecentIndex(-1)
  }

  const listboxId = search.listboxId
  const recentOptionId = (i: number) => `${listboxId}-recent-${i}`
  const activeDescendantId =
    showRecent && search.suggestions.length === 0 && activeRecentIndex >= 0
      ? recentOptionId(activeRecentIndex)
      : search.activeDescendantId

  return (
    <form onSubmit={handleSubmit} className={`relative w-full ${className}`}>
      {showDropdown && (
        <div className="absolute inset-x-0 bottom-[calc(100%+8px)] z-20 overflow-hidden rounded-xl border border-app-border-muted/60 bg-white shadow-[0_8px_20px_rgba(74,55,40,0.16)]">
          {showRecent && search.suggestions.length === 0 && (
            <>
              <p className="px-4 py-2 font-kodchasan text-xs font-medium text-app-text/70">
                Recent searches
              </p>
              <ul
                id={`${listboxId}-recent`}
                role="listbox"
                aria-label="Recent searches"
                className="divide-y divide-app-border-muted/35"
              >
                {recentLocations.map((recent, index) => (
                  <li key={`${recent.label}-${recent.lat}-${recent.lng}-${recent.ts}`}>
                    <button
                      type="button"
                      id={recentOptionId(index)}
                      role="option"
                      aria-selected={activeRecentIndex === index}
                      onMouseEnter={() => setActiveRecentIndex(index)}
                      onMouseDown={(e) => {
                        e.preventDefault()
                        selectRecent(recent)
                      }}
                      aria-label={recent.label}
                      className={`w-full cursor-pointer px-4 py-2 text-left transition-colors hover:bg-app-background ${activeRecentIndex === index ? 'bg-app-background' : ''}`}
                    >
                      <p className="font-kodchasan text-sm text-app-text">{recent.label}</p>
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}
          {search.isLoading && !showRecent && (
            <p className="px-4 py-2 text-sm text-app-text/70">Searching locations...</p>
          )}
          {search.suggestions.length > 0 && (
            <ul
              id={listboxId}
              role="listbox"
              aria-label="Location suggestions"
              className="divide-y divide-app-border-muted/35"
            >
              {search.suggestions.map((suggestion, index) => (
                <li key={`${suggestion.label}-${suggestion.lat}-${suggestion.lng}`}>
                  <button
                    type="button"
                    id={`${listboxId}-option-${index}`}
                    role="option"
                    aria-selected={search.activeIndex === index}
                    onMouseEnter={() => search.setActiveIndex(index)}
                    onMouseDown={(e) => {
                      e.preventDefault()
                      search.selectSuggestion(suggestion)
                    }}
                    aria-label={suggestion.label}
                    className={`w-full cursor-pointer px-4 py-2 text-left transition-colors hover:bg-app-background ${search.activeIndex === index ? 'bg-app-background' : ''}`}
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
      <div
        className={
          mode === 'results'
            ? compact
              ? 'flex items-center gap-2 rounded-xl bg-white px-3 py-2 shadow-[0_2px_8px_rgba(78,54,38,0.08)]'
              : 'flex items-center gap-2 rounded-2xl bg-white px-4 py-3 shadow-[0_2px_8px_rgba(78,54,38,0.08)]'
            : 'flex items-center gap-4 rounded-[14px] bg-white px-6 py-4 shadow-[0px_0px_33px_3px_rgba(74,55,40,0.05)]'
        }
      >
        <input
          type="text"
          role="combobox"
          aria-autocomplete="list"
          aria-controls={showRecent && search.suggestions.length === 0 ? `${listboxId}-recent` : listboxId}
          aria-expanded={showDropdown}
          aria-activedescendant={activeDescendantId}
          value={displayValue}
          onChange={(e) => search.handleInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={mode === 'results' && !location ? resultsPlaceholder : placeholder}
          className={`min-w-0 flex-1 bg-transparent font-kodchasan text-app-text outline-none placeholder:text-app-text/60 ${mode === 'results' ? 'text-sm' : 'text-[19px]'}`}
          aria-label="Location search"
          disabled={disabled || search.isSubmitting}
        />
        <button
          type="submit"
          className={`shrink-0 cursor-pointer transition-opacity hover:opacity-80 disabled:opacity-50 ${mode === 'results' && compact ? 'size-4' : mode === 'results' ? 'size-5' : 'size-6'}`}
          aria-label="Search"
          disabled={disabled || search.isSubmitting}
        >
          <SearchIcon />
        </button>
      </div>
      {search.error && (
        <p className="mt-2 text-sm text-red-600">{search.error}</p>
      )}
    </form>
  )
}
