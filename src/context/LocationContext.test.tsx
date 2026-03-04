import { describe, it, expect } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LocationProvider, useLocation } from './LocationContext'

function TestConsumer() {
  const { location, setZipLocation, setGeoLocation, clearLocation } = useLocation()
  return (
    <div data-testid="test-consumer">
      <span data-testid="location">{location ? JSON.stringify(location) : 'null'}</span>
      <button onClick={() => setZipLocation('12345')}>Set zip</button>
      <button onClick={() => setGeoLocation(45.5, -122.6)}>Set geo</button>
      <button onClick={clearLocation}>Clear</button>
    </div>
  )
}

describe('LocationContext', () => {
  it('provides null location initially', () => {
    render(
      <LocationProvider>
        <TestConsumer />
      </LocationProvider>
    )
    const consumer = screen.getAllByTestId('test-consumer')[0]
    expect(within(consumer).getByTestId('location')).toHaveTextContent('null')
  })

  it('stores zip location when setZipLocation is called', async () => {
    const user = userEvent.setup()
    render(
      <LocationProvider>
        <TestConsumer />
      </LocationProvider>
    )
    const consumer = screen.getAllByTestId('test-consumer')[0]
    await user.click(within(consumer).getByText('Set zip'))
    expect(within(consumer).getByTestId('location')).toHaveTextContent('{"type":"zip","value":"12345"}')
  })

  it('stores geo location when setGeoLocation is called', async () => {
    const user = userEvent.setup()
    render(
      <LocationProvider>
        <TestConsumer />
      </LocationProvider>
    )
    const consumer = screen.getAllByTestId('test-consumer')[0]
    await user.click(within(consumer).getByText('Set geo'))
    expect(within(consumer).getByTestId('location')).toHaveTextContent('{"type":"geo","value":{"lat":45.5,"lng":-122.6}}')
  })

  it('clears location when clearLocation is called', async () => {
    const user = userEvent.setup()
    render(
      <LocationProvider>
        <TestConsumer />
      </LocationProvider>
    )
    const consumer = screen.getAllByTestId('test-consumer')[0]
    await user.click(within(consumer).getByText('Set zip'))
    expect(within(consumer).getByTestId('location')).not.toHaveTextContent('null')
    await user.click(within(consumer).getByText('Clear'))
    expect(within(consumer).getByTestId('location')).toHaveTextContent('null')
  })
})
