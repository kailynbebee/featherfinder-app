import type { LocationSuggestion, SuggestionBias } from './types'

function distanceScoreMiles(a: SuggestionBias, b: { lat: number; lng: number }): number {
  const latMiles = (a.lat - b.lat) * 69
  const lngMiles = (a.lng - b.lng) * 54.6
  return Math.sqrt((latMiles ** 2) + (lngMiles ** 2))
}

export function dedupeSuggestions(suggestions: LocationSuggestion[]): LocationSuggestion[] {
  const seen = new Set<string>()
  const deduped: LocationSuggestion[] = []
  for (const suggestion of suggestions) {
    const key = `${suggestion.label}|${suggestion.lat.toFixed(5)}|${suggestion.lng.toFixed(5)}`
    if (seen.has(key)) continue
    seen.add(key)
    deduped.push(suggestion)
  }
  return deduped
}

export function rankSuggestions(
  suggestions: LocationSuggestion[],
  query: string,
  bias?: SuggestionBias | null
): LocationSuggestion[] {
  const queryLower = query.toLowerCase()
  return [...suggestions].sort((a, b) => {
    const aLabel = a.label.toLowerCase()
    const bLabel = b.label.toLowerCase()
    const aPrimary = aLabel.split(',')[0]?.trim() ?? aLabel
    const bPrimary = bLabel.split(',')[0]?.trim() ?? bLabel
    const aWordStarts = aPrimary.split(/[\s-]+/).some((word) => word.startsWith(queryLower))
    const bWordStarts = bPrimary.split(/[\s-]+/).some((word) => word.startsWith(queryLower))
    const aStarts = aLabel.startsWith(queryLower)
    const bStarts = bLabel.startsWith(queryLower)
    if (aStarts !== bStarts) return aStarts ? -1 : 1
    if (aWordStarts !== bWordStarts) return aWordStarts ? -1 : 1
    const aIncludes = aLabel.includes(queryLower)
    const bIncludes = bLabel.includes(queryLower)
    if (aIncludes !== bIncludes) return aIncludes ? -1 : 1

    // When both candidates are valid text matches, prefer nearest result.
    if (bias && (aWordStarts || bWordStarts || aIncludes || bIncludes)) {
      const aDistance = distanceScoreMiles(bias, a)
      const bDistance = distanceScoreMiles(bias, b)
      if (aDistance !== bDistance) return aDistance - bDistance
    }

    const aPrimaryExact = aPrimary === queryLower
    const bPrimaryExact = bPrimary === queryLower
    if (aPrimaryExact !== bPrimaryExact) return aPrimaryExact ? -1 : 1
    if (aStarts && bStarts) {
      const aDelta = Math.max(0, aPrimary.length - queryLower.length)
      const bDelta = Math.max(0, bPrimary.length - queryLower.length)
      if (aDelta !== bDelta) return aDelta - bDelta
    }

    return aLabel.localeCompare(bLabel)
  })
}
