import { useEffect } from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import App from '@/app/App'
import { LocationProvider, useLocation } from '@/context/LocationContext'
import { getNearbyBirds } from '@/services/nearbyBirds'

vi.mock('@/services/nearbyBirds', () => ({
  getNearbyBirds: vi.fn(),
}))

const mockGetNearbyBirds = vi.mocked(getNearbyBirds)

function SeedLocation({ zip }: { zip?: string }) {
  const { setZipLocation } = useLocation()

  useEffect(() => {
    if (zip) {
      setZipLocation(zip)
    }
  }, [zip, setZipLocation])

  return null
}

function TestApp({ initialPath, seedZip }: { initialPath: string; seedZip?: string }) {
  return (
    <MemoryRouter initialEntries={[initialPath]}>
      <LocationProvider>
        <SeedLocation zip={seedZip} />
        <App />
      </LocationProvider>
    </MemoryRouter>
  )
}

describe('BirdListPlaceholder', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows recovery path when /birds is opened without a location', async () => {
    render(<TestApp initialPath="/birds" />)

    await waitFor(() => {
      expect(screen.getByText(/Choose a location first so we can find birds nearby/)).toBeInTheDocument()
    })
  })

  it('shows loading state while nearby birds are fetched', () => {
    mockGetNearbyBirds.mockImplementation(() => new Promise(() => {}))

    render(<TestApp initialPath="/birds" seedZip="12345" />)

    expect(screen.getAllByText('Birds Near You').length).toBeGreaterThan(0)
    expect(screen.getByText('Finding nearby birds...')).toBeInTheDocument()
  })

  it('renders bird list when nearby birds load', async () => {
    mockGetNearbyBirds.mockResolvedValue([
      {
        id: 'northern-cardinal',
        commonName: 'Northern Cardinal',
        scientificName: 'Cardinalis cardinalis',
        distanceMiles: 1.2,
      },
    ])

    render(<TestApp initialPath="/birds" seedZip="12345" />)

    await waitFor(() => {
      expect(screen.getByText('Northern Cardinal')).toBeInTheDocument()
    })
    expect(screen.getByText('Cardinalis cardinalis')).toBeInTheDocument()
    expect(screen.getByText(/~1.2 miles away/)).toBeInTheDocument()
  })

  it('renders empty state when service returns no birds', async () => {
    mockGetNearbyBirds.mockResolvedValue([])

    render(<TestApp initialPath="/birds" seedZip="00000" />)

    await waitFor(() => {
      expect(screen.getByText(/No birds found for this location yet/)).toBeInTheDocument()
    })
  })

  it('renders error state when service fails', async () => {
    mockGetNearbyBirds.mockRejectedValue(new Error('Nearby bird service is temporarily unavailable.'))

    render(<TestApp initialPath="/birds" seedZip="99999" />)

    await waitFor(() => {
      expect(screen.getByText('Nearby bird service is temporarily unavailable.')).toBeInTheDocument()
    })
    expect(screen.getByRole('button', { name: /Try another location/i })).toBeInTheDocument()
  })
})
