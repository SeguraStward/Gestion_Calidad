'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@una-gc/ui/components/button'
import { ArrowLeft } from 'lucide-react'
import { StepNavigation } from './enhanced-step-navigation'

interface ReportPageHeaderProps {
  pageTitle: string
  pageDescription?: string
  stepLabels: string[]
  currentStep: number
  backButton?: {
    text: string
    href: string
  }
  isLoading?: boolean
  nrc?: string | null
  onGoToStep?: (step: number) => void
  completedSteps?: boolean[]
}

export function ReportPageHeader({
  pageTitle,
  pageDescription,
  stepLabels,
  currentStep,
  backButton,
  isLoading,
  nrc,
  onGoToStep,
  completedSteps = []
}: ReportPageHeaderProps) {
  const router = useRouter()

  const defaultDescription =
    pageDescription ||
    (nrc
      ? `Modifique los datos del informe final del curso. NRC: ${isLoading ? 'Cargando...' : nrc || 'N/A'}`
      : 'Complete todos los pasos para crear el informe.')

  return (
    <div className="w-full mb-4 md:mb-6 sticky top-0 bg-background z-10 py-3 sm:py-4 border-b border-border/40">
      {backButton && (
        <Button
          variant="outline"
          onClick={() => router.push(backButton.href)}
          className="mb-3 sm:mb-4 text-xs sm:text-sm 
                     bg-slate-900 text-white hover:bg-slate-700
                     dark:bg-white dark:text-black dark:hover:bg-slate-200
                     border-slate-700 dark:border-slate-300"
        >
          <ArrowLeft className="mr-1.5 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
          {backButton.text}
        </Button>
      )}
      <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">{pageTitle}</h1>
      <p className="text-muted-foreground text-xs sm:text-sm">{defaultDescription}</p>

      {/* Enhanced Step Navigation */}
      <div className="mt-4 sm:mt-6 w-full">
        <StepNavigation
          currentStep={currentStep}
          totalSteps={stepLabels.length}
          stepLabels={stepLabels}
          onGoToStep={onGoToStep}
          completedSteps={completedSteps}
          showNavigationButtons={false}
          className="w-full"
        />
      </div>
    </div>
  )
}
