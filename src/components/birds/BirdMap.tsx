import { useEffect, useMemo } from 'react'
import { MapContainer, Marker, TileLayer, useMap } from 'react-leaflet'
import type { DivIcon } from 'leaflet'
import L from 'leaflet'
import type { NearbyBird } from '@/services/nearbyBirds'

type BirdMapProps = {
  birds: NearbyBird[]
  selectedBirdId: string | null
  onSelectBird: (birdId: string) => void
  className?: string
}

function SelectedBirdSync({ birds, selectedBirdId }: { birds: NearbyBird[]; selectedBirdId: string | null }) {
  const map = useMap()

  const selectedBird = useMemo(
    () => birds.find((bird) => bird.id === selectedBirdId) ?? null,
    [birds, selectedBirdId]
  )

  useEffect(() => {
    if (!selectedBird) return
    map.flyTo([selectedBird.lat, selectedBird.lng], Math.max(map.getZoom(), 11), { duration: 0.45 })
  }, [selectedBird, map])

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
      background:${isSelected ? '#77db6f' : '#1d3b2a'};
      display:block;
      box-shadow:0 2px 6px rgba(0,0,0,0.25);
    "></span>`,
    iconSize: [isSelected ? 22 : 16, isSelected ? 22 : 16],
    iconAnchor: [isSelected ? 11 : 8, isSelected ? 11 : 8],
  })
}

export function BirdMap({ birds, selectedBirdId, onSelectBird, className }: BirdMapProps) {
  const center = useMemo(() => {
    if (birds.length === 0) return { lat: 45.52, lng: -122.68 }
    const lat = birds.reduce((sum, bird) => sum + bird.lat, 0) / birds.length
    const lng = birds.reduce((sum, bird) => sum + bird.lng, 0) / birds.length
    return { lat, lng }
  }, [birds])

  if (import.meta.env.MODE === 'test') {
    return (
      <div className={className ?? ''}>
        <p className="rounded-full bg-white/90 px-3 py-1 font-kodchasan text-xs text-[#4e3626]">
          Map view (Leaflet in Phase 2)
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          {birds.map((bird) => (
            <button
              key={bird.id}
              type="button"
              onClick={() => onSelectBird(bird.id)}
              aria-label={`Bird marker ${bird.id}`}
              className={`rounded-md border px-2 py-1 text-xs ${bird.id === selectedBirdId ? 'bg-[#dff6d8]' : 'bg-white'}`}
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
        attribution='&copy; OpenStreetMap contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <SelectedBirdSync birds={birds} selectedBirdId={selectedBirdId} />
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
