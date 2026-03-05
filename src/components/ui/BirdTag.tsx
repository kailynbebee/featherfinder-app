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
      return 'bg-[#4a7c9e]/20 text-[#2d5a75] border-[#4a7c9e]/40'
    case 'subnational_bird':
      return 'bg-[#5a8f5a]/20 text-[#2d5a2d] border-[#5a8f5a]/40'
    case 'season':
      return tag.isNow
        ? 'bg-[#5a8f5a]/25 text-[#1d3b2a] border-[#5a8f5a]/50'
        : 'border-[#c8b292]/60 text-[#4e3626]/70 bg-transparent'
    default:
      return 'bg-[#c8b292]/20 text-[#4e3626]/80 border-[#c8b292]/40'
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
