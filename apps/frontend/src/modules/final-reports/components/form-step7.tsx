'use client'

import React, { useEffect, useMemo } from 'react'
import { UseFormReturn, FormProvider } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import { Activity } from 'lucide-react'
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
  respuestasRadio: z.array(radioResponseSchema)
})

export type Step7FormData = z.infer<typeof step7Schema>

interface Step7FormProps {
  formMethods: UseFormReturn<Step7FormData>
  onSaveAndNext: (data: Step7FormData) => void | Promise<void>
  onPrevious: () => void
  totalSteps: number
  reportType?: ReportType
  isSubmitting?: boolean
}

// Updated getOptionColors function (ensure it's complete)
const getOptionColors = (value: string, isSelected: boolean) => {
  if (!isSelected) {
    return 'border-border/30 bg-transparent hover:border-border/50 hover:bg-muted/20 dark:hover:bg-muted/10'
  }
  const colorMap = {
    '5': 'border-emerald-500/80 bg-emerald-500/25 dark:border-emerald-600/80 dark:bg-emerald-600/30', // Muy bueno
    '4': 'border-green-500/80 bg-green-500/25 dark:border-green-600/80 dark:bg-green-600/30', // Bueno
    '3': 'border-amber-500/80 bg-yellow-500/25 dark:border-amber-600/80 dark:bg-yellow-600/30', // Regular
    '2': 'border-orange-500/80 bg-orange-500/25 dark:border-orange-600/80 dark:bg-orange-600/30', // Malo
    '1': 'border-red-500/80 bg-red-500/25 dark:border-red-600/80 dark:bg-red-600/30' // Muy malo
  }
  return (
    colorMap[value as keyof typeof colorMap] || 'border-blue-500/80 bg-blue-500/25 dark:border-blue-600/80 dark:bg-blue-600/30'
  )
}

export function Step7Form({ formMethods, onSaveAndNext, onPrevious, totalSteps, reportType, isSubmitting }: Step7FormProps) {
  const router = useRouter()
  const { control, watch, setValue, getValues, handleSubmit, formState, register } = formMethods

  const { questionGroups, flatDisplayedQuestionList } = useMemo(() => {
    const grupos: Record<string, Step7Question[]> = {}
    const filtered = step7QuestionsPageMock.filter((q) => {
      if (Array.isArray(q.appliesTo)) {
        // Check if reportType is defined before using it in includes
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
    // Initialize form with empty responses for all applicable questions
    const initialFormValues = flatDisplayedQuestionList.map((q) => ({
      idPregunta: q.questionId,
      respuesta: ''
    }))
    formMethods.reset({ respuestasRadio: initialFormValues })
  }, [flatDisplayedQuestionList, formMethods])

  const handleFormSubmitSuccess = (data: Step7FormData) => {
    onSaveAndNext(data)
  }

  const handleFormSubmitError = (errors: any) => {
    console.error('Step 7 Form Validation Errors:', errors)
    // Optionally, show a generic toast error
    // toast.error('Por favor corrija los errores en el formulario.');
  }

  return (
    <FormProvider {...formMethods}>
      <Form {...formMethods}>
        <form onSubmit={handleSubmit(handleFormSubmitSuccess, handleFormSubmitError)} className="flex flex-col h-full">
          <Card className="flex flex-col flex-1 min-h-0">
            <CardHeader className="py-2.5 px-3 sm:px-4 md:py-3 md:px-5">
              <CardTitle className="flex items-center gap-1.5 sm:gap-2 text-base sm:text-md md:text-lg">
                <Activity className="w-4 h-4 sm:w-4 sm:h-4 md:w-5 md:h-5 text-foreground/70" />
                Paso {totalSteps > 0 ? `7 de ${totalSteps}: ` : ''}
                Percepción General y Desempeño
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm pt-0.5">
                Evalúe su percepción sobre los aspectos del curso y desempeño estudiantil. ({flatDisplayedQuestionList.length}{' '}
                pregunta{flatDisplayedQuestionList.length !== 1 ? 's' : ''})
              </CardDescription>
            </CardHeader>

            <CardContent className="flex-1 overflow-y-auto p-2 sm:p-2.5 md:p-3 space-y-2 sm:space-y-2.5 md:space-y-3">
              {flatDisplayedQuestionList.length === 0 ? (
                <div className="text-center py-4 sm:py-5 text-muted-foreground">
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
                                        className="flex flex-wrap items-center gap-1.5 sm:gap-2"
                                      >
                                        {questionItem.options.map((optionItem: OptionFE) => {
                                          const isSelected = currentRadioValue === optionItem.value
                                          const colorClasses = getOptionColors(optionItem.value, isSelected) // Value is '1', '2', etc.
                                          const uniqueOptionId = `${field.name}-${globalQuestionIndex}-${optionItem.value}`
                                          return (
                                            <FormItem key={optionItem.value} className="space-y-0">
                                              <div
                                                className={`flex items-center space-x-1 sm:space-x-1.5 p-1.5 sm:p-2 rounded-md border transition-all duration-200 cursor-pointer ${colorClasses}`}
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
            </CardContent>

            <CardFooter className="flex justify-between py-2.5 px-3 sm:px-4 md:py-3 md:px-5">
              {/* User-facing: Spanish */}
              <Button
                type="button"
                variant="outline"
                onClick={onPrevious}
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
            </CardFooter>
          </Card>
        </form>
      </Form>
    </FormProvider>
  )
}
