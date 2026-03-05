import type { RarityTier } from '@/services/nearbyBirds'

const RARITY_STYLES: Record<RarityTier, string> = {
  common: 'bg-app-text-muted/25 text-app-text-muted border-app-text-muted/50',
  uncommon: 'bg-app-accent-secondary/20 text-app-accent-secondary-hover border-app-accent-secondary/40',
  rare: 'bg-app-accent/25 text-app-accent-hover border-app-accent/50',
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
