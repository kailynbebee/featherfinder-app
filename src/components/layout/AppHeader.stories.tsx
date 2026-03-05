import type { Meta, StoryObj } from '@storybook/react'
import { AppHeader } from './AppHeader'
import { FeatherFinderMark } from '@/components/branding/FeatherFinderMark'

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
    <AppHeader className="px-4 pb-4 pt-4 md:px-6">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <FeatherFinderMark showName={false} />
          <button type="button" className="font-kodchasan text-xs text-app-accent-secondary hover:opacity-80">
            ← Back
          </button>
        </div>
        <h1 className="font-kodchasan text-xl font-bold text-app-text md:text-2xl">Birds Near You</h1>
        <span className="font-kodchasan text-xs text-app-text/70">Portland, Oregon</span>
      </div>
    </AppHeader>
  ),
}
