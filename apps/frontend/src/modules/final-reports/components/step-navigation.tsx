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
}

/**
 * Enhanced step navigation component
 * Provides visual step indicator and navigation controls
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
  className
}: StepNavigationProps) {
  const handleStepClick = (step: number) => {
    if (step <= currentStep && onGoToStep) {
      onGoToStep(step)
    }
  }

  return (
    <Card className={cn("w-full", className)}>
      <CardContent className="p-6">
        {/* Step Indicators */}
        <div className="flex items-center justify-between mb-8">
          {Array.from({ length: totalSteps }, (_, index) => {
            const stepNumber = index + 1
            const isActive = stepNumber === currentStep
            const isCompleted = stepNumber < currentStep
            const isClickable = stepNumber <= currentStep

            return (
              <React.Fragment key={stepNumber}>
                <div className="flex flex-col items-center">
                  <button
                    onClick={() => handleStepClick(stepNumber)}
                    disabled={!isClickable}
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-200",
                      "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                      {
                        "bg-primary text-primary-foreground": isActive,
                        "bg-green-500 text-white": isCompleted,
                        "bg-muted text-muted-foreground": !isActive && !isCompleted,
                        "cursor-pointer hover:bg-primary/80": isClickable && !isActive && !isCompleted,
                        "cursor-not-allowed": !isClickable
                      }
                    )}
                  >
                    {isCompleted ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      stepNumber
                    )}
                  </button>
                  <span className={cn(
                    "mt-2 text-xs font-medium text-center min-w-0",
                    {
                      "text-primary": isActive,
                      "text-green-600 dark:text-green-400": isCompleted,
                      "text-muted-foreground": !isActive && !isCompleted
                    }
                  )}>
                    {stepLabels[index] || `Step ${stepNumber}`}
                  </span>
                </div>

                {/* Connector Line */}
                {stepNumber < totalSteps && (
                  <div className="flex-1 mx-4">
                    <div className={cn(
                      "h-0.5 w-full transition-colors duration-200",
                      stepNumber < currentStep ? "bg-green-500" : "bg-muted"
                    )} />
                  </div>
                )}
              </React.Fragment>
            )
          })}
        </div>

        {/* Navigation Controls */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={onPrev}
            disabled={currentStep === 1 || isSubmitting}
            className="flex items-center gap-2"
          >
            <ChevronRight className="w-4 h-4 rotate-180" />
            Previous
          </Button>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Step {currentStep} of {totalSteps}</span>
          </div>

          {isLastStep ? (
            <Button
              onClick={onSubmit}
              disabled={!canProceed || isSubmitting}
              className="flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  Submit Report
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
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
