import { Component, useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLocation } from '@/context/LocationContext'
import { getNearbyBirds, isInWingspan, type BirdTag, type NearbyBird, type RarityTier } from '@/services/nearbyBirds'
import { useBirdImage } from '@/hooks/useBirdImage'
import { useBirdTags } from '@/hooks/useBirdTags'
import { BirdTag as BirdTagChip } from '@/components/ui/BirdTag'
import { RarityBadge } from '@/components/ui/RarityBadge'
import { BirdCard } from '@/components/birds/BirdCard'
import { BirdMap } from '@/components/birds/BirdMap'
import { FeatherFinderMark } from '@/components/branding/FeatherFinderMark'

const THUMBNAIL_SIZE = 72

type MobileViewMode = 'map' | 'list'
type SheetMode = 'collapsed' | 'half' | 'expanded'
type DistanceFilter = 'all' | '10' | '25'
type SortMode = 'distance' | 'recent'

const SHEET_HEIGHT_CLASS: Record<SheetMode, string> = {
  collapsed: 'h-26',
  half: 'h-56',
  expanded: 'h-[75vh]',
}

class MapErrorBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: ReactNode; fallback: ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error: unknown) {
    console.error('BirdMap crashed', error)
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback
    }
    return this.props.children
  }
}

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.innerWidth >= 768
  })

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return
    const mediaQuery = window.matchMedia('(min-width: 768px)')
    const onChange = (event: MediaQueryListEvent) => setIsDesktop(event.matches)
    setIsDesktop(mediaQuery.matches)
    mediaQuery.addEventListener('change', onChange)
    return () => mediaQuery.removeEventListener('change', onChange)
  }, [])

  return isDesktop
}

