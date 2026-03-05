import type { RarityTier } from '@/services/nearbyBirds'

const RARITY_STYLES: Record<RarityTier, string> = {
  common: 'bg-[#9ca3af]/25 text-[#4b5563] border-[#9ca3af]/50',
  uncommon: 'bg-[#4a7c9e]/20 text-[#2d5a75] border-[#4a7c9e]/40',
  rare: 'bg-[#c8a84a]/25 text-[#6b5a2d] border-[#c8a84a]/50',
}

export function RarityBadge({ tier }: { tier: RarityTier }) {
  const label = tier.charAt(0).toUpperCase() + tier.slice(1)
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 font-kodchasan text-xs font-medium ${RARITY_STYLES[tier]}`}
    >
      {label}
    </span>
  )
}
