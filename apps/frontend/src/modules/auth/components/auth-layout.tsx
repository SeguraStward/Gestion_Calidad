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
    <main
      className={cn('min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background to-muted/20', className)}
    >
      <div className={cn('w-full space-y-8', maxWidthClasses[maxWidth])}>
        {/* Header with enhanced styling */}
        <div className="text-center space-y-4 animate-in fade-in slide-in-from-top-4 duration-700">
          {icon && (
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-primary/20 to-primary/30 rounded-full flex items-center justify-center ring-4 ring-primary/10 shadow-lg">
              {icon}
            </div>
          )}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
              {title}
            </h1>
            {subtitle && <p className="text-muted-foreground text-lg font-medium">{subtitle}</p>}
          </div>
        </div>

        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">{children}</div>
      </div>
    </main>
  )
}
