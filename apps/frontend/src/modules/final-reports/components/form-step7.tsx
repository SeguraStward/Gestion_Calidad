'use client'

import React, { useEffect, useMemo } from 'react'
import { UseFormReturn, FormProvider } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import { Activity, AlertTriangle } from 'lucide-react' // MODIFIED: Added AlertTriangle
import { RadioGroup, RadioGroupItem } from '@una-gc/ui/components/radio-group'
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from '@una-gc/ui/components/card'
import { Separator } from '@una-gc/ui/components/separator'
import { Button } from '@una-gc/ui/components/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@una-gc/ui/components/form'
import * as z from 'zod'
import type { ReportType } from '../types/final-reports.types' // Import ReportType
// Use centralized mock and types
import { step7QuestionsPageMock, Step7Question, OptionFE } from '@/modules/final-reports/mocks/questions'

const radioResponseSchema = z.object({
  idPregunta: z.string(), // This will map to questionId from the mock
  respuesta: z.string().min(1, 'Debe seleccionar una opción.') // User-facing: Spanish
})

export const step7Schema = z.object({
  respuestasRadio: z
    .array(radioResponseSchema)
    // Este refine asegura que cada respuesta en el array (que corresponde a una pregunta mostrada)
    // tenga un valor seleccionado.
    .refine((respuestas) => respuestas.every((r) => r.respuesta.trim() !== ''), {
      message: 'Debe seleccionar una opción para todas las preguntas mostradas.',
      // Adjuntar a 'respuestasRadio' para que se muestre en un lugar general del paso.
      path: ['respuestasRadio']
    })
})

export type Step7FormData = z.infer<typeof step7Schema>

interface Step7FormProps {
  formMethods: UseFormReturn<Step7FormData>
  onSaveAndNext: (data: Step7FormData) => void | Promise<void>
  onPrevious: (data: Step7FormData) => void // MODIFICADO para aceptar datos
  totalSteps: number
  reportType?: ReportType
  isSubmitting?: boolean
  initialData?: Step7FormData | null
  isEditing?: boolean
}

// Define getOptionColors - MODIFIED to match form-step7-edit.tsx styling
// This assumes option values '1' through '5' map semantically as:
// '5': "Muy de acuerdo" (most positive)
// '4': "De acuerdo"
// '3': "Neutral"
// '2': "En desacuerdo"
// '1': "Muy en desacuerdo" (most negative)
function getOptionColors(optionValue: string, isSelected: boolean): string {
  if (!isSelected) {
    // Consistent unselected style (matches form-step7-edit.tsx's unselected style)
    return 'border-border/30 bg-transparent hover:border-border/50 hover:bg-muted/20 dark:hover:bg-muted/10'
  }
  // Color mapping based on value, similar to form-step7-edit.tsx
  // Using a similar palette but with the Tailwind CSS color names from the original form-step7.tsx for simplicity,
  // adjust if you want the exact emerald/amber etc. colors from form-step7-edit.tsx
  switch (optionValue) {
    case '5': // "Muy de acuerdo"
      return 'border-green-500/80 bg-green-500/25 text-green-700 hover:bg-green-500/30 dark:border-green-600/80 dark:bg-green-600/30 dark:text-green-300'
    case '4': // "De acuerdo"
      return 'border-lime-500/80 bg-lime-500/25 text-lime-700 hover:bg-lime-500/30 dark:border-lime-600/80 dark:bg-lime-600/30 dark:text-lime-300'
    case '3': // "Neutral"
      return 'border-yellow-500/80 bg-yellow-500/25 text-yellow-700 hover:bg-yellow-500/30 dark:border-yellow-600/80 dark:bg-yellow-600/30 dark:text-yellow-300'
    case '2': // "En desacuerdo"
      return 'border-orange-500/80 bg-orange-500/25 text-orange-700 hover:bg-orange-500/30 dark:border-orange-600/80 dark:bg-orange-600/30 dark:text-orange-300'
    case '1': // "Muy en desacuerdo"
      return 'border-red-500/80 bg-red-500/25 text-red-700 hover:bg-red-500/30 dark:border-red-600/80 dark:bg-red-600/30 dark:text-red-300'
    default: // Fallback, though ideally all values are covered
      return 'border-slate-500/80 bg-slate-500/25 text-slate-700 hover:bg-slate-500/30 dark:border-slate-600/80 dark:bg-slate-600/30 dark:text-slate-300'
  }
}

