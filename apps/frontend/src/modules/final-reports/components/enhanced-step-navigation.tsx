'use client'

import React from 'react'
import { Button } from '@una-gc/ui/components/button'
import { Card, CardContent } from '@una-gc/ui/components/card'
import { Check, ChevronRight, Loader2 } from 'lucide-react'
import { cn } from '@una-gc/ui/lib/utils'

interface StepNavigationProps {
  currentStep: number
  totalSteps: number
  stepLabels: string[]
  onNext?: () => void
  onPrev?: () => void
  onGoToStep?: (step: number) => void
  onSubmit?: () => void
  isSubmitting?: boolean
  isLastStep?: boolean
  canProceed?: boolean
  className?: string
  completedSteps?: boolean[]
  showNavigationButtons?: boolean // New prop to control button visibility
}

/**
 * Enhanced step navigation with elegant card-based design
 * Visual step indicators with clickable navigation
 */
export function StepNavigation({
  currentStep,
  totalSteps,
  stepLabels,
  onNext,
  onPrev,
  onGoToStep,
  onSubmit,
  isSubmitting = false,
  isLastStep = false,
  canProceed = true,
  className,
  completedSteps = [],
  showNavigationButtons = true
}: StepNavigationProps) {
  const handleStepClick = (step: number) => {
    // Allow navigation to completed steps or current step
    if ((completedSteps[step - 1] || step <= currentStep) && onGoToStep) {
      onGoToStep(step)
    }
  }

  return (
    <div className={cn("w-full space-y-4", className)}>
      {/* Compact Step Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {Array.from({ length: totalSteps }, (_, index) => {
          const stepNumber = index + 1
          const isActive = stepNumber === currentStep
          const isCompleted = completedSteps[index]
          const isClickable = isCompleted || stepNumber <= currentStep

          return (
            <Card
              key={stepNumber}
              className={cn(
                "relative cursor-pointer transition-all duration-200",
                {
                  "ring-2 ring-primary border-primary": isActive,
                  "bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800": isCompleted && !isActive,
                  "hover:border-primary/50": isClickable && !isActive,
                  "opacity-60 cursor-not-allowed": !isClickable
                }
              )}
              onClick={() => handleStepClick(stepNumber)}
            >
              <CardContent className="p-2 text-center">
                {/* Compact Step Label */}
                <div className={cn(
                  "text-xs font-medium leading-tight",
                  {
                    "text-primary font-semibold": isActive,
                    "text-green-700 dark:text-green-300": isCompleted && !isActive,
                    "text-muted-foreground": !isActive && !isCompleted
                  }
                )}>
                  {stepNumber}. {stepLabels[index] || `Paso ${stepNumber}`}
                </div>

                {/* Completion Check */}
                {isCompleted && !isActive && (
                  <Check className="w-3 h-3 mx-auto mt-1 text-green-600" />
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Navigation Controls */}
      {showNavigationButtons && (
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={onPrev}
                disabled={currentStep === 1 || isSubmitting}
                className="flex items-center gap-2"
              >
                <ChevronRight className="w-4 h-4 rotate-180" />
                Anterior
              </Button>

              {isLastStep ? (
                <Button
                  onClick={onSubmit}
                  disabled={!canProceed || isSubmitting}
                  className="flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      Enviar Informe
                      <Check className="w-4 h-4" />
                    </>
                  )}
                </Button>
              ) : (
                <Button
                  onClick={onNext}
                  disabled={!canProceed || isSubmitting}
                  className="flex items-center gap-2"
                >
                  Siguiente
                  <ChevronRight className="w-4 h-4" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
