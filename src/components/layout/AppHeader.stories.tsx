import type { Meta, StoryObj } from '@storybook/react'
import { AppHeader } from './AppHeader'
import { FeatherFinderMark } from '@/components/branding/FeatherFinderMark'
import { LocationSearchBar } from '@/components/location/LocationSearchBar'
import { LocationProvider } from '@/context/LocationContext'

const meta: Meta<typeof AppHeader> = {
  title: 'Components/Layout/AppHeader',
  component: AppHeader,
  parameters: {
    layout: 'fullscreen',
  },
}

export default meta

export const Welcome: StoryObj<typeof AppHeader> = {
  render: () => (
    <AppHeader className="flex items-start justify-between px-5 pt-10 pb-4">
      <h1 className="m-0">
        <FeatherFinderMark showName />
      </h1>
      <button
        type="button"
        className="flex cursor-pointer items-center gap-2 transition-opacity hover:opacity-80"
      >
        <span className="font-kodchasan text-[19px] font-bold text-app-text underline">Log in</span>
      </button>
    </AppHeader>
  ),
}

export const Birds: StoryObj<typeof AppHeader> = {
  render: () => (
    <LocationProvider
      initialLocation={{
        source: 'query',
        lat: 45.5152,
        lng: -122.6784,
        label: 'Portland, Oregon',
        query: 'portland',
      }}
    >
      <AppHeader className="px-4 pb-4 pt-4 md:px-6">
        <h1 className="sr-only">Birds near Portland, Oregon</h1>
        <div className="mb-3 flex items-center gap-3">
          <div className="flex shrink-0 items-center gap-1.5">
            <FeatherFinderMark showName={false} />
            <button type="button" className="font-kodchasan text-xs text-app-accent-secondary hover:opacity-80">
              ← Back
            </button>
          </div>
          <div className="min-w-0 flex-1">
            <LocationSearchBar mode="results" compact onCommitLocation={() => {}} />
          </div>
        </div>
      </AppHeader>
    </LocationProvider>
  ),
}
