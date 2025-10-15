'use client'

import React, { useEffect, useMemo } from 'react'
import { UseFormReturn, FormProvider } from 'react-hook-form'
import * as z from 'zod'
import { Button } from '@una-gc/ui/components/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@una-gc/ui/components/form'
import { Textarea } from '@una-gc/ui/components/textarea'
import { Input } from '@una-gc/ui/components/input'
import { RadioGroup, RadioGroupItem } from '@una-gc/ui/components/radio-group'
import { Checkbox } from '@una-gc/ui/components/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@una-gc/ui/components/select'
import { Separator } from '@una-gc/ui/components/separator'
import { MessageSquareText, AlertTriangle, Loader2 } from 'lucide-react'
import { cn } from '@una-gc/ui/lib/utils'
import type { FullFinalReport, FinalReportEvaluationFE, ReportType } from '@/modules/final-reports/types/final-reports.types'
import { useQuestionsByStep } from '@/modules/final-reports/services/questions.service'

// Schema for a single response item
const respuestaStep5Schema = z.object({
  idPregunta: z.string(),
  respuesta: z.string().min(1, 'Este campo es requerido.').refine((val) => val.trim().length > 0, {
    message: 'Este campo es requerido.'
  })
})

// Schema for the entire step 5 form data
export const step5Schema = z.object({
  respuestas: z.array(respuestaStep5Schema)
})

export type Step5FormData = z.infer<typeof step5Schema>

export function transformReportToStep5Data(report: FullFinalReport): Step5FormData | null {
  // Filter evaluation items for step 5
  const step5Evaluations = report.evaluation?.filter(e => {
    // Step 5 questions typically have TEXT, NUMBER, BOOLEAN, SELECT, or MULTISELECT responseType
    // and are NOT in the 'herramientas' or 'percepcion_calidad' groups
    return e.questionGroup !== 'herramientas' &&
      e.questionGroup !== 'percepcion_calidad' &&
      e.questionGroup !== 'percepcion_general'
  }) || []

  const respuestas = step5Evaluations.map((evaluation) => ({
    idPregunta: evaluation.questionId,
    respuesta: evaluation.response || ''
  }))

  return { respuestas }
}

interface Step5EditFormProps {
  formMethods: UseFormReturn<Step5FormData>
  onSaveAndNext: (data: Step5FormData) => void
  onPrevious?: (data: Step5FormData) => void
  totalSteps: number
  initialData?: Step5FormData | null
  isEditing?: boolean
  report?: FullFinalReport | null
  reportType?: ReportType
}

// Neutral color function for radio options
const getOptionColors = (value: string, isSelected: boolean): string => {
  if (!isSelected) {
    return 'bg-background border-border hover:bg-muted/50'
  }

  // Selected state - neutral blue/primary color
  return 'bg-primary/10 border-primary hover:bg-primary/20'
}

