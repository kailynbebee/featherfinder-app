import type { ReactNode } from 'react'

type AppHeaderProps = {
  children: ReactNode
  className?: string
}

const baseClasses =
  'sticky top-0 z-[1200] border-b border-app-border/45 bg-app-background/92 backdrop-blur-xs'

export function AppHeader({ children, className = '' }: AppHeaderProps) {
  return <header className={`${baseClasses} ${className}`.trim()}>{children}</header>
}
