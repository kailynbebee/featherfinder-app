import type { ReactNode } from 'react'

type AppHeaderProps = {
  children: ReactNode
  className?: string
}

const baseClasses =
  'sticky top-0 z-[1200] border-b border-app-border-muted/50 bg-app-background/95 backdrop-blur-sm'

export function AppHeader({ children, className = '' }: AppHeaderProps) {
  return <header className={`${baseClasses} ${className}`.trim()}>{children}</header>
}
