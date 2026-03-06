import { useEffect, useMemo, useRef, useState } from 'react'
import { Circle, MapContainer, Marker, TileLayer, Tooltip, useMap } from 'react-leaflet'
import type { DivIcon } from 'leaflet'
import L from 'leaflet'
import { getNearbyBirdingPlaces, type BirdingPlace } from '@/services/birdingPlaces'
import type { NearbyBird } from '@/services/nearbyBirds'
import { palette } from '@/theme/palette'

type BirdMapProps = {
  birds: NearbyBird[]
  selectedBirdId: string | null
  onSelectBird: (birdId: string) => void
  pauseSelectionFlyTo?: boolean
  searchRadiusMiles?: number
  searchCenter?: { lat: number; lng: number }
  landmarkDistanceMiles?: number
  locationCenter?: { lat: number; lng: number }
  fitBoundsBottomPaddingPx?: number
  className?: string
}

function isValidLatLng(point: { lat: number; lng: number } | undefined): point is { lat: number; lng: number } {
  if (!point) return false
  return (
    Number.isFinite(point.lat) &&
    Number.isFinite(point.lng) &&
    point.lat >= -90 &&
    point.lat <= 90 &&
    point.lng >= -180 &&
    point.lng <= 180
  )
}

function ClusterBoundsSync({
  birds,
  fallbackCenter,
  fallbackRadiusMiles,
  searchCenter,
  searchRadiusMiles,
  bottomPaddingPx,
}: {
  birds: NearbyBird[]
  fallbackCenter: { lat: number; lng: number }
  fallbackRadiusMiles: number
  searchCenter?: { lat: number; lng: number }
  searchRadiusMiles?: number
  bottomPaddingPx: number
}) {
  const map = useMap()

  useEffect(() => {
    const framingCenter = isValidLatLng(searchCenter) ? searchCenter : fallbackCenter
    const framingRadiusMiles =
      typeof searchRadiusMiles === 'number' && searchRadiusMiles > 0
        ? searchRadiusMiles
        : fallbackRadiusMiles
    const latDelta = framingRadiusMiles / 69
    const cosLat = Math.max(0.2, Math.cos((framingCenter.lat * Math.PI) / 180))
    const lngDelta = framingRadiusMiles / (69 * cosLat)
    const bounds = L.latLngBounds(
      [
        [framingCenter.lat - latDelta, framingCenter.lng - lngDelta],
        [framingCenter.lat + latDelta, framingCenter.lng + lngDelta],
      ] as [number, number][]
    )
    birds.forEach((bird) => bounds.extend([bird.lat, bird.lng]))
    map.fitBounds(bounds, {
      paddingTopLeft: [24, 24],
      paddingBottomRight: [24, bottomPaddingPx],
      maxZoom: 13,
      animate: true,
      duration: 0.35,
    })
  }, [map, birds, fallbackCenter.lat, fallbackCenter.lng, fallbackRadiusMiles, searchCenter, searchRadiusMiles, bottomPaddingPx])

  return null
}

function SelectedBirdSync({
  birds,
  selectedBirdId,
  isPaused = false,
}: {
  birds: NearbyBird[]
  selectedBirdId: string | null
  isPaused?: boolean
}) {
  const map = useMap()
  const hasSkippedInitialFocus = useRef(false)

  const selectedBird = useMemo(
    () => birds.find((bird) => bird.id === selectedBirdId) ?? null,
    [birds, selectedBirdId]
  )

  useEffect(() => {
    if (!selectedBird) return
    if (isPaused) return
    // Preserve initial "show the area" framing; only fly on later user-driven selections.
    if (!hasSkippedInitialFocus.current) {
      hasSkippedInitialFocus.current = true
      return
    }
    map.flyTo([selectedBird.lat, selectedBird.lng], map.getZoom(), { duration: 0.35 })
  }, [selectedBird, map, isPaused])

  return null
}

function DecorativeMapSync() {
  const map = useMap()

  useEffect(() => {
    const container = map.getContainer()
    container.setAttribute('tabindex', '-1')
    container.setAttribute('aria-hidden', 'true')
    container.setAttribute('role', 'presentation')
  }, [map])

  return null
}

function markerIcon(isSelected: boolean): DivIcon {
  return L.divIcon({
    className: 'bird-map-marker',
    html: `<span style="
      width:${isSelected ? 22 : 16}px;
      height:${isSelected ? 22 : 16}px;
      border-radius:9999px;
      border:2px solid white;
      background:${isSelected ? palette.accent : palette.accentSecondaryHover};
      display:block;
      box-shadow:0 2px 6px rgba(0,0,0,0.25);
    "></span>`,
    iconSize: [isSelected ? 22 : 16, isSelected ? 22 : 16],
    iconAnchor: [isSelected ? 11 : 8, isSelected ? 11 : 8],
  })
}

