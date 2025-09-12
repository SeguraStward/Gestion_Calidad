'use client'

import React, { useEffect, useMemo } from 'react'
import { UseFormReturn, FormProvider } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import { Activity, AlertTriangle, Loader2, MessageSquareText } from 'lucide-react'
import { RadioGroup, RadioGroupItem } from '@una-gc/ui/components/radio-group'
import { Checkbox } from '@una-gc/ui/components/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@una-gc/ui/components/select'
import { Input } from '@una-gc/ui/components/input'
import { Textarea } from '@una-gc/ui/components/textarea'
import { Separator } from '@una-gc/ui/components/separator'
import { Button } from '@una-gc/ui/components/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@una-gc/ui/components/form'
import * as z from 'zod'
import { cn } from '@una-gc/ui/lib/utils'
import type { ReportType } from '../types/final-reports.types'
import { useQuestionGroupsWithQuestionsByStep } from '@/modules/final-reports/services/question-groups.service'
import type { Question, QuestionOption, QuestionGroupWithQuestions } from '@/modules/final-reports/types/question-management.types'

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
  onPrevious,
  totalSteps,
  reportType = 'TODOS',
  isSubmitting,
  initialData,
  isEditing = false
}: Step7FormProps) {
  const router = useRouter()
  const { control, watch, setValue, getValues, handleSubmit, formState, register, reset } = formMethods

  // Cargar grupos de preguntas para el paso 7
  const {
    data: questionGroupsData,
    isLoading: isLoadingQuestions,
    error: questionsError
  } = useQuestionGroupsWithQuestionsByStep(7, reportType)

  const { questionGroups, flatDisplayedQuestionList } = useMemo(() => {
    if (!questionGroupsData) return { questionGroups: {}, flatDisplayedQuestionList: [] }

    const grupos: Record<string, Question[]> = {}
    const allQuestions = questionGroupsData.flatMap(group =>
      group.questions?.filter(q => q.status === 'ACTIVE') || []
    )

    // Filtrar preguntas que aplican al tipo de reporte
    const filtered = allQuestions.filter((q) => {
      if (Array.isArray(q.appliesTo)) {
        const matchesReportType = reportType ? q.appliesTo.includes(reportType) : false
        const includesTodos = q.appliesTo.includes('TODOS')
        return matchesReportType || includesTodos
      }
      return false
    })

    // Agrupar preguntas por grupo
    questionGroupsData.forEach((group) => {
      const groupQuestions = group.questions?.filter(q =>
        q.status === 'ACTIVE' &&
        filtered.some(fq => fq.id === q.id)
      ) || []

      if (groupQuestions.length > 0) {
        grupos[group.name] = groupQuestions.sort((a, b) => (a.order || 0) - (b.order || 0))
      }
    })

    return {
      questionGroups: grupos,
      flatDisplayedQuestionList: filtered.sort((a, b) => (a.order || 0) - (b.order || 0))
    }
  }, [questionGroupsData, reportType])

  useEffect(() => {
    const defaultFormValuesBasedOnCurrentQuestions = {
      respuestasRadio: flatDisplayedQuestionList.map((q) => ({
        idPregunta: q.id!,
        respuesta: ''
      }))
    }

    if (initialData && initialData.respuestasRadio) {
      const mergedRespuestasRadio = flatDisplayedQuestionList.map((q) => {
        const existingResponse = initialData.respuestasRadio.find((r) => r.idPregunta === q.id!)
        return {
          idPregunta: q.id!,
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

  // Función para renderizar campos según el tipo de pregunta
  const renderQuestionField = (question: Question, index: number) => {
    const currentValue = watch(`respuestasRadio.${index}.respuesta`)

    // Para preguntas tipo SELECT con opciones tipo radio (1-5)
    if (question.responseType === 'SELECT' && question.options && question.options.length <= 5) {
      return (
        <FormField
          key={question.id}
          control={control}
          name={`respuestasRadio.${index}.respuesta`}
          render={({ field }) => (
            <FormItem className="space-y-1 sm:space-y-1.5">
              <FormLabel className="text-xs sm:text-sm font-medium text-foreground/85 leading-normal block">
                <span className="inline-flex items-baseline gap-2">
                  <span className="text-muted-foreground font-normal text-xs bg-muted/50 px-2 py-0.5 rounded-full min-w-[24px] text-center">
                    {index + 1}
                  </span>
                  <span className="flex-1">{question.question}</span>
                  {question.isRequired && <span className="text-destructive ml-1">*</span>}
                </span>
                {question.description && (
                  <span className="block text-xs text-muted-foreground mt-1 ml-8">
                    {question.description}
                  </span>
                )}
              </FormLabel>
              <div className="ml-0.5 sm:ml-1">
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    value={field.value || ''}
                    className="flex flex-wrap items-center gap-2 sm:gap-3"
                  >
                    {question.options?.map((optionItem: QuestionOption) => {
                      const isSelected = currentValue === optionItem.value
                      const colorClasses = getOptionColors(optionItem.value, isSelected)
                      const uniqueOptionId = `${field.name}-${index}-${optionItem.value}`
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
                <input
                  type="hidden"
                  {...register(`respuestasRadio.${index}.idPregunta`)}
                  value={question.id}
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
        key={question.id}
        control={control}
        name={`respuestasRadio.${index}.respuesta`}
        render={({ field }) => (
          <FormItem className="space-y-1 sm:space-y-1.5">
            <FormLabel className="text-xs sm:text-sm font-medium text-foreground/85 leading-normal block">
              <span className="inline-flex items-baseline gap-2">
                <span className="text-muted-foreground font-normal text-xs bg-muted/50 px-2 py-0.5 rounded-full min-w-[24px] text-center">
                  {index + 1}
                </span>
                <span className="flex-1">{question.question}</span>
                {question.isRequired && <span className="text-destructive ml-1">*</span>}
              </span>
              {question.description && (
                <span className="block text-xs text-muted-foreground mt-1 ml-8">
                  {question.description}
                </span>
              )}
            </FormLabel>
            <div className="ml-0.5 sm:ml-1">
              {question.responseType === 'TEXT' && (
                <FormControl>
                  <Textarea
                    placeholder="Escriba su respuesta aquí..."
                    rows={3}
                    className="resize-y bg-background/60 border-border/60"
                    {...field}
                  />
                </FormControl>
              )}
              {question.responseType === 'NUMBER' && (
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Ingrese un número..."
                    className="bg-background/60 border-border/60"
                    {...field}
                  />
                </FormControl>
              )}
              {question.responseType === 'BOOLEAN' && (
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    value={field.value || ''}
                    className="flex gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="true" id={`${question.id}-true`} />
                      <label htmlFor={`${question.id}-true`} className="text-sm">Sí</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="false" id={`${question.id}-false`} />
                      <label htmlFor={`${question.id}-false`} className="text-sm">No</label>
                    </div>
                  </RadioGroup>
                </FormControl>
              )}
              {question.responseType === 'SELECT' && question.options && question.options.length > 5 && (
                <FormControl>
                  <Select onValueChange={field.onChange} value={field.value || ''}>
                    <SelectTrigger className="bg-background/60 border-border/60">
                      <SelectValue placeholder="Seleccione una opción..." />
                    </SelectTrigger>
                    <SelectContent>
                      {question.options.map((option: QuestionOption) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
              )}
              {question.responseType === 'MULTISELECT' && (
                <FormControl>
                  <div className="space-y-2">
                    {question.options?.map((option: QuestionOption) => {
                      const currentValues = field.value ? field.value.split(',') : []
                      const isChecked = currentValues.includes(option.value)

                      return (
                        <div key={option.value} className="flex items-center space-x-2">
                          <Checkbox
                            id={`${question.id}-${option.value}`}
                            checked={isChecked}
                            onCheckedChange={(checked) => {
                              const newValues = checked
                                ? [...currentValues.filter(v => v), option.value]
                                : currentValues.filter(v => v !== option.value)
                              field.onChange(newValues.join(','))
                            }}
                          />
                          <label
                            htmlFor={`${question.id}-${option.value}`}
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
                {...register(`respuestasRadio.${index}.idPregunta`)}
                value={question.id}
              />
            </div>
          </FormItem>
        )}
      />
    )
  }

  // Mostrar estado de carga
  if (isLoadingQuestions) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground mb-4" />
        <p className="text-muted-foreground">Cargando preguntas...</p>
      </div>
    )
  }

  // Mostrar error de carga
  if (questionsError) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <AlertTriangle className="w-8 h-8 text-destructive mb-4" />
        <p className="text-destructive">Error al cargar las preguntas</p>
        <p className="text-muted-foreground text-sm mt-2">
          {questionsError instanceof Error ? questionsError.message : 'Error desconocido'}
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col">
      <div className="mb-4">
        <h2 className="text-xl font-semibold flex items-center gap-3">
          <Activity className="w-5 h-5 text-foreground/70" />
          Paso {totalSteps > 0 ? `7 de ${totalSteps}: ` : ''} Percepción General y Desempeño
        </h2>
        <p className="text-muted-foreground text-sm mt-1">
          Complete la evaluación y percepción general del curso{isEditing ? ' (Editando)' : ''}.
        </p>
      </div>

      {/* Fixed Navigation Buttons at Top */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border/20 pb-4 mb-6">
        <div className="flex justify-between">
          <Button type="button" variant="outline" onClick={handlePreviousClick} className="px-8">
            Anterior
          </Button>
          <Button type="submit" form="step7-form" disabled={isSubmitting} className="px-8">
            {isEditing ? 'Actualizar Informe' : 'Enviar Informe'}
          </Button>
        </div>
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
          <form id="step7-form" onSubmit={handleSubmit(handleFormSubmitSuccess, handleFormSubmitError)} className="flex-1 flex flex-col min-h-0">
            {/* Scrollable Questions Area */}
            <div className="flex-1 space-y-0 overflow-y-auto pr-2 pb-4">
              {flatDisplayedQuestionList.length === 0 ? (
                <div className="text-center py-4 sm:py-5 text-muted-foreground flex flex-col items-center justify-center h-full">
                  <Activity className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 mx-auto mb-1 sm:mb-1.5 md:mb-2 opacity-50" />
                  <p className="text-xs sm:text-sm">No hay preguntas disponibles</p>
                  <p className="text-xs sm:text-sm">para este tipo de informe o configuración.</p>
                </div>
              ) : (
                Object.entries(questionGroups).map(([groupName, questionsInGroup], groupIndex) => (
                  <div key={groupName} className="mb-6">
                    {/* Título del grupo */}
                    <div className="mb-4 p-3 bg-muted/30 rounded-lg border-l-4 border-primary">
                      <h3 className="text-sm font-semibold text-foreground/90 flex items-center gap-2">
                        <MessageSquareText className="w-4 h-4" />
                        {groupName}
                      </h3>
                    </div>

                    {/* Preguntas del grupo */}
                    <div className="space-y-0">
                      {questionsInGroup.map((questionItem, questionIndex) => {
                        const globalQuestionIndex = flatDisplayedQuestionList.findIndex(
                          (item) => item.id === questionItem.id
                        )
                        if (globalQuestionIndex === -1) return null

                        return (
                          <div key={questionItem.id}>
                            <div className="py-4 px-1">
                              {renderQuestionField(questionItem, globalQuestionIndex)}
                            </div>
                            {questionIndex < questionsInGroup.length - 1 && <Separator className="opacity-20 my-1" />}
                          </div>
                        )
                      })}
                    </div>

                    {/* Separador entre grupos */}
                    {groupIndex < Object.entries(questionGroups).length - 1 && (
                      <Separator className="opacity-40 my-6" />
                    )}
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
