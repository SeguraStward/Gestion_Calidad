'use client'

import React, { useEffect, useMemo } from 'react'
import { UseFormReturn, FormProvider } from 'react-hook-form'
import * as z from 'zod'
import { toast } from 'sonner'
import { Button } from '@una-gc/ui/components/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@una-gc/ui/components/form'
import { RadioGroup, RadioGroupItem } from '@una-gc/ui/components/radio-group'
import { Separator } from '@una-gc/ui/components/separator'
import { Input } from '@una-gc/ui/components/input'
import { Textarea } from '@una-gc/ui/components/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@una-gc/ui/components/select'
import { Checkbox } from '@una-gc/ui/components/checkbox'
import { Activity, Loader2 } from 'lucide-react'
import type { FullFinalReport, FinalReportEvaluationFE, ReportType } from '@/modules/final-reports/types/final-reports.types'
import { useQuestionsByStep } from '@/modules/final-reports/services/questions.service'

// Schema for a single radio response item
const respuestaRadioStep7Schema = z.object({
  idPregunta: z.string(),
  respuesta: z.string().min(1, 'Debe seleccionar una opción.')
})

// Schema for the entire step 7 form data
export const step7Schema = z.object({
  respuestasRadio: z.array(respuestaRadioStep7Schema)
})

export type Step7FormData = z.infer<typeof step7Schema>

interface Step7EditFormProps {
  formMethods: UseFormReturn<Step7FormData>
  onSaveAndNext: (data: Step7FormData) => void
  onPrevious?: (data: Step7FormData) => void
  totalSteps: number
  initialData?: Step7FormData | null
  isEditing?: boolean
  reportType: ReportType
  onFinalSubmit: () => Promise<void>
  report?: FullFinalReport | null
}

// Helper to group questions from report evaluation
const groupQuestionsFromReport = (evaluations: FinalReportEvaluationFE[]) => {
  const grupos: Record<string, FinalReportEvaluationFE[]> = {}

  evaluations.forEach((evaluation) => {
    const groupName = evaluation.questionGroup || 'General'
    if (!grupos[groupName]) {
      grupos[groupName] = []
    }
    grupos[groupName].push(evaluation)
  })

  return { gruposDePreguntas: grupos, todasLasPreguntasFiltradas: evaluations }
}

// Color function for radio options - matches step 5 styling
const getOptionColors = (value: string, isSelected: boolean): string => {
  if (!isSelected) {
    return 'bg-background/40 border-border/40 hover:bg-background/60 hover:border-border/60'
  }

  const lowerValue = value.toLowerCase()

  // Positive/High values - Green/Emerald tones
  if (
    lowerValue.includes('excelente') ||
    lowerValue.includes('muy_bueno') ||
    lowerValue.includes('siempre') ||
    lowerValue.includes('mas_90') ||
    lowerValue.includes('todas')
  ) {
    return 'bg-emerald-500/20 border-emerald-500/60 hover:bg-emerald-500/30'
  }

  // Good/Medium-High values - Blue/Cyan tones
  if (
    lowerValue.includes('bueno') ||
    lowerValue.includes('frecuentemente') ||
    lowerValue.includes('70_89') ||
    lowerValue.includes('mayoria') ||
    lowerValue.includes('mensual')
  ) {
    return 'bg-blue-500/20 border-blue-500/60 hover:bg-blue-500/30'
  }

  // Medium values - Yellow/Amber tones
  if (
    lowerValue.includes('regular') ||
    lowerValue.includes('ocasionalmente') ||
    lowerValue.includes('50_69') ||
    lowerValue.includes('algunas') ||
    lowerValue.includes('trimestral') ||
    lowerValue.includes('semestral')
  ) {
    return 'bg-amber-500/20 border-amber-500/60 hover:bg-amber-500/30'
  }

  // Low/Negative values - Orange/Red tones
  if (
    lowerValue.includes('deficiente') ||
    lowerValue.includes('nunca') ||
    lowerValue.includes('menos_50') ||
    lowerValue.includes('pocas') ||
    lowerValue.includes('ninguna') ||
    lowerValue.includes('anual')
  ) {
    return 'bg-orange-500/20 border-orange-500/60 hover:bg-orange-500/30'
  }

  // Process-related or neutral
  if (lowerValue.includes('proceso') || lowerValue.includes('bienal')) {
    return 'bg-purple-500/20 border-purple-500/60 hover:bg-purple-500/30'
  }

  // Default for any other selected value
  return 'bg-primary/20 border-primary/60 hover:bg-primary/30'
}

