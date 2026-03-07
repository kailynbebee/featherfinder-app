import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import type { NearbyBird } from '@/services/nearbyBirds'

type DistanceFilter = '10' | '25'
type SortMode = 'distance' | 'recent'

type BirdFiltersModalProps = {
  isOpen: boolean
  onClose: () => void
  distanceFilter: DistanceFilter
  onDistanceFilterChange: (v: DistanceFilter) => void
  groupFilter: NearbyBird['group'] | 'all'
  onGroupFilterChange: (v: NearbyBird['group'] | 'all') => void
  includeNonGameBirds: boolean
  onIncludeNonGameBirdsChange: (v: boolean) => void
  recentOnly: boolean
  onRecentOnlyChange: (v: boolean) => void
  sortMode: SortMode
  onSortModeChange: (v: SortMode) => void
  visibleCount: number
}

export function BirdFiltersModal({
  isOpen,
  onClose,
  distanceFilter,
  onDistanceFilterChange,
  groupFilter,
  onGroupFilterChange,
  includeNonGameBirds,
  onIncludeNonGameBirdsChange,
  recentOnly,
  onRecentOnlyChange,
  sortMode,
  onSortModeChange,
  visibleCount,
}: BirdFiltersModalProps) {
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const modalContent = (
    <>
      <div
        className="fixed inset-0 z-1300 bg-black/40"
        aria-hidden
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="filters-title"
        className="fixed inset-x-4 top-4 z-1310 max-h-[calc(100vh-2rem)] overflow-y-auto rounded-2xl border border-app-border-muted/60 bg-white p-6 shadow-[0_8px_32px_rgba(74,55,40,0.2)] lg:inset-auto lg:left-1/2 lg:top-1/2 lg:max-w-md lg:-translate-x-1/2 lg:-translate-y-1/2"
      >
        <div className="flex items-center justify-between pb-4">
          <h2 id="filters-title" className="font-kodchasan text-lg font-bold text-app-text">
            Filters
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close filters"
            className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full text-app-text/60 transition-colors hover:bg-app-background hover:text-app-text"
          >
            <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-6">
          <section aria-labelledby="filters-distance">
            <h3 id="filters-distance" className="mb-2 font-kodchasan text-sm font-medium text-app-text/80">
              Distance
            </h3>
            <div className="flex h-9 overflow-hidden rounded-xl border border-app-border-muted/70" role="group" aria-label="Distance filter">
              {(['10', '25'] as const).map((distance, i) => (
                <button
                  key={distance}
                  type="button"
                  onClick={() => onDistanceFilterChange(distance)}
                  aria-pressed={distanceFilter === distance}
                  className={`flex flex-1 cursor-pointer items-center justify-center font-kodchasan text-sm ${distanceFilter === distance ? 'bg-app-accent-secondary/15 text-teal-900' : 'bg-white text-black hover:bg-app-background'} ${i > 0 ? 'border-l border-app-border-muted/70' : ''}`}
                >
                  {distance === '25' ? 'Within 25 mi' : `Under ${distance} mi`}
                </button>
              ))}
            </div>
          </section>

          <section aria-labelledby="filters-group">
            <h3 id="filters-group" className="mb-2 font-kodchasan text-sm font-medium text-app-text/80">
              Bird type
            </h3>
            <div className="flex flex-wrap gap-2">
              {(['all', 'songbird', 'woodpecker', 'raptor', 'other'] as const).map((group) => (
                <button
                  key={group}
                  type="button"
                  onClick={() => onGroupFilterChange(group)}
                  aria-pressed={groupFilter === group}
                  className={`flex h-9 shrink-0 cursor-pointer items-center rounded-lg border px-3 font-kodchasan text-sm ${groupFilter === group ? 'border-app-accent-secondary/50 bg-app-accent-secondary/15 text-teal-900' : 'border-app-border-muted/70 bg-white text-black hover:bg-app-background'}`}
                >
                  {group === 'all' ? 'All' : group}
                </button>
              ))}
            </div>
          </section>

          <section aria-labelledby="filters-wingspan">
            <h3 id="filters-wingspan" className="mb-2 font-kodchasan text-sm font-medium text-app-text/80">
              Bird source
            </h3>
            <div className="flex h-9 overflow-hidden rounded-xl border border-app-border-muted/70" role="group" aria-label="Wingspan bird filter">
              <button
                type="button"
                onClick={() => onIncludeNonGameBirdsChange(false)}
                aria-pressed={!includeNonGameBirds}
                className={`flex flex-1 cursor-pointer items-center justify-center font-kodchasan text-sm ${!includeNonGameBirds ? 'bg-app-accent-secondary/15 text-teal-900' : 'bg-white text-black hover:bg-app-background'}`}
              >
                Wingspan birds
              </button>
              <button
                type="button"
                onClick={() => onIncludeNonGameBirdsChange(true)}
                aria-pressed={includeNonGameBirds}
                className={`flex flex-1 cursor-pointer items-center justify-center border-l border-app-border-muted/70 font-kodchasan text-sm ${includeNonGameBirds ? 'bg-app-accent-secondary/15 text-teal-900' : 'bg-white text-black hover:bg-app-background'}`}
              >
                All birds
              </button>
            </div>
          </section>

          <section aria-labelledby="filters-recent">
            <h3 id="filters-recent" className="mb-2 font-kodchasan text-sm font-medium text-app-text/80">
              When seen
            </h3>
            <button
              type="button"
              onClick={() => onRecentOnlyChange(!recentOnly)}
              aria-pressed={recentOnly}
              className={`flex h-9 w-full cursor-pointer items-center justify-center rounded-xl border font-kodchasan text-sm ${recentOnly ? 'border-app-accent-secondary-hover bg-app-accent-secondary/15 text-teal-900' : 'border-app-border-muted/70 bg-white text-black hover:bg-app-background'}`}
            >
              Last 24 hours only
            </button>
          </section>

          <section aria-labelledby="filters-sort">
            <h3 id="filters-sort" className="mb-2 font-kodchasan text-sm font-medium text-app-text/80">
              Sort by
            </h3>
            <div className="flex h-9 overflow-hidden rounded-xl border border-app-border-muted/70" role="group" aria-label="Sort">
              <button
                type="button"
                onClick={() => onSortModeChange('distance')}
                aria-pressed={sortMode === 'distance'}
                className={`flex flex-1 cursor-pointer items-center justify-center font-kodchasan text-sm ${sortMode === 'distance' ? 'bg-app-accent-secondary/15 text-teal-900' : 'bg-white text-black hover:bg-app-background'}`}
              >
                Distance
              </button>
              <button
                type="button"
                onClick={() => onSortModeChange('recent')}
                aria-pressed={sortMode === 'recent'}
                className={`flex flex-1 cursor-pointer items-center justify-center border-l border-app-border-muted/70 font-kodchasan text-sm ${sortMode === 'recent' ? 'bg-app-accent-secondary/15 text-teal-900' : 'bg-white text-black hover:bg-app-background'}`}
              >
                Recent
              </button>
            </div>
          </section>
        </div>

        <div className="mt-6 flex items-center justify-between gap-4 border-t border-app-border-muted/50 pt-4">
          <p className="font-kodchasan text-sm text-app-text/70">
            {visibleCount} bird{visibleCount === 1 ? '' : 's'}
          </p>
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-xl bg-app-accent-secondary px-4 py-2 font-kodchasan text-sm font-bold text-white transition-opacity hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-app-accent focus-visible:ring-offset-2"
          >
            Show results
          </button>
        </div>
      </div>
    </>
  )

  return createPortal(modalContent, document.body)
}
