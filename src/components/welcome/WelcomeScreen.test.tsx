import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { LocationProvider } from '@/context/LocationContext'
import App from '@/app/App'

// Mock useGeolocation
const mockRequestLocation = vi.fn()
const mockUseGeolocation = vi.fn(() => ({
  status: 'idle',
  coords: null,
  error: null,
  requestLocation: mockRequestLocation,
}))

vi.mock('@/hooks/useGeolocation', () => ({
  useGeolocation: () => mockUseGeolocation(),
}))

function TestApp() {
  return (
    <MemoryRouter initialEntries={['/']}>
      <LocationProvider>
        <App />
      </LocationProvider>
    </MemoryRouter>
  )
}

describe('WelcomeScreen', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseGeolocation.mockReturnValue({
      status: 'idle',
      coords: null,
      error: null,
      requestLocation: mockRequestLocation,
    })
  })

  describe('zip code flow', () => {
    it('shows validation error for invalid zip', async () => {
      render(<TestApp />)
      const input = screen.getAllByPlaceholderText('Search by zip code')[0]
      fireEvent.change(input, { target: { value: '1234' } })
      fireEvent.click(screen.getAllByRole('button', { name: /search/i })[0])
      expect(screen.getByText('Please enter a valid 5-digit zip code')).toBeInTheDocument()
    })

    it('navigates to /birds and stores zip when valid zip is submitted', async () => {
      render(<TestApp />)
      const input = screen.getAllByPlaceholderText('Search by zip code')[0]
      fireEvent.change(input, { target: { value: '12345' } })
      fireEvent.click(screen.getAllByRole('button', { name: /search/i })[0])
      await waitFor(
        () => {
          expect(screen.getAllByText('Bird List').length).toBeGreaterThan(0)
        },
        { timeout: 3000 }
      )
      expect(screen.getByText(/Zip: 12345/)).toBeInTheDocument()
    })
  })

  describe('Discover birds near you flow', () => {
    it('calls requestLocation when Discover birds near you is clicked', async () => {
      const user = userEvent.setup()
      render(<TestApp />)
      await user.click(screen.getAllByRole('button', { name: /discover birds near you/i })[0])
      expect(mockRequestLocation).toHaveBeenCalledTimes(1)
    })

    it('shows loading state while geolocation is in progress', () => {
      mockUseGeolocation.mockReturnValue({
        status: 'loading',
        coords: null,
        error: null,
        requestLocation: mockRequestLocation,
      })
      render(<TestApp />)
      expect(screen.getByText('Finding your location...')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /finding your location/i })).toBeDisabled()
    })

    it('shows denied message when user denies permission', () => {
      mockUseGeolocation.mockReturnValue({
        status: 'denied',
        coords: null,
        error: 'Location access was denied.',
        requestLocation: mockRequestLocation,
      })
      render(<TestApp />)
      expect(screen.getByText(/Location access was denied/)).toBeInTheDocument()
      expect(screen.getAllByText(/Try entering a zip code instead/)[0]).toBeInTheDocument()
    })

    it('shows timeout message when request times out', () => {
      mockUseGeolocation.mockReturnValue({
        status: 'error',
        coords: null,
        error: 'Location request timed out.',
        requestLocation: mockRequestLocation,
      })
      render(<TestApp />)
      expect(screen.getByText(/Location request timed out/)).toBeInTheDocument()
      expect(screen.getAllByText(/Try entering a zip code instead/)[0]).toBeInTheDocument()
    })

    it('navigates to /birds and stores coords when geolocation succeeds', async () => {
      mockUseGeolocation.mockReturnValue({
        status: 'success',
        coords: { lat: 45.5, lng: -122.6 },
        error: null,
        requestLocation: mockRequestLocation,
      })
      render(<TestApp />)
      await waitFor(
        () => {
          expect(screen.getAllByText('Bird List').length).toBeGreaterThan(0)
        },
        { timeout: 3000 }
      )
      expect(screen.getAllByText(/Location: 45\.5/)[0]).toBeInTheDocument()
    })
  })
})
