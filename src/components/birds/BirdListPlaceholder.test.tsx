import { describe, it, expect, vi, beforeEach } from 'vitest'
import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import App from '@/app/App'
import { LocationProvider } from '@/context/LocationContext'
import { getNearbyBirds } from '@/services/nearbyBirds'

vi.mock('@/services/nearbyBirds', () => ({
  getNearbyBirds: vi.fn(),
}))

const mockGetNearbyBirds = vi.mocked(getNearbyBirds)
const demoBirds = [
  {
    id: 'northern-cardinal',
    commonName: 'Northern Cardinal',
    scientificName: 'Cardinalis cardinalis',
    distanceMiles: 1.2,
    lat: 45.52,
    lng: -122.67,
    group: 'songbird' as const,
    lastSeenHoursAgo: 2,
  },
  {
    id: 'red-tailed-hawk',
    commonName: 'Red-tailed Hawk',
    scientificName: 'Buteo jamaicensis',
    distanceMiles: 8.4,
    lat: 45.54,
    lng: -122.7,
    group: 'raptor' as const,
    lastSeenHoursAgo: 18,
  },
]

const seededLocation = {
  source: 'query' as const,
  query: 'new york',
  lat: 40.7128,
  lng: -74.006,
  label: 'New York, New York, United States',
}

function TestApp({
  initialPath,
  seedQuery,
}: {
  initialPath: string
  seedQuery?: string
}) {
  return (
    <MemoryRouter initialEntries={[initialPath]}>
      <LocationProvider initialLocation={seedQuery ? seededLocation : null}>
        <App />
      </LocationProvider>
    </MemoryRouter>
  )
}

describe('BirdListPlaceholder', () => {
  beforeEach(() => {
    cleanup()
    vi.clearAllMocks()
    window.innerWidth = 1024
    window.dispatchEvent(new Event('resize'))
  })

  it('redirects to welcome screen when /birds is opened without a location', async () => {
    render(<TestApp initialPath="/birds" />)

    await waitFor(() => {
      expect(screen.getByText(/Discover birds near you/)).toBeInTheDocument()
    })
  })

  it('shows loading state while nearby birds are fetched', () => {
    mockGetNearbyBirds.mockImplementation(() => new Promise(() => {}))

    render(<TestApp initialPath="/birds" seedQuery="new york" />)

    expect(screen.getAllByText('Birds Near You').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Finding nearby birds...').length).toBeGreaterThan(0)
  })

  it('renders bird list when nearby birds load', async () => {
    mockGetNearbyBirds.mockResolvedValue([demoBirds[0]])

    render(<TestApp initialPath="/birds" seedQuery="new york" />)

    await waitFor(() => {
      expect(screen.getAllByText('Northern Cardinal').length).toBeGreaterThan(0)
    })
    expect(screen.getAllByText('Cardinalis cardinalis').length).toBeGreaterThan(0)
    expect(screen.getAllByText(/~1.2 miles away/).length).toBeGreaterThan(0)
  })

  it('renders empty state when service returns no birds', async () => {
    mockGetNearbyBirds.mockResolvedValue([])

    render(<TestApp initialPath="/birds" seedQuery="new york" />)

    await waitFor(() => {
      expect(screen.getAllByText(/No birds found for this location yet/).length).toBeGreaterThan(0)
    })
  })

  it('renders error state when service fails', async () => {
    mockGetNearbyBirds.mockRejectedValue(new Error('Nearby bird service is temporarily unavailable.'))

    render(<TestApp initialPath="/birds" seedQuery="new york" />)

    await waitFor(() => {
      expect(screen.getAllByText('Nearby bird service is temporarily unavailable.').length).toBeGreaterThan(0)
    })
    expect(screen.getAllByRole('button', { name: /Try another location/i }).length).toBeGreaterThan(0)
  })

  it('toggles into mobile list mode', async () => {
    const user = userEvent.setup()
    mockGetNearbyBirds.mockResolvedValue(demoBirds)
    window.innerWidth = 390
    window.dispatchEvent(new Event('resize'))

    render(<TestApp initialPath="/birds" seedQuery="new york" />)

    await waitFor(() => {
      expect(screen.getAllByText('Northern Cardinal').length).toBeGreaterThan(0)
    })
    await user.click(screen.getAllByRole('button', { name: 'List' })[0])
    expect(screen.getAllByRole('button', { name: /Bird card northern-cardinal/i }).length).toBeGreaterThan(0)
  })

  it('filters list by bird group', async () => {
    const user = userEvent.setup()
    mockGetNearbyBirds.mockResolvedValue(demoBirds)

    render(<TestApp initialPath="/birds" seedQuery="new york" />)

    await waitFor(() => {
      expect(screen.getAllByText('Northern Cardinal').length).toBeGreaterThan(0)
    })
    await user.click(screen.getAllByRole('button', { name: 'raptor' })[0])
    expect(screen.queryAllByText('Northern Cardinal').length).toBe(0)
    expect(screen.getAllByText('Red-tailed Hawk').length).toBeGreaterThan(0)
  })

  it('syncs map marker click to selected list card', async () => {
    const user = userEvent.setup()
    mockGetNearbyBirds.mockResolvedValue(demoBirds)

    render(<TestApp initialPath="/birds" seedQuery="new york" />)

    await waitFor(() => {
      expect(screen.getAllByRole('button', { name: /Bird marker red-tailed-hawk/i }).length).toBeGreaterThan(0)
    })

    await user.click(screen.getAllByRole('button', { name: /Bird marker red-tailed-hawk/i })[0])

    await waitFor(() => {
      expect(screen.getAllByRole('button', { name: /Bird card red-tailed-hawk/i })[0]).toHaveAttribute('aria-pressed', 'true')
    })
  })
})
