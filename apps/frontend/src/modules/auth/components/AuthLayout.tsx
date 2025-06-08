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
    <main className={cn('min-h-screen flex items-center justify-center p-4', className)}>
      <div className={cn('w-full space-y-6', maxWidthClasses[maxWidth])}>
        {/* Header */}
        <div className="text-center space-y-3">
          {icon && <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">{icon}</div>}
          <div>
            <h1 className="text-2xl font-bold text-foreground">{title}</h1>
            {subtitle && <p className="text-muted-foreground">{subtitle}</p>}
          </div>
        </div>

        {children}
      </div>
    </main>
  )
}
