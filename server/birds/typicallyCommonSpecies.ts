/**
 * Species that are typically common in urban/suburban areas but often lack
 * Status and Trends data (ST focuses on ~1,120 conservation-priority species).
 * When ST returns null for these, we default to "common" instead of "uncommon".
 *
 * eBird species codes. Add species as needed.
 */
export const TYPICALLY_COMMON_SPECIES = new Set([
  'rocpig', // Rock Pigeon (Feral Pigeon)
  'houspa', // House Sparrow
  'eursta', // European Starling
  'amerob', // American Robin
  'mourdo', // Mourning Dove
  'blujay', // Blue Jay
  'norcar', // Northern Cardinal
  'amecro', // American Crow
  'comgra', // Common Grackle
  'redwha', // Red-winged Blackbird
  'houfin', // House Finch
  'golfin', // American Goldfinch
  'chispa', // Chipping Sparrow
  'sonspa', // Song Sparrow
  'daejun', // Dark-eyed Junco
  'tuftit', // Tufted Titmouse
  'carwre', // Carolina Wren
  'dowwoo', // Downy Woodpecker
  'rebnut', // Red-bellied Woodpecker
  'annhum', // Anna's Hummingbird
  'cangoo', // Canada Goose
  'mallar', // Mallard
  'gbbgul', // Ring-billed Gull
  'hergul', // Herring Gull
])
