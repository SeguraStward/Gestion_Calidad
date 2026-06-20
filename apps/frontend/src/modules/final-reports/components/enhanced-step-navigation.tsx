'use client'

import React from 'react'
import { Check } from 'lucide-react'
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
  showNavigationButtons?: boolean
}

/**
 * Compact animated stepper. Every step is a small circle; only the *current*
 * step expands into a pill that reveals its label, with a smooth width/opacity
 * transition. Completed steps show a check, future steps are muted. Designed to
 * stay on a single row.
 */
export function StepNavigation({
  currentStep,
  totalSteps,
  stepLabels,
  onGoToStep,
  className,
  completedSteps = []
}: StepNavigationProps) {
  const handleStepClick = (step: number) => {
    if ((completedSteps[step - 1] || step <= currentStep) && onGoToStep) {
      onGoToStep(step)
    }
  }

  return (
    <div className={cn('flex w-full items-center gap-1.5 sm:gap-2', className)}>
      {Array.from({ length: totalSteps }, (_, index) => {
        const stepNumber = index + 1
        const isActive = stepNumber === currentStep
        const isCompleted = !!completedSteps[index] && !isActive
        const isClickable = !!completedSteps[index] || stepNumber <= currentStep
        const lineDone = !!completedSteps[index] || stepNumber < currentStep
        const isLast = stepNumber === totalSteps

        return (
          <React.Fragment key={stepNumber}>
            <button
              type="button"
              onClick={() => handleStepClick(stepNumber)}
              disabled={!isClickable}
              aria-current={isActive ? 'step' : undefined}
              title={stepLabels[index]}
              className={cn(
                'group inline-flex h-8 min-w-8 shrink-0 items-center justify-center rounded-full border px-0 transition-all duration-300 ease-out',
                isActive && 'border-primary bg-primary px-2 text-primary-foreground shadow-sm',
                isCompleted && 'border-primary bg-primary/10 text-primary',
                !isActive && !isCompleted && 'border-border bg-background text-muted-foreground',
                isClickable ? 'cursor-pointer' : 'cursor-not-allowed opacity-60',
                isClickable && !isActive && 'hover:border-primary/60'
              )}
            >
              <span className="flex h-6 w-6 shrink-0 items-center justify-center text-xs font-semibold tabular-nums">
                {isCompleted ? <Check className="h-4 w-4" /> : stepNumber}
              </span>
              <span
                className={cn(
                  'overflow-hidden whitespace-nowrap text-xs font-medium transition-all duration-300 ease-out',
                  isActive ? 'ml-1 max-w-[200px] pr-1 opacity-100' : 'max-w-0 opacity-0'
                )}
              >
                {stepLabels[index] || `Paso ${stepNumber}`}
              </span>
            </button>

            {!isLast && (
              <div
                className={cn(
                  'h-px min-w-3 flex-1 transition-colors duration-300',
                  lineDone ? 'bg-primary' : 'bg-border'
                )}
              />
            )}
          </React.Fragment>
        )
      })}
    </div>
  )
}
