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

function ClusterBoundsSync({
  birds,
  fallbackCenter,
  fallbackRadiusMiles,
  bottomPaddingPx,
}: {
  birds: NearbyBird[]
  fallbackCenter: { lat: number; lng: number }
  fallbackRadiusMiles: number
  bottomPaddingPx: number
}) {
  const map = useMap()

  useEffect(() => {
    if (birds.length >= 2) {
      const bounds = L.latLngBounds(
        birds.map((bird) => [bird.lat, bird.lng] as [number, number])
      )
      map.fitBounds(bounds, {
        paddingTopLeft: [24, 24],
        paddingBottomRight: [24, bottomPaddingPx],
        maxZoom: 13,
        animate: true,
        duration: 0.35,
      })
      return
    }

    if (birds.length === 1) {
      map.setView(
        [birds[0]!.lat, birds[0]!.lng],
        fallbackRadiusMiles <= 10 ? 12 : 11,
        { animate: true }
      )
      return
    }

    const latDelta = fallbackRadiusMiles / 69
    const cosLat = Math.max(0.2, Math.cos((fallbackCenter.lat * Math.PI) / 180))
    const lngDelta = fallbackRadiusMiles / (69 * cosLat)
    map.fitBounds(
      [
        [fallbackCenter.lat - latDelta, fallbackCenter.lng - lngDelta],
        [fallbackCenter.lat + latDelta, fallbackCenter.lng + lngDelta],
      ],
      {
        paddingTopLeft: [24, 24],
        paddingBottomRight: [24, bottomPaddingPx],
        animate: true,
        duration: 0.35,
      }
    )
  }, [map, birds, fallbackCenter.lat, fallbackCenter.lng, fallbackRadiusMiles, bottomPaddingPx])

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
    if (locationCenter) return locationCenter
    if (birds.length === 0) return { lat: 20, lng: 0 }
    const lat = birds.reduce((sum, bird) => sum + bird.lat, 0) / birds.length
    const lng = birds.reduce((sum, bird) => sum + bird.lng, 0) / birds.length
    return { lat, lng }
  }, [locationCenter, birds])

  useEffect(() => {
    if (import.meta.env.MODE === 'test') {
      setPlaces([])
      return
    }
    if (birds.length === 0) {
      setPlaces([])
      return
    }
    let cancelled = false
    const loadPlaces = async () => {
      try {
        const data = await getNearbyBirdingPlaces(center.lat, center.lng, {
          distMiles: landmarkDistanceMiles,
          maxPlaces: landmarkDistanceMiles <= 10 ? 10 : 16,
        })
        if (!cancelled) setPlaces(data)
      } catch {
        if (!cancelled) setPlaces([])
      }
    }
    void loadPlaces()
    return () => {
      cancelled = true
    }
  }, [birds.length, center.lat, center.lng, landmarkDistanceMiles])

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
    <MapContainer center={[center.lat, center.lng]} zoom={11} scrollWheelZoom className={className}>
      <TileLayer
        attribution='&copy; OpenStreetMap contributors &copy; CARTO'
        url="https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png"
      />
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png"
      />
      <ClusterBoundsSync
        birds={birds}
        fallbackCenter={center}
        fallbackRadiusMiles={landmarkDistanceMiles}
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
          icon={placeIcon(place.source)}
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
            icon={markerIcon(isSelected)}
            eventHandlers={{ click: () => onSelectBird(bird.id) }}
          />
        )
      })}
    </MapContainer>
  )
}