export function Step7EditForm({
  formMethods,
  onSaveAndNext,
  onPrevious,
  totalSteps,
  initialData,
  isEditing = true,
  reportType,
  onFinalSubmit,
  report
}: Step7EditFormProps) {
  const { control, handleSubmit, reset, watch, register, getValues } = formMethods

  // Load step 7 questions from the database
  const { data: step7QuestionsDB, isLoading: loadingStep7Questions } = useQuestionsByStep(7, reportType)

  // Extract step 7 questions by matching with DB questions
  const step7Questions = useMemo(() => {
    if (!report?.evaluation || !step7QuestionsDB) return []

    console.log('🔍 Step 7 Edit - DB Questions:', step7QuestionsDB.length, step7QuestionsDB.map(q => q.id))
    console.log('🔍 Step 7 Edit - Report Evaluation:', report.evaluation.length, report.evaluation.map(e => e.questionId))

    // Get the IDs of step 7 questions from DB
    const step7QuestionIds = new Set(step7QuestionsDB.map(q => q.id))

    // Filter evaluation to only include questions that are in step 7
    const filtered = report.evaluation.filter(e => step7QuestionIds.has(e.questionId))

    console.log('🔍 Step 7 Edit - Filtered Questions:', filtered.length, filtered.map(q => ({ id: q.questionId, hasOptions: !!q.options, optionsCount: q.options?.length })))

    return filtered
  }, [report, step7QuestionsDB])

  console.log('📊 Step 7 - Questions loaded:', step7Questions.length)
  console.log('📊 Step 7 - Questions detail:', step7Questions.map(q => ({
    id: q.questionId,
    text: q.question?.substring(0, 50),
    type: q.responseType,
    hasOptions: !!q.options,
    optionsCount: q.options?.length,
    response: q.response,
    group: q.questionGroup
  })))

  useEffect(() => {
    if (step7Questions.length > 0) {
      if (initialData && initialData.respuestasRadio) {
        const formValuesForVisibleQuestions = {
          respuestasRadio: step7Questions.map((visibleQuestion) => {
            const existingAnswer = initialData.respuestasRadio.find((r) => r.idPregunta === visibleQuestion.questionId)

            // Start with existing answer or the stored response
            let responseValue = existingAnswer?.respuesta || visibleQuestion.response || ''

            console.log('🔄 Step 7 - Processing question:', {
              id: visibleQuestion.questionId,
              type: visibleQuestion.responseType,
              storedResponse: visibleQuestion.response,
              hasOptions: !!visibleQuestion.options,
              optionsCount: visibleQuestion.options?.length
            })

            // For SELECT questions, convert label back to value
            if (responseValue && visibleQuestion.options && visibleQuestion.options.length > 0) {
              console.log('🔄 Step 7 SELECT conversion:', {
                storedValue: responseValue,
                availableOptions: visibleQuestion.options
              })
              // Try to find by label first (new format)
              const matchingOptionByLabel = visibleQuestion.options.find((opt) => opt.label === responseValue)
              if (matchingOptionByLabel) {
                console.log('✅ Found matching option by label:', matchingOptionByLabel)
                responseValue = matchingOptionByLabel.value
              } else {
                // If not found by label, check if it's already a value (backwards compatibility)
                const matchingOptionByValue = visibleQuestion.options.find((opt) => opt.value === responseValue)
                console.log('⚠️ No match by label, trying by value:', matchingOptionByValue)
                if (matchingOptionByValue) {
                  responseValue = matchingOptionByValue.value
                }
              }
            }

            return {
              idPregunta: visibleQuestion.questionId,
              respuesta: responseValue
            }
          })
        }
        console.log('📝 Step 7 - Final form values:', formValuesForVisibleQuestions.respuestasRadio)
        reset(formValuesForVisibleQuestions)
      } else if (!isEditing) {
        const defaultValues = {
          respuestasRadio: step7Questions.map((q) => ({
            idPregunta: q.questionId,
            respuesta: ''
          }))
        }
        reset(defaultValues)
      }
    }
  }, [initialData, reset, step7Questions, isEditing])

  const handleValidationErrors = (errors: any) => {
    toast.error('Por favor, corrija los errores en el formulario del Paso 7.')
  }

  const localSubmitAndFinalize = async (data: Step7FormData) => {
    onSaveAndNext(data)
    await onFinalSubmit()
  }

  const handlePreviousClickInternal = () => {
    const currentData = getValues()
    if (onPrevious) {
      onPrevious(currentData)
    }
  }

  const handlePreviousClick = () => {
    if (onPrevious) {
      const currentData = getValues()
      onPrevious(currentData)
    }
  }

  // Render field based on question responseType - matches step 5 structure
  const renderQuestionField = (question: FinalReportEvaluationFE, index: number) => {
    return (
      <FormField
        key={question.questionId}
        control={control}
        name={`respuestasRadio.${index}.respuesta`}
        render={({ field, fieldState }) => {
          // Log rendering for debugging
          console.log(`🎨 Rendering ${question.responseType}:`, {
            id: question.questionId,
            value: field.value,
            optionsCount: question.options?.length
          })

          switch (question.responseType) {
            case 'TEXT':
              return (
                <FormControl>
                  <Textarea
                    placeholder="Escriba su respuesta aquí..."
                    rows={3}
                    className="resize-y bg-background/60 border-border/60"
                    {...field}
                  />
                </FormControl>
              )

            case 'NUMBER':
              return (
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Ingrese un número..."
                    className="bg-background/60 border-border/60"
                    {...field}
                  />
                </FormControl>
              )

            case 'BOOLEAN':
              return (
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    value={field.value || ''}
                    className="flex gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="true" id={`${question.questionId}-true`} />
                      <label htmlFor={`${question.questionId}-true`} className="text-sm">Sí</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="false" id={`${question.questionId}-false`} />
                      <label htmlFor={`${question.questionId}-false`} className="text-sm">No</label>
                    </div>
                  </RadioGroup>
                </FormControl>
              )

            case 'SELECT':
            case 'SELECCION_UNICA':
              // Use RadioGroup for 5 or fewer options (matches step 5 style)
              if (question.options && question.options.length > 0 && question.options.length <= 5) {
                return (
                  <FormControl>
                    <RadioGroup
                      key={`${question.questionId}-${field.value}`}
                      onValueChange={field.onChange}
                      value={field.value || ''}
                      className="flex flex-wrap items-center gap-2 sm:gap-3"
                    >
                      {question.options.map((option) => {
                        const isSelected = field.value === option.value
                        const colorClasses = getOptionColors(option.value, isSelected)
                        return (
                          <FormItem key={option.value} className="space-y-0">
                            <div
                              className={`flex items-center space-x-1 sm:space-x-1.5 p-1.5 sm:p-2 rounded-md border transition-all duration-200 cursor-pointer ${colorClasses}`}
                            >
                              <FormControl>
                                <RadioGroupItem
                                  value={option.value}
                                  id={`${question.questionId}-${option.value}`}
                                  className="mt-0 w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4"
                                />
                              </FormControl>
                              <FormLabel
                                htmlFor={`${question.questionId}-${option.value}`}
                                className="text-xs sm:text-sm font-normal cursor-pointer flex-1 leading-snug text-foreground/90"
                              >
                                {option.label}
                              </FormLabel>
                            </div>
                          </FormItem>
                        )
                      })}
                    </RadioGroup>
                  </FormControl>
                )
              }

              // Use Select dropdown for more than 5 options
              return (
                <FormControl>
                  <Select
                    key={`${question.questionId}-${field.value}`}
                    onValueChange={field.onChange}
                    value={field.value || ''}
                    defaultValue={field.value || ''}
                  >
                    <SelectTrigger className="bg-background/60 border-border/60">
                      <SelectValue placeholder="Seleccione una opción..." />
                    </SelectTrigger>
                    <SelectContent>
                      {question.options?.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
              )

            case 'MULTISELECT':
            case 'SELECCION_MULTIPLE':
              return (
                <div className="space-y-2">
                  {question.options?.map((option) => {
                    const currentValues = field.value ? field.value.split(',') : []
                    const isChecked = currentValues.includes(option.value)

                    return (
                      <div key={option.value} className="flex items-center space-x-2">
                        <Checkbox
                          id={`${question.questionId}-${option.value}`}
                          checked={isChecked}
                          onCheckedChange={(checked: boolean) => {
                            const newValues = checked
                              ? [...currentValues.filter((v) => v), option.value]
                              : currentValues.filter((v) => v !== option.value)
                            field.onChange(newValues.join(','))
                          }}
                        />
                        <label htmlFor={`${question.questionId}-${option.value}`} className="text-sm font-normal cursor-pointer">
                          {option.label}
                        </label>
                      </div>
                    )
                  })}
                </div>
              )

            default:
              return (
                <FormControl>
                  <Input
                    type="text"
                    placeholder="Ingrese su respuesta..."
                    className="bg-background/60 border-border/60"
                    {...field}
                  />
                </FormControl>
              )
          }
        }}
      />
    )
  }

  // Show loading state while questions are being loaded
  if (loadingStep7Questions || !step7QuestionsDB) {
    return (
      <div className="p-4 md:p-6 h-full flex flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
        <p className="text-muted-foreground">Cargando preguntas del paso 7...</p>
      </div>
    )
  }

  if (!report) {
    return (
      <div className="p-4 md:p-6 h-full flex flex-col items-center justify-center">
        <p className="text-muted-foreground">No se encontró el reporte.</p>
      </div>
    )
  }

  if (step7Questions.length === 0) {
    return (
      <div className="p-4 md:p-6 h-full flex flex-col items-center justify-center">
        <p className="text-muted-foreground">No hay preguntas del paso 7 guardadas en este reporte.</p>
        <p className="text-sm text-muted-foreground mt-2">Esto puede suceder si no respondió ninguna pregunta en el paso 7 al crear el reporte.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col">
      <div className="mb-4">
        <h2 className="text-xl font-semibold flex items-center gap-3">
          <Activity className="w-5 h-5 text-foreground/70" />
          Paso {totalSteps > 0 ? `7 de ${totalSteps}: ` : ''}
          Percepción General y Desempeño (Editando)
        </h2>
        <p className="text-muted-foreground text-sm mt-1">
          Modifique su percepción sobre los aspectos del curso y desempeño estudiantil. ({step7Questions.length}{' '}
          pregunta{step7Questions.length !== 1 ? 's' : ''})
        </p>
      </div>

      {/* Fixed Navigation Buttons at Top */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border/20 pb-4 mb-6">
        <div className="flex justify-between">
          <Button type="button" variant="outline" onClick={handlePreviousClickInternal} className="px-8">
            Anterior
          </Button>
          <Button type="submit" form="step7-edit-form" className="px-8">
            Actualizar Informe
          </Button>
        </div>
      </div>

      <FormProvider {...formMethods}>
        <Form {...formMethods}>
          <form id="step7-edit-form" onSubmit={handleSubmit(localSubmitAndFinalize, handleValidationErrors)} className="flex-1 flex flex-col min-h-0">
            {/* Scrollable Questions Area */}
            <div className="flex-1 space-y-0 overflow-y-auto pr-2 pb-4">
              {step7Questions.length === 0 ? (
                <div className="text-center py-4 sm:py-5 text-muted-foreground">
                  <Activity className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 mx-auto mb-1 sm:mb-1.5 md:mb-2 opacity-50" />
                  <p className="text-xs sm:text-sm">No hay preguntas disponibles para este paso.</p>
                </div>
              ) : (
                step7Questions.map((question, index) => (
                  <div key={question.questionId}>
                    <div className="py-4 px-1">
                      <FormItem className="space-y-2.5">
                        <FormLabel className="text-sm font-medium leading-relaxed text-foreground/90 block">
                          <span className="inline-flex items-baseline gap-2">
                            <span className="text-muted-foreground font-normal text-xs bg-muted/50 px-2 py-0.5 rounded-full min-w-[24px] text-center">
                              {index + 1}
                            </span>
                            <span className="flex-1">{question.question}</span>
                            <span className="text-destructive ml-1">*</span>
                          </span>
                        </FormLabel>
                        <div className="ml-6">
                          {renderQuestionField(question, index)}
                          <input type="hidden" {...register(`respuestasRadio.${index}.idPregunta`)} value={question.questionId} />
                        </div>
                      </FormItem>
                    </div>
                    {index < step7Questions.length - 1 && <Separator className="opacity-20 my-1" />}
                  </div>
                ))
              )}
            </div>
          </form>
        </Form>
      </FormProvider>
    </div>
  )
}
