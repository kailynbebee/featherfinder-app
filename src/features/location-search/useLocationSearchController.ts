import { useEffect, useId, useMemo, useState } from 'react'
import { geocodeLocation, searchLocationSuggestions, type LocationSuggestion, type SuggestionBias } from '@/services/geocoding'
import { trackEvent } from '@/observability/telemetry'

const SUGGESTION_BIAS_STORAGE_KEY = 'ff:suggestion-bias'
const BIAS_TTL_MS = 12 * 60 * 60 * 1000

type StoredBias = {
  lat: number
  lng: number
  ts: number
}

type UseLocationSearchControllerArgs = {
  onCommitLocation: (location: LocationSuggestion, query: string) => void
}

function roundBias(value: number): number {
  return Number(value.toFixed(1))
}

function getCountryHint(): string | null {
  if (typeof navigator === 'undefined') return null
  const region = navigator.language?.split('-')[1]
  if (!region || !/^[A-Za-z]{2}$/.test(region)) return null
  return region.toLowerCase()
}

function readStoredSuggestionBias(): SuggestionBias | null {
  if (typeof window === 'undefined') return null
  const storage = window.localStorage
  if (!storage || typeof storage.getItem !== 'function') return null
  try {
    const raw = storage.getItem(SUGGESTION_BIAS_STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<StoredBias>
    const { lat, lng, ts } = parsed
    if (typeof lat !== 'number' || typeof lng !== 'number' || typeof ts !== 'number') return null
    if (Date.now() - ts > BIAS_TTL_MS) return null
    return { lat, lng }
  } catch {
    return null
  }
}

function persistSuggestionBias(bias: SuggestionBias): void {
  if (typeof window === 'undefined') return
  const storage = window.localStorage
  if (!storage || typeof storage.setItem !== 'function') return
  const payload: StoredBias = {
    lat: roundBias(bias.lat),
    lng: roundBias(bias.lng),
    ts: Date.now(),
  }
  try {
    storage.setItem(SUGGESTION_BIAS_STORAGE_KEY, JSON.stringify(payload))
  } catch {
    // Ignore storage write errors.
  }
}

export function useLocationSearchController(args: UseLocationSearchControllerArgs) {
  const { onCommitLocation } = args
  const listboxId = useId()
  const [query, setQuery] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const [selectedSuggestion, setSelectedSuggestion] = useState<LocationSuggestion | null>(null)
  const [suggestionBias, setSuggestionBias] = useState<SuggestionBias | null>(null)
  const [hasAttemptedAutoBias, setHasAttemptedAutoBias] = useState(false)
  const [hasRefreshedGrantedBias, setHasRefreshedGrantedBias] = useState(false)
  const countryHint = useMemo(() => getCountryHint(), [])

  const activeDescendantId = activeIndex >= 0 ? `${listboxId}-option-${activeIndex}` : undefined

  useEffect(() => {
    const persisted = readStoredSuggestionBias()
    if (persisted) {
      setSuggestionBias(persisted)
    }
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined' || !('geolocation' in navigator) || hasRefreshedGrantedBias) {
      return
    }
    if (!('permissions' in navigator) || !navigator.permissions?.query) {
      return
    }
    void navigator.permissions.query({ name: 'geolocation' }).then((permissionStatus) => {
      if (permissionStatus.state !== 'granted') return
      setHasRefreshedGrantedBias(true)
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const nextBias = { lat: position.coords.latitude, lng: position.coords.longitude }
          setSuggestionBias(nextBias)
          persistSuggestionBias(nextBias)
        },
        () => {
          // Keep autocomplete available without bias.
        },
        {
          enableHighAccuracy: false,
          timeout: 3500,
          maximumAge: 600000,
        }
      )
    }).catch(() => {
      // Ignore permissions API failures.
    })
  }, [hasRefreshedGrantedBias])

  useEffect(() => {
    const trimmed = query.trim()
    if (trimmed.length < 2 || suggestionBias || hasAttemptedAutoBias) {
      return
    }
    if (typeof window === 'undefined' || !('geolocation' in navigator)) {
      return
    }
    setHasAttemptedAutoBias(true)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const nextBias = { lat: position.coords.latitude, lng: position.coords.longitude }
        setSuggestionBias(nextBias)
        persistSuggestionBias(nextBias)
      },
      () => {
        // User denied/unsupported: continue without bias.
      },
      {
        enableHighAccuracy: false,
        timeout: 3500,
        maximumAge: 600000,
      }
    )
  }, [query, suggestionBias, hasAttemptedAutoBias])

  useEffect(() => {
    const trimmed = query.trim()
    if (trimmed.length < 2 || selectedSuggestion?.label === trimmed) {
      setSuggestions([])
      setIsLoading(false)
      setIsOpen(false)
      setActiveIndex(-1)
      return
    }

    const controller = new AbortController()
    setIsLoading(true)
    setIsOpen(true)
    setActiveIndex(-1)

    const timeoutId = window.setTimeout(async () => {
      const startedAt = performance.now()
      trackEvent('location_search_started', { queryLength: trimmed.length })
      const nextSuggestions = await searchLocationSuggestions(
        trimmed,
        5,
        { bias: suggestionBias, countryHint },
        controller.signal
      )
      if (controller.signal.aborted) return
      // Keep previous suggestions if a transient request returns empty.
      setSuggestions((prev) => (nextSuggestions.length > 0 ? nextSuggestions : prev))
      setIsLoading(false)
      trackEvent('location_search_loaded', {
        count: nextSuggestions.length,
        durationMs: Math.round(performance.now() - startedAt),
      })
    }, 250)

    return () => {
      controller.abort()
      window.clearTimeout(timeoutId)
    }
  }, [query, selectedSuggestion, suggestionBias, countryHint])

  const handleInputChange = (value: string) => {
    setQuery(value)
    setSelectedSuggestion(null)
    setError(null)
    setIsOpen(true)
  }

  const selectSuggestion = (suggestion: LocationSuggestion) => {
    setSelectedSuggestion(suggestion)
    setQuery(suggestion.label)
    setError(null)
    setSuggestions([])
    setIsOpen(false)
    setActiveIndex(-1)
    const nextBias = { lat: suggestion.lat, lng: suggestion.lng }
    setSuggestionBias(nextBias)
    persistSuggestionBias(nextBias)
    trackEvent('location_suggestion_selected', { label: suggestion.label })
    onCommitLocation(suggestion, suggestion.label)
  }

  const handleSubmit = async () => {
    const trimmed = query.trim()
    setError(null)
    if (trimmed.length < 2) {
      setError('Please enter a city, postal code, or address')
      return
    }

    const chosen = selectedSuggestion && selectedSuggestion.label === trimmed ? selectedSuggestion : null
    setIsSubmitting(true)
    trackEvent('location_submit_started', { hasSelectedSuggestion: Boolean(chosen) })
    try {
      const geocoded = chosen ?? await geocodeLocation(trimmed, countryHint)
      const nextBias = { lat: geocoded.lat, lng: geocoded.lng }
      setSuggestionBias(nextBias)
      persistSuggestionBias(nextBias)
      onCommitLocation(geocoded, trimmed)
      setSuggestions([])
      setIsOpen(false)
      trackEvent('location_submit_success')
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Could not find that location. Please try again.')
      trackEvent('location_submit_failed')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || suggestions.length === 0) {
      if (event.key === 'Escape') setIsOpen(false)
      return
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setActiveIndex((prev) => (prev + 1) % suggestions.length)
      return
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActiveIndex((prev) => (prev <= 0 ? suggestions.length - 1 : prev - 1))
      return
    }
    if (event.key === 'Escape') {
      event.preventDefault()
      setIsOpen(false)
      setActiveIndex(-1)
      return
    }
    if (event.key === 'Enter' && activeIndex >= 0 && activeIndex < suggestions.length) {
      event.preventDefault()
      const activeSuggestion = suggestions[activeIndex]
      if (activeSuggestion) {
        selectSuggestion(activeSuggestion)
      }
    }
  }

  return {
    query,
    error,
    suggestions,
    isLoading,
    isSubmitting,
    isOpen,
    activeIndex,
    listboxId,
    activeDescendantId,
    setIsOpen,
    setActiveIndex,
    handleInputChange,
    handleSubmit,
    handleKeyDown,
    selectSuggestion,
  }
}
