'use client'

import { useEffect, useState, ReactNode } from 'react'

interface HydrationGuardProps {
  children: ReactNode
  fallback?: ReactNode
}

/**
 * Component to prevent hydration mismatches
 * Delays rendering of content until the component is mounted on the client
 */
export function HydrationGuard({ children, fallback }: HydrationGuardProps) {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
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
