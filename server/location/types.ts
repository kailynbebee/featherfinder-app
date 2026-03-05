export type SuggestionBias = {
  lat: number
  lng: number
}

export type LocationSuggestion = {
  lat: number
  lng: number
  label: string
}

export type ReverseGeocodeContext = {
  state: string | null
  county: string | null
  countryCode: string | null
}

export type SuggestRequest = {
  query: string
  limit: number
  countryHint: string | null
  bias: SuggestionBias | null
}
