/**
 * Service Worker Manager
 * Maneja el registro y actualización del service worker para la aplicación.
 */

export function isServiceWorkerSupported(): boolean {
  return typeof window !== 'undefined' && 'serviceWorker' in navigator
}

// Registra el service worker para manejar el caching de assets y mejorar el rendimiento
const serviceWorkerManager = {
  register: async (): Promise<void> => {
    if (!isServiceWorkerSupported()) {
      console.log('Service workers are not supported in this browser')
      return
    }

    try {
      // Primero intentamos unregister para forzar actualización
      await serviceWorkerManager.unregister()

      // Luego registramos el service worker de nuevo
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
        updateViaCache: 'none' // No usar caché para actualizaciones
      })

      console.log('Service Worker registered with scope:', registration.scope)

      // Forzar la actualización inmediata si hay una nueva versión
      registration.update()

      // Escuchar actualizaciones
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('New service worker installed, reloading for updates')
              window.location.reload()
            }
          })
        }
      })
    } catch (error) {
      console.error('Service Worker registration failed:', error)
    }
  },

  unregister: async (): Promise<void> => {
    if (!isServiceWorkerSupported()) return

    try {
      const registration = await navigator.serviceWorker.getRegistration()
      if (registration) {
        await registration.unregister()
        console.log('Service Worker unregistered successfully')
      }
    } catch (error) {
      console.error('Error unregistering Service Worker:', error)
    }
  }
}

export default serviceWorkerManager
