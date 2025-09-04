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
                    "text-muted-foreground": !isActive
                  }
                )}>
                  {stepNumber}. {stepLabels[index] || `Paso ${stepNumber}`}
                </div> 
              </CardContent>
            </Card>
          )
        })}
      </div> 
    </div>
  )
}
