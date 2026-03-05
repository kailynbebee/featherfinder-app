import { Component, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLocation } from '@/context/LocationContext'
import { getNearbyBirds, type BirdTag, type NearbyBird } from '@/services/nearbyBirds'
import { useBirdImage } from '@/hooks/useBirdImage'
import { useBirdTags } from '@/hooks/useBirdTags'
import { BirdTag as BirdTagChip } from '@/components/ui/BirdTag'
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

function BirdCard({
  bird,
  tags,
  selected,
  onSelect,
  onQuickView,
}: {
  bird: NearbyBird
  tags: readonly BirdTag[]
  selected: boolean
  onSelect: () => void
  onQuickView: () => void
}) {
  const { imageUrl, isLoading } = useBirdImage(bird.id, bird.scientificName)

  const handleClick = () => {
    onSelect()
    onQuickView()
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-pressed={selected}
      aria-label={`Bird card ${bird.id}`}
      className={`flex w-full gap-4 rounded-xl p-4 text-left shadow-[0_2px_8px_rgba(78,54,38,0.08)] transition-colors ${selected ? 'bg-[#dff6d8]' : 'bg-white/85 hover:bg-white'}`}
    >
      <div
        className="shrink-0 overflow-hidden rounded-lg bg-[#c8b292]/30"
        style={{ width: THUMBNAIL_SIZE, height: THUMBNAIL_SIZE }}
      >
        {isLoading ? (
          <div
            className="h-full w-full animate-pulse bg-[#c8b292]/50"
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
            className="flex h-full w-full items-center justify-center bg-[#c8b292]/40"
            aria-hidden
          >
            <span className="text-[#4e3626]/40 text-xl">🐦</span>
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-kodchasan text-lg font-bold text-[#4e3626]">{bird.commonName}</p>
        <p className="font-kodchasan text-sm text-[#4e3626]/80 italic">{bird.scientificName}</p>
        <p className="mt-1 font-kodchasan text-sm text-[#4e3626]/70">~{bird.distanceMiles} miles away</p>
        <p className="mt-1 font-kodchasan text-xs text-[#4e3626]/65">
          {bird.group} · seen {bird.lastSeenHoursAgo}h ago
        </p>
        {tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {tags.slice(0, 2).map((tag, i) => (
              <BirdTagChip key={i} tag={tag} />
            ))}
          </div>
        )}
      </div>
    </button>
  )
}

function QuickViewOverlay({
  bird,
  tags,
  onClose,
}: {
  bird: NearbyBird
  tags: readonly BirdTag[]
  onClose: () => void
}) {
  const { imageUrl, caption, isLoading } = useBirdImage(bird.id, bird.scientificName)

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
          className="absolute right-4 top-4 rounded-full p-1 text-[#4e3626]/70 hover:bg-[#c8b292]/30 hover:text-[#4e3626]"
        >
          <span className="text-xl">×</span>
        </button>
        <h2 id="quick-view-title" className="pr-8 font-kodchasan text-xl font-bold text-[#4e3626]">
          {bird.commonName}
        </h2>
        <p className="font-kodchasan text-sm italic text-[#4e3626]/80">{bird.scientificName}</p>
        <figure className="mt-4">
          <div className="flex justify-center overflow-hidden rounded-xl bg-[#c8b292]/20">
            {isLoading ? (
              <div
                className="h-64 w-80 animate-pulse bg-[#c8b292]/40"
                aria-hidden
              />
            ) : imageUrl ? (
              <img
                src={imageUrl}
                alt=""
                className="h-64 w-full object-cover"
              />
            ) : (
              <div className="flex h-64 w-80 items-center justify-center bg-[#c8b292]/30">
                <span className="text-4xl text-[#4e3626]/40">🐦</span>
              </div>
            )}
          </div>
          {(caption || imageUrl) && (
            <figcaption className="mt-2 text-center font-kodchasan text-xs text-[#4e3626]/60">
              {caption && <span>{caption} · </span>}
              <a
                href="https://www.inaturalist.org"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#006e63] underline hover:opacity-80"
              >
                iNaturalist
              </a>
            </figcaption>
          )}
        </figure>
        <p className="mt-4 font-kodchasan text-sm text-[#4e3626]/70">
          ~{bird.distanceMiles} miles away · seen {bird.lastSeenHoursAgo}h ago
        </p>
        {tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {tags.map((tag, i) => (
              <BirdTagChip key={i} tag={tag} />
            ))}
          </div>
        )}
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
  const [sortMode, setSortMode] = useState<SortMode>('distance')
  const [selectedBirdId, setSelectedBirdId] = useState<string | null>(null)
  const [quickViewBird, setQuickViewBird] = useState<NearbyBird | null>(null)
  const isDesktop = useIsDesktop()

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
  const tagsByBirdId = useBirdTags(location, birds)

  const visibleBirds = useMemo(() => {
    let filtered = [...birds]

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
  }, [birds, distanceFilter, groupFilter, recentOnly, sortMode])

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
          className="shrink-0 animate-pulse rounded-lg bg-[#c8b292]/40"
          style={{ width: THUMBNAIL_SIZE, height: THUMBNAIL_SIZE }}
        />
        <div className="min-w-0 flex-1 space-y-2">
          <div className="h-5 w-3/4 animate-pulse rounded bg-[#c8b292]/40" />
          <div className="h-4 w-1/2 animate-pulse rounded bg-[#c8b292]/30" />
          <div className="h-4 w-1/3 animate-pulse rounded bg-[#c8b292]/30" />
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
            className="font-kodchasan text-sm text-[#006e63] underline hover:opacity-80"
          >
            Try another location
          </button>
        </div>
      )
    }

    if (birds.length === 0) {
      return (
        <p className={wrapperClassName ?? 'mt-4 font-kodchasan text-sm text-[#4e3626]/60'}>
          No birds found for this location yet. Try another location.
        </p>
      )
    }

    if (visibleBirds.length === 0) {
      return (
        <p className={wrapperClassName ?? 'mt-4 font-kodchasan text-sm text-[#4e3626]/60'}>
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
              selected={selectedBirdId === bird.id}
              onSelect={() => setSelectedBirdId(bird.id)}
              onQuickView={() => openQuickView(bird)}
            />
          </li>
        ))}
      </ul>
    )
  }

  if (!location) {
    return (
      <div className="flex min-h-screen flex-col bg-linear-to-t from-[#f6f0e7] from-35% to-[rgba(200,178,146,0.8)] p-6">
        <h1 className="font-kodchasan text-2xl font-bold text-[#4e3626]">Birds Near You</h1>
        <p className="mt-4 font-kodchasan text-sm text-[#4e3626]/70">
          Choose a location first so we can find birds nearby.
        </p>
        <button
          type="button"
          onClick={() => navigate('/')}
          className="mt-4 self-start font-kodchasan text-[#006e63] underline hover:opacity-80"
        >
          Back to welcome
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-linear-to-t from-[#f6f0e7] from-35% to-[rgba(200,178,146,0.8)]">
      <header className="sticky top-0 z-20 border-b border-[#c8b292]/50 bg-[#f6f0e7]/95 px-4 pb-4 pt-4 backdrop-blur-sm md:px-6">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <FeatherFinderMark showName={false} />
            <button
              type="button"
              onClick={() => navigate('/')}
              className="font-kodchasan text-xs text-[#006e63] hover:opacity-80"
            >
              ← Back
            </button>
          </div>
          <h1 className="font-kodchasan text-xl font-bold text-[#4e3626] md:text-2xl">Birds Near You</h1>
          <span className="font-kodchasan text-xs text-[#4e3626]/70">{locationLabel}</span>
        </div>
        <div className="rounded-2xl bg-white px-4 py-3 shadow-[0_2px_8px_rgba(78,54,38,0.08)]">
          <p className="font-kodchasan text-sm text-[#4e3626]/60">Search birds, locations, or hotspots</p>
        </div>
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {(['all', '10', '25'] as const).map((distance) => (
            <button
              key={distance}
              type="button"
              onClick={() => setDistanceFilter(distance)}
              className={`shrink-0 rounded-xl border px-3 py-2 font-kodchasan text-sm ${distanceFilter === distance ? 'border-[#1d3b2a] bg-[#dff6d8] text-[#1d3b2a]' : 'border-[#c8b292]/70 bg-white text-[#4e3626] hover:bg-[#f6f0e7]'}`}
            >
              {distance === 'all' ? 'All distances' : `Under ${distance} mi`}
            </button>
          ))}
          {(['all', 'songbird', 'woodpecker', 'raptor', 'other'] as const).map((group) => (
            <button
              key={group}
              type="button"
              onClick={() => setGroupFilter(group)}
              className={`shrink-0 rounded-xl border px-3 py-2 font-kodchasan text-sm ${groupFilter === group ? 'border-[#1d3b2a] bg-[#dff6d8] text-[#1d3b2a]' : 'border-[#c8b292]/70 bg-white text-[#4e3626] hover:bg-[#f6f0e7]'}`}
            >
              {group === 'all' ? 'All groups' : group}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setRecentOnly((value) => !value)}
            className={`shrink-0 rounded-xl border px-3 py-2 font-kodchasan text-sm ${recentOnly ? 'border-[#1d3b2a] bg-[#dff6d8] text-[#1d3b2a]' : 'border-[#c8b292]/70 bg-white text-[#4e3626] hover:bg-[#f6f0e7]'}`}
          >
            Last 24h
          </button>
          <button
            type="button"
            onClick={() => setSortMode((mode) => (mode === 'distance' ? 'recent' : 'distance'))}
            className="shrink-0 rounded-xl border border-[#c8b292]/70 bg-white px-3 py-2 font-kodchasan text-sm text-[#4e3626] hover:bg-[#f6f0e7]"
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
                    <p className="font-kodchasan text-sm text-[#4e3626]/80">
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
              className={`rounded-full px-4 py-2 font-kodchasan text-sm ${mobileView === 'map' ? 'bg-[#77db6f] text-[#1d3b2a]' : 'bg-white/80 text-[#4e3626]'}`}
            >
              Map
            </button>
            <button
              type="button"
              onClick={() => setMobileView('list')}
              className={`rounded-full px-4 py-2 font-kodchasan text-sm ${mobileView === 'list' ? 'bg-[#77db6f] text-[#1d3b2a]' : 'bg-white/80 text-[#4e3626]'}`}
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
                    <p className="font-kodchasan text-sm text-[#4e3626]/80">
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
                <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-[#c8b292]" />
                <div className="mb-3 flex items-center justify-between">
                  <p className="font-kodchasan text-sm font-bold text-[#4e3626]">
                    {visibleBirds.length} birds nearby
                  </p>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => setSheetMode('collapsed')}
                      className="rounded-lg border border-[#c8b292]/70 px-2 py-1 font-kodchasan text-xs text-[#4e3626]"
                    >
                      Peek
                    </button>
                    <button
                      type="button"
                      onClick={() => setSheetMode('half')}
                      className="rounded-lg border border-[#c8b292]/70 px-2 py-1 font-kodchasan text-xs text-[#4e3626]"
                    >
                      Cards
                    </button>
                    <button
                      type="button"
                      onClick={() => setSheetMode('expanded')}
                      className="rounded-lg border border-[#c8b292]/70 px-2 py-1 font-kodchasan text-xs text-[#4e3626]"
                    >
                      Full
                    </button>
                  </div>
                </div>
                <div className="h-[calc(100%-3.5rem)] overflow-y-auto pr-1">
                  {sheetMode === 'collapsed' ? (
                    <p className="font-kodchasan text-sm text-[#4e3626]/70">
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
          onClose={closeQuickView}
        />
      )}
    </div>
  )
}