function placeIcon(source: BirdingPlace['source']): DivIcon {
  const bg = source === 'hotspot' ? '#f1c40f' : '#4f9d69'
  const label = source === 'hotspot' ? 'H' : 'N'
  return L.divIcon({
    className: 'bird-place-marker',
    html: `<span style="
      width:20px;
      height:20px;
      border-radius:9999px;
      border:2px solid #ffffff;
      background:${bg};
      color:#1f2937;
      display:flex;
      align-items:center;
      justify-content:center;
      font:700 10px/1 sans-serif;
      box-shadow:0 2px 6px rgba(0,0,0,0.25);
    ">${label}</span>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  })
}

const DEFAULT_BIRD_ICON = markerIcon(false)
const SELECTED_BIRD_ICON = markerIcon(true)
const HOTSPOT_PLACE_ICON = placeIcon('hotspot')
const NATURAL_PLACE_ICON = placeIcon('natural')

export function BirdMap({
  birds,
  selectedBirdId,
  onSelectBird,
  pauseSelectionFlyTo = false,
  searchRadiusMiles,
  searchCenter,
  landmarkDistanceMiles = 25,
  locationCenter,
  fitBoundsBottomPaddingPx = 24,
  className,
}: BirdMapProps) {
  const [places, setPlaces] = useState<BirdingPlace[]>([])

  const center = useMemo(() => {
    if (isValidLatLng(locationCenter)) return locationCenter
    if (isValidLatLng(searchCenter)) return searchCenter
    if (birds.length === 0) return { lat: 39.5, lng: -98.35 }
    const lat = birds.reduce((sum, bird) => sum + bird.lat, 0) / birds.length
    const lng = birds.reduce((sum, bird) => sum + bird.lng, 0) / birds.length
    return { lat, lng }
  }, [locationCenter, searchCenter, birds])

  useEffect(() => {
    if (import.meta.env.MODE === 'test') {
      setPlaces([])
      return
    }
    if (!isValidLatLng(center)) {
      setPlaces([])
      return
    }

    const controller = new AbortController()
    const loadPlaces = async () => {
      try {
        // Render hotspot markers first, then merge slower natural places.
        const hotspotsOnly = await getNearbyBirdingPlaces(center.lat, center.lng, {
          distMiles: landmarkDistanceMiles,
          maxPlaces: landmarkDistanceMiles <= 10 ? 10 : 16,
          includeNatural: false,
          signal: controller.signal,
        })
        if (!controller.signal.aborted) {
          setPlaces(hotspotsOnly)
        }

        const withNaturals = await getNearbyBirdingPlaces(center.lat, center.lng, {
          distMiles: landmarkDistanceMiles,
          maxPlaces: landmarkDistanceMiles <= 10 ? 10 : 16,
          includeNatural: true,
          signal: controller.signal,
        })
        if (!controller.signal.aborted) {
          setPlaces(withNaturals)
        }
      } catch (err) {
        if ((err as { name?: string })?.name === 'AbortError') return
        if (!controller.signal.aborted) setPlaces([])
      }
    }
    void loadPlaces()
    return () => {
      controller.abort()
    }
  }, [center.lat, center.lng, landmarkDistanceMiles])

  if (import.meta.env.MODE === 'test') {
    return (
      <div className={className ?? ''}>
        <p className="rounded-full bg-white/90 px-3 py-1 font-kodchasan text-xs text-app-text">
          Map view (Leaflet in Phase 2)
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          {birds.map((bird) => (
            <button
              key={bird.id}
              type="button"
              onClick={() => onSelectBird(bird.id)}
              aria-label={`Bird marker ${bird.id}`}
              className={`rounded-md border px-2 py-1 text-xs ${bird.id === selectedBirdId ? 'bg-app-accent-secondary/15' : 'bg-white'}`}
            >
              {bird.commonName}
            </button>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className={`relative ${className ?? ''}`} aria-hidden="true" role="presentation">
      <MapContainer
        center={[center.lat, center.lng]}
        zoom={11}
        scrollWheelZoom
        keyboard={false}
        zoomControl={false}
        attributionControl={false}
        className="h-full w-full"
      >
        <DecorativeMapSync />
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png"
        />
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png"
        />
        <ClusterBoundsSync
          birds={birds}
          fallbackCenter={center}
          fallbackRadiusMiles={landmarkDistanceMiles}
          searchCenter={searchCenter}
          searchRadiusMiles={searchRadiusMiles}
          bottomPaddingPx={fitBoundsBottomPaddingPx}
        />
        <SelectedBirdSync birds={birds} selectedBirdId={selectedBirdId} isPaused={pauseSelectionFlyTo} />
        {searchCenter && typeof searchRadiusMiles === 'number' ? (
          <Circle
            center={[searchCenter.lat, searchCenter.lng]}
            radius={searchRadiusMiles * 1609.34}
            pathOptions={{
              color: palette.accentSecondaryHover,
              weight: 1.5,
              fillColor: palette.accentSecondaryHover,
              fillOpacity: 0.08,
            }}
          />
        ) : null}
        {places.map((place) => (
          <Marker
            key={place.id}
            position={[place.lat, place.lng]}
            icon={place.source === 'hotspot' ? HOTSPOT_PLACE_ICON : NATURAL_PLACE_ICON}
          >
            <Tooltip direction="top" offset={[0, -8]} opacity={0.95}>
              <span className="font-kodchasan text-xs text-app-text">
                {place.name} · {place.source === 'hotspot' ? 'hotspot' : 'natural place'}
              </span>
            </Tooltip>
          </Marker>
        ))}
        {birds.map((bird) => {
          const isSelected = bird.id === selectedBirdId
          return (
            <Marker
              key={bird.id}
              position={[bird.lat, bird.lng]}
              icon={isSelected ? SELECTED_BIRD_ICON : DEFAULT_BIRD_ICON}
              eventHandlers={{ click: () => onSelectBird(bird.id) }}
            />
          )
        })}
      </MapContainer>
    </div>
  )
}
