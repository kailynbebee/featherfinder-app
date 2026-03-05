/**
 * eBird species code -> subnational regions (eBird subnational1 codes).
 * Official birds of states, provinces, territories.
 * Prioritized by population: India, China, Indonesia, US, Brazil.
 */

export type SubnationalRegion = {
  regionCode: string
  regionName: string
}

export const SUBNATIONAL_BIRDS: Record<string, SubnationalRegion[]> = {
  // US state birds
  norcar: [
    { regionCode: 'US-IL', regionName: 'Illinois' },
    { regionCode: 'US-IN', regionName: 'Indiana' },
    { regionCode: 'US-KY', regionName: 'Kentucky' },
    { regionCode: 'US-NC', regionName: 'North Carolina' },
    { regionCode: 'US-OH', regionName: 'Ohio' },
    { regionCode: 'US-VA', regionName: 'Virginia' },
    { regionCode: 'US-WV', regionName: 'West Virginia' },
  ],
  wesmea: [
    { regionCode: 'US-KS', regionName: 'Kansas' },
    { regionCode: 'US-MT', regionName: 'Montana' },
    { regionCode: 'US-NE', regionName: 'Nebraska' },
    { regionCode: 'US-ND', regionName: 'North Dakota' },
    { regionCode: 'US-OR', regionName: 'Oregon' },
    { regionCode: 'US-WY', regionName: 'Wyoming' },
  ],
  amerob: [
    { regionCode: 'US-CT', regionName: 'Connecticut' },
    { regionCode: 'US-MI', regionName: 'Michigan' },
    { regionCode: 'US-WI', regionName: 'Wisconsin' },
  ],
  blujay: [
    { regionCode: 'US-NJ', regionName: 'New Jersey' },
    { regionCode: 'US-NY', regionName: 'New York' },
    { regionCode: 'CA-PE', regionName: 'Prince Edward Island' },
  ],
  comloo: [
    { regionCode: 'US-MN', regionName: 'Minnesota' },
    { regionCode: 'CA-ON', regionName: 'Ontario' },
  ],
  stelja: [{ regionCode: 'CA-BC', regionName: 'British Columbia' }],
  grhowl: [{ regionCode: 'CA-AB', regionName: 'Alberta' }],
  grgowl: [{ regionCode: 'CA-MB', regionName: 'Manitoba' }],
  blcchi: [{ regionCode: 'CA-NB', regionName: 'New Brunswick' }],
  atlpuf: [{ regionCode: 'CA-NL', regionName: 'Newfoundland and Labrador' }],
  osprey: [{ regionCode: 'CA-NS', regionName: 'Nova Scotia' }],
  gyrfal: [{ regionCode: 'CA-NT', regionName: 'Northwest Territories' }],
  rocpta: [{ regionCode: 'CA-NU', regionName: 'Nunavut' }],
  snoowl1: [{ regionCode: 'CA-QC', regionName: 'Quebec' }],
  shtgro: [{ regionCode: 'CA-SK', regionName: 'Saskatchewan' }],
  comrav: [{ regionCode: 'CA-YT', regionName: 'Yukon' }],
  // Australia
  blkswa: [{ regionCode: 'AU-WA', regionName: 'Western Australia' }],
  laukoo: [{ regionCode: 'AU-NSW', regionName: 'New South Wales' }],
  weteag: [{ regionCode: 'AU-NT', regionName: 'Northern Territory' }],
  brolga: [{ regionCode: 'AU-QLD', regionName: 'Queensland' }],
  ausmag: [{ regionCode: 'AU-SA', regionName: 'South Australia' }],
  yelwat: [{ regionCode: 'AU-TAS', regionName: 'Tasmania' }],
  helhon: [{ regionCode: 'AU-VIC', regionName: 'Victoria' }],
  ganga1: [{ regionCode: 'AU-ACT', regionName: 'Australian Capital Territory' }],
  // India - sample state birds
  grehor: [{ regionCode: 'IN-AR', regionName: 'Arunachal Pradesh' }],
  whwwoo: [{ regionCode: 'IN-AS', regionName: 'Assam' }],
  rospar: [{ regionCode: 'IN-AP', regionName: 'Andhra Pradesh' }],
}
