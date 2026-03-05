import { useId } from 'react'

type DotPatternProps = {
  color?: string
  opacity?: number
  className?: string
}

/**
 * Polka dot texture overlay for field-guide feel.
 * Documented in Storybook as a texture option for future use.
 * Not currently applied in the app.
 */
export function DotPattern({ color = '#1A1A1A', opacity = 0.08, className = '' }: DotPatternProps) {
  const id = useId().replace(/:/g, '-')
  return (
    <svg
      width="100%"
      height="100%"
      className={className}
      style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}
      aria-hidden
    >
      <defs>
        <pattern id={id} x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
          <circle cx="10" cy="10" r="2" fill={color} opacity={opacity} />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  )
}
