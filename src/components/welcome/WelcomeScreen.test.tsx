import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { LocationProvider } from '@/context/LocationContext'
import App from '@/app/App'
import { geocodeLocation, searchLocationSuggestions } from '@/services/geocoding'

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
  GEOLOCATION_TIMEOUT_MS: 30000,
}))

vi.mock('@/services/geocoding', () => ({
  geocodeLocation: vi.fn(),
  searchLocationSuggestions: vi.fn(),
}))

const mockGeocodeLocation = vi.mocked(geocodeLocation)
const mockSearchLocationSuggestions = vi.mocked(searchLocationSuggestions)

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
    mockGeocodeLocation.mockResolvedValue({
      lat: 40.7128,
      lng: -74.006,
      label: 'New York, New York, United States',
    })
    mockSearchLocationSuggestions.mockResolvedValue([])
    mockUseGeolocation.mockReturnValue({
      status: 'idle',
      coords: null,
      error: null,
      requestLocation: mockRequestLocation,
    })
  })

  describe('location search flow', () => {
    it('shows validation error for invalid location query', async () => {
      render(<TestApp />)
      const input = screen.getAllByPlaceholderText('Search by city, postal code, or address')[0]
      fireEvent.change(input, { target: { value: 'a' } })
      fireEvent.click(screen.getAllByRole('button', { name: /search/i })[0])
      expect(screen.getByText('Please enter a city, postal code, or address')).toBeInTheDocument()
    })

    it('navigates to /birds and stores resolved location when query is submitted', async () => {
      render(<TestApp />)
      const input = screen.getAllByPlaceholderText('Search by city, postal code, or address')[0]
      fireEvent.change(input, { target: { value: 'new york' } })
      fireEvent.click(screen.getAllByRole('button', { name: /search/i })[0])
      await waitFor(
        () => {
          expect(screen.getAllByText('Birds Near You').length).toBeGreaterThan(0)
        },
        { timeout: 3000 }
      )
      expect(mockGeocodeLocation).toHaveBeenCalledWith('new york', 'us')
      expect(screen.getByText(/Location: New York, New York, United States/)).toBeInTheDocument()
    })

    it('shows autocomplete suggestions and navigates immediately on suggestion click', async () => {
      mockSearchLocationSuggestions.mockResolvedValue([
        {
          lat: 48.8566,
          lng: 2.3522,
          label: 'Paris, Ile-de-France, France',
        },
      ])

      render(<TestApp />)
      const input = screen.getAllByPlaceholderText('Search by city, postal code, or address')[0]
      fireEvent.change(input, { target: { value: 'par' } })

      await waitFor(() => {
        expect(screen.getByRole('option', { name: 'Paris, Ile-de-France, France' })).toBeInTheDocument()
      })

      fireEvent.click(screen.getByRole('option', { name: 'Paris, Ile-de-France, France' }))

      await waitFor(() => {
        expect(screen.getAllByText('Birds Near You').length).toBeGreaterThan(0)
      })
      expect(mockGeocodeLocation).not.toHaveBeenCalled()
      expect(screen.getByText(/Location: Paris, Ile-de-France, France/)).toBeInTheDocument()
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
      expect(screen.getByText(/Check your browser for a location permission prompt/)).toBeInTheDocument()
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
      expect(screen.getByText(/enter a location instead/)).toBeInTheDocument()
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
      expect(screen.getByText(/You can retry with Discover birds near you/)).toBeInTheDocument()
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
          expect(screen.getAllByText('Birds Near You').length).toBeGreaterThan(0)
        },
        { timeout: 3000 }
      )
      expect(screen.getAllByText(/Location: 45\.5/)[0]).toBeInTheDocument()
    })
  })
})
