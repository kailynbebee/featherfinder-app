import type { Meta, StoryObj } from '@storybook/react'
import { RarityBadge } from './RarityBadge'
import type { RarityTier } from '@/services/nearbyBirds'

const meta: Meta<typeof RarityBadge> = {
  title: 'Components/RarityBadge',
  component: RarityBadge,
}

export default meta

export const Common: StoryObj<typeof RarityBadge> = {
  args: { tier: 'common' as RarityTier },
}

export const Uncommon: StoryObj<typeof RarityBadge> = {
  args: { tier: 'uncommon' as RarityTier },
}

export const Rare: StoryObj<typeof RarityBadge> = {
  args: { tier: 'rare' as RarityTier },
}

export const AllTiers: StoryObj<typeof RarityBadge> = {
  render: () => (
    <div className="flex gap-2">
      <RarityBadge tier="common" />
      <RarityBadge tier="uncommon" />
      <RarityBadge tier="rare" />
    </div>
  ),
}
