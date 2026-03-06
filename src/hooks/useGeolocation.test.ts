import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { GEOLOCATION_MAX_AGE_MS, GEOLOCATION_TIMEOUT_MS, useGeolocation } from './useGeolocation'

describe('useGeolocation', () => {
  let mockWatchPosition: ReturnType<typeof vi.fn>
  let mockClearWatch: ReturnType<typeof vi.fn>

  beforeEach(() => {
    mockWatchPosition = vi.fn()
    mockClearWatch = vi.fn()
    vi.stubGlobal('navigator', {
      geolocation: {
        watchPosition: mockWatchPosition,
        clearWatch: mockClearWatch,
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
    expect(mockWatchPosition).toHaveBeenCalled()
  })

  it('sets success state and coords when geolocation succeeds', async () => {
    const { result } = renderHook(() => useGeolocation())
    mockWatchPosition.mockImplementation((success: (p: GeolocationPosition) => void) => {
      queueMicrotask(() => {
        success({
          coords: { latitude: 45.5, longitude: -122.6 } as GeolocationCoordinates,
          timestamp: Date.now(),
        } as GeolocationPosition)
      })
      return 123
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
    expect(mockClearWatch).toHaveBeenCalledWith(123)
  })

  it('sets denied state when user denies permission', async () => {
    const { result } = renderHook(() => useGeolocation())
    mockWatchPosition.mockImplementation((_success: unknown, error: (e: GeolocationPositionError) => void) => {
      error({ code: 1, message: 'User denied' } as GeolocationPositionError)
      return 222
    })

    act(() => {
      result.current.requestLocation()
    })

    expect(result.current.status).toBe('denied')
    expect(result.current.error).toBe('Location access was denied.')
  })

  it('sets error state when position is unavailable', async () => {
    const { result } = renderHook(() => useGeolocation())
    mockWatchPosition.mockImplementation((_success: unknown, error: (e: GeolocationPositionError) => void) => {
      error({ code: 2, message: 'Position unavailable' } as GeolocationPositionError)
      return 333
    })

    act(() => {
      result.current.requestLocation()
    })

    expect(result.current.status).toBe('error')
    expect(result.current.error).toBe('Could not determine your location.')
  })

  it('sets error state when request times out', async () => {
    vi.useFakeTimers()
    const { result } = renderHook(() => useGeolocation())
    mockWatchPosition.mockReturnValue(444)

    act(() => {
      result.current.requestLocation()
    })

    act(() => {
      vi.advanceTimersByTime(GEOLOCATION_TIMEOUT_MS)
    })

    expect(result.current.status).toBe('error')
    expect(result.current.error).toBe('Location request timed out.')
    expect(mockClearWatch).toHaveBeenCalledWith(444)
    vi.useRealTimers()
  })

  it('supports canceling an in-flight request', () => {
    const { result } = renderHook(() => useGeolocation())
    mockWatchPosition.mockReturnValue(555)

    act(() => {
      result.current.requestLocation()
    })
    expect(result.current.status).toBe('loading')

    act(() => {
      result.current.cancelLocationRequest()
    })

    expect(result.current.status).toBe('canceled')
    expect(result.current.error).toBe('Location request canceled.')
    expect(mockClearWatch).toHaveBeenCalledWith(555)
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
    expect(mockWatchPosition).toHaveBeenCalledWith(
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
