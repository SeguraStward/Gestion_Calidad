'use client'

import { useEffect, useState } from 'react'
import serviceWorkerManager from '@/lib/service-worker'

export function ServiceWorkerInitializer() {
  const [hasRegistered, setHasRegistered] = useState(false)

  useEffect(() => {
    // Solo registrar el service worker una vez
    if (!hasRegistered) {
      // Retrasar un poco el registro para permitir que la aplicación cargue primero
      const timer = setTimeout(() => {
        serviceWorkerManager.register()
        setHasRegistered(true)
      }, 2000) // Retraso de 2 segundos para dar tiempo a cargar los estilos principales

      return () => clearTimeout(timer)
    }
  }, [hasRegistered])

  // Este componente no renderiza nada
  return null
}
