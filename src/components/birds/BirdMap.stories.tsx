import type { Meta, StoryObj } from '@storybook/react'
import { BirdMap } from './BirdMap'
import type { NearbyBird } from '@/services/nearbyBirds'

const mockBirds: NearbyBird[] = [
  {
    id: 'annhum',
    commonName: "Anna's Hummingbird",
    scientificName: 'Calypte anna',
    distanceMiles: 2.3,
    lat: 45.52,
    lng: -122.68,
    group: 'songbird',
    lastSeenHoursAgo: 4,
  },
  {
    id: 'dowwoo',
    commonName: 'Downy Woodpecker',
    scientificName: 'Dryobates pubescens',
    distanceMiles: 5.1,
    lat: 45.48,
    lng: -122.72,
    group: 'woodpecker',
    lastSeenHoursAgo: 12,
  },
]

const meta: Meta<typeof BirdMap> = {
  title: 'Components/BirdMap',
  component: BirdMap,
  parameters: {
    layout: 'centered',
  },
}

export default meta

export const Default: StoryObj<typeof BirdMap> = {
  args: {
    birds: mockBirds,
    selectedBirdId: null,
    onSelectBird: () => {},
    className: 'h-64 w-80',
  },
}

export const WithSelection: StoryObj<typeof BirdMap> = {
  args: {
    ...Default.args,
    selectedBirdId: 'annhum',
  } as Partial<typeof Default.args>,
}
