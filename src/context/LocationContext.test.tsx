import { describe, it, expect } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { LocationProvider, useLocation } from './LocationContext'

function TestConsumer() {
  const { location, setQueryLocation, setGeoLocation, clearLocation } = useLocation()
  return (
    <div data-testid="test-consumer">
      <span data-testid="location">{location ? JSON.stringify(location) : 'null'}</span>
      <button onClick={() => setQueryLocation('Paris', 48.8566, 2.3522, 'Paris, Ile-de-France, France')}>Set query</button>
      <button onClick={() => setGeoLocation(45.5, -122.6)}>Set geo</button>
      <button onClick={clearLocation}>Clear</button>
    </div>
  )
}

describe('LocationContext', () => {
  it('provides null location initially', () => {
    render(
      <MemoryRouter>
        <LocationProvider>
          <TestConsumer />
        </LocationProvider>
      </MemoryRouter>
    )
    const consumer = screen.getAllByTestId('test-consumer')[0]
    expect(within(consumer).getByTestId('location')).toHaveTextContent('null')
  })

  it('stores query location when setQueryLocation is called', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <LocationProvider>
          <TestConsumer />
        </LocationProvider>
      </MemoryRouter>
    )
    const consumer = screen.getAllByTestId('test-consumer')[0]
    await user.click(within(consumer).getByText('Set query'))
    expect(within(consumer).getByTestId('location')).toHaveTextContent(
      '{"source":"query","query":"Paris","lat":48.8566,"lng":2.3522,"label":"Paris, Ile-de-France, France"}'
    )
  })

  it('stores geo location when setGeoLocation is called', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <LocationProvider>
          <TestConsumer />
        </LocationProvider>
      </MemoryRouter>
    )
    const consumer = screen.getAllByTestId('test-consumer')[0]
    await user.click(within(consumer).getByText('Set geo'))
    expect(within(consumer).getByTestId('location')).toHaveTextContent(
      '{"source":"geo","lat":45.5,"lng":-122.6,"label":"45.5000, -122.6000"}'
    )
  })

  it('clears location when clearLocation is called', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <LocationProvider>
          <TestConsumer />
        </LocationProvider>
      </MemoryRouter>
    )
    const consumer = screen.getAllByTestId('test-consumer')[0]
    await user.click(within(consumer).getByText('Set query'))
    expect(within(consumer).getByTestId('location')).not.toHaveTextContent('null')
    await user.click(within(consumer).getByText('Clear'))
    expect(within(consumer).getByTestId('location')).toHaveTextContent('null')
  })
})
