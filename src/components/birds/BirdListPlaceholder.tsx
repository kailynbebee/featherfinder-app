import { Component, useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore, type ReactNode } from 'react'
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
import { LocationSearchBar } from '@/components/location/LocationSearchBar'
import { AppHeader } from '@/components/layout/AppHeader'

const THUMBNAIL_SIZE = 72

type SheetMode = 'collapsed' | 'half' | 'expanded'
type DistanceFilter = '10' | '25'
type SortMode = 'distance' | 'recent'

const SHEET_HEIGHT_RATIO: Record<Exclude<SheetMode, 'collapsed'>, number> = {
  half: 0.6,
  expanded: 1,
}
const COLLAPSED_SHEET_HEIGHT_PX = 74

const SHEET_MODE_ORDER: SheetMode[] = ['collapsed', 'half', 'expanded']

function getNextSheetMode(mode: SheetMode): SheetMode {
  const i = SHEET_MODE_ORDER.indexOf(mode)
  return SHEET_MODE_ORDER[Math.min(i + 1, SHEET_MODE_ORDER.length - 1)]
}

function getPrevSheetMode(mode: SheetMode): SheetMode {
  const i = SHEET_MODE_ORDER.indexOf(mode)
  return SHEET_MODE_ORDER[Math.max(i - 1, 0)]
}

function getSheetHeightPx(mode: SheetMode, containerHeight: number): number {
  if (mode === 'collapsed') return COLLAPSED_SHEET_HEIGHT_PX
  return Math.round(containerHeight * SHEET_HEIGHT_RATIO[mode])
}

