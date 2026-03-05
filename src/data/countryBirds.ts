/**
 * eBird species code -> ISO 3166-1 country code.
 * National/official birds. Source: Wikipedia List of national birds.
 * Prioritized by population (India, China, Indonesia, US, Brazil, etc.)
 */
export const COUNTRY_BIRDS: Record<string, string> = {
  // India - Indian Peafowl
  indpef: 'IN',
  // China - Red-crowned Crane
  reccra: 'CN',
  // Indonesia - Javan Hawk-Eagle
  javhae: 'ID',
  // US - Bald Eagle
  baleag: 'US',
  // Brazil - Rufous-bellied Thrush
  rufthr: 'BR',
  // Mexico - Golden Eagle
  goleag: 'MX',
  // UK - European Robin
  eurrob: 'GB',
  // Japan - Green Pheasant
  grnphe: 'JP',
  // South Africa - Blue Crane
  blucra: 'ZA',
  // New Zealand - Kiwi (North Island Brown Kiwi)
  nibkiw: 'NZ',
  // Australia - Emu (unofficial, but widely recognized)
  emu: 'AU',
  // Canada - Gray Jay / Canada Jay (unofficial)
  grajay: 'CA',
}
