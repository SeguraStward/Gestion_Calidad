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

// Updated getOptionColors function (consistent with form-step7-edit.tsx)
const getOptionColors = (value: string, isSelected: boolean) => {
  if (!isSelected) {
    return 'border-border/30 bg-transparent hover:border-border/50 hover:bg-muted/20 dark:hover:bg-muted/10'
  }
  const colorMap = {
    muy_bueno: 'border-emerald-500/80 bg-emerald-500/25 dark:border-emerald-600/80 dark:bg-emerald-600/30',
    bueno: 'border-green-500/80 bg-green-500/25 dark:border-green-600/80 dark:bg-green-600/30',
    muy_alto: 'border-emerald-500/80 bg-emerald-500/25 dark:border-emerald-600/80 dark:bg-emerald-600/30',
    alto: 'border-green-500/80 bg-green-500/25 dark:border-green-600/80 dark:bg-green-600/30',
    regular: 'border-amber-500/80 bg-amber-500/25 dark:border-amber-600/80 dark:bg-amber-600/30',
    medio: 'border-yellow-500/80 bg-yellow-500/25 dark:border-yellow-600/80 dark:bg-yellow-600/30',
    deficiente: 'border-red-500/80 bg-red-500/25 dark:border-red-600/80 dark:bg-red-600/30',
    bajo: 'border-orange-500/80 bg-orange-500/25 dark:border-orange-600/80 dark:bg-orange-600/30',
    '5': 'border-emerald-500/80 bg-emerald-500/25', // Totalmente de acuerdo
    '4': 'border-green-500/80 bg-green-500/25', // De acuerdo
    '3': 'border-amber-500/80 bg-amber-500/25', // Neutral
    '2': 'border-orange-500/80 bg-orange-500/25', // En desacuerdo
    '1': 'border-red-500/80 bg-red-500/25', // Totalmente en desacuerdo
    excelente: 'border-sky-500/80 bg-sky-500/25',
    siempre: 'border-teal-500/80 bg-teal-500/25',
    casi_siempre: 'border-cyan-500/80 bg-cyan-500/25',
    a_veces: 'border-indigo-500/80 bg-indigo-500/25',
    rara_vez: 'border-purple-500/80 bg-purple-500/25',
    nunca: 'border-pink-500/80 bg-pink-500/25'
  }
  return (
    colorMap[value as keyof typeof colorMap] || 'border-blue-500/80 bg-blue-500/25 dark:border-blue-600/80 dark:bg-blue-600/30'
  )
}

