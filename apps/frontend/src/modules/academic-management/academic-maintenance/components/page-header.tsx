'use client'

import { LucideIcon } from 'lucide-react'

interface PageHeaderProps {
  title: string
  icon: LucideIcon
}

export function PageHeader({ title, icon: Icon }: PageHeaderProps) {
  return (
    <div className="flex items-center space-x-3 border-b pb-4">
      <Icon className="h-8 w-8 text-primary" />
      <h1 className="text-3xl font-bold">{title}</h1>
    </div>
  )
}
