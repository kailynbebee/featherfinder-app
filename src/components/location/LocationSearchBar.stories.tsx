import type { Meta, StoryObj } from '@storybook/react'
import { MemoryRouter } from 'react-router-dom'
import { LocationProvider } from '@/context/LocationContext'
import { LocationSearchBar } from './LocationSearchBar'

const meta: Meta<typeof LocationSearchBar> = {
  title: 'Components/Location/LocationSearchBar',
  component: LocationSearchBar,
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <MemoryRouter>
        <LocationProvider>
          <div className="w-80">
            <Story />
          </div>
        </LocationProvider>
      </MemoryRouter>
    ),
  ],
}

export default meta

export const HomeMode: StoryObj<typeof LocationSearchBar> = {
  args: {
    mode: 'home',
    onCommitLocation: () => {},
  },
}

export const ResultsModeEmpty: StoryObj<typeof LocationSearchBar> = {
  args: {
    mode: 'results',
    onCommitLocation: () => {},
  },
  decorators: [
    (Story) => (
      <MemoryRouter>
        <LocationProvider>
          <div className="w-80">
            <Story />
          </div>
        </LocationProvider>
      </MemoryRouter>
    ),
  ],
}

export const ResultsModeWithLocation: StoryObj<typeof LocationSearchBar> = {
  args: {
    mode: 'results',
    onCommitLocation: () => {},
  },
  decorators: [
    (Story) => (
      <MemoryRouter>
        <LocationProvider
          initialLocation={{
            source: 'query',
            lat: 45.5152,
            lng: -122.6784,
            label: 'Portland, Oregon',
            query: 'portland',
          }}
        >
          <div className="w-80">
            <Story />
          </div>
        </LocationProvider>
      </MemoryRouter>
    ),
  ],
}

export const ResultsModeWithGeoLocation: StoryObj<typeof LocationSearchBar> = {
  args: {
    mode: 'results',
    onCommitLocation: () => {},
  },
  decorators: [
    (Story) => (
      <MemoryRouter>
        <LocationProvider
          initialLocation={{
            source: 'geo',
            lat: 45.5152,
            lng: -122.6784,
            label: '45.5152, -122.6784',
          }}
        >
          <div className="w-80">
            <Story />
          </div>
        </LocationProvider>
      </MemoryRouter>
    ),
  ],
}
