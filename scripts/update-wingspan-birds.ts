#!/usr/bin/env npx tsx
/**
 * Update Wingspan bird list with eBird species codes.
 *
 * 1. Fetches eBird taxonomy from https://api.ebird.org/v2/ref/taxonomy/ebird
 * 2. Matches Wingspan bird names (common or scientific) to eBird species codes
 * 3. Writes to src/data/wingspanBirds.ts
 *
 * Usage:
 *   npx tsx scripts/update-wingspan-birds.ts
 *   EBIRD_API_KEY=xxx npx tsx scripts/update-wingspan-birds.ts
 *
 * Requires EBIRD_API_KEY in .env or environment.
 */

import { readFileSync, writeFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

const EBIRD_TAXONOMY_URL = 'https://api.ebird.org/v2/ref/taxonomy/ebird'
const RAW_BIRDS_PATH = resolve(__dirname, 'wingspan-birds-raw.json')
const OUTPUT_PATH = resolve(__dirname, '../src/data/wingspanBirds.ts')

type EbirdTaxon = {
  sciName: string
  comName: string
  speciesCode: string
  category: string
  reportAs?: string
}

function loadEnv(): void {
  try {
    const envPath = resolve(__dirname, '../.env')
    const content = readFileSync(envPath, 'utf-8')
    for (const line of content.split('\n')) {
      const m = line.match(/^([^#=]+)=(.*)$/)
      if (m) {
        const key = m[1].trim()
        const val = m[2].trim().replace(/^["']|["']$/g, '')
        if (!process.env[key]) process.env[key] = val
      }
    }
  } catch {
    // .env optional
  }
}

function normalizeForMatch(s: string): string {
  return s
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/['']/g, "'")
    .replace(/\s*[-–]\s*/g, '-')
    .trim()
}

function fetchEbirdTaxonomy(apiKey: string): Promise<EbirdTaxon[]> {
  const url = new URL(EBIRD_TAXONOMY_URL)
  url.searchParams.set('fmt', 'json')
  url.searchParams.set('cat', 'species')

  return fetch(url.toString(), {
    headers: { 'X-eBirdApiToken': apiKey },
  }).then(async (res) => {
    if (!res.ok) {
      const text = await res.text()
      throw new Error(`eBird API ${res.status}: ${text.slice(0, 200)}`)
    }
    return res.json() as Promise<EbirdTaxon[]>
  })
}

function buildLookupMaps(taxa: EbirdTaxon[]): {
  byCommon: Map<string, string>
  byScientific: Map<string, string>
} {
  const byCommon = new Map<string, string>()
  const byScientific = new Map<string, string>()

  for (const t of taxa) {
    const code = t.reportAs ?? t.speciesCode
    if (t.category === 'species' || t.reportAs) {
      byCommon.set(normalizeForMatch(t.comName), code)
      byScientific.set(normalizeForMatch(t.sciName), code)
    }
  }
  return { byCommon, byScientific }
}

function matchBird(
  name: string,
  byCommon: Map<string, string>,
  byScientific: Map<string, string>
): string | null {
  const norm = normalizeForMatch(name)
  return byCommon.get(norm) ?? byScientific.get(norm) ?? null
}

// Common name variants (Wingspan -> eBird). Full-name replacements for eBird taxonomy differences.
const COMMON_VARIANTS: [string, string][] = [
  ['European Bee Eater', 'European Bee-eater'],
  ['Grey', 'Gray'], // eBird uses Gray for American, Grey for others
  ['Count Raggi\'s Bird of Paradise', "Count Raggi's Bird-of-paradise"],
  ['Magpie Lark', 'Magpie-lark'],
  ['Willie Wagtail', 'Willie-wagtail'],
  ['White Bellied Sea Eagle', 'White-bellied Sea-Eagle'],
  ['White-Breasted Woodswallow', 'White-breasted Woodswallow'],
  ['Many-Colored Fruit Dove', 'Many-colored Fruit-Dove'],
  ['Orange Footed Scrubfowl', 'Orange-footed Scrubfowl'],
  ['Pink-Eared Duck', 'Pink-eared Duck'],
  ['Plains Wanderer', 'Plains-wanderer'],
  ['Princess Stephanie\'s Astrapia', "Princess Stephanie's Astrapia"],
  ['Pukeko', 'Purple Swamphen'],
  ['Korimako', 'New Zealand Bellbird'],
  ['Australian Owlet Nightjar', 'Australian Owlet-Nightjar'],
  ['Grey Shrike-Thrush', 'Grey Shrikethrush'],
  ['Grey-Headed Mannikin', 'Grey-headed Mannikin'],
  ['Red-Backed Fairywren', 'Red-backed Fairywren'],
  ['Red-Necked Avocet', 'Red-necked Avocet'],
  ['Red-Winged Parrot', 'Red-winged Parrot'],
  ['Rufous Banded Honeyeater', 'Rufous-banded Honeyeater'],
  ['Sulphur Crested Cockatoo', 'Sulphur-crested Cockatoo'],
  ['Black Shouldered Kite', 'Black-shouldered Kite'],
  ['Gould\'s Finch', 'Gouldian Finch'],
  // eBird name updates / regional variants
  ['Gray Jay', 'Canada Jay'],
  ['Common Starling', 'European Starling'],
  ['Common Blackbird', 'Eurasian Blackbird'],
  ['Common Moorhen', 'Eurasian Moorhen'],
  ['Black-throated Diver', 'Arctic Loon'],
  ['Bullfinch', 'Eurasian Bullfinch'],
  ['European Honey Buzzard', 'European Honey-buzzard'],
  ['European Turtle Dove', 'European Turtle-Dove'],
  ['Griffon Vulture', 'Eurasian Griffon'],
  ['Northern Goshawk', 'Eurasian Goshawk'],
  ['Wilson\'s Storm Petrel', "Wilson's Storm-Petrel"],
  ['Australasian Pipit', 'Australian Pipit'],
  ['Australian Zebra Finch', 'Zebra Finch'],
  ['Count Raggi\'s Bird-of-paradise', "Raggiana Bird-of-paradise"],
  ['Grey-headed Mannikin', 'Grey-headed Munia'],
  ['Grey Warbler', 'Grey Gerygone'],
  ['Horsfield\'s Bushlark', 'Australasian Bushlark'],
  ['Kereru', 'New Zealand Pigeon'],
  ['Major Mitchell\'s Cockatoo', 'Pink Cockatoo'],
  ['Purple Swamphen', 'Australasian Swamphen'],
  ['Rufous Night Heron', 'Nankeen Night Heron'],
  ['Common Little Bittern', 'Little Bittern'],
  ['Barn Owl', 'Western Barn-Owl'],
  ['Herring Gull', 'European Herring Gull'],
  ['Yellow Warbler', 'American Yellow Warbler'],
  ['Eastern Imperial Eagle', 'Eastern Imperial Eagle'], // same in eBird
  ['Eurasian Nutcracker', 'Spotted Nutcracker'],
  ['Grey-Headed Mannikin', 'Grey-headed Munia'],
  ['Horsfield\'s Bushlark', 'Australasian Bushlark'],
  ['Orange-footed Scrubfowl', 'Orange-footed Scrubfowl'],
  ['Princess Stephanie\'s Astrapia', "Princess Stephanie's Astrapia"],
]

// Manual overrides when eBird taxonomy name differs significantly
const MANUAL_OVERRIDES: Record<string, string> = {
  'barn owl': 'barowl',
  'yellow warbler': 'yelwar',
  'eastern imperial eagle': 'easime1',
  'eurasian nutcracker': 'sponut1',
  'grey-headed mannikin': 'grymun1',
  'grey warbler': 'gryger1',
  "horsfield's bushlark": 'ausbus1',
  'orange-footed scrubfowl': 'orfscr1',
  "princess stephanie's astrapia": 'prsast1',
}

function tryVariants(
  name: string,
  byCommon: Map<string, string>,
  byScientific: Map<string, string>
): string | null {
  let code = matchBird(name, byCommon, byScientific)
  if (code) return code

  for (const [from, to] of COMMON_VARIANTS) {
    const replaced = name.replace(new RegExp(from, 'gi'), to)
    if (replaced !== name) {
      code = matchBird(replaced, byCommon, byScientific)
      if (code) return code
    }
  }

  const norm = normalizeForMatch(name)
  return MANUAL_OVERRIDES[norm] ?? null
}

async function main(): Promise<void> {
  loadEnv()
  const apiKey = process.env.EBIRD_API_KEY?.trim()
  if (!apiKey) {
    console.error('Error: EBIRD_API_KEY is required. Set it in .env or environment.')
    process.exit(1)
  }

  const raw = JSON.parse(readFileSync(RAW_BIRDS_PATH, 'utf-8')) as {
    base?: string[]
    europe?: string[]
    oceania?: string[]
    asia?: string[]
    americas?: string[]
  }

  const allNames = [
    ...(raw.base ?? []),
    ...(raw.europe ?? []),
    ...(raw.oceania ?? []),
    ...(raw.asia ?? []),
    ...(raw.americas ?? []),
  ]
  const uniqueNames = [...new Set(allNames)]

  console.log('Fetching eBird taxonomy...')
  const taxa = await fetchEbirdTaxonomy(apiKey)
  const { byCommon, byScientific } = buildLookupMaps(taxa)
  console.log(`Loaded ${taxa.length} eBird taxa`)

  const matched: string[] = []
  const unmatched: string[] = []

  for (const name of uniqueNames) {
    const code = tryVariants(name, byCommon, byScientific)
    if (code && !matched.includes(code)) {
      matched.push(code)
    } else if (!code) {
      unmatched.push(name)
    }
  }

  matched.sort()

  if (unmatched.length > 0) {
    console.warn(`\nUnmatched (${unmatched.length}):`)
    unmatched.forEach((n) => console.warn(`  - ${n}`))
  }

  const tsContent = `/**
 * eBird species codes for birds in the Wingspan board game.
 * Base + Europe + Oceania expansions. Used to highlight Wingspan birds in nearby results.
 *
 * Generated by: npm run update-wingspan-birds
 * Last updated: ${new Date().toISOString().slice(0, 10)}
 * Sources: wingspan-birds-raw.json, eBird taxonomy API
 */
export const WINGSPAN_EBIRD_SPECIES = new Set<string>([
${matched.map((c) => `  '${c}',`).join('\n')}
])
`

  writeFileSync(OUTPUT_PATH, tsContent)
  console.log(`\nWrote ${matched.length} species codes to ${OUTPUT_PATH}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
