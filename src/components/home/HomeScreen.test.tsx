import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { LocationProvider } from '@/context/LocationContext'
import App from '@/app/App'
import { geocodeLocation, searchLocationSuggestions } from '@/services/geocoding'
import type { GeolocationResult } from '@/hooks/useGeolocation'

// Mock useGeolocation
const mockRequestLocation = vi.fn()
const mockCancelLocationRequest = vi.fn()
const mockUseGeolocation = vi.fn(() => ({
  status: 'idle',
  coords: null,
  error: null,
  requestLocation: mockRequestLocation,
  cancelLocationRequest: mockCancelLocationRequest,
}) as GeolocationResult)

vi.mock('@/hooks/useGeolocation', () => ({
  useGeolocation: () => mockUseGeolocation(),
  GEOLOCATION_TIMEOUT_MS: 15000,
}))

vi.mock('@/services/geocoding', () => ({
  geocodeLocation: vi.fn(),
  searchLocationSuggestions: vi.fn(),
}))

const mockGeocodeLocation = vi.mocked(geocodeLocation)
const mockSearchLocationSuggestions = vi.mocked(searchLocationSuggestions)

function TestApp({ initialEntries = ['/'] }: { initialEntries?: string[] }) {
  return (
    <MemoryRouter initialEntries={initialEntries}>
      <LocationProvider>
        <App />
      </LocationProvider>
    </MemoryRouter>
  )
}

describe('HomeScreen', () => {
  beforeEach(() => {
    cleanup()
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
      cancelLocationRequest: mockCancelLocationRequest,
    } as GeolocationResult)
  })

  describe('habitat carousel', () => {
    it('renders 3 habitat slides with bird names and photo author', () => {
      render(<TestApp />)
      expect(screen.getByText('European Robin')).toBeInTheDocument()
      expect(screen.getByText(/Photo: Aarn Giri/)).toBeInTheDocument()
      expect(screen.getByRole('group', { name: /european robin/i })).toBeInTheDocument()
      expect(screen.getByRole('group', { name: /burrowing owl/i })).toBeInTheDocument()
      expect(screen.getByRole('group', { name: /common kingfisher/i })).toBeInTheDocument()
    })

    it('dot navigation changes slide when clicked', async () => {
      const user = userEvent.setup()
      render(<TestApp />)
      const wetlandButton = screen.getByRole('tab', { name: /go to wetland habitat slide/i })
      await user.click(wetlandButton)
      expect(screen.getByRole('group', { name: /common kingfisher.*wetland/i })).toBeInTheDocument()
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
          expect(screen.getByRole('heading', { name: /Birds near/ })).toBeInTheDocument()
        },
        { timeout: 3000 }
      )
      expect(mockGeocodeLocation).toHaveBeenCalledWith('new york', 'us')
      expect(screen.getByDisplayValue('New York, New York, United States')).toBeInTheDocument()
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

      fireEvent.mouseDown(screen.getByRole('option', { name: 'Paris, Ile-de-France, France' }))

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /Birds near/ })).toBeInTheDocument()
      })
      expect(mockGeocodeLocation).not.toHaveBeenCalled()
      expect(screen.getByDisplayValue('Paris, Ile-de-France, France')).toBeInTheDocument()
    })
  })

  describe('Discover Wingspan birds near you flow', () => {
    it('calls requestLocation when Discover Wingspan birds near you is clicked', async () => {
      const user = userEvent.setup()
      render(<TestApp />)
      await user.click(screen.getAllByRole('button', { name: /discover wingspan birds near you/i })[0])
      expect(mockRequestLocation).toHaveBeenCalledTimes(1)
    })

    it('shows loading state while geolocation is in progress', () => {
      mockUseGeolocation.mockReturnValue({
        status: 'loading',
        coords: null,
        error: null,
        requestLocation: mockRequestLocation,
        cancelLocationRequest: mockCancelLocationRequest,
      } as GeolocationResult)
      render(<TestApp />)
      expect(screen.getByText('Finding your location...')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /finding your location/i })).toBeDisabled()
      expect(screen.getByText(/Look for the location prompt in your browser/)).toBeInTheDocument()
      expect(screen.getByText(/\(15s\)/)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument()
    })

    it('calls cancelLocationRequest when Cancel is clicked', async () => {
      const user = userEvent.setup()
      mockUseGeolocation.mockReturnValue({
        status: 'loading',
        coords: null,
        error: null,
        requestLocation: mockRequestLocation,
        cancelLocationRequest: mockCancelLocationRequest,
      } as GeolocationResult)
      render(<TestApp />)
      await user.click(screen.getByRole('button', { name: /cancel/i }))
      expect(mockCancelLocationRequest).toHaveBeenCalledTimes(1)
    })

    it('shows denied message when user denies permission', () => {
      mockUseGeolocation.mockReturnValue({
        status: 'denied',
        coords: null,
        error: 'Location access was denied.',
        requestLocation: mockRequestLocation,
        cancelLocationRequest: mockCancelLocationRequest,
      } as GeolocationResult)
      render(<TestApp />)
      expect(screen.getByText(/Location access was denied/)).toBeInTheDocument()
      expect(screen.getByText(/Let's try something else/)).toBeInTheDocument()
      expect(screen.getByText(/enter a location instead/)).toBeInTheDocument()
    })

    it('shows timeout message when request times out', () => {
      mockUseGeolocation.mockReturnValue({
        status: 'error',
        coords: null,
        error: 'Location request timed out.',
        requestLocation: mockRequestLocation,
        cancelLocationRequest: mockCancelLocationRequest,
      } as GeolocationResult)
      render(<TestApp />)
      expect(screen.getByText(/Location request timed out/)).toBeInTheDocument()
      expect(screen.getByText(/No worries — try again, or enter a location/)).toBeInTheDocument()
    })

    it('shows canceled message when location request is canceled', () => {
      mockUseGeolocation.mockReturnValue({
        status: 'canceled',
        coords: null,
        error: 'Location request canceled.',
        requestLocation: mockRequestLocation,
        cancelLocationRequest: mockCancelLocationRequest,
      } as GeolocationResult)
      render(<TestApp />)
      expect(screen.getByText(/Location request canceled/)).toBeInTheDocument()
    })

    it('navigates to /birds and stores a non-generic geo label when geolocation succeeds', async () => {
      mockUseGeolocation.mockReturnValue({
        status: 'success',
        coords: { lat: 45.5, lng: -122.6 },
        error: null,
        requestLocation: mockRequestLocation,
        cancelLocationRequest: mockCancelLocationRequest,
      } as GeolocationResult)
      render(<TestApp />)
      await waitFor(
        () => {
          expect(screen.getByDisplayValue('45.5000, -122.6000')).toBeInTheDocument()
        },
        { timeout: 3000 }
      )
      expect(screen.getByRole('heading', { name: /Birds near you/ })).toBeInTheDocument()
    })
  })
})
