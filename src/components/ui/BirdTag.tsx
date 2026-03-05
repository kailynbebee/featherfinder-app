import type { BirdTag as BirdTagType } from '@/services/nearbyBirds'

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
    case 'rare_sighting':
      return 'Rare Sighting'
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
    case 'rare_sighting':
      return 'bg-[#c8a84a]/25 text-[#6b5a2d] border-[#c8a84a]/50'
    default:
      return 'bg-[#c8b292]/20 text-[#4e3626]/80 border-[#c8b292]/40'
  }
}

export function BirdTag({ tag }: { tag: BirdTagType }) {
  const label = getTagLabel(tag)
  if (!label) return null

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 font-kodchasan text-xs font-medium ${getTagStyles(tag)}`}
    >
      {label}
    </span>
  )
}
