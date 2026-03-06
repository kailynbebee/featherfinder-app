import type { Meta, StoryObj } from '@storybook/react'

const meta: Meta = {
  title: 'Foundation/Copy Guidelines',
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Editorial and copy preferences. See docs/content/COPY_GUIDELINES.md for the full list.',
      },
    },
  },
}

export default meta

const GUIDELINES = [
  {
    category: 'Bird counts',
    use: '"X birds found in this area" (or "100+ birds found in this area" at API cap)',
    avoid: '"X birds nearby"',
    rationale:
      'Specifies that the number is what the app found/retrieved, not a claim about total birds in the region.',
  },
]

export const CopyPreferences: StoryObj = {
  render: () => (
    <div className="font-kodchasan max-w-2xl space-y-6">
      <p className="text-sm text-app-text-muted">
        See <code className="rounded bg-app-border-muted/30 px-1">docs/content/COPY_GUIDELINES.md</code> for the full list.
      </p>
      {GUIDELINES.map((g) => (
        <div key={g.category} className="rounded-xl border border-app-border p-4">
          <h3 className="mb-2 font-bold text-app-text">{g.category}</h3>
          <div className="space-y-1 text-sm">
            <p>
              <span className="font-medium text-app-accent-secondary">Use:</span> {g.use}
            </p>
            <p>
              <span className="font-medium text-app-accent">Avoid:</span> {g.avoid}
            </p>
            <p className="text-app-text-muted">{g.rationale}</p>
          </div>
        </div>
      ))}
    </div>
  ),
}
