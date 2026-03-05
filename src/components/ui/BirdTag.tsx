import type { BirdTag as BirdTagType } from '@/services/nearbyBirds'

/** Convert ISO 3166-1 alpha-2 country code to flag emoji (e.g. US -> 🇺🇸) */
function countryCodeToFlag(code: string): string {
  const c = code.toUpperCase()
  if (c.length !== 2) return ''
  return [...c]
    .map((char) => String.fromCodePoint(0x1f1e6 + char.charCodeAt(0) - 0x41))
    .join('')
}

const COUNTRY_NAMES: Record<string, string> = {
  US: 'United States',
  IN: 'India',
  CN: 'China',
  ID: 'Indonesia',
  BR: 'Brazil',
  MX: 'Mexico',
  GB: 'United Kingdom',
  JP: 'Japan',
  ZA: 'South Africa',
  NZ: 'New Zealand',
  AU: 'Australia',
  CA: 'Canada',
}

function getTagLabel(tag: BirdTagType): string {
  switch (tag.type) {
    case 'country_bird':
      return `National Bird of ${COUNTRY_NAMES[tag.country] ?? tag.country}`
    case 'subnational_bird':
      return `Official Bird of ${tag.regionName}`
    case 'season': {
      if (tag.isNow) {
        const label =
          tag.season === 'breeding'
            ? 'Breeding'
            : tag.season === 'nonbreeding'
              ? 'Nonbreeding'
              : 'Migrating'
        return `${label} now (${tag.dateRange})`
      }
      const factLabel =
        tag.season === 'breeding'
          ? 'Breeds'
          : tag.season === 'nonbreeding'
            ? 'Nonbreeding'
            : 'Migrates'
      return `${factLabel} ${tag.dateRange}`
    }
    default:
      return ''
  }
}

function getTagStyles(tag: BirdTagType): string {
  switch (tag.type) {
    case 'country_bird':
      return 'bg-app-accent-secondary/20 text-app-accent-secondary-hover border-app-accent-secondary/40'
    case 'subnational_bird':
      return 'bg-app-accent-secondary/20 text-app-accent-secondary-hover border-app-accent-secondary/40'
    case 'season':
      return tag.isNow
        ? 'bg-app-accent-secondary/25 text-app-accent-secondary-hover border-app-accent-secondary/50'
        : 'border-app-border-muted/60 text-app-text/70 bg-transparent'
    default:
      return 'bg-app-border-muted/20 text-app-text/80 border-app-border-muted/40'
  }
}

function getTagFlag(tag: BirdTagType): string {
  switch (tag.type) {
    case 'country_bird':
      return countryCodeToFlag(tag.country)
    case 'subnational_bird': {
      const country = tag.regionCode.split('-')[0]
      return country ? countryCodeToFlag(country) : ''
    }
    default:
      return ''
  }
}

export function BirdTag({ tag }: { tag: BirdTagType }) {
  const label = getTagLabel(tag)
  if (!label) return null

  const flag = getTagFlag(tag)
  const display = flag ? `${flag} ${label}` : label

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 font-kodchasan text-xs font-medium ${getTagStyles(tag)}`}
    >
      {display}
    </span>
  )
}
