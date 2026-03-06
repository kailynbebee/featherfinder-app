import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useLocationSearchController } from './useLocationSearchController'
import { geocodeLocation, searchLocationSuggestions } from '@/services/geocoding'

vi.mock('@/services/geocoding', () => ({
  geocodeLocation: vi.fn(),
  searchLocationSuggestions: vi.fn(),
}))

describe('useLocationSearchController', () => {
  const mockSearch = vi.mocked(searchLocationSuggestions)
  const mockGeocode = vi.mocked(geocodeLocation)
  const mockCommit = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
    mockSearch.mockResolvedValue([
      { lat: 45.52, lng: -122.67, label: 'Portland, Oregon, United States' },
    ])
    mockGeocode.mockResolvedValue({
      lat: 40.7128,
      lng: -74.006,
      label: 'New York, New York, United States',
    })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('loads suggestions after debounce', async () => {
    const { result } = renderHook(() => useLocationSearchController({ onCommitLocation: mockCommit }))
    act(() => {
      result.current.handleInputChange('port')
    })
    expect(result.current.isLoading).toBe(true)

    await act(async () => {
      vi.advanceTimersByTime(260)
      await Promise.resolve()
    })

    expect(mockSearch).toHaveBeenCalled()
    expect(result.current.suggestions).toHaveLength(1)
    expect(result.current.isOpen).toBe(true)
  })

  it('selects active suggestion with keyboard enter', async () => {
    const { result } = renderHook(() => useLocationSearchController({ onCommitLocation: mockCommit }))
    act(() => {
      result.current.handleInputChange('port')
    })

    await act(async () => {
      vi.advanceTimersByTime(260)
      await Promise.resolve()
    })

    act(() => {
      result.current.handleKeyDown({ key: 'ArrowDown', preventDefault: vi.fn() } as unknown as React.KeyboardEvent<HTMLInputElement>)
    })
    act(() => {
      result.current.handleKeyDown({ key: 'Enter', preventDefault: vi.fn() } as unknown as React.KeyboardEvent<HTMLInputElement>)
    })

    expect(mockCommit).toHaveBeenCalledTimes(1)
    expect(mockCommit.mock.calls[0]?.[0]?.label).toContain('Portland')
  })

  it('submits geocoded location for manual query', async () => {
    const { result } = renderHook(() => useLocationSearchController({ onCommitLocation: mockCommit }))
    act(() => {
      result.current.handleInputChange('new york')
    })

    await act(async () => {
      await result.current.handleSubmit()
    })

    expect(mockGeocode).toHaveBeenCalled()
    expect(mockCommit).toHaveBeenCalledTimes(1)
  })

  it('clears current query and suggestions', async () => {
    const { result } = renderHook(() => useLocationSearchController({ onCommitLocation: mockCommit }))
    act(() => {
      result.current.handleInputChange('port')
    })

    await act(async () => {
      vi.advanceTimersByTime(260)
      await Promise.resolve()
    })

    expect(result.current.suggestions).toHaveLength(1)
    act(() => {
      result.current.clearInput()
    })
    expect(result.current.query).toBe('')
    expect(result.current.suggestions).toEqual([])
    expect(result.current.activeIndex).toBe(-1)
  })
})
