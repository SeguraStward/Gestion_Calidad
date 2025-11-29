'use client'

import { Component, ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

/**
 * Error boundary para manejar ChunkLoadError
 * Automáticamente recarga la página cuando detecta un error de carga de chunks
 * Incluye protección contra loops infinitos
 */
export class ChunkErrorBoundary extends Component<Props, State> {
  private static readonly RELOAD_KEY = 'chunk_error_reload_count'
  private static readonly MAX_RELOADS = 3
  private static readonly RESET_TIMEOUT = 30000 // 30 segundos

  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    // Solo manejar ChunkLoadError
    if (error.name === 'ChunkLoadError' || error.message.includes('Loading chunk')) {
      console.error('ChunkLoadError detectado:', error)

      // Verificar contador de recargas para evitar loops infinitos
      const reloadCount = this.getReloadCount()

      if (reloadCount < this.MAX_RELOADS) {
        console.log(`Intento de recarga ${reloadCount + 1}/${this.MAX_RELOADS}`)
        this.incrementReloadCount()

        // Recargar página después de un breve delay
        setTimeout(() => {
          window.location.reload()
        }, 500)

        return { hasError: true, error }
      } else {
        console.error('Máximo de recargas alcanzado, mostrando error al usuario')
        // Reset contador para futuras sesiones
        this.resetReloadCount()
        return { hasError: true, error }
      }
    }

    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Error boundary capturó un error:', error, errorInfo)
  }

  componentDidMount() {
    // Reset contador después de un tiempo si la página carga correctamente
    setTimeout(() => {
      ChunkErrorBoundary.resetReloadCount()
    }, ChunkErrorBoundary.RESET_TIMEOUT)
  }

  private static getReloadCount(): number {
    if (typeof window === 'undefined') return 0
    const count = sessionStorage.getItem(this.RELOAD_KEY)
    return count ? parseInt(count, 10) : 0
  }

  private static incrementReloadCount(): void {
    if (typeof window === 'undefined') return
    const count = this.getReloadCount()
    sessionStorage.setItem(this.RELOAD_KEY, String(count + 1))
  }

  private static resetReloadCount(): void {
    if (typeof window === 'undefined') return
    sessionStorage.removeItem(this.RELOAD_KEY)
  }

  render() {
    if (this.state.hasError) {
      const isChunkError = this.state.error?.name === 'ChunkLoadError' ||
        this.state.error?.message.includes('Loading chunk')
      const reloadCount = ChunkErrorBoundary.getReloadCount()

      // Si es ChunkLoadError y no hemos alcanzado el máximo de recargas
      if (isChunkError && reloadCount < ChunkErrorBoundary.MAX_RELOADS) {
        return (
          <div className="flex items-center justify-center min-h-screen bg-background">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Actualizando aplicación...</p>
              <p className="text-xs text-muted-foreground mt-2">Intento {reloadCount + 1}/{ChunkErrorBoundary.MAX_RELOADS}</p>
            </div>
          </div>
        )
      }

      // Para otros errores o si alcanzamos el máximo de recargas
      return (
        <div className="flex items-center justify-center min-h-screen bg-background">
          <div className="text-center max-w-md p-6">
            <h2 className="text-2xl font-bold mb-4">Error de Carga</h2>
            <p className="text-muted-foreground mb-4">
              {isChunkError
                ? 'No se pudo cargar la aplicación después de varios intentos. Por favor, limpia el cache del navegador e intenta de nuevo.'
                : 'Ha ocurrido un error inesperado. Por favor, recarga la página.'}
            </p>
            <div className="space-y-2">
              <button
                onClick={() => {
                  ChunkErrorBoundary.resetReloadCount()
                  window.location.reload()
                }}
                className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
              >
                Recargar página
              </button>
              {isChunkError && (
                <p className="text-xs text-muted-foreground">
                  Tip: Presiona Ctrl+Shift+R (o Cmd+Shift+R en Mac) para limpiar cache
                </p>
              )}
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