export function Step7Form({
  formMethods,
  onSaveAndNext,
  onPrevious, // MODIFICADO
  totalSteps,
  reportType,
  isSubmitting,
  initialData,
  isEditing = false
}: Step7FormProps) {
  const router = useRouter()
  const { control, watch, setValue, getValues, handleSubmit, formState, register, reset } = formMethods

  const { questionGroups, flatDisplayedQuestionList } = useMemo(() => {
    const grupos: Record<string, Step7Question[]> = {}
    const filtered = step7QuestionsPageMock.filter((q) => {
      if (Array.isArray(q.appliesTo)) {
        const matchesReportType = reportType ? q.appliesTo.includes(reportType) : false
        return matchesReportType || q.appliesTo.includes('TODOS')
      }
      return false
    })
    filtered.forEach((p) => {
      const groupName = p.group || 'General'
      if (!grupos[groupName]) {
        grupos[groupName] = []
      }
      grupos[groupName].push(p)
    })
    return { questionGroups: grupos, flatDisplayedQuestionList: filtered }
  }, [reportType])

  useEffect(() => {
   
    const defaultFormValuesBasedOnCurrentQuestions = {
      respuestasRadio: flatDisplayedQuestionList.map((q) => ({
        idPregunta: q.questionId,
        respuesta: ''
      }))
    }

    if (initialData && initialData.respuestasRadio) {
      const mergedRespuestasRadio = flatDisplayedQuestionList.map((q) => {
        const existingResponse = initialData.respuestasRadio.find((r) => r.idPregunta === q.questionId)
        return {
          idPregunta: q.questionId,
          respuesta: existingResponse ? existingResponse.respuesta : ''
        }
      })
      reset({ respuestasRadio: mergedRespuestasRadio })
    } else if (!isEditing) {
      reset(defaultFormValuesBasedOnCurrentQuestions)
    }
  }, [initialData, isEditing, flatDisplayedQuestionList, reset, reportType])

  const handleFormSubmitSuccess = (data: Step7FormData) => {
    onSaveAndNext(data)
  }

  const handleFormSubmitError = (errorsFromSubmitHandler: any) => {
    // Validation errors are now displayed in the UI via FormMessage components.
  }

  const handlePreviousClick = () => {
    const currentData = getValues()
    onPrevious(currentData) // Pasa los datos al padre
  }

  return (
    <div className="flex flex-col">
      
      <div className="mb-4">
        <h2 className="text-xl font-semibold flex items-center gap-3">
          <Activity className="w-5 h-5 text-foreground/70" />
          Paso {totalSteps > 0 ? `7 de ${totalSteps}: ` : ''} Percepción General y Desempeño
        </h2>
        <p className="text-muted-foreground text-sm mt-1">
          Evalúe su percepción sobre los aspectos del curso y desempeño estudiantil. ({flatDisplayedQuestionList.length}{' '}
          pregunta{flatDisplayedQuestionList.length !== 1 ? 's' : ''})
        </p>
      </div>

      {/* General Form Error Message */}
      {formState.errors.respuestasRadio?.root?.message && (
        <div className="mb-3 p-3 rounded-md flex items-center text-sm bg-destructive/10 text-destructive border border-destructive/30">
          <AlertTriangle className="mr-2 h-5 w-5 flex-shrink-0" />
          <span>{formState.errors.respuestasRadio.root.message}</span>
        </div>
      )}
      {formState.errors.root?.message && (
        <div className="mb-3 p-3 rounded-md flex items-center text-sm bg-destructive/10 text-destructive border border-destructive/30">
          <AlertTriangle className="mr-2 h-5 w-5 flex-shrink-0" />
          <span>{formState.errors.root.message}</span>
        </div>
      )}

      <FormProvider {...formMethods}>
        <Form {...formMethods}>
          <form onSubmit={handleSubmit(handleFormSubmitSuccess, handleFormSubmitError)} className="flex-1 flex flex-col min-h-0">
            {/* Scrollable Questions Area */}
            <div className="flex-1 overflow-y-auto pr-2 pb-4 space-y-2 sm:space-y-2.5 md:space-y-3">
              {flatDisplayedQuestionList.length === 0 ? (
                <div className="text-center py-4 sm:py-5 text-muted-foreground flex flex-col items-center justify-center h-full">
                  <Activity className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 mx-auto mb-1 sm:mb-1.5 md:mb-2 opacity-50" />
                  <p className="text-xs sm:text-sm">No hay preguntas disponibles</p>
                  <p className="text-xs sm:text-sm">para este tipo de informe o configuración.</p>
                </div>
              ) : (
                Object.entries(questionGroups).map(([groupName, questionsInGroup], groupIndex, allGroupsArray) => (
                  <div key={groupName}>
                    <div className="py-1.5 sm:py-2 px-1">
                      <div className="mb-1.5 sm:mb-2">
                        <h3 className="text-xs sm:text-sm font-medium text-foreground/90 leading-normal flex items-center gap-1 sm:gap-1.5">
                          <div className="w-1.5 h-1.5 bg-muted-foreground/70 rounded-full"></div>
                          {groupName}
                        </h3>
                      </div>
                      <div className="ml-1 sm:ml-2 space-y-2.5 sm:space-y-3">
                        {questionsInGroup.map((questionItem) => {
                          const globalQuestionIndex = flatDisplayedQuestionList.findIndex(
                            (item) => item.questionId === questionItem.questionId
                          )
                          if (globalQuestionIndex === -1) return null

                          const currentRadioValue = watch(`respuestasRadio.${globalQuestionIndex}.respuesta`)

                          return (
                            <FormField
                              key={questionItem.questionId}
                              control={control}
                              name={`respuestasRadio.${globalQuestionIndex}.respuesta`}
                              render={({ field }) => (
                                <FormItem className="space-y-1 sm:space-y-1.5">
                                  <FormLabel className="text-xs sm:text-sm font-medium text-foreground/85 leading-normal block">
                                    {questionItem.question}
                                  </FormLabel>
                                  <div className="ml-0.5 sm:ml-1">
                                    <FormControl>
                                      <RadioGroup
                                        onValueChange={field.onChange}
                                        value={field.value || ''}
                                        className="flex flex-wrap items-center gap-2 sm:gap-3" // CORREGIDO: El gap era excesivo (sm:gap-15)
                                      >
                                        {questionItem.options.map((optionItem: OptionFE) => {
                                          const isSelected = currentRadioValue === optionItem.value
                                          const colorClasses = getOptionColors(optionItem.value, isSelected) // Value is '1', '2', etc.
                                          const uniqueOptionId = `${field.name}-${globalQuestionIndex}-${optionItem.value}`
                                          return (
                                            <FormItem key={optionItem.value} className="space-y-0">
                                              <div
                                                className={`flex items-center space-x-1 sm:space-x-1.5 p-1.5 sm:p-2 rounded-md border transition-all duration-200 cursor-pointer ${colorClasses}`} // Ensure this line is identical in both files
                                              >
                                                <FormControl>
                                                  <RadioGroupItem
                                                    value={optionItem.value}
                                                    id={uniqueOptionId}
                                                    className="mt-0 w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4"
                                                  />
                                                </FormControl>
                                                <FormLabel
                                                  htmlFor={uniqueOptionId}
                                                  className="text-xs sm:text-sm font-normal cursor-pointer flex-1 leading-snug text-foreground/90"
                                                >
                                                  {optionItem.label}
                                                </FormLabel>
                                              </div>
                                            </FormItem>
                                          )
                                        })}
                                      </RadioGroup>
                                    </FormControl>
                                    <FormMessage className="text-xs mt-0.5 sm:mt-1 text-destructive" />
                                    {/* Hidden input to store questionId with the response */}
                                    <input
                                      type="hidden"
                                      {...register(`respuestasRadio.${globalQuestionIndex}.idPregunta`)}
                                      value={questionItem.questionId}
                                    />
                                  </div>
                                </FormItem>
                              )}
                            />
                          )
                        })}
                      </div>
                    </div>
                    {groupIndex < allGroupsArray.length - 1 && <Separator className="opacity-20 my-3" />}
                  </div>
                ))
              )}
            </div>
            {/* Navigation Buttons (Stays Visible at the bottom) */}
            <div className="flex justify-between pt-4 border-t border-border/20 mt-auto">
              <Button
                type="button"
                variant="outline"
                onClick={handlePreviousClick}
                className="px-6 py-2 text-sm shadow-sm"
                disabled={isSubmitting}
              >
                Anterior
              </Button>
              <Button
                type="submit"
                className="px-6 py-2 text-sm shadow-sm"
                disabled={isSubmitting || flatDisplayedQuestionList.length === 0}
              >
                {isSubmitting ? 'Finalizando...' : 'Finalizar Informe'}
              </Button>
            </div>
          </form>
        </Form>
      </FormProvider>
    </div>
  )
}
