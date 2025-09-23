import { useCallback, useState } from 'react'
import { autoNumberingService } from '../services/auto-numbering.service'

export const useAutoNumbering = () => {
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const generateDimensionCode = useCallback(async (): Promise<string> => {
    setIsGenerating(true)
    setError(null)

    try {
      const code = await autoNumberingService.generateNextDimensionNumber()
      return code
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error generando código'
      setError(errorMessage)
      throw err
    } finally {
      setIsGenerating(false)
    }
  }, [])

  const generateComponentCode = useCallback(async (dimensionId: string): Promise<string> => {
    setIsGenerating(true)
    setError(null)

    try {
      const code = await autoNumberingService.generateNextComponentNumber(dimensionId)
      return code
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error generando código'
      setError(errorMessage)
      throw err
    } finally {
      setIsGenerating(false)
    }
  }, [])

  const generateCriterionCode = useCallback(async (componentId: string): Promise<string> => {
    setIsGenerating(true)
    setError(null)

    try {
      const code = await autoNumberingService.generateNextCriterionNumber(componentId)
      return code
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error generando código'
      setError(errorMessage)
      throw err
    } finally {
      setIsGenerating(false)
    }
  }, [])

  const generateStandardCode = useCallback(async (criterionId: string): Promise<string> => {
    setIsGenerating(true)
    setError(null)

    try {
      const code = await autoNumberingService.generateNextStandardNumber(criterionId)
      return code
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error generando código'
      setError(errorMessage)
      throw err
    } finally {
      setIsGenerating(false)
    }
  }, [])

  const generateEvidenceCode = useCallback(async (): Promise<string> => {
    setIsGenerating(true)
    setError(null)

    try {
      const code = await autoNumberingService.generateNextEvidenceNumber()
      return code
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error generando código'
      setError(errorMessage)
      throw err
    } finally {
      setIsGenerating(false)
    }
  }, [])

  const recalculateAllCodes = useCallback(async (): Promise<void> => {
    setIsGenerating(true)
    setError(null)

    try {
      await autoNumberingService.recalculateAllCodes()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error recalculando códigos'
      setError(errorMessage)
      throw err
    } finally {
      setIsGenerating(false)
    }
  }, [])

  return {
    generateDimensionCode,
    generateComponentCode,
    generateCriterionCode,
    generateStandardCode,
    generateEvidenceCode,
    recalculateAllCodes,
    isGenerating,
    error,
    clearError: () => setError(null)
  }
}
