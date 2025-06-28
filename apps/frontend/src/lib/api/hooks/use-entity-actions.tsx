'use client'

import { useState } from 'react'

export interface UseEntityActionsOptions {
  onSuccess?: (action: string, data?: any) => void
  onError?: (action: string, error: Error) => void
}

export interface UseEntityActionsReturn {
  loading: Record<string, boolean>
  errors: Record<string, Error | null>
  execute: <T>(action: string, fn: () => Promise<T>, options?: { successMessage?: string }) => Promise<T | null>
  setLoading: (action: string, loading: boolean) => void
  setError: (action: string, error: Error | null) => void
  clearErrors: () => void
}

export function useEntityActions(options: UseEntityActionsOptions = {}): UseEntityActionsReturn {
  const [loading, setLoadingState] = useState<Record<string, boolean>>({})
  const [errors, setErrorsState] = useState<Record<string, Error | null>>({})

  const setLoading = (action: string, isLoading: boolean) => {
    setLoadingState((prev) => ({ ...prev, [action]: isLoading }))
  }

  const setError = (action: string, error: Error | null) => {
    setErrorsState((prev) => ({ ...prev, [action]: error }))
  }

  const clearErrors = () => {
    setErrorsState({})
  }

  const execute = async <T,>(
    action: string,
    fn: () => Promise<T>,
    actionOptions?: { successMessage?: string }
  ): Promise<T | null> => {
    setLoading(action, true)
    setError(action, null)

    try {
      const result = await fn()
      options.onSuccess?.(action, result)
      return result
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Unknown error')
      setError(action, err)
      options.onError?.(action, err)
      return null
    } finally {
      setLoading(action, false)
    }
  }

  return {
    loading,
    errors,
    execute,
    setLoading,
    setError,
    clearErrors
  }
}