export function Step7Form({ formMethods, onSaveAndNext, onPrevious, totalSteps, reportType, isSubmitting }: Step7FormProps) {
  const router = useRouter()
  const { control, watch, setValue, getValues, handleSubmit, formState, register } = formMethods

  // Memoized list of questions to display based on reportType, using centralized mock
  const questionGroups = useMemo(() => {
    let questionsToFilter: Step7Question[] = step7QuestionsPageMock // Use centralized mock
    if (reportType) {
      questionsToFilter = step7QuestionsPageMock.filter((q) => {
        // Corrected typo and use centralized mock
        return !q.appliesTo || q.appliesTo.includes(reportType) || q.appliesTo.includes('TODOS')
      })
    }
    // Grouping logic
    const groups: Record<string, Step7Question[]> = {}
    questionsToFilter.forEach((question) => {
      // Use Step7Question type
      const groupKey = question.group || 'General' // Use 'group' property
      if (!groups[groupKey]) {
        groups[groupKey] = []
      }
      groups[groupKey].push(question)
    })
    // Clean up empty groups
    for (const groupName in groups) {
      if (Object.prototype.hasOwnProperty.call(groups, groupName) && groups[groupName] && groups[groupName].length === 0) {
        delete groups[groupName]
      }
    }
    return groups
  }, [reportType])

  // Flattened list of all questions to be displayed, for indexing and initialization
  const flatDisplayedQuestionList = useMemo(() => Object.values(questionGroups).flat(), [questionGroups])

  useEffect(() => {
    const currentRadioResponses = getValues('respuestasRadio')
    const initialResponses = flatDisplayedQuestionList.map((question) => {
      const existingResponse = Array.isArray(currentRadioResponses)
        ? currentRadioResponses.find((response) => response && response.idPregunta === question.questionId)
        : undefined
      return {
        idPregunta: question.questionId,
        respuesta: existingResponse?.respuesta || ''
      }
    })

    let needsUpdate = true
    if (Array.isArray(currentRadioResponses) && currentRadioResponses.length === initialResponses.length) {
      needsUpdate = !currentRadioResponses.every((currentResponse, index) => {
        const initialItem = initialResponses[index]
        return currentResponse && initialItem && currentResponse.idPregunta === initialItem.idPregunta
      })
    }

    if (needsUpdate) {
      setValue('respuestasRadio', initialResponses, { shouldValidate: false, shouldDirty: false })
    }
  }, [setValue, getValues, flatDisplayedQuestionList])

  // Handler for successful form submission
  const handleFormSubmitSuccess = async (data: Step7FormData) => {
    try {
      await onSaveAndNext(data)
      router.push('/final-reports') // Navigate after successful save
    } catch (error) {
      console.error('Error during final save or navigation:', error)
    }
  }

  // Handler for form submission errors
  const handleFormSubmitError = (errors: any) => {
    const currentValues = getValues()
    console.error('Step 7 Form Validation Errors:', errors)
    console.log('Form values at time of validation error (Step 7):', currentValues)
  }

  return (
    <FormProvider {...formMethods}>
      <Form {...formMethods}>
        <form onSubmit={handleSubmit(handleFormSubmitSuccess, handleFormSubmitError)} className="space-y-6">
          <Card>
            <CardHeader className="py-4 px-6">
              {/* User-facing: Spanish */}
              <CardTitle className="flex items-center gap-2 text-lg">
                <Activity className="w-5 h-5 text-foreground/70" />
                Paso {totalSteps > 0 ? `7 de ${totalSteps}: ` : ''}
                Percepción General y Desempeño
              </CardTitle>
              <CardDescription className="text-sm pt-0.5">
                Evalúe su percepción sobre los aspectos del curso y desempeño estudiantil. ({flatDisplayedQuestionList.length}{' '}
                pregunta{flatDisplayedQuestionList.length !== 1 ? 's' : ''})
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 md:p-6 space-y-4">
              {flatDisplayedQuestionList.length === 0 ? (
                // User-facing: Spanish
                <div className="text-center py-6 text-muted-foreground">
                  <Activity className="w-10 h-10 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No hay preguntas disponibles</p>
                  <p className="text-sm">para este tipo de informe o configuración.</p>
                </div>
              ) : (
                Object.entries(questionGroups).map(([groupName, questionsInGroup], groupIndex, allGroupsArray) => (
                  <div key={groupName}>
                    <div className="py-3 px-1">
                      <div className="mb-3">
                        {/* User-facing: Spanish (groupName comes from mock) */}
                        <h3 className="text-sm font-medium text-foreground/90 leading-normal flex items-center gap-1.5">
                          <div className="w-1.5 h-1.5 bg-muted-foreground/70 rounded-full"></div>
                          {groupName}
                        </h3>
                      </div>
                      <div className="ml-3 space-y-4">
                        {questionsInGroup.map((questionItem) => {
                          // questionItem is Step7Question
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
                                <FormItem className="space-y-2">
                                  {/* User-facing: Spanish (questionItem.question comes from mock) */}
                                  <FormLabel className="text-sm font-medium text-foreground/85 leading-normal block">
                                    {questionItem.question}
                                  </FormLabel>
                                  <div className="ml-2">
                                    <FormControl>
                                      <RadioGroup
                                        onValueChange={field.onChange}
                                        value={field.value || ''}
                                        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5"
                                      >
                                        {questionItem.options.map((optionItem: OptionFE) => {
                                          // optionItem is OptionFE
                                          const isSelected = currentRadioValue === optionItem.value
                                          const colorClasses = getOptionColors(optionItem.value, isSelected)
                                          const uniqueOptionId = `${field.name}-${globalQuestionIndex}-${optionItem.value}`
                                          return (
                                            <FormItem key={optionItem.value} className="space-y-0">
                                              <div
                                                className={`flex items-center space-x-2 p-2.5 rounded-md border transition-all duration-200 cursor-pointer ${colorClasses}`}
                                              >
                                                <FormControl>
                                                  <RadioGroupItem
                                                    value={optionItem.value}
                                                    id={uniqueOptionId}
                                                    className="mt-0 w-4 h-4"
                                                  />
                                                </FormControl>
                                                {/* User-facing: Spanish (optionItem.label comes from mock) */}
                                                <FormLabel
                                                  htmlFor={uniqueOptionId}
                                                  className="text-sm font-normal cursor-pointer flex-1 leading-snug text-foreground/90"
                                                >
                                                  {optionItem.label}
                                                </FormLabel>
                                              </div>
                                            </FormItem>
                                          )
                                        })}
                                      </RadioGroup>
                                    </FormControl>
                                    <FormMessage className="text-xs mt-1.5 text-destructive" />
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
            <CardFooter className="flex justify-between py-4 px-6">
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
