import type { Meta, StoryObj } from '@storybook/react'
import { DotPattern } from './DotPattern'

const meta: Meta<typeof DotPattern> = {
  title: 'Foundation/DotPattern',
  component: DotPattern,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Polka dot texture overlay for field-guide feel. Documented as a texture option for future use. Not currently applied in the app.',
      },
    },
  },
}

export default meta

export const Default: StoryObj<typeof DotPattern> = {
  render: (args) => (
    <div className="relative h-48 w-64 overflow-hidden rounded-xl bg-app-background">
      <DotPattern {...args} />
      <div className="relative p-4 font-kodchasan">
        <p className="text-app-text">Content over dot pattern</p>
        <p className="text-sm text-app-text-muted">Opacity and color are configurable.</p>
      </div>
    </div>
  ),
}

export const Subtle: StoryObj<typeof DotPattern> = {
  render: () => (
    <div className="relative h-48 w-64 overflow-hidden rounded-xl bg-app-background">
      <DotPattern color="#4A3728" opacity={0.04} />
      <div className="relative p-4 font-kodchasan">
        <p className="text-app-text">Subtle texture (opacity 0.04)</p>
      </div>
    </div>
  ),
}

export const Stronger: StoryObj<typeof DotPattern> = {
  render: () => (
    <div className="relative h-48 w-64 overflow-hidden rounded-xl bg-app-surface">
      <DotPattern color="#4A3728" opacity={0.08} />
      <div className="relative p-4 font-kodchasan">
        <p className="text-app-text">Stronger texture (opacity 0.08)</p>
      </div>
    </div>
  ),
}