function QuickViewOverlay({
  bird,
  tags,
  rarity,
  onClose,
  showWingspanMark,
}: {
  bird: NearbyBird
  tags: readonly BirdTag[]
  rarity: RarityTier
  onClose: () => void
  showWingspanMark: boolean
}) {
  const { imageUrl, caption, isLoading } = useBirdImage(bird.id, bird.scientificName)
  const inWingspan = isInWingspan(bird.id)

  useEffect(() => {
    const handlePopState = () => onClose()
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-9999 flex items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="quick-view-title"
      onClick={onClose}
    >
      <div
        className="relative max-h-[90vh] w-full max-w-2xl overflow-auto rounded-2xl bg-white p-8 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 rounded-full p-1 text-app-text/70 hover:bg-app-border-muted/30 hover:text-app-text"
        >
          <span className="text-xl">×</span>
        </button>
        {showWingspanMark && inWingspan && (
          <span
            className="absolute right-12 top-8 font-serif text-base font-bold text-app-text/60"
            aria-label="In Wingspan"
          >
            W
          </span>
        )}
        <h2 id="quick-view-title" className="pr-8 font-kodchasan text-xl font-bold text-app-text">
          {bird.commonName}
        </h2>
        <p className="font-kodchasan text-sm italic text-app-text/80">{bird.scientificName}</p>
        <figure className="mt-4">
          <div className="flex justify-center overflow-hidden rounded-xl bg-app-border-muted/20">
            {isLoading ? (
              <div
                className="h-64 w-80 animate-pulse bg-app-border-muted/40"
                aria-hidden
              />
            ) : imageUrl ? (
              <img
                src={imageUrl}
                alt=""
                className="h-64 w-full object-cover"
              />
            ) : (
              <div className="flex h-64 w-80 items-center justify-center bg-app-border-muted/30">
                <span className="text-4xl text-app-text/40">🐦</span>
              </div>
            )}
          </div>
          {(caption || imageUrl) && (
            <figcaption className="mt-2 text-center font-kodchasan text-xs text-app-text/60">
              {caption && <span>{caption} · </span>}
              <a
                href="https://www.inaturalist.org"
                target="_blank"
                rel="noopener noreferrer"
                className="text-app-accent-secondary underline hover:opacity-80"
              >
                iNaturalist
              </a>
            </figcaption>
          )}
        </figure>
        <p className="mt-4 font-kodchasan text-sm text-app-text/70">
          ~{bird.distanceMiles} miles away · seen {bird.lastSeenHoursAgo}h ago
        </p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          <RarityBadge tier={rarity} />
          {tags.map((tag, i) => (
            <BirdTagChip key={i} tag={tag} />
          ))}
        </div>
      </div>
    </div>
  )
}

export function BirdListPlaceholder() {
  const navigate = useNavigate()
  const { location } = useLocation()
  const [birds, setBirds] = useState<NearbyBird[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [mobileView, setMobileView] = useState<MobileViewMode>('map')
  const [sheetMode, setSheetMode] = useState<SheetMode>('half')
  const [distanceFilter, setDistanceFilter] = useState<DistanceFilter>('all')
  const [groupFilter, setGroupFilter] = useState<NearbyBird['group'] | 'all'>('all')
  const [recentOnly, setRecentOnly] = useState(false)
  const [includeNonGameBirds, setIncludeNonGameBirds] = useState(false)
  const [sortMode, setSortMode] = useState<SortMode>('distance')
  const [selectedBirdId, setSelectedBirdId] = useState<string | null>(null)
  const [quickViewBird, setQuickViewBird] = useState<NearbyBird | null>(null)
  const [showFilterFade, setShowFilterFade] = useState(false)
  const filterScrollRef = useRef<HTMLDivElement>(null)
  const isDesktop = useIsDesktop()

  const updateFilterFade = useCallback(() => {
    const el = filterScrollRef.current
    if (!el) return
    const hasOverflow = el.scrollWidth > el.clientWidth
    const isAtEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 1
    setShowFilterFade(hasOverflow && !isAtEnd)
  }, [])

  useEffect(() => {
    const el = filterScrollRef.current
    if (!el) return
    updateFilterFade()
    el.addEventListener('scroll', updateFilterFade)
    const ro =
      typeof ResizeObserver !== 'undefined'
        ? new ResizeObserver(updateFilterFade)
        : null
    ro?.observe(el)
    return () => {
      el.removeEventListener('scroll', updateFilterFade)
      ro?.disconnect()
    }
  }, [updateFilterFade])

  const openQuickView = (bird: NearbyBird) => {
    setQuickViewBird(bird)
    history.pushState({ quickView: true }, '')
  }

  const closeQuickView = () => {
    setQuickViewBird(null)
    if (window.history.state?.quickView) {
      history.back()
    }
  }

  // When location context is lost (e.g. after reload), redirect to welcome
  useEffect(() => {
    if (!location) {
      navigate('/', { replace: true })
    }
  }, [location, navigate])

  useEffect(() => {
    if (!location) return

    let cancelled = false

    const loadBirds = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const nearbyBirds = await getNearbyBirds(location)
        if (!cancelled) {
          setBirds(nearbyBirds)
          setSelectedBirdId(nearbyBirds[0]?.id ?? null)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Could not load nearby birds.')
          setBirds([])
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    void loadBirds()

    return () => {
      cancelled = true
    }
  }, [location])

  const locationLabel = location ? `Location: ${location.label}` : ''
  const { tagsByBirdId, rarityByBirdId } = useBirdTags(location, birds)

  const visibleBirds = useMemo(() => {
    let filtered = [...birds]

    if (!includeNonGameBirds) {
      filtered = filtered.filter((bird) => isInWingspan(bird.id))
    }

    if (distanceFilter !== 'all') {
      filtered = filtered.filter((bird) => bird.distanceMiles <= Number(distanceFilter))
    }

    if (groupFilter !== 'all') {
      filtered = filtered.filter((bird) => bird.group === groupFilter)
    }

    if (recentOnly) {
      filtered = filtered.filter((bird) => bird.lastSeenHoursAgo <= 24)
    }

    if (sortMode === 'distance') {
      filtered.sort((a, b) => a.distanceMiles - b.distanceMiles)
    } else {
      filtered.sort((a, b) => a.lastSeenHoursAgo - b.lastSeenHoursAgo)
    }

    return filtered
  }, [birds, includeNonGameBirds, distanceFilter, groupFilter, recentOnly, sortMode])

  useEffect(() => {
    if (!selectedBirdId || !visibleBirds.some((bird) => bird.id === selectedBirdId)) {
      setSelectedBirdId(visibleBirds[0]?.id ?? null)
    }
  }, [visibleBirds, selectedBirdId])

  const mapFocusedBirdId = quickViewBird?.id ?? selectedBirdId
  const listItemRefs = useRef<Record<string, HTMLLIElement | null>>({})

  useEffect(() => {
    const el = listItemRefs.current[selectedBirdId ?? '']
    if (!selectedBirdId || !el || typeof el.scrollIntoView !== 'function') return
    el.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  }, [selectedBirdId])

  function BirdCardSkeleton() {
    return (
      <div className="flex gap-4 rounded-xl p-4 shadow-[0_2px_8px_rgba(78,54,38,0.08)]">
        <div
          className="shrink-0 animate-pulse rounded-lg bg-app-border-muted/40"
          style={{ width: THUMBNAIL_SIZE, height: THUMBNAIL_SIZE }}
        />
        <div className="min-w-0 flex-1 space-y-2">
          <div className="h-5 w-3/4 animate-pulse rounded bg-app-border-muted/40" />
          <div className="h-4 w-1/2 animate-pulse rounded bg-app-border-muted/30" />
          <div className="h-4 w-1/3 animate-pulse rounded bg-app-border-muted/30" />
        </div>
      </div>
    )
  }

  const renderListContent = (wrapperClassName?: string): ReactNode => {
    if (isLoading) {
      return (
        <div className={wrapperClassName ?? 'mt-4'} role="status" aria-live="polite">
          <span className="sr-only">Finding nearby birds...</span>
          <ul className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <li key={i}>
                <BirdCardSkeleton />
              </li>
            ))}
          </ul>
        </div>
      )
    }

    if (error) {
      return (
        <div className={wrapperClassName ?? 'mt-4 space-y-2'}>
          <p className="font-kodchasan text-sm text-red-700">{error}</p>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="font-kodchasan text-sm text-app-accent-secondary underline hover:opacity-80"
          >
            Try another location
          </button>
        </div>
      )
    }

    if (birds.length === 0) {
      return (
        <p className={wrapperClassName ?? 'mt-4 font-kodchasan text-sm text-app-text/60'}>
          No birds found for this location yet. Try another location.
        </p>
      )
    }

    if (visibleBirds.length === 0) {
      return (
        <p className={wrapperClassName ?? 'mt-4 font-kodchasan text-sm text-app-text/60'}>
          No birds match your filters. Adjust filters to see more.
        </p>
      )
    }

    return (
      <ul className={wrapperClassName ?? 'mt-4 space-y-3'}>
        {visibleBirds.map((bird) => (
          <li key={bird.id} ref={(el) => { listItemRefs.current[bird.id] = el }}>
            <BirdCard
              bird={bird}
              tags={tagsByBirdId.get(bird.id) ?? []}
              rarity={rarityByBirdId.get(bird.id) ?? 'uncommon'}
              selected={selectedBirdId === bird.id}
              onSelect={() => setSelectedBirdId(bird.id)}
              onQuickView={() => openQuickView(bird)}
              showWingspanMark={includeNonGameBirds}
            />
          </li>
        ))}
      </ul>
    )
  }

  if (!location) {
    return null
  }

  return (
    <div className="min-h-screen bg-linear-to-t from-app-background from-35% to-app-border-muted/80">
      <header className="sticky top-0 z-20 border-b border-app-border-muted/50 bg-app-background/95 px-4 pb-4 pt-4 backdrop-blur-sm md:px-6">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <FeatherFinderMark showName={false} />
            <button
              type="button"
              onClick={() => navigate('/')}
              className="font-kodchasan text-xs text-app-accent-secondary hover:opacity-80"
            >
              ← Back
            </button>
          </div>
          <h1 className="font-kodchasan text-xl font-bold text-app-text md:text-2xl">Birds Near You</h1>
          <span className="font-kodchasan text-xs text-app-text/70">{locationLabel}</span>
        </div>
        <div className="rounded-2xl bg-white px-4 py-3 shadow-[0_2px_8px_rgba(78,54,38,0.08)]">
          <p className="font-kodchasan text-sm text-app-text/60">Search birds, locations, or hotspots</p>
        </div>
        <div className="mt-3 flex items-stretch gap-2 pb-1">
          <div className="relative flex min-w-0 flex-1 items-center">
            <div
              ref={filterScrollRef}
              className="flex h-10 w-full items-center overflow-x-auto overflow-y-hidden"
            >
              <div className="flex h-10 items-center gap-2 pr-12">
              {(['all', '10', '25'] as const).map((distance) => (
                <button
                  key={distance}
                  type="button"
                  onClick={() => setDistanceFilter(distance)}
                  className={`flex h-10 shrink-0 items-center rounded-xl border px-3 font-kodchasan text-sm ${distanceFilter === distance ? 'border-app-accent-secondary-hover bg-app-accent-secondary/15 text-app-accent-secondary-hover' : 'border-app-border-muted/70 bg-white text-app-text hover:bg-app-background'}`}
                >
                  {distance === 'all' ? 'All distances' : `Under ${distance} mi`}
                </button>
              ))}
              {(['all', 'songbird', 'woodpecker', 'raptor', 'other'] as const).map((group) => (
                <button
                  key={group}
                  type="button"
                  onClick={() => setGroupFilter(group)}
                  className={`flex h-10 shrink-0 items-center rounded-xl border px-3 font-kodchasan text-sm ${groupFilter === group ? 'border-app-accent-secondary-hover bg-app-accent-secondary/15 text-app-accent-secondary-hover' : 'border-app-border-muted/70 bg-white text-app-text hover:bg-app-background'}`}
                >
                  {group === 'all' ? 'All groups' : group}
                </button>
              ))}
              <div className="flex h-10 shrink-0 overflow-hidden rounded-xl border border-app-border-muted/70" role="group" aria-label="Wingspan bird filter">
                <button
                  type="button"
                  onClick={() => setIncludeNonGameBirds(false)}
                  aria-pressed={!includeNonGameBirds}
                  className={`flex h-10 items-center px-3 font-kodchasan text-sm ${!includeNonGameBirds ? 'bg-app-accent-secondary/15 text-app-accent-secondary-hover' : 'bg-white text-app-text hover:bg-app-background'}`}
                >
                  Wingspan birds
                </button>
                <button
                  type="button"
                  onClick={() => setIncludeNonGameBirds(true)}
                  aria-pressed={includeNonGameBirds}
                  className={`flex h-10 items-center border-l border-app-border-muted/70 px-3 font-kodchasan text-sm ${includeNonGameBirds ? 'bg-app-accent-secondary/15 text-app-accent-secondary-hover' : 'bg-white text-app-text hover:bg-app-background'}`}
                >
                  All birds
                </button>
              </div>
              <button
                type="button"
                onClick={() => setRecentOnly((value) => !value)}
                className={`flex h-10 shrink-0 items-center rounded-xl border px-3 font-kodchasan text-sm ${recentOnly ? 'border-app-accent-secondary-hover bg-app-accent-secondary/15 text-app-accent-secondary-hover' : 'border-app-border-muted/70 bg-white text-app-text hover:bg-app-background'}`}
              >
                Last 24h
              </button>
              </div>
            </div>
            {showFilterFade && (
              <div
                className="pointer-events-none absolute right-0 top-0 bottom-1 w-6 shrink-0 bg-gradient-to-r from-transparent to-app-background"
                aria-hidden
              />
            )}
          </div>
          <button
            type="button"
            onClick={() => setSortMode((mode) => (mode === 'distance' ? 'recent' : 'distance'))}
            className="flex min-h-10 shrink-0 items-center self-stretch rounded-xl border border-app-border-muted/70 bg-white px-3 font-kodchasan text-sm text-app-text hover:bg-app-background"
          >
            Sort: {sortMode === 'distance' ? 'Distance' : 'Recent'}
          </button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-360 md:px-6 md:pb-6">
        {isDesktop ? (
          <div className="gap-6 md:grid md:grid-cols-[minmax(340px,420px)_1fr]">
            <section className="h-[calc(100vh-220px)] overflow-y-auto rounded-2xl bg-white/45 p-4">
              {renderListContent('space-y-3')}
            </section>
            <section className="h-[calc(100vh-220px)] overflow-hidden rounded-2xl">
              <MapErrorBoundary
                fallback={(
                  <div className="flex h-full items-center justify-center rounded-2xl bg-white/70 p-4 text-center">
                    <p className="font-kodchasan text-sm text-app-text/80">
                      The map could not load right now. You can still browse birds in the list.
                    </p>
                  </div>
                )}
              >
                <BirdMap
                  birds={visibleBirds}
                  selectedBirdId={mapFocusedBirdId}
                  onSelectBird={setSelectedBirdId}
                  className="h-full w-full"
                />
              </MapErrorBoundary>
            </section>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2 px-4 pt-4">
            <button
              type="button"
              onClick={() => setMobileView('map')}
              className={`rounded-full px-4 py-2 font-kodchasan text-sm ${mobileView === 'map' ? 'bg-app-accent text-white' : 'bg-white/80 text-app-text'}`}
            >
              Map
            </button>
            <button
              type="button"
              onClick={() => setMobileView('list')}
              className={`rounded-full px-4 py-2 font-kodchasan text-sm ${mobileView === 'list' ? 'bg-app-accent text-white' : 'bg-white/80 text-app-text'}`}
            >
              List
            </button>
          </div>
        )}

        {!isDesktop && mobileView === 'list' && (
            <section className="px-4 pb-6 pt-4">
              {renderListContent('space-y-3')}
            </section>
          )}

        {!isDesktop && mobileView === 'map' && (
            <section className="relative h-[calc(100vh-250px)] overflow-hidden">
              <MapErrorBoundary
                fallback={(
                  <div className="flex h-full items-center justify-center bg-white/70 p-4 text-center">
                    <p className="font-kodchasan text-sm text-app-text/80">
                      The map could not load right now. Switch to List view to keep exploring birds.
                    </p>
                  </div>
                )}
              >
                <BirdMap
                  birds={visibleBirds}
                  selectedBirdId={mapFocusedBirdId}
                  onSelectBird={setSelectedBirdId}
                  className="h-full w-full"
                />
              </MapErrorBoundary>

              <div className={`absolute inset-x-0 bottom-0 rounded-t-3xl bg-white/95 px-4 pb-4 pt-3 shadow-[0_-8px_24px_rgba(78,54,38,0.2)] ${SHEET_HEIGHT_CLASS[sheetMode]}`}>
                <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-app-border-muted" />
                <div className="mb-3 flex items-center justify-between">
                  <p className="font-kodchasan text-sm font-bold text-app-text">
                    {visibleBirds.length} birds nearby
                  </p>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => setSheetMode('collapsed')}
                      className="rounded-lg border border-app-border-muted/70 px-2 py-1 font-kodchasan text-xs text-app-text"
                    >
                      Peek
                    </button>
                    <button
                      type="button"
                      onClick={() => setSheetMode('half')}
                      className="rounded-lg border border-app-border-muted/70 px-2 py-1 font-kodchasan text-xs text-app-text"
                    >
                      Cards
                    </button>
                    <button
                      type="button"
                      onClick={() => setSheetMode('expanded')}
                      className="rounded-lg border border-app-border-muted/70 px-2 py-1 font-kodchasan text-xs text-app-text"
                    >
                      Full
                    </button>
                  </div>
                </div>
                <div className="h-[calc(100%-3.5rem)] overflow-y-auto pr-1">
                  {sheetMode === 'collapsed' ? (
                    <p className="font-kodchasan text-sm text-app-text/70">
                      Pull up to preview nearby birds.
                    </p>
                  ) : (
                    renderListContent('space-y-2')
                  )}
                </div>
              </div>
            </section>
          )}
      </main>
      {quickViewBird && (
        <QuickViewOverlay
          bird={quickViewBird}
          tags={tagsByBirdId.get(quickViewBird.id) ?? []}
          rarity={rarityByBirdId.get(quickViewBird.id) ?? 'uncommon'}
          onClose={closeQuickView}
          showWingspanMark={includeNonGameBirds}
        />
      )}
    </div>
  )
}
