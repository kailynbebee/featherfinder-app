import type { Meta, StoryObj } from '@storybook/react'
import { BirdCard } from './BirdCard'
import type { NearbyBird } from '@/services/nearbyBirds'

const mockBird: NearbyBird = {
  id: 'annhum',
  commonName: "Anna's Hummingbird",
  scientificName: 'Calypte anna',
  distanceMiles: 2.3,
  lat: 45.5,
  lng: -122.6,
  group: 'songbird',
  lastSeenHoursAgo: 4,
}

const meta: Meta<typeof BirdCard> = {
  title: 'Components/BirdCard',
  component: BirdCard,
  parameters: {
    layout: 'centered',
  },
}

export default meta

export const Default: StoryObj<typeof BirdCard> = {
  args: {
    bird: mockBird,
    tags: [],
    rarity: 'uncommon',
    selected: false,
    onSelect: () => {},
    onQuickView: () => {},
    showWingspanMark: false,
  },
}

export const Selected: StoryObj<typeof BirdCard> = {
  args: {
    ...Default.args,
    selected: true,
  } as Partial<typeof Default.args>,
}

export const WithWingspanMark: StoryObj<typeof BirdCard> = {
  args: {
    ...Default.args,
    bird: { ...mockBird, id: 'eupsni' },
    showWingspanMark: true,
  } as Partial<typeof Default.args>,
}

export const WithTags: StoryObj<typeof BirdCard> = {
  args: {
    ...Default.args,
    tags: [
      { type: 'country_bird', country: 'US' },
      {
        type: 'season',
        season: 'breeding',
        isNow: true,
        dateRange: 'Apr–Jul',
      },
    ],
  } as Partial<typeof Default.args>,
}
