import { useNavigate } from 'react-router-dom'
import { useLocation } from '@/context/LocationContext'

export function BirdListPlaceholder() {
  const navigate = useNavigate()
  const { location } = useLocation()

  const locationLabel = location
    ? location.type === 'zip'
      ? `Zip: ${location.value}`
      : `Location: ${location.value.lat.toFixed(4)}, ${location.value.lng.toFixed(4)}`
    : 'No location set'

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
        Bird List
      </h1>
      <p className="mt-2 font-kodchasan text-[#4e3626]/80">
        {locationLabel}
      </p>
      <p className="mt-4 font-kodchasan text-sm text-[#4e3626]/60">
        Bird list and eBird integration coming soon.
      </p>
    </div>
  )
}
