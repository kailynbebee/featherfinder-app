import type { Meta, StoryObj } from '@storybook/react'

const meta: Meta = {
  title: 'Foundation/Design Tokens',
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'FeatherFinder app theme tokens. Use these semantic tokens instead of hardcoded hex values.',
      },
    },
  },
}

export default meta

const TOKENS = [
  { token: 'app-background', hex: '#F5F0E8', name: 'Warm Cream', role: 'Page background' },
  { token: 'app-surface', hex: '#FAF6EF', name: 'Parchment', role: 'Card / surface' },
  { token: 'app-surface-light', hex: '#FFFDF8', name: 'Ivory White', role: 'Input / light surface' },
  { token: 'app-text', hex: '#4A3728', name: 'Deep Brown', role: 'Body text' },
  { token: 'app-text-muted', hex: '#7A6B5A', name: '—', role: 'Muted / secondary text' },
  { token: 'app-accent', hex: '#D94420', name: 'Flycatcher Red', role: 'Primary CTA' },
  { token: 'app-accent-hover', hex: '#BF5B2E', name: 'Burnt Orange', role: 'CTA hover' },
  { token: 'app-accent-secondary', hex: '#2A8C82', name: 'Jungle Teal', role: 'Secondary CTA / links' },
  { token: 'app-accent-secondary-hover', hex: '#1B6B63', name: 'Deep Teal', role: 'Headers / nav' },
  { token: 'app-border', hex: '#d4c9b8', name: 'Warm Tan', role: 'Borders / dividers' },
  { token: 'app-border-muted', hex: '#C4B396', name: 'Warm Tan', role: 'Subtle borders' },
  { token: 'app-dot-accent', hex: '#1A1A1A', name: 'Dot Black', role: 'Polka dot texture' },
]

const HEAT_GRADIENT = ['#C4B396', '#BF5B2E', '#D94420']

export const ColorSwatches: StoryObj = {
  render: () => (
    <div className="font-kodchasan">
      <h2 className="mb-4 text-xl font-bold text-app-text">FeatherFinder Theme Colors</h2>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        {TOKENS.map((t) => (
          <div key={t.token} className="rounded-lg border border-app-border p-3">
            <div
              className="mb-2 aspect-square w-full rounded-lg border border-app-border-muted"
              style={{ backgroundColor: t.hex }}
            />
            <div className="text-sm font-semibold text-app-text">{t.name || t.token}</div>
            <div className="text-xs text-app-text-muted">{t.hex}</div>
            <div className="mt-1 text-xs text-app-accent-secondary">{t.role}</div>
          </div>
        ))}
      </div>
    </div>
  ),
}

export const HeatGradient: StoryObj = {
  render: () => (
    <div className="font-kodchasan">
      <h2 className="mb-2 text-lg font-bold text-app-text">Heat map gradient</h2>
      <p className="mb-3 text-sm text-app-text-muted">Fewer sightings → more sightings</p>
      <div className="flex overflow-hidden rounded-lg">
        {HEAT_GRADIENT.map((c, i) => (
          <div
            key={i}
            className="flex flex-1 items-center justify-center py-3 text-xs text-white/90"
            style={{ background: c }}
          >
            {c}
          </div>
        ))}
      </div>
    </div>
  ),
}

export const Typography: StoryObj = {
  render: () => (
    <div className="font-kodchasan space-y-4">
      <h2 className="text-xl font-bold text-app-text">Typography (Kodchasan)</h2>
      <p className="text-app-text">
        Body text uses Deep Brown. Muted text uses the text-muted token for secondary information.
      </p>
      <p className="text-sm text-app-text-muted">
        Secondary and helper text appear in a lighter tone for hierarchy.
      </p>
    </div>
  ),
}
