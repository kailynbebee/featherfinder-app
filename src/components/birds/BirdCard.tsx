import { useBirdImage } from '@/hooks/useBirdImage'
import { isInWingspan, type BirdTag, type NearbyBird, type RarityTier } from '@/services/nearbyBirds'
import { BirdTag as BirdTagChip } from '@/components/ui/BirdTag'
import { RarityBadge } from '@/components/ui/RarityBadge'

const THUMBNAIL_SIZE = 72

export type BirdCardProps = {
  bird: NearbyBird
  tags: readonly BirdTag[]
  rarity: RarityTier
  selected: boolean
  onSelect: () => void
  onQuickView: () => void
  showWingspanMark: boolean
}

export function BirdCard({
  bird,
  tags,
  rarity,
  selected,
  onSelect,
  onQuickView,
  showWingspanMark,
}: BirdCardProps) {
  const { imageUrl, isLoading } = useBirdImage(bird.id, bird.scientificName)

  const handleClick = () => {
    onSelect()
    onQuickView()
  }

  const inWingspan = isInWingspan(bird.id)

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-pressed={selected}
      aria-label={`Bird card ${bird.id}${inWingspan ? ', in Wingspan' : ''}`}
      className={`relative flex w-full cursor-pointer gap-4 rounded-xl p-4 text-left shadow-[0_2px_8px_rgba(78,54,38,0.08)] transition-colors ${selected ? 'bg-app-accent-secondary/15' : 'bg-white/85 hover:bg-white'}`}
    >
      {showWingspanMark && inWingspan && (
        <span
          className="absolute right-3 top-3 font-serif text-sm font-bold text-app-text/60"
          aria-label="In Wingspan"
        >
          W
        </span>
      )}
      <div
        className="shrink-0 overflow-hidden rounded-lg bg-app-border-muted/30"
        style={{ width: THUMBNAIL_SIZE, height: THUMBNAIL_SIZE }}
      >
        {isLoading ? (
          <div
            className="h-full w-full animate-pulse bg-app-border-muted/50"
            aria-hidden
          />
        ) : imageUrl ? (
          <img
            src={imageUrl}
            alt=""
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div
            className="flex h-full w-full items-center justify-center bg-app-border-muted/40"
            aria-hidden
          >
            <span className="text-app-text/40 text-xl">🐦</span>
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-kodchasan text-lg font-bold text-app-text">{bird.commonName}</p>
        <p className="font-kodchasan text-sm text-app-text/80 italic">{bird.scientificName}</p>
        <p className="mt-1 font-kodchasan text-sm text-app-text/70">~{bird.distanceMiles} miles away</p>
        <p className="mt-1 font-kodchasan text-xs text-app-text/65">
          {bird.group} · seen {bird.lastSeenHoursAgo}h ago
        </p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          <RarityBadge tier={rarity} />
          {tags.map((tag, i) => (
            <BirdTagChip key={i} tag={tag} />
          ))}
        </div>
      </div>
    </button>
  )
}
