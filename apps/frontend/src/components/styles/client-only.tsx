'use client'

import { ReactNode } from 'react'

interface ClientOnlyProps {
  children: ReactNode
  fallback?: ReactNode
}

export function ClientOnly({ children, fallback }: ClientOnlyProps) {
  // Verificar si estamos en el cliente
  if (typeof window === 'undefined') {
    return (
      fallback || (
        <div className="h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100"></div>
        </div>
      )
    )
  }

  return <>{children}</>
}
