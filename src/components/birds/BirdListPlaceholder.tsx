import { Component, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLocation } from '@/context/LocationContext'
import { getNearbyBirds, type NearbyBird } from '@/services/nearbyBirds'
import { BirdMap } from '@/components/birds/BirdMap'
import { FeatherFinderMark } from '@/components/branding/FeatherFinderMark'

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
  selected,
  onSelect,
}: {
  bird: NearbyBird
  selected: boolean
  onSelect: () => void
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      aria-label={`Bird card ${bird.id}`}
      className={`w-full rounded-xl p-4 text-left shadow-[0_2px_8px_rgba(78,54,38,0.08)] transition-colors ${selected ? 'bg-[#dff6d8]' : 'bg-white/85 hover:bg-white'}`}
    >
      <p className="font-kodchasan text-lg font-bold text-[#4e3626]">{bird.commonName}</p>
      <p className="font-kodchasan text-sm text-[#4e3626]/80 italic">{bird.scientificName}</p>
      <p className="mt-1 font-kodchasan text-sm text-[#4e3626]/70">~{bird.distanceMiles} miles away</p>
      <p className="mt-1 font-kodchasan text-xs text-[#4e3626]/65">
        {bird.group} · seen {bird.lastSeenHoursAgo}h ago
      </p>
    </button>
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
  const isDesktop = useIsDesktop()

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

  const renderListContent = (wrapperClassName?: string): ReactNode => {
    if (isLoading) {
      return (
        <p className={wrapperClassName ?? 'mt-4 font-kodchasan text-sm text-[#4e3626]/60'}>
          Finding nearby birds...
        </p>
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
          <li key={bird.id}>
            <BirdCard
              bird={bird}
              selected={selectedBirdId === bird.id}
              onSelect={() => setSelectedBirdId(bird.id)}
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
          {(['all', 'songbird', 'woodpecker', 'raptor'] as const).map((group) => (
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
                  selectedBirdId={selectedBirdId}
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
                  selectedBirdId={selectedBirdId}
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
    </div>
  )
}
