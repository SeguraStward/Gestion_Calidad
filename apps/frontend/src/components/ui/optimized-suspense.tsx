import { Suspense, lazy, memo } from 'react'
import { LoadingSpinner } from './loading-spinner'

interface OptimizedSuspenseProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  errorFallback?: React.ComponentType<{ error: Error; resetErrorBoundary: () => void }>
}

// Fallback por defecto optimizado
const DefaultFallback = memo(function DefaultFallback() {
  return (
    <div className="flex items-center justify-center min-h-[200px]">
      <LoadingSpinner size="md" text="Cargando..." />
    </div>
  )
})

// Error fallback por defecto
const DefaultErrorFallback = memo(function DefaultErrorFallback({
  error,
  resetErrorBoundary
}: {
  error: Error
  resetErrorBoundary: () => void
}) {
  const { Button } = require('@una-gc/ui/components/button')
  return (
    <div className="flex flex-col items-center justify-center min-h-[200px] space-y-4">
      <div className="text-red-600 text-center">
        <h3 className="font-semibold">Error al cargar el componente</h3>
        <p className="text-sm text-muted-foreground mt-1">{error.message}</p>
      </div>
      <Button
        onClick={resetErrorBoundary}
        className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
        type="button"
      >
        Reintentar
      </Button>
    </div>
  )
})

// ErrorBoundary propio
import React from 'react'

interface ErrorBoundaryProps {
  children: React.ReactNode
  FallbackComponent: React.ComponentType<{ error: Error; resetErrorBoundary: () => void }>
}

interface ErrorBoundaryState {
  error: Error | null
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { error: null }
    this.resetErrorBoundary = this.resetErrorBoundary.bind(this)
  }

  static getDerivedStateFromError(error: Error) {
    return { error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Puedes loguear el error aquí si lo necesitas
  }

  resetErrorBoundary() {
    this.setState({ error: null })
  }

  render() {
    const { error } = this.state
    const { FallbackComponent, children } = this.props

    if (error) {
      return <FallbackComponent error={error} resetErrorBoundary={this.resetErrorBoundary} />
    }

    return children
  }
}

/**
 * Componente optimizado que combina Suspense + ErrorBoundary
 * Reduce re-renders y proporciona mejor UX durante cargas
 */
export const OptimizedSuspense = memo(function OptimizedSuspense({
  children,
  fallback,
  errorFallback: ErrorFallback = DefaultErrorFallback
}: OptimizedSuspenseProps) {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <Suspense fallback={fallback || <DefaultFallback />}>{children}</Suspense>
    </ErrorBoundary>
  )
})

/**
 * HOC para lazy loading con optimizaciones
 */
export function withOptimizedLazy<P extends object>(
  importFunc: () => Promise<{ default: React.ComponentType<P> }>,
  fallback?: React.ReactNode
) {
  const LazyComponent = lazy(importFunc)

  return memo(function OptimizedLazyComponent(props: P) {
    return (
      <OptimizedSuspense fallback={fallback}>
        <LazyComponent {...props} />
      </OptimizedSuspense>
    )
  })
}

export default OptimizedSuspense
