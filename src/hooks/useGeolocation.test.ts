import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { GEOLOCATION_MAX_AGE_MS, GEOLOCATION_TIMEOUT_MS, useGeolocation } from './useGeolocation'

describe('useGeolocation', () => {
  let mockGetCurrentPosition: ReturnType<typeof vi.fn>

  beforeEach(() => {
    mockGetCurrentPosition = vi.fn()
    vi.stubGlobal('navigator', {
      geolocation: {
        getCurrentPosition: mockGetCurrentPosition,
      },
    })
  })

  it('starts in idle state', () => {
    const { result } = renderHook(() => useGeolocation())
    expect(result.current.status).toBe('idle')
    expect(result.current.coords).toBeNull()
    expect(result.current.error).toBeNull()
  })

  it('sets loading state when requestLocation is called', () => {
    const { result } = renderHook(() => useGeolocation())
    act(() => {
      result.current.requestLocation()
    })
    expect(result.current.status).toBe('loading')
    expect(mockGetCurrentPosition).toHaveBeenCalled()
  })

  it('sets success state and coords when geolocation succeeds', async () => {
    const { result } = renderHook(() => useGeolocation())
    mockGetCurrentPosition.mockImplementation((success: (p: GeolocationPosition) => void) => {
      queueMicrotask(() => {
        success({
          coords: { latitude: 45.5, longitude: -122.6 } as GeolocationCoordinates,
          timestamp: Date.now(),
        } as GeolocationPosition)
      })
    })

    act(() => {
      result.current.requestLocation()
    })
    expect(result.current.status).toBe('loading')

    await act(async () => {
      await new Promise((r) => setTimeout(r, 0))
    })

    expect(result.current.status).toBe('success')
    expect(result.current.coords).toEqual({ lat: 45.5, lng: -122.6 })
    expect(result.current.error).toBeNull()
  })

  it('sets denied state when user denies permission', async () => {
    const { result } = renderHook(() => useGeolocation())
    mockGetCurrentPosition.mockImplementation((_success: unknown, error: (e: GeolocationPositionError) => void) => {
      error({ code: 1, message: 'User denied' } as GeolocationPositionError)
    })

    act(() => {
      result.current.requestLocation()
    })

    expect(result.current.status).toBe('denied')
    expect(result.current.error).toBe('Location access was denied.')
  })

  it('sets error state when position is unavailable', async () => {
    const { result } = renderHook(() => useGeolocation())
    mockGetCurrentPosition.mockImplementation((_success: unknown, error: (e: GeolocationPositionError) => void) => {
      error({ code: 2, message: 'Position unavailable' } as GeolocationPositionError)
    })

    act(() => {
      result.current.requestLocation()
    })

    expect(result.current.status).toBe('error')
    expect(result.current.error).toBe('Could not determine your location.')
  })

  it('sets error state when request times out', async () => {
    const { result } = renderHook(() => useGeolocation())
    mockGetCurrentPosition.mockImplementation((_success: unknown, error: (e: GeolocationPositionError) => void) => {
      error({ code: 3, message: 'Timeout' } as GeolocationPositionError)
    })

    act(() => {
      result.current.requestLocation()
    })

    expect(result.current.status).toBe('error')
    expect(result.current.error).toBe('Location request timed out. Please try again or use a zip code.')
  })

  it('sets unavailable state when geolocation is not supported', () => {
    vi.stubGlobal('navigator', {})
    const { result } = renderHook(() => useGeolocation())

    act(() => {
      result.current.requestLocation()
    })

    expect(result.current.status).toBe('unavailable')
    expect(result.current.error).toBe('Geolocation is not supported by your browser')
  })

  it('uses options that favor faster desktop response', () => {
    const { result } = renderHook(() => useGeolocation())
    act(() => {
      result.current.requestLocation()
    })
    expect(mockGetCurrentPosition).toHaveBeenCalledWith(
      expect.any(Function),
      expect.any(Function),
      expect.objectContaining({
        enableHighAccuracy: false,
        timeout: GEOLOCATION_TIMEOUT_MS,
        maximumAge: GEOLOCATION_MAX_AGE_MS,
      })
    )
  })
})
