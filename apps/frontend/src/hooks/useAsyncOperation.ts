import { useState, useCallback } from 'react'

export interface UseAsyncOperationReturn<T> {
  loading: boolean
  error: string | null
  data: T | null
  execute: (operation: () => Promise<T>) => Promise<T | null>
  reset: () => void
}

export function useAsyncOperation<T = any>(): UseAsyncOperationReturn<T> {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<T | null>(null)

  const execute = useCallback(async (operation: () => Promise<T>): Promise<T | null> => {
    try {
      setLoading(true)
      setError(null)

      const result = await operation()
      setData(result)
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ha ocurrido un error inesperado'
      setError(errorMessage)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const reset = useCallback(() => {
    setLoading(false)
    setError(null)
    setData(null)
  }, [])

  return {
    loading,
    error,
    data,
    execute,
    reset
  }
}
