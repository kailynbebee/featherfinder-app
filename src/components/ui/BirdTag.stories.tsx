import type { Meta, StoryObj } from '@storybook/react'
import { BirdTag } from './BirdTag'
import type { BirdTag as BirdTagType } from '@/services/nearbyBirds'

const meta: Meta<typeof BirdTag> = {
  title: 'Components/BirdTag',
  component: BirdTag,
}

export default meta

export const CountryBird: StoryObj<typeof BirdTag> = {
  args: {
    tag: { type: 'country_bird', country: 'US' } satisfies BirdTagType,
  },
}

export const SubnationalBird: StoryObj<typeof BirdTag> = {
  args: {
    tag: {
      type: 'subnational_bird',
      regionCode: 'US-CA',
      regionName: 'California',
    } satisfies BirdTagType,
  },
}

export const SeasonNow: StoryObj<typeof BirdTag> = {
  args: {
    tag: {
      type: 'season',
      season: 'breeding',
      isNow: true,
      dateRange: 'Apr–Jul',
    } satisfies BirdTagType,
  },
}

export const SeasonFuture: StoryObj<typeof BirdTag> = {
  args: {
    tag: {
      type: 'season',
      season: 'nonbreeding',
      isNow: false,
      dateRange: 'Oct–Mar',
    } satisfies BirdTagType,
  },
}
