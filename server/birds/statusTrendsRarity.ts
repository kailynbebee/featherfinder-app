/**
 * Fetches species frequency (abundance) from eBird Status and Trends
 * to derive rarity tiers. Uses regional_stats.csv per species.
 */

const ST_BASE = 'https://st-download.ebird.org/v1'
const VERSION_YEAR = '2023'

/** Map eBird region (US-CA) to Status and Trends format (USA-CA) */
function toStRegionCode(regionCode: string | null, countryCode: string | null): string | null {
  if (regionCode) {
    // US-CA -> USA-CA, CA-ON -> CAN-ON
    const [cc, sub] = regionCode.split('-')
    if (cc === 'US' && sub) return `USA-${sub}`
    if (cc === 'CA' && sub) return `CAN-${sub}`
    if (cc === 'AU' && sub) return `AUS-${sub}`
    if (cc) return regionCode.replace(/^US$/, 'USA').replace(/^CA$/, 'CAN').replace(/^AU$/, 'AUS')
  }
  if (countryCode) {
    const u = countryCode.toUpperCase()
    if (u === 'US') return 'USA'
    if (u === 'CA') return 'CAN'
    if (u === 'AU') return 'AUS'
    return u
  }
  return null
}

/** Status and Trends season names (match CSV format) */
const ST_SEASONS = [
  'breeding',
  'nonbreeding',
  'prebreeding-migration',
  'postbreeding-migration',
] as const

/** Current season for Status and Trends based on month and hemisphere */
function getStSeason(lat: number): (typeof ST_SEASONS)[number] {
  const month = new Date().getMonth() + 1 // 1–12
  if (lat >= 0) {
    if (month >= 5 && month <= 8) return 'breeding'
    if (month >= 11 || month <= 2) return 'nonbreeding'
    if (month >= 3 && month <= 4) return 'prebreeding-migration'
    return 'postbreeding-migration'
  }
  // Southern
  if (month >= 9 || month <= 2) return 'breeding'
  if (month >= 5 && month <= 8) return 'nonbreeding'
  if (month >= 3 && month <= 4) return 'postbreeding-migration'
  return 'prebreeding-migration'
}

/** Normalize CSV season for comparison (supports underscore or hyphen variants) */
function seasonMatches(csvSeason: string, target: string): boolean {
  const n = (s: string) => s.replace(/-/g, '_').toLowerCase()
  return n(csvSeason) === n(target) || csvSeason.toLowerCase() === 'resident'
}

type RegionalStatsRow = {
  region_code: string
  region_type: string
  season: string
  abundance_mean: number
  range_percent_occupied?: number
}

export type RarityFromSt = {
  abundanceMean: number
  rangePercentOccupied?: number
  season: string
}

/**
 * Fetch regional_stats.csv for a species and extract abundance for the region.
 * Returns null if species has no Status and Trends data or region not found.
 */
export async function fetchRarityFromStatusTrends(
  speciesCode: string,
  regionCode: string | null,
  countryCode: string | null,
  lat: number,
  accessKey: string
): Promise<RarityFromSt | null> {
  const stRegion = toStRegionCode(regionCode, countryCode)
  if (!stRegion) return null

  const objKey = `${VERSION_YEAR}/${speciesCode}/regional_stats.csv`
  const url = `${ST_BASE}/fetch?objKey=${encodeURIComponent(objKey)}&key=${encodeURIComponent(accessKey)}`

  try {
    const res = await fetch(url)
    if (!res.ok) return null
    const text = await res.text()
    const rows = parseRegionalStatsCsv(text)
    const season = getStSeason(lat)

    // Prefer exact region match, then country
    const regionMatch = rows.find(
      (r) => r.region_code === stRegion && seasonMatches(r.season, season)
    )
    if (regionMatch)
      return {
        abundanceMean: regionMatch.abundance_mean,
        rangePercentOccupied: regionMatch.range_percent_occupied,
        season,
      }

    // Try country-level (e.g. USA) if state not found
    const countryPart = stRegion.split('-')[0]
    const countryMatch = rows.find(
      (r) => r.region_code === countryPart && seasonMatches(r.season, season)
    )
    if (countryMatch)
      return {
        abundanceMean: countryMatch.abundance_mean,
        rangePercentOccupied: countryMatch.range_percent_occupied,
        season,
      }

    return null
  } catch {
    return null
  }
}

function parseRegionalStatsCsv(text: string): RegionalStatsRow[] {
  const lines = text.trim().split('\n')
  if (lines.length < 2) return []
  const header = lines[0].split(',')
  const rows: RegionalStatsRow[] = []
  for (let i = 1; i < lines.length; i++) {
    const values = parseCsvLine(lines[i]!)
    const row: Record<string, string | number> = {}
    header.forEach((h, j) => {
      row[h.trim()] = values[j] ?? ''
    })
    const abundance_mean = parseFloat(String(row.abundance_mean ?? 0))
    const range_percent_occupied = parseFloat(
      String(row.range_percent_occupied ?? '')
    )
    if (!Number.isNaN(abundance_mean)) {
      rows.push({
        region_code: String(row.region_code ?? ''),
        region_type: String(row.region_type ?? ''),
        season: String(row.season ?? ''),
        abundance_mean,
        range_percent_occupied: Number.isNaN(range_percent_occupied)
          ? undefined
          : range_percent_occupied,
      })
    }
  }
  return rows
}

function parseCsvLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const c = line[i]
    if (c === '"') {
      inQuotes = !inQuotes
    } else if ((c === ',' && !inQuotes) || c === '\n') {
      result.push(current.trim())
      current = ''
    } else {
      current += c
    }
  }
  result.push(current.trim())
  return result
}

/**
 * Map abundance/occupancy to rarity. Higher values = more common.
 *
 * abundance_mean = expected count per standardized checklist (can span 0.0001–50+).
 * range_percent_occupied = proportion of region in species range (0–1).
 *
 * Use range_percent_occupied when available (clearer 0–1 scale). Otherwise use
 * abundance_mean with log-friendly thresholds.
 */
export function abundanceToRarity(
  abundanceMean: number,
  rangePercentOccupied?: number
): 'common' | 'uncommon' | 'rare' {
  if (rangePercentOccupied != null && rangePercentOccupied > 0) {
    if (rangePercentOccupied >= 0.25) return 'common'   // in 25%+ of region
    if (rangePercentOccupied >= 0.05) return 'uncommon' // 5–25%
    return 'rare' // <5%
  }

  // abundance_mean: expected count per checklist (often 0.001–10)
  if (abundanceMean >= 0.5) return 'common'   // expect ~0.5+ per checklist
  if (abundanceMean >= 0.05) return 'uncommon' // 0.05–0.5
  return 'rare' // <0.05
}
