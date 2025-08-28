import { useState, useCallback, useEffect } from 'react'

interface FormData {
  step1?: any
  step2?: any
  step3?: any
  step4?: any
  step5?: any
  step6?: any
  step7?: any
}

interface UseMultiStepFormOptions {
  totalSteps?: number
  onStepChange?: (step: number) => void
  onComplete?: (allData: FormData) => void
}

export function useMultiStepForm(options: UseMultiStepFormOptions = {}) {
  const { totalSteps = 7, onStepChange, onComplete } = options

  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<FormData>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [completedSteps, setCompletedSteps] = useState<boolean[]>(new Array(totalSteps).fill(false))

  // Notify when step changes
  useEffect(() => {
    onStepChange?.(currentStep)
  }, [currentStep, onStepChange])

  const nextStep = useCallback(() => {
    if (currentStep < totalSteps) {
      const newStep = currentStep + 1
      setCurrentStep(newStep)
    }
  }, [currentStep, totalSteps])

  const prevStep = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }, [currentStep])

  const goToStep = useCallback((step: number) => {
    if (step >= 1 && step <= totalSteps) {
      setCurrentStep(step)
    }
  }, [totalSteps])

  const updateStepData = useCallback((step: number, data: any) => {
    setFormData(prev => ({
      ...prev,
      [`step${step}`]: data
    }))

    // Mark step as completed
    setCompletedSteps(prev => {
      const newCompleted = [...prev]
      newCompleted[step - 1] = true
      return newCompleted
    })
  }, [])

  const getStepData = useCallback((step: number) => {
    return formData[`step${step}` as keyof FormData]
  }, [formData])

  const isStepCompleted = useCallback((step: number) => {
    return completedSteps[step - 1] || false
  }, [completedSteps])

  const canProceedToStep = useCallback((step: number) => {
    // Can always go to step 1
    if (step === 1) return true

    // For other steps, check if previous step is completed
    return isStepCompleted(step - 1)
  }, [isStepCompleted])

  const submitForm = useCallback(async () => {
    setIsSubmitting(true)
    try {
      await onComplete?.(formData)
    } catch (error) {
      console.error('Form submission error:', error)
      throw error
    } finally {
      setIsSubmitting(false)
    }
  }, [formData, onComplete])

  const resetForm = useCallback(() => {
    setCurrentStep(1)
    setFormData({})
    setIsSubmitting(false)
    setCompletedSteps(new Array(totalSteps).fill(false))
  }, [totalSteps])

  const validateCurrentStep = useCallback(() => {
    const currentData = getStepData(currentStep)
    return !!currentData // Basic validation - has data
  }, [currentStep, getStepData])

  return {
    // State
    currentStep,
    formData,
    isSubmitting,
    completedSteps,

    // Navigation
    nextStep,
    prevStep,
    goToStep,

    // Data management
    updateStepData,
    getStepData,

    // Utilities
    isStepCompleted,
    canProceedToStep,
    validateCurrentStep,
    submitForm,
    resetForm,

    // Setters for external control
    setSubmitting: setIsSubmitting
  }
}
