'use client'

import { useEffect, useState } from 'react'

interface NoSSRProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

/**
 * Componente para evitar problemas de hidratación
 * Retrasa el renderizado del contenido hasta que el componente esté montado en el cliente
 */
export function NoSSR({ children, fallback }: NoSSRProps) {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return fallback || null
  }

  return <>{children}</>
}
