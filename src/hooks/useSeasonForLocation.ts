/**
 * Derives current season for a location based on lat (hemisphere) and today's date.
 * Northern: Breeding May–Aug, Nonbreeding Nov–Feb, Migration Mar–Apr & Sep–Oct
 * Southern: Breeding Sep–Feb, Nonbreeding May–Aug, Migration Mar–Apr & Aug–Oct
 */
export type Season = 'breeding' | 'nonbreeding' | 'migration'

export type SeasonInfo = {
  season: Season
  dateRange: string
  isNow: boolean
}

const NORTHERN_SEASONS: { months: number[]; season: Season; dateRange: string }[] = [
  { months: [5, 6, 7, 8], season: 'breeding', dateRange: 'May–Aug' },
  { months: [11, 12, 1, 2], season: 'nonbreeding', dateRange: 'Nov–Feb' },
  { months: [3, 4], season: 'migration', dateRange: 'Mar–Apr' },
  { months: [9, 10], season: 'migration', dateRange: 'Sep–Oct' },
]

const SOUTHERN_SEASONS: { months: number[]; season: Season; dateRange: string }[] = [
  { months: [9, 10, 11, 12, 1, 2], season: 'breeding', dateRange: 'Sep–Feb' },
  { months: [3, 4], season: 'migration', dateRange: 'Mar–Apr' },
  { months: [8, 9, 10], season: 'migration', dateRange: 'Aug–Oct' },
  { months: [5, 6, 7, 8], season: 'nonbreeding', dateRange: 'May–Aug' },
]

function getSeasonForMonth(
  month: number,
  seasons: { months: number[]; season: Season; dateRange: string }[]
): { season: Season; dateRange: string } | null {
  for (const s of seasons) {
    if (s.months.includes(month)) return { season: s.season, dateRange: s.dateRange }
  }
  return null
}

export function getSeasonForLocation(lat: number): SeasonInfo | null {
  const month = new Date().getMonth() + 1 // 1–12
  const seasons = lat >= 0 ? NORTHERN_SEASONS : SOUTHERN_SEASONS
  const match = getSeasonForMonth(month, seasons)
  if (!match) return null
  return {
    ...match,
    isNow: true, // We always show the current season
  }
}
