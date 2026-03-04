import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLocation } from '@/context/LocationContext'
import { getNearbyBirds, type NearbyBird } from '@/services/nearbyBirds'

export function BirdListPlaceholder() {
  const navigate = useNavigate()
  const { location } = useLocation()
  const [birds, setBirds] = useState<NearbyBird[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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

  const locationLabel = location
    ? location.type === 'zip'
      ? `Zip: ${location.value}`
      : `Location: ${location.value.lat.toFixed(4)}, ${location.value.lng.toFixed(4)}`
    : ''

  return (
    <div className="flex min-h-screen flex-col bg-linear-to-t from-[#f6f0e7] from-35% to-[rgba(200,178,146,0.8)] p-6">
      <button
        type="button"
        onClick={() => navigate('/')}
        className="mb-4 self-start font-kodchasan text-[#006e63] underline hover:opacity-80"
      >
        ← Back to welcome
      </button>
      <h1 className="font-kodchasan text-2xl font-bold text-[#4e3626]">
        Birds Near You
      </h1>
      <p className="mt-2 font-kodchasan text-[#4e3626]/80">
        {locationLabel}
      </p>

      {isLoading && (
        <p className="mt-4 font-kodchasan text-sm text-[#4e3626]/60">
          Finding nearby birds...
        </p>
      )}

      {!isLoading && error && (
        <div className="mt-4 space-y-2">
          <p className="font-kodchasan text-sm text-red-700">{error}</p>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="font-kodchasan text-sm text-[#006e63] underline hover:opacity-80"
          >
            Try another location
          </button>
        </div>
      )}

      {!isLoading && !error && birds.length === 0 && (
        <p className="mt-4 font-kodchasan text-sm text-[#4e3626]/60">
          No birds found for this location yet. Try another location.
        </p>
      )}

      {!isLoading && !error && birds.length > 0 && (
        <ul className="mt-4 space-y-3">
          {birds.map((bird) => (
            <li key={bird.id} className="rounded-lg bg-white/70 p-4 shadow-[0_2px_8px_rgba(78,54,38,0.08)]">
              <p className="font-kodchasan text-lg font-bold text-[#4e3626]">{bird.commonName}</p>
              <p className="font-kodchasan text-sm text-[#4e3626]/80 italic">{bird.scientificName}</p>
              <p className="mt-1 font-kodchasan text-sm text-[#4e3626]/70">~{bird.distanceMiles} miles away</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
