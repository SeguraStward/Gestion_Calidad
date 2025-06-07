'use client'

import { LucideIcon } from 'lucide-react'
import { ReactNode, memo } from 'react'

interface PageHeaderProps {
  title: string
  icon: LucideIcon
  subtitle?: string
  actions?: ReactNode
}

export const PageHeader = memo(function PageHeader({ title, icon: Icon, subtitle, actions }: PageHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b pb-6">
      <div className="flex items-start space-x-4">
        <Icon className="h-10 w-10 text-primary mt-1" />
        <div>
          <h1 className="text-4xl font-semibold leading-tight text-foreground">{title}</h1>
          {subtitle && <p className="text-muted-foreground text-lg mt-1">{subtitle}</p>}
        </div>
      </div>
      {actions && <div className="self-end md:self-auto">{actions}</div>}
    </div>
  )
})
