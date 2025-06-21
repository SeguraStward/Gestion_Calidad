import { useCallback, useMemo, useState } from 'react'

export interface OptimizedLoadingState {
  isLoading: boolean
  isError: boolean
  error: Error | null
  isSuccess: boolean
  isIdle: boolean
}

interface UseOptimizedLoadingOptions {
  initialState?: 'idle' | 'loading'
  onSuccess?: () => void
  onError?: (error: Error) => void
  resetOnSuccess?: boolean
}

/**
 * Hook optimizado para manejar estados de carga de manera eficiente
 * Reduce re-renders innecesarios y provide un API consistente
 */
export function useOptimizedLoading(options: UseOptimizedLoadingOptions = {}) {
  const { initialState = 'idle', onSuccess, onError, resetOnSuccess = false } = options

  const [state, setState] = useState<'idle' | 'loading' | 'success' | 'error'>(initialState)
  const [error, setError] = useState<Error | null>(null)

  const loadingState: OptimizedLoadingState = useMemo(
    () => ({
      isLoading: state === 'loading',
      isError: state === 'error',
      error,
      isSuccess: state === 'success',
      isIdle: state === 'idle'
    }),
    [state, error]
  )

  const setLoading = useCallback(() => {
    setState('loading')
    setError(null)
  }, [])

  const setSuccess = useCallback(() => {
    setState('success')
    setError(null)
    onSuccess?.()

    if (resetOnSuccess) {
      const timeoutId = setTimeout(() => setState('idle'), 100)
      return () => clearTimeout(timeoutId)
    }
  }, [onSuccess, resetOnSuccess])

  const setErrorState = useCallback(
    (error: Error) => {
      setState('error')
      setError(error)
      onError?.(error)
    },
    [onError]
  )

  const reset = useCallback(() => {
    setState('idle')
    setError(null)
  }, [])

  const execute = useCallback(
    async <T>(asyncOperation: () => Promise<T>): Promise<T | null> => {
      try {
        setLoading()
        const result = await asyncOperation()
        setSuccess()
        return result
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Unknown error')
        setErrorState(error)
        return null
      }
    },
    [setLoading, setSuccess, setErrorState]
  )

  return {
    ...loadingState,
    setLoading,
    setSuccess,
    setError: setErrorState,
    reset,
    execute
  }
}