export function Step5EditForm({
  formMethods,
  onSaveAndNext,
  onPrevious,
  totalSteps,
  initialData,
  isEditing = true,
  report,
  reportType = 'TODOS'
}: Step5EditFormProps) {
  const { control, handleSubmit, reset, register, formState, getValues } = formMethods

  // Load step 5 questions from the database
  const { data: step5QuestionsDB, isLoading: loadingStep5Questions } = useQuestionsByStep(5, reportType)

  // Extract step 5 questions by matching with DB questions
  const step5Questions = useMemo(() => {
    if (!report?.evaluation || !step5QuestionsDB) return []

    console.log('🔍 Step 5 Edit - DB Questions:', step5QuestionsDB.length, step5QuestionsDB.map(q => q.id))
    console.log('🔍 Step 5 Edit - Report Evaluation:', report.evaluation.length, report.evaluation.map(e => e.questionId))

    // Get the IDs of step 5 questions from DB
    const step5QuestionIds = new Set(step5QuestionsDB.map(q => q.id))

    // Filter evaluation to only include questions that are in step 5
    const filtered = report.evaluation.filter(e => step5QuestionIds.has(e.questionId))

    console.log('🔍 Step 5 Edit - Filtered Questions:', filtered.length, filtered.map(q => ({ id: q.questionId, hasOptions: !!q.options, optionsCount: q.options?.length })))

    return filtered
  }, [report, step5QuestionsDB])

  useEffect(() => {
    if (step5Questions.length > 0) {
      const currentAnswers = initialData?.respuestas || []
      const initialFormValues = step5Questions.map((question) => {
        const existing = currentAnswers.find((r) => r.idPregunta === question.questionId)
        let respuesta = existing?.respuesta || question.response || ''

        console.log('🔄 Step 5 - Processing question:', {
          id: question.questionId,
          type: question.responseType,
          storedResponse: question.response,
          hasOptions: !!question.options,
          optionsCount: question.options?.length
        })

        // For SELECT fields, convert label back to value for the form
        if (question.responseType === 'SELECT' && question.options && respuesta) {
          console.log('🔄 SELECT conversion:', {
            storedValue: respuesta,
            availableOptions: question.options
          })
          const matchingOption = question.options.find((opt) => opt.label === respuesta)
          if (matchingOption) {
            console.log('✅ Found matching option by label:', matchingOption)
            respuesta = matchingOption.value
          } else {
            // If no match found, try to use it as value (backwards compatibility)
            const byValue = question.options.find((opt) => opt.value === respuesta)
            console.log('⚠️ No match by label, trying by value:', byValue)
            if (byValue) {
              respuesta = byValue.value
            }
          }
        }

        return {
          idPregunta: question.questionId,
          respuesta: respuesta
        }
      })
      console.log('📝 Step 5 - Final form values:', initialFormValues)
      reset({ respuestas: initialFormValues })
    }
  }, [step5Questions, initialData, reset])

  const handlePreviousClick = () => {
    if (onPrevious) {
      const currentData = getValues()
      onPrevious(currentData)
    }
  }

  // Render field based on question responseType
  const renderQuestionField = (question: FinalReportEvaluationFE, index: number) => {
    return (
      <FormField
        control={control}
        name={`respuestas.${index}.respuesta`}
        render={({ field, fieldState }) => {
          switch (question.responseType) {
            case 'TEXT':
              return (
                <FormControl>
                  <Textarea
                    placeholder="Escriba su respuesta aquí..."
                    rows={3}
                    className={cn(
                      'resize-y bg-background/60 border-border/60 focus:border-border focus:bg-background transition-all duration-200 text-sm leading-relaxed shadow-sm',
                      fieldState.error && 'border-destructive focus-visible:ring-destructive/50'
                    )}
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
                    className={cn(
                      'bg-background/60 border-border/60 focus:border-background transition-all duration-200 text-sm shadow-sm',
                      fieldState.error && 'border-destructive focus-visible:ring-destructive/50'
                    )}
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
              console.log('🎨 Rendering SELECT:', {
                questionId: question.questionId,
                fieldValue: field.value,
                optionsCount: question.options?.length,
                options: question.options?.map(o => ({ value: o.value, label: o.label }))
              })

              // Use RadioGroup for 5 or fewer options (matches step 7 style)
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
                          onCheckedChange={(checked) => {
                            const newValues = checked
                              ? [...currentValues.filter(v => v), option.value]
                              : currentValues.filter(v => v !== option.value)
                            field.onChange(newValues.join(','))
                          }}
                        />
                        <label
                          htmlFor={`${question.questionId}-${option.value}`}
                          className="text-sm font-normal"
                        >
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
                  <Textarea
                    placeholder="Escriba su respuesta aquí..."
                    rows={3}
                    className={cn(
                      'resize-y bg-background/60 border-border/60',
                      fieldState.error && 'border-destructive'
                    )}
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
  if (loadingStep5Questions || !step5QuestionsDB) {
    return (
      <div className="p-4 md:p-6 h-full flex flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
        <p className="text-muted-foreground">Cargando preguntas del paso 5...</p>
      </div>
    )
  }

  if (!report || step5Questions.length === 0) {
    return (
      <div className="p-4 md:p-6 h-full flex flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
        <p className="text-muted-foreground">Cargando preguntas...</p>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 h-full flex flex-col">
      {/* Header Section (Stays Visible) */}
      <div className="mb-4">
        <h2 className="text-xl font-semibold flex items-center gap-3">
          <MessageSquareText className="w-5 h-5 text-foreground/70" />
          Paso {totalSteps > 0 ? `5 de ${totalSteps}: ` : ''} Reflexión y Análisis del Curso (Editando)
        </h2>
        <p className="text-muted-foreground text-sm mt-1">Modifique sus respuestas sobre el desarrollo y resultados del curso.</p>
      </div>

      {/* Fixed Navigation Buttons at Top */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border/20 pb-4 mb-6">
        <div className="flex justify-between">
          <Button type="button" variant="outline" onClick={handlePreviousClick} className="px-8">
            Anterior
          </Button>
          <Button type="submit" form="step5-edit-form" className="px-8">
            Siguiente
          </Button>
        </div>
      </div>

      {/* General Form Error Message */}
      {formState.errors.respuestas?.root && (
        <div className="mb-3 p-3 rounded-md flex items-center text-sm bg-destructive/10 text-destructive border border-destructive/30">
          <AlertTriangle className="mr-2 h-5 w-5" />
          <span>{formState.errors.respuestas.root.message}</span>
        </div>
      )}
      {formState.errors.respuestas &&
        !formState.errors.respuestas.root &&
        typeof formState.errors.respuestas.message === 'string' && (
          <div className="mb-3 p-3 rounded-md flex items-center text-sm bg-destructive/10 text-destructive border border-destructive/30">
            <AlertTriangle className="mr-2 h-5 w-5" />
            <span>{formState.errors.respuestas.message}</span>
          </div>
        )}

      <FormProvider {...formMethods}>
        <Form {...formMethods}>
          <form id="step5-edit-form" onSubmit={handleSubmit(onSaveAndNext)} className="flex-1 flex flex-col min-h-0">
            {/* Scrollable Questions Area */}
            <div className="flex-1 space-y-0 overflow-y-auto pr-2 pb-4">
              {step5Questions.map((question, index) => {
                const fieldError = formState.errors.respuestas?.[index]?.respuesta
                return (
                  <div key={question.questionId}>
                    <div className={`py-4 px-1 rounded-lg transition-colors ${fieldError ? 'bg-destructive/5 border-2 border-destructive/50' : ''}`}>
                      <FormItem className="space-y-2.5">
                        <FormLabel className="text-sm font-medium leading-relaxed text-foreground/90 block">
                          <span className="inline-flex items-baseline gap-2">
                            <span className="text-muted-foreground font-normal text-xs bg-muted/50 px-2 py-0.5 rounded-full min-w-[24px] text-center">
                              {index + 1}
                            </span>
                            <span className="flex-1">{question.question}</span>
                          </span>
                        </FormLabel>
                        <div className="ml-6">
                          {renderQuestionField(question, index)}
                          <input type="hidden" {...register(`respuestas.${index}.idPregunta`)} value={question.questionId} />
                        </div>
                      </FormItem>
                    </div>
                    {index < step5Questions.length - 1 && <Separator className="opacity-20 my-1" />}
                  </div>
                )
              })}
            </div>
          </form>
        </Form>
      </FormProvider>
    </div>
  )
}
