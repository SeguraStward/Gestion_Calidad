import { ReactNode } from 'react'
import { cn } from '@una-gc/ui/lib/utils'

interface AuthLayoutProps {
  children: ReactNode
  title: string
  subtitle?: string
  icon?: ReactNode
  maxWidth?: 'sm' | 'md' | 'lg'
  className?: string
}

export function AuthLayout({ children, title, subtitle, icon, maxWidth = 'md', className }: AuthLayoutProps) {
  const maxWidthClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl'
  }

  return (
    <main className={cn('min-h-screen bg-background flex items-center justify-center p-4', className)}>
      <div
        className={cn(
          'w-full space-y-8',
          maxWidthClasses[maxWidth],
          'rounded-xl shadow-xl bg-white/90 dark:bg-zinc-900/90 border border-border p-6'
        )}
      >
        {/* Header */}
        <div className="text-center space-y-3">
          {icon && (
            <div className="mx-auto w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center shadow-sm">{icon}</div>
          )}
          <div>
            <h1 className="text-3xl font-bold text-foreground tracking-tight leading-tight">{title}</h1>
            {subtitle && <p className="text-base text-muted-foreground mt-1">{subtitle}</p>}
          </div>
        </div>

        {children}
      </div>
    </main>
  )
}
