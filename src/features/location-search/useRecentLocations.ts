import { useCallback, useEffect, useState } from 'react'
import type { LocationSuggestion } from '@/services/geocoding'

const RECENT_LOCATIONS_KEY = 'ff:recent-locations'
const MAX_RECENT = 8

export type RecentLocation = {
  label: string
  lat: number
  lng: number
  ts: number
}

function normalizeLabel(label: string): string {
  return label.toLowerCase().trim()
}

function readFromStorage(): RecentLocation[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(RECENT_LOCATIONS_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed.filter(
      (item): item is RecentLocation =>
        typeof item === 'object' &&
        item !== null &&
        typeof (item as RecentLocation).label === 'string' &&
        typeof (item as RecentLocation).lat === 'number' &&
        typeof (item as RecentLocation).lng === 'number' &&
        typeof (item as RecentLocation).ts === 'number'
    )
  } catch {
    return []
  }
}

function writeToStorage(locations: RecentLocation[]): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(RECENT_LOCATIONS_KEY, JSON.stringify(locations))
    window.dispatchEvent(new Event('ff:recent-locations'))
  } catch {
    // Ignore storage errors
  }
}

export function useRecentLocations() {
  const [locations, setLocations] = useState<RecentLocation[]>(() => readFromStorage())

  useEffect(() => {
    const handler = () => setLocations(readFromStorage())
    window.addEventListener('ff:recent-locations', handler)
    return () => window.removeEventListener('ff:recent-locations', handler)
  }, [])

  const addRecentLocation = useCallback((location: LocationSuggestion) => {
    const entry: RecentLocation = {
      label: location.label,
      lat: location.lat,
      lng: location.lng,
      ts: Date.now(),
    }
    const current = readFromStorage()
    const normalized = normalizeLabel(location.label)
    const deduped = current.filter((item) => normalizeLabel(item.label) !== normalized)
    const updated = [entry, ...deduped].slice(0, MAX_RECENT)
    writeToStorage(updated)
  }, [])

  const removeRecentLocation = useCallback((recent: RecentLocation) => {
    const current = readFromStorage()
    const updated = current.filter(
      (item) =>
        item.label !== recent.label ||
        item.lat !== recent.lat ||
        item.lng !== recent.lng ||
        item.ts !== recent.ts
    )
    writeToStorage(updated)
  }, [])

  return { recentLocations: locations, addRecentLocation, removeRecentLocation }
}
