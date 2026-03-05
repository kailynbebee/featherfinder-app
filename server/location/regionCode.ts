/**
 * Maps (countryCode, state/province name) to eBird subnational1 region code.
 * Nominatim returns full names; eBird uses codes like US-CA, CA-ON, AU-NSW.
 */

const US_STATE_TO_CODE: Record<string, string> = {
  alabama: 'US-AL',
  alaska: 'US-AK',
  arizona: 'US-AZ',
  arkansas: 'US-AR',
  california: 'US-CA',
  colorado: 'US-CO',
  connecticut: 'US-CT',
  delaware: 'US-DE',
  florida: 'US-FL',
  georgia: 'US-GA',
  hawaii: 'US-HI',
  idaho: 'US-ID',
  illinois: 'US-IL',
  indiana: 'US-IN',
  iowa: 'US-IA',
  kansas: 'US-KS',
  kentucky: 'US-KY',
  louisiana: 'US-LA',
  maine: 'US-ME',
  maryland: 'US-MD',
  massachusetts: 'US-MA',
  michigan: 'US-MI',
  minnesota: 'US-MN',
  mississippi: 'US-MS',
  missouri: 'US-MO',
  montana: 'US-MT',
  nebraska: 'US-NE',
  nevada: 'US-NV',
  'new hampshire': 'US-NH',
  'new jersey': 'US-NJ',
  'new mexico': 'US-NM',
  'new york': 'US-NY',
  'north carolina': 'US-NC',
  'north dakota': 'US-ND',
  ohio: 'US-OH',
  oklahoma: 'US-OK',
  oregon: 'US-OR',
  pennsylvania: 'US-PA',
  'rhode island': 'US-RI',
  'south carolina': 'US-SC',
  'south dakota': 'US-SD',
  tennessee: 'US-TN',
  texas: 'US-TX',
  utah: 'US-UT',
  vermont: 'US-VT',
  virginia: 'US-VA',
  washington: 'US-WA',
  'west virginia': 'US-WV',
  wisconsin: 'US-WI',
  wyoming: 'US-WY',
  'district of columbia': 'US-DC',
}

const CA_PROVINCE_TO_CODE: Record<string, string> = {
  alberta: 'CA-AB',
  'british columbia': 'CA-BC',
  manitoba: 'CA-MB',
  'new brunswick': 'CA-NB',
  'newfoundland and labrador': 'CA-NL',
  'nova scotia': 'CA-NS',
  ontario: 'CA-ON',
  'prince edward island': 'CA-PE',
  quebec: 'CA-QC',
  québec: 'CA-QC',
  saskatchewan: 'CA-SK',
  'northwest territories': 'CA-NT',
  nunavut: 'CA-NU',
  yukon: 'CA-YT',
}

const AU_STATE_TO_CODE: Record<string, string> = {
  'new south wales': 'AU-NSW',
  victoria: 'AU-VIC',
  queensland: 'AU-QLD',
  'western australia': 'AU-WA',
  'south australia': 'AU-SA',
  tasmania: 'AU-TAS',
  'northern territory': 'AU-NT',
  'australian capital territory': 'AU-ACT',
}

export function toEbirdRegionCode(countryCode: string | null, state: string | null): string | null {
  if (!countryCode || !state) return null
  const key = state.trim().toLowerCase()
  if (!key) return null

  if (countryCode === 'us') {
    return US_STATE_TO_CODE[key] ?? null
  }
  if (countryCode === 'ca') {
    return CA_PROVINCE_TO_CODE[key] ?? null
  }
  if (countryCode === 'au') {
    return AU_STATE_TO_CODE[key] ?? null
  }

  return null
}