function getNearestSheetMode(heightPx: number, containerHeight: number): SheetMode {
  const candidates: SheetMode[] = ['collapsed', 'half', 'expanded']
  let bestMode: SheetMode = 'half'
  let bestDistance = Number.POSITIVE_INFINITY
  for (const mode of candidates) {
    const distance = Math.abs(getSheetHeightPx(mode, containerHeight) - heightPx)
    if (distance < bestDistance) {
      bestDistance = distance
      bestMode = mode
    }
  }
  return bestMode
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
  return useSyncExternalStore(
    (onStoreChange) => {
      if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return () => {}
      const mq = window.matchMedia('(min-width: 768px)')
      mq.addEventListener('change', onStoreChange)
      return () => mq.removeEventListener('change', onStoreChange)
    },
    () => (typeof window !== 'undefined' && typeof window.matchMedia === 'function' ? window.matchMedia('(min-width: 768px)').matches : false),
    () => false
  )
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
  const { location, setQueryLocation } = useLocation()
  const [birds, setBirds] = useState<NearbyBird[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sheetMode, setSheetMode] = useState<SheetMode>('half')
  const [distanceFilter, setDistanceFilter] = useState<DistanceFilter>('10')
  const [groupFilter, setGroupFilter] = useState<NearbyBird['group'] | 'all'>('all')
  const [recentOnly, setRecentOnly] = useState(false)
  const [includeNonGameBirds, setIncludeNonGameBirds] = useState(false)
  const [sortMode, setSortMode] = useState<SortMode>('distance')
  const [selectedBirdId, setSelectedBirdId] = useState<string | null>(null)
  const [quickViewBird, setQuickViewBird] = useState<NearbyBird | null>(null)
  const [showFilterFade, setShowFilterFade] = useState(false)
  const [isDraggingSheet, setIsDraggingSheet] = useState(false)
  const [dragPreviewHeightPx, setDragPreviewHeightPx] = useState<number | null>(null)
  const [sheetContainerHeightPx, setSheetContainerHeightPx] = useState(() =>
    typeof window !== 'undefined' ? Math.round(window.innerHeight * 0.6) : 480
  )
  const filterScrollRef = useRef<HTMLDivElement>(null)
  const mobileSheetSectionRef = useRef<HTMLElement | null>(null)
  const isDesktop = useIsDesktop()
  const sheetDragRef = useRef({
    pointerId: -1,
    startY: 0,
    startHeightPx: 0,
    hasMoved: false,
  })
  const suppressNextSheetClickRef = useRef(false)
  const sheetContainerHeight = Math.max(COLLAPSED_SHEET_HEIGHT_PX + 80, sheetContainerHeightPx)
  const minSheetHeightPx = getSheetHeightPx('collapsed', sheetContainerHeight)
  const maxSheetHeightPx = getSheetHeightPx('expanded', sheetContainerHeight)
  const effectiveSheetHeightPx =
    dragPreviewHeightPx ?? getSheetHeightPx(sheetMode, sheetContainerHeight)
  const isFullyExpanded = effectiveSheetHeightPx >= maxSheetHeightPx - 1

  const handleSheetPointerDown = useCallback(
    (e: React.PointerEvent) => {
      sheetDragRef.current = {
        pointerId: e.pointerId,
        startY: e.clientY,
        startHeightPx: getSheetHeightPx(sheetMode, sheetContainerHeight),
        hasMoved: false,
      }
      ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
      setIsDraggingSheet(true)
      setDragPreviewHeightPx(getSheetHeightPx(sheetMode, sheetContainerHeight))
    },
    [sheetMode, sheetContainerHeight]
  )

  const handleSheetPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDraggingSheet || sheetDragRef.current.pointerId !== e.pointerId) return
      const deltaY = sheetDragRef.current.startY - e.clientY
      if (Math.abs(deltaY) > 3) {
        sheetDragRef.current.hasMoved = true
      }
      const nextHeight = Math.round(
        Math.max(
          minSheetHeightPx,
          Math.min(maxSheetHeightPx, sheetDragRef.current.startHeightPx + deltaY)
        )
      )
      setDragPreviewHeightPx(nextHeight)
    },
    [isDraggingSheet, minSheetHeightPx, maxSheetHeightPx]
  )

  const handleSheetPointerUp = useCallback(
    (e: React.PointerEvent) => {
      const el = e.target as HTMLElement
      el.releasePointerCapture?.(e.pointerId)
      if (sheetDragRef.current.pointerId !== e.pointerId) return
      const deltaY = sheetDragRef.current.startY - e.clientY
      const projectedHeight =
        dragPreviewHeightPx ??
        Math.round(
          Math.max(
            minSheetHeightPx,
            Math.min(maxSheetHeightPx, sheetDragRef.current.startHeightPx + deltaY)
          )
        )
      setSheetMode(getNearestSheetMode(projectedHeight, sheetContainerHeight))
      suppressNextSheetClickRef.current = sheetDragRef.current.hasMoved
      sheetDragRef.current.pointerId = -1
      sheetDragRef.current.hasMoved = false
      setIsDraggingSheet(false)
      setDragPreviewHeightPx(null)
    },
    [dragPreviewHeightPx, minSheetHeightPx, maxSheetHeightPx, sheetContainerHeight]
  )

  const handleSheetPointerCancel = useCallback(
    (e: React.PointerEvent) => {
      const el = e.target as HTMLElement
      el.releasePointerCapture?.(e.pointerId)
      if (sheetDragRef.current.pointerId !== e.pointerId) return
      sheetDragRef.current.pointerId = -1
      sheetDragRef.current.hasMoved = false
      setIsDraggingSheet(false)
      setDragPreviewHeightPx(null)
    },
    []
  )

  useEffect(() => {
    if (isDesktop) return
    const section = mobileSheetSectionRef.current
    if (!section) return

    const syncHeight = () => {
      const nextHeight = section.clientHeight
      if (nextHeight > 0) setSheetContainerHeightPx(nextHeight)
    }
    syncHeight()

    if (typeof ResizeObserver !== 'undefined') {
      const ro = new ResizeObserver(syncHeight)
      ro.observe(section)
      return () => ro.disconnect()
    }

    window.addEventListener('resize', syncHeight)
    return () => window.removeEventListener('resize', syncHeight)
  }, [isDesktop])

  useEffect(() => {
    if (isDesktop) {
      setIsDraggingSheet(false)
      setDragPreviewHeightPx(null)
      sheetDragRef.current.pointerId = -1
      sheetDragRef.current.hasMoved = false
      return
    }
    setDragPreviewHeightPx((current) => {
      if (current == null) return current
      return Math.max(minSheetHeightPx, Math.min(maxSheetHeightPx, current))
    })
  }, [isDesktop, minSheetHeightPx, maxSheetHeightPx])

  const handleSetSheetMode = useCallback((nextMode: SheetMode) => {
    setSheetMode(nextMode)
    setDragPreviewHeightPx(null)
    setIsDraggingSheet(false)
    sheetDragRef.current.pointerId = -1
  }, [])

  const handleCollapsedSheetClick = useCallback(() => {
    if (suppressNextSheetClickRef.current) {
      suppressNextSheetClickRef.current = false
      return
    }
    if (isDraggingSheet) return
    if (sheetMode !== 'collapsed') return
    handleSetSheetMode('half')
  }, [isDraggingSheet, sheetMode, handleSetSheetMode])

  const handleSheetToggleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    if (suppressNextSheetClickRef.current) {
      suppressNextSheetClickRef.current = false
      return
    }
    if (isDraggingSheet) return
    if (sheetMode === 'collapsed') {
      handleSetSheetMode('half')
      return
    }
    handleSetSheetMode('collapsed')
  }, [isDraggingSheet, sheetMode, handleSetSheetMode])

  const handleSheetKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowUp' || e.key === ' ') {
        e.preventDefault()
        handleSetSheetMode(getNextSheetMode(sheetMode))
      } else if (e.key === 'ArrowDown') {
        e.preventDefault()
        handleSetSheetMode(getPrevSheetMode(sheetMode))
      }
    },
    [handleSetSheetMode, sheetMode]
  )

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

  // When location context is lost (e.g. after reload), redirect to home
  useEffect(() => {
    if (!location) {
      navigate('/', { replace: true })
    }
  }, [location, navigate])

  useEffect(() => {
    if (!location) return

    let cancelled = false
    setBirds([])
    setSelectedBirdId(null)

    const loadBirds = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const nearbyBirds = await getNearbyBirds(location)
        if (!cancelled) {
          setBirds(nearbyBirds)
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

  const { tagsByBirdId, rarityByBirdId } = useBirdTags(location, birds)

  const visibleBirds = useMemo(() => {
    let filtered = [...birds]

    if (!includeNonGameBirds) {
      filtered = filtered.filter((bird) => isInWingspan(bird.id))
    }

    filtered = filtered.filter((bird) => bird.distanceMiles <= Number(distanceFilter))

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
    if (selectedBirdId && !visibleBirds.some((bird) => bird.id === selectedBirdId)) {
      setSelectedBirdId(null)
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
    <div className="home-to-results-enter flex h-full min-h-dvh flex-col overflow-hidden bg-app-background">
      <AppHeader className="shrink-0 px-4 pb-4 pt-4 md:px-6">
        <h1 className="sr-only">
          Birds near {location.source === 'geo' ? 'you' : location.label}
        </h1>
        <div className="mb-3 flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="flex shrink-0 cursor-pointer items-center text-app-accent-secondary hover:opacity-80"
            aria-label="Go to home"
          >
            <FeatherFinderMark showName={false} />
          </button>
          <div className="min-w-0 flex-1">
            <LocationSearchBar
              mode="results"
              compact
              onCommitLocation={(loc) => setQueryLocation(loc.label, loc.lat, loc.lng, loc.label)}
            />
          </div>
        </div>
        <div className="mt-3 flex items-stretch gap-2 pb-1">
          <div className="relative flex min-w-0 flex-1 items-center">
            <div
              ref={filterScrollRef}
              className="flex h-10 w-full items-center overflow-x-auto overflow-y-hidden md:overflow-x-visible"
            >
              <div className="flex h-10 items-center gap-2 pr-12">
              <div className="flex h-10 shrink-0 overflow-hidden rounded-xl border border-app-border-muted/70" role="group" aria-label="Distance filter">
                {(['10', '25'] as const).map((distance, i) => (
                  <button
                    key={distance}
                    type="button"
                    onClick={() => setDistanceFilter(distance)}
                    aria-pressed={distanceFilter === distance}
                    className={`flex h-10 items-center px-3 font-kodchasan text-sm ${distanceFilter === distance ? 'bg-app-accent-secondary/15 text-teal-900' : 'bg-white text-black hover:bg-app-background'} ${i > 0 ? 'border-l border-app-border-muted/70' : ''}`}
                  >
                    {distance === '25' ? 'Within 25 mi' : `Under ${distance} mi`}
                  </button>
                ))}
              </div>
              <div className="flex h-10 shrink-0 overflow-hidden rounded-xl border border-app-border-muted/70" role="group" aria-label="Bird group filter">
                {(['all', 'songbird', 'woodpecker', 'raptor', 'other'] as const).map((group, i) => (
                  <button
                    key={group}
                    type="button"
                    onClick={() => setGroupFilter(group)}
                    aria-pressed={groupFilter === group}
                    className={`flex h-10 shrink-0 items-center px-3 font-kodchasan text-sm ${groupFilter === group ? 'bg-app-accent-secondary/15 text-teal-900' : 'bg-white text-black hover:bg-app-background'} ${i > 0 ? 'border-l border-app-border-muted/70' : ''}`}
                  >
                    {group === 'all' ? 'All' : group}
                  </button>
                ))}
              </div>
              <div className="flex h-10 shrink-0 overflow-hidden rounded-xl border border-app-border-muted/70" role="group" aria-label="Wingspan bird filter">
                <button
                  type="button"
                  onClick={() => setIncludeNonGameBirds(false)}
                  aria-pressed={!includeNonGameBirds}
                  className={`flex h-10 items-center px-3 font-kodchasan text-sm ${!includeNonGameBirds ? 'bg-app-accent-secondary/15 text-teal-900' : 'bg-white text-black hover:bg-app-background'}`}
                >
                  Wingspan birds
                </button>
                <button
                  type="button"
                  onClick={() => setIncludeNonGameBirds(true)}
                  aria-pressed={includeNonGameBirds}
                  className={`flex h-10 items-center border-l border-app-border-muted/70 px-3 font-kodchasan text-sm ${includeNonGameBirds ? 'bg-app-accent-secondary/15 text-teal-900' : 'bg-white text-black hover:bg-app-background'}`}
                >
                  All birds
                </button>
              </div>
              <button
                type="button"
                onClick={() => setRecentOnly((value) => !value)}
                className={`flex h-10 shrink-0 items-center rounded-xl border px-3 font-kodchasan text-sm ${recentOnly ? 'border-app-accent-secondary-hover bg-app-accent-secondary/15 text-teal-900' : 'border-app-border-muted/70 bg-white text-black hover:bg-app-background'}`}
              >
                Last 24h
              </button>
              </div>
            </div>
            {showFilterFade && !isDesktop && (
              <div
                className="pointer-events-none absolute right-0 top-0 bottom-1 w-6 shrink-0 bg-linear-to-r from-transparent to-app-background"
                aria-hidden
              />
            )}
          </div>
          <button
            type="button"
            onClick={() => setSortMode((mode) => (mode === 'distance' ? 'recent' : 'distance'))}
            className="flex min-h-10 shrink-0 items-center self-stretch rounded-xl border border-app-border-muted/70 bg-white px-3 font-kodchasan text-sm text-black hover:bg-app-background"
          >
            Sort: {sortMode === 'distance' ? 'Distance' : 'Recent'}
          </button>
        </div>
      </AppHeader>

      <main className="flex min-h-0 flex-1 flex-col w-full md:px-6 md:pt-4 md:pb-4">
        {isDesktop ? (
          <div className="grid min-h-0 flex-1 gap-6 md:grid-cols-[minmax(340px,420px)_1fr]">
            <section className="min-h-0 overflow-y-auto rounded-2xl bg-white/45 p-4">
              {renderListContent('space-y-3')}
            </section>
            <section
              className="min-h-0 overflow-hidden rounded-2xl"
              aria-label="Visual bird map (screen reader note)"
              aria-description="This map is visual-only and hidden from screen readers. Use the bird list panel for all bird location details and selection."
            >
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
                  pauseSelectionFlyTo={quickViewBird !== null}
                  searchRadiusMiles={distanceFilter === '10' ? 10 : 25}
                  searchCenter={{ lat: location.lat, lng: location.lng }}
                  landmarkDistanceMiles={distanceFilter === '10' ? 10 : 25}
                  locationCenter={{ lat: location.lat, lng: location.lng }}
                  fitBoundsBottomPaddingPx={24}
                  className="h-full w-full"
                />
              </MapErrorBoundary>
            </section>
          </div>
        ) : null}

        {!isDesktop && (
            <section
              ref={mobileSheetSectionRef}
              className="relative min-h-[50vh] flex-1 overflow-hidden"
              aria-label="Visual bird map with list sheet (screen reader note)"
              aria-description="The map is visual-only and hidden from screen readers. Use the bird list content in the bottom sheet for location details and bird selection."
            >
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
                  pauseSelectionFlyTo={quickViewBird !== null}
                  searchRadiusMiles={distanceFilter === '10' ? 10 : 25}
                  searchCenter={{ lat: location.lat, lng: location.lng }}
                  landmarkDistanceMiles={distanceFilter === '10' ? 10 : 25}
                  locationCenter={{ lat: location.lat, lng: location.lng }}
                  fitBoundsBottomPaddingPx={
                    sheetMode === 'collapsed' ? 110 : sheetMode === 'half' ? 240 : 330
                  }
                  className="h-full w-full"
                />
              </MapErrorBoundary>

              <div
                className={`absolute inset-x-0 bottom-0 z-1000 bg-app-surface px-4 shadow-[0_-4px_12px_rgba(78,54,38,0.12)] transition-[height] duration-180 ease-out ${isFullyExpanded ? 'rounded-t-none' : 'rounded-t-3xl'} ${sheetMode === 'collapsed' ? 'pb-0 pt-1.5' : 'pb-4 pt-3'}`}
                style={{
                  height: `${effectiveSheetHeightPx}px`,
                  transitionDuration: isDraggingSheet ? '0ms' : '180ms',
                }}
                onClick={handleCollapsedSheetClick}
              >
                <div
                  role="button"
                  tabIndex={0}
                  aria-label="Drag to expand or collapse bird list"
                  className={`mx-auto flex cursor-grab touch-none select-none items-center justify-center active:cursor-grabbing ${sheetMode === 'collapsed' ? 'mb-1 h-6 w-12' : 'mb-3 h-6 w-12'}`}
                  onPointerDown={handleSheetPointerDown}
                  onPointerMove={handleSheetPointerMove}
                  onPointerUp={handleSheetPointerUp}
                  onPointerCancel={handleSheetPointerCancel}
                  onKeyDown={handleSheetKeyDown}
                  onClick={handleSheetToggleClick}
                >
                  {sheetMode === 'collapsed' ? (
                    <svg
                      aria-hidden
                      viewBox="0 0 24 24"
                      className="h-6 w-9 text-app-border-muted"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="m6 16 6-6 6 6" />
                      <path d="m6 12 6-6 6 6" />
                    </svg>
                  ) : (
                    <div className="h-1.5 w-12 rounded-full bg-app-border-muted" />
                  )}
                </div>
                <div className={`flex items-center ${sheetMode === 'collapsed' ? 'mb-0 justify-center' : 'mb-3 justify-between'}`}>
                  <p
                    className={`font-kodchasan text-sm ${
                      sheetMode === 'collapsed'
                        ? 'font-medium text-app-text/80'
                        : 'font-semibold text-app-text'
                    }`}
                  >
                    {visibleBirds.length >= 100 ? '100+' : visibleBirds.length} birds found in this area
                  </p>
                </div>
                <div className={`${sheetMode === 'collapsed' ? 'h-auto' : 'h-[calc(100%-3.5rem)] overflow-y-auto pr-1'}`}>
                  {sheetMode === 'collapsed' ? (
                    null
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
