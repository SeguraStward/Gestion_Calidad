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

// Ensure getOptionColors is identical to form-step7.tsx
const getOptionColors = (value: string, isSelected: boolean) => {
  if (!isSelected) {
    return 'border-border/30 bg-transparent hover:border-border/50 hover:bg-muted/20 dark:hover:bg-muted/10'
  }
  const colorMap = {
    '5': 'border-emerald-500/80 bg-emerald-500/25 dark:border-emerald-600/80 dark:bg-emerald-600/30',
    '4': 'border-green-500/80 bg-green-500/25 dark:border-green-600/80 dark:bg-green-600/30',
    '3': 'border-amber-500/80 bg-yellow-500/25 dark:border-amber-600/80 dark:bg-yellow-600/30',
    '2': 'border-orange-500/80 bg-orange-500/25 dark:border-orange-600/80 dark:bg-orange-600/30',
    '1': 'border-red-500/80 bg-red-500/25 dark:border-red-600/80 dark:bg-red-600/30'
  }
  return (
    colorMap[value as keyof typeof colorMap] || 'border-blue-500/80 bg-blue-500/25 dark:border-blue-600/80 dark:bg-blue-600/30'
  )
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

  const { gruposDePreguntas, todasLasPreguntasFiltradas } = useMemo(
    () => groupQuestionsFromReport(step7Questions),
    [step7Questions]
  )

  console.log('📊 Step 7 - Grouped questions:', Object.keys(gruposDePreguntas).length, 'groups')
  console.log('📊 Step 7 - Questions detail:', step7Questions.map(q => ({
    id: q.questionId,
    text: q.question?.substring(0, 50),
    type: q.responseType,
    hasOptions: !!q.options,
    optionsCount: q.options?.length,
    group: q.questionGroup
  })))

  useEffect(() => {
    if (step7Questions.length > 0) {
      if (initialData && initialData.respuestasRadio) {
        const formValuesForVisibleQuestions = {
          respuestasRadio: todasLasPreguntasFiltradas.map((visibleQuestion) => {
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
              const matchingOptionByLabel = visibleQuestion.options.find(opt => opt.label === responseValue)
              if (matchingOptionByLabel) {
                console.log('✅ Found matching option by label:', matchingOptionByLabel)
                responseValue = matchingOptionByLabel.value
              } else {
                // If not found by label, check if it's already a value (backwards compatibility)
                const matchingOptionByValue = visibleQuestion.options.find(opt => opt.value === responseValue)
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
          respuestasRadio: todasLasPreguntasFiltradas.map((q) => ({
            idPregunta: q.questionId,
            respuesta: ''
          }))
        }
        reset(defaultValues)
      }
    }
  }, [initialData, reset, todasLasPreguntasFiltradas, isEditing, step7Questions])

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
          Modifique su percepción sobre los aspectos del curso y desempeño estudiantil. ({todasLasPreguntasFiltradas.length}{' '}
          pregunta{todasLasPreguntasFiltradas.length !== 1 ? 's' : ''})
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
            <div className="flex-1 overflow-y-auto pr-2 pb-4 space-y-2 sm:space-y-2.5 md:space-y-3">
              {todasLasPreguntasFiltradas.length === 0 ? (
                <div className="text-center py-4 sm:py-5 text-muted-foreground">
                  <Activity className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 mx-auto mb-1 sm:mb-1.5 md:mb-2 opacity-50" />
                  <p className="text-xs sm:text-sm">No hay preguntas disponibles para este tipo de informe.</p>
                </div>
              ) : (
                Object.entries(gruposDePreguntas).map(([nombreGrupo, preguntasDelGrupo], grupoIndex, arr) => (
                  <div key={nombreGrupo}>
                    <div className="py-1.5 sm:py-2 px-1">
                      <div className="mb-1.5 sm:mb-2">
                        <h3 className="text-xs sm:text-sm font-medium text-foreground/90 leading-normal flex items-center gap-1 sm:gap-1.5">
                          <div className="w-1.5 h-1.5 bg-muted-foreground/70 rounded-full"></div>
                          {nombreGrupo}
                        </h3>
                      </div>
                      <div className="ml-1 sm:ml-2 space-y-2.5 sm:space-y-3">
                        {preguntasDelGrupo.map((pregunta) => {
                          const overallIndex = todasLasPreguntasFiltradas.findIndex((p) => p.questionId === pregunta.questionId)
                          if (overallIndex === -1) return null

                          const currentValue = watch(`respuestasRadio.${overallIndex}.respuesta`)

                          // Para preguntas tipo SELECT/SELECCION_UNICA con 5 opciones o menos, usar RadioGroup
                          if (
                            (pregunta.responseType === 'SELECT' || pregunta.responseType === 'SELECCION_UNICA') &&
                            pregunta.options &&
                            pregunta.options.length > 0 &&
                            pregunta.options.length <= 5
                          ) {
                            return (
                              <FormField
                                key={pregunta.questionId}
                                control={control}
                                name={`respuestasRadio.${overallIndex}.respuesta`}
                                render={({ field }) => (
                                  <FormItem className="space-y-1 sm:space-y-1.5">
                                    <FormLabel className="text-xs sm:text-sm font-medium text-foreground/85 leading-normal block">
                                      {pregunta.question}
                                    </FormLabel>
                                    <div className="ml-0.5 sm:ml-1">
                                      <FormControl>
                                        <RadioGroup
                                          onValueChange={field.onChange}
                                          value={field.value || ''}
                                          className="flex flex-wrap items-center gap-2 sm:gap-3"
                                        >
                                          {pregunta.options?.map((opcion) => {
                                            const isSelected = currentValue === opcion.value
                                            const colorClasses = getOptionColors(opcion.value, isSelected)
                                            return (
                                              <FormItem key={opcion.value} className="space-y-0">
                                                <div
                                                  className={`flex items-center space-x-1 sm:space-x-1.5 p-1.5 sm:p-2 rounded-md border transition-all duration-200 cursor-pointer ${colorClasses}`}
                                                >
                                                  <FormControl>
                                                    <RadioGroupItem
                                                      value={opcion.value}
                                                      id={`${field.name}-${overallIndex}-${opcion.value}`}
                                                      className="mt-0 w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4"
                                                    />
                                                  </FormControl>
                                                  <FormLabel
                                                    htmlFor={`${field.name}-${overallIndex}-${opcion.value}`}
                                                    className="text-xs sm:text-sm font-normal cursor-pointer flex-1 leading-snug text-foreground/90"
                                                  >
                                                    {opcion.label}
                                                  </FormLabel>
                                                </div>
                                              </FormItem>
                                            )
                                          })}
                                        </RadioGroup>
                                      </FormControl>
                                      <FormMessage className="text-xs mt-0.5 sm:mt-1 text-destructive" />
                                      <input
                                        type="hidden"
                                        {...register(`respuestasRadio.${overallIndex}.idPregunta`)}
                                        value={pregunta.questionId}
                                      />
                                    </div>
                                  </FormItem>
                                )}
                              />
                            )
                          }

                          // Para otros tipos de preguntas
                          return (
                            <FormField
                              key={pregunta.questionId}
                              control={control}
                              name={`respuestasRadio.${overallIndex}.respuesta`}
                              render={({ field }) => {
                                // Log rendering for debugging
                                if (pregunta.responseType === 'TEXT') {
                                  console.log('🎨 Rendering TEXT:', { id: pregunta.questionId, value: field.value })
                                } else if (pregunta.responseType === 'NUMBER') {
                                  console.log('🎨 Rendering NUMBER:', { id: pregunta.questionId, value: field.value })
                                } else if (pregunta.responseType === 'BOOLEAN') {
                                  console.log('🎨 Rendering BOOLEAN:', { id: pregunta.questionId, value: field.value })
                                }

                                return (
                                  <FormItem className="space-y-1 sm:space-y-1.5">
                                    <FormLabel className="text-xs sm:text-sm font-medium text-foreground/85 leading-normal block">
                                      <span className="inline-flex items-baseline gap-2">
                                        <span className="text-muted-foreground font-normal text-xs bg-muted/50 px-2 py-0.5 rounded-full min-w-[24px] text-center">
                                          {overallIndex + 1}
                                        </span>
                                        <span className="flex-1">{pregunta.question}</span>
                                      </span>
                                    </FormLabel>
                                    <div className="ml-0.5 sm:ml-1">
                                      {pregunta.responseType === 'TEXT' && (
                                        <FormControl>
                                          <Textarea
                                            placeholder="Escriba su respuesta aquí..."
                                            rows={3}
                                            className="resize-y bg-background/60 border-border/60"
                                            {...field}
                                          />
                                        </FormControl>
                                      )}
                                      {pregunta.responseType === 'NUMBER' && (
                                        <FormControl>
                                          <Input
                                            type="number"
                                            placeholder="Ingrese un número..."
                                            className="bg-background/60 border-border/60"
                                            {...field}
                                          />
                                        </FormControl>
                                      )}
                                      {pregunta.responseType === 'BOOLEAN' && (
                                        <FormControl>
                                          <RadioGroup
                                            onValueChange={field.onChange}
                                            value={field.value || ''}
                                            className="flex gap-4"
                                          >
                                            <div className="flex items-center space-x-2">
                                              <RadioGroupItem value="true" id={`${pregunta.questionId}-true`} />
                                              <label htmlFor={`${pregunta.questionId}-true`} className="text-sm">Sí</label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                              <RadioGroupItem value="false" id={`${pregunta.questionId}-false`} />
                                              <label htmlFor={`${pregunta.questionId}-false`} className="text-sm">No</label>
                                            </div>
                                          </RadioGroup>
                                        </FormControl>
                                      )}
                                      {(pregunta.responseType === 'SELECT' || pregunta.responseType === 'SELECCION_UNICA') &&
                                        pregunta.options &&
                                        pregunta.options.length > 5 && (
                                          <FormControl>
                                            <Select onValueChange={field.onChange} value={field.value || ''}>
                                              <SelectTrigger className="bg-background/60 border-border/60">
                                                <SelectValue placeholder="Seleccione una opción..." />
                                              </SelectTrigger>
                                              <SelectContent>
                                                {pregunta.options.map((option) => (
                                                  <SelectItem key={option.value} value={option.value}>
                                                    {option.label}
                                                  </SelectItem>
                                                ))}
                                              </SelectContent>
                                            </Select>
                                          </FormControl>
                                        )}
                                      {pregunta.responseType === 'MULTISELECT' && (
                                        <FormControl>
                                          <div className="space-y-2">
                                            {pregunta.options?.map((option) => {
                                              const currentValues = field.value ? field.value.split(',') : []
                                              const isChecked = currentValues.includes(option.value)

                                              return (
                                                <div key={option.value} className="flex items-center space-x-2">
                                                  <Checkbox
                                                    id={`${pregunta.questionId}-${option.value}`}
                                                    checked={isChecked}
                                                    onCheckedChange={(checked: boolean) => {
                                                      const newValues = checked
                                                        ? [...currentValues.filter((v) => v), option.value]
                                                        : currentValues.filter((v) => v !== option.value)
                                                      field.onChange(newValues.join(','))
                                                    }}
                                                  />
                                                  <label
                                                    htmlFor={`${pregunta.questionId}-${option.value}`}
                                                    className="text-sm font-normal"
                                                  >
                                                    {option.label}
                                                  </label>
                                                </div>
                                              )
                                            })}
                                          </div>
                                        </FormControl>
                                      )}
                                      <FormMessage className="text-xs mt-0.5 sm:mt-1 text-destructive" />
                                      <input
                                        type="hidden"
                                        {...register(`respuestasRadio.${overallIndex}.idPregunta`)}
                                        value={pregunta.questionId}
                                      />
                                    </div>
                                  </FormItem>
                                )
                              }}
                            />
                          )
                        })}
                      </div>
                    </div>
                    {grupoIndex < arr.length - 1 && <Separator className="opacity-20 my-3" />}
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
