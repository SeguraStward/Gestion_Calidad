'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@una-gc/ui/components/button'
import { ArrowLeft, CheckCircle } from 'lucide-react'

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
}

export function ReportPageHeader({
  pageTitle,
  pageDescription,
  stepLabels,
  currentStep,
  backButton,
  isLoading,
  nrc
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

      {/* Indicador de Pasos */}
      <div className="mt-4 sm:mt-6 w-full">
        {/* MODIFIED: Added a wrapper for horizontal scrolling on small screens */}
        <div className="overflow-x-auto pb-2 -mb-2">
          {' '}
          {/* pb-2 and -mb-2 to hide scrollbar visually if possible but keep functionality */}
          <div className="flex justify-between items-center px-0 sm:px-1 min-w-max">
            {' '}
            {/* Added min-w-max to ensure flex items don't shrink too much before scrolling */}
            {stepLabels.map((label, index) => {
              const stepNumber = index + 1
              const isCompleted = currentStep > stepNumber
              const isCurrent = currentStep === stepNumber
              return (
                <React.Fragment key={stepNumber}>
                  <div className="flex items-center flex-1 last:flex-grow-0">
                    {' '}
                    {/* last:flex-grow-0 to prevent last line from over-expanding */}
                    <div
                      className={`
                        h-12 sm:h-14 md:h-16 
                        rounded-full flex items-center justify-center 
                        px-2 py-1 sm:px-3 sm:py-1.5 md:px-4 md:py-2 
                        text-xs font-medium transition-all duration-300 text-center leading-tight 
                        min-w-[60px] sm:min-w-[90px] md:min-w-[100px] 
                        max-w-[100px] sm:max-w-[120px] md:max-w-[140px] 
                        mx-0.5 sm:mx-1
                        whitespace-nowrap /* Prevent text wrapping inside bubble */
                        ${
                          isCompleted
                            ? 'bg-primary text-primary-foreground shadow-md'
                            : isCurrent
                              ? 'bg-primary text-primary-foreground ring-2 ring-primary/30 shadow-lg font-semibold'
                              : 'bg-muted text-muted-foreground border border-muted-foreground/30'
                        }`}
                    >
                      {isCompleted ? (
                        <div className="flex items-center gap-1">
                          <CheckCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 flex-shrink-0" />
                          <span className="truncate">{label}</span>
                        </div>
                      ) : (
                        <span className="truncate">{label}</span>
                      )}
                    </div>
                    {index < stepLabels.length - 1 && (
                      <div
                        className={`
                          flex-1 h-0.5 
                          mx-0.5 sm:mx-1 md:mx-2 
                          rounded-full 
                          min-w-[5px] sm:min-w-[10px] md:min-w-[20px] 
                          ${currentStep > stepNumber ? 'bg-primary' : 'bg-muted'}`}
                      />
                    )}
                  </div>
                </React.Fragment>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
