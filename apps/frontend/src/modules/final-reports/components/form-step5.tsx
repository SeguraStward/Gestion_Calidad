'use client'

import React, { useEffect } from 'react'
import { UseFormReturn, FormProvider } from 'react-hook-form'
import * as z from 'zod'
import { Button } from '@una-gc/ui/components/button'
import { Form, FormControl, FormField, FormItem, FormLabel } from '@una-gc/ui/components/form'
import { Textarea } from '@una-gc/ui/components/textarea'
import { Input } from '@una-gc/ui/components/input'
import { RadioGroup, RadioGroupItem } from '@una-gc/ui/components/radio-group'
import { Checkbox } from '@una-gc/ui/components/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@una-gc/ui/components/select'
import { Separator } from '@una-gc/ui/components/separator'
import { MessageSquareText, AlertTriangle, Loader2 } from 'lucide-react'
import { cn } from '@una-gc/ui/lib/utils'
import { useQuestionGroupsWithQuestionsByStep } from '@/modules/final-reports/services/question-groups.service'
import type { ReportType } from '@/modules/final-reports/types/final-reports.types'
import type { Question, QuestionOption } from '@/modules/final-reports/types/question-management.types'

const respuestaSchema = z.object({
  idPregunta: z.string(),
  respuesta: z.string().min(1, 'Este campo es requerido.').refine((val) => val.trim().length > 0, {
    message: 'Este campo es requerido.'
  })
})

export const step5Schema = z.object({
  respuestas: z.array(respuestaSchema)
})

export type Step5FormData = z.infer<typeof step5Schema>

interface Step5FormProps {
  formMethods: UseFormReturn<Step5FormData>
  onSaveAndNext: (data: Step5FormData) => void
  onPrevious: (data: Step5FormData) => void
  totalSteps: number
  initialData?: Step5FormData | null
  isEditing?: boolean
  reportType?: ReportType
}

export function Step5Form({
  formMethods,
  onSaveAndNext,
  onPrevious,
  totalSteps,
  initialData,
  isEditing = false,
  reportType = 'TODOS'
}: Step5FormProps) {
  const { control, handleSubmit, reset, register, formState, getValues } = formMethods

  // Cargar grupos de preguntas para el paso 5
  const {
    data: questionGroupsData,
    isLoading: isLoadingQuestions,
    error: questionsError
  } = useQuestionGroupsWithQuestionsByStep(5, reportType)

  // Procesar las preguntas de todos los grupos
  const { questionGroups, allQuestions } = React.useMemo(() => {
    if (!questionGroupsData) return { questionGroups: {}, allQuestions: [] }

    const grupos: Record<string, Question[]> = {}
    const allQuestionsFlat: Question[] = []

    questionGroupsData.forEach(group => {
      const activeQuestions = group.questions?.filter(q => q.status === 'ACTIVE').sort((a, b) => (a.order || 0) - (b.order || 0)) || []
      if (activeQuestions.length > 0) {
        grupos[group.questionTitle] = activeQuestions
        allQuestionsFlat.push(...activeQuestions)
      }
    })

    return {
      questionGroups: grupos,
      allQuestions: allQuestionsFlat.sort((a, b) => (a.order || 0) - (b.order || 0))
    }
  }, [questionGroupsData])

  useEffect(() => {
    if (allQuestions.length > 0) {
      if (initialData) {
        reset(initialData)
      } else if (!isEditing) {
        const initialFormValues = allQuestions.map((q) => ({
          idPregunta: q.id!,
          respuesta: ''
        }))
        reset({ respuestas: initialFormValues })
      }
    }
  }, [allQuestions, initialData, isEditing, reset])

  const handlePreviousClick = () => {
    const currentData = getValues()
    onPrevious(currentData)
  }

  // Función para validar preguntas obligatorias
  const validateRequiredQuestions = () => {
    const currentValues = getValues()
    const requiredQuestions = allQuestions.filter(q => q.isRequired)
    const unansweredRequired: string[] = []

    requiredQuestions.forEach((question, index) => {
      const globalIndex = allQuestions.findIndex(q => q.id === question.id)
      const answer = currentValues.respuestas?.[globalIndex]?.respuesta

      if (!answer || answer.trim() === '') {
        unansweredRequired.push(question.question)
      }
    })

    return unansweredRequired
  }

  // Manejar submit con validación
  const handleFormSubmit = (data: Step5FormData) => {
    const unansweredRequired = validateRequiredQuestions()

    if (unansweredRequired.length > 0) {
      // Mostrar alerta con las preguntas faltantes
      const questionsList = unansweredRequired
        .slice(0, 3) // Mostrar máximo 3 preguntas
        .map((q, i) => `${i + 1}. ${q.substring(0, 80)}${q.length > 80 ? '...' : ''}`)
        .join('\n')

      const moreQuestions = unansweredRequired.length > 3 ? `\n... y ${unansweredRequired.length - 3} más` : ''

      alert(`⚠️ Faltan respuestas obligatorias:\n\n${questionsList}${moreQuestions}\n\nPor favor complete todas las preguntas marcadas con (*) antes de continuar.`)
      return
    }

    onSaveAndNext(data)
  }

  // Función para renderizar el campo de respuesta según el tipo
  const renderQuestionField = (question: Question, index: number) => {
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
                      'resize-y bg-background/60 border-border/60 focus:border-background transition-all duration-200 text-sm leading-relaxed shadow-sm',
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
                      <RadioGroupItem value="true" id={`${question.id}-true`} />
                      <label htmlFor={`${question.id}-true`} className="text-sm">Sí</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="false" id={`${question.id}-false`} />
                      <label htmlFor={`${question.id}-false`} className="text-sm">No</label>
                    </div>
                  </RadioGroup>
                </FormControl>
              )

            case 'SELECT':
              return (
                <FormControl>
                  <Select onValueChange={field.onChange} value={field.value || ''}>
                    <SelectTrigger className="bg-background/60 border-border/60">
                      <SelectValue placeholder="Seleccione una opción..." />
                    </SelectTrigger>
                    <SelectContent>
                      {question.options?.map((option: QuestionOption) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
              )

            case 'MULTISELECT':
              return (
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
              )

            default:
              return (
                <FormControl>
                  <Textarea
                    placeholder="Escriba su respuesta aquí..."
                    rows={3}
                    className={cn(
                      'resize-y bg-background/60 border-border/60 focus:border-background transition-all duration-200 text-sm leading-relaxed shadow-sm',
                      fieldState.error && 'border-destructive focus-visible:ring-destructive/50'
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

  // Mensaje de error consolidado
  const formError =
    formState.errors.respuestas?.root?.message || formState.errors.respuestas?.message || formState.errors.root?.message

  // Mostrar estado de carga
  if (isLoadingQuestions) {
    return (
      <div className="p-4 md:p-6 h-full flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground mb-4" />
        <p className="text-muted-foreground">Cargando preguntas...</p>
      </div>
    )
  }

  // Mostrar error de carga
  if (questionsError) {
    return (
      <div className="p-4 md:p-6 h-full flex flex-col items-center justify-center">
        <AlertTriangle className="w-8 h-8 text-destructive mb-4" />
        <p className="text-destructive">Error al cargar las preguntas</p>
        <p className="text-muted-foreground text-sm mt-2">
          {questionsError instanceof Error ? questionsError.message : 'Error desconocido'}
        </p>
      </div>
    )
  }

  // Mostrar mensaje si no hay preguntas
  if (allQuestions.length === 0) {
    return (
      <div className="p-4 md:p-6 h-full flex flex-col items-center justify-center">
        <MessageSquareText className="w-8 h-8 text-muted-foreground mb-4" />
        <p className="text-muted-foreground">No hay preguntas disponibles para este paso</p>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 h-full flex flex-col">
      <div className="mb-4">
        <h2 className="text-xl font-semibold flex items-center gap-3">
          <MessageSquareText className="w-5 h-5 text-foreground/70" />
          Paso {totalSteps > 0 ? `5 de ${totalSteps}: ` : ''} Reflexión y Análisis del Curso
        </h2>
        <p className="text-muted-foreground text-sm mt-1">
          Responda las siguientes preguntas sobre el desarrollo y resultados del curso.
        </p>
      </div>

      {formError && (
        <div className="mb-3 p-3 rounded-md flex items-center text-sm bg-destructive/10 text-destructive border border-destructive/30">
          <AlertTriangle className="mr-2 h-5 w-5" />
          <span>{formError}</span>
        </div>
      )}

      {/* Fixed Navigation Buttons at Top */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border/20 pb-4 mb-6">
        <div className="flex justify-between">
          <Button type="button" variant="outline" onClick={handlePreviousClick} className="px-8">
            Anterior
          </Button>
          <Button type="submit" form="step5-form" className="px-8">
            Siguiente
          </Button>
        </div>
      </div>

      <FormProvider {...formMethods}>
        <Form {...formMethods}>
          <form id="step5-form" onSubmit={handleSubmit(handleFormSubmit)} className="flex-1 flex flex-col min-h-0">
            <div className="flex-1 space-y-0 overflow-y-auto pr-2 pb-4">
              {Object.entries(questionGroups).map(([groupTitle, groupQuestions], groupIndex) => (
                <div key={groupTitle} className="mb-6">
                  {/* Título del grupo */}
                  <div className="mb-4 p-3 bg-muted/30 rounded-lg border-l-4 border-primary">
                    <h3 className="text-sm font-semibold text-foreground/90 flex items-center gap-2">
                      <MessageSquareText className="w-4 h-4" />
                      {groupTitle}
                    </h3>
                  </div>

                  {/* Preguntas del grupo */}
                  <div className="space-y-0">
                    {groupQuestions.map((pregunta, questionIndex) => {
                      const globalIndex = allQuestions.findIndex(q => q.id === pregunta.id)
                      const fieldError = formState.errors.respuestas?.[globalIndex]?.respuesta
                      return (
                        <div key={pregunta.id}>
                          <div className={`py-4 px-1 rounded-lg transition-colors ${fieldError ? 'bg-destructive/5 border-2 border-destructive/50' : ''}`}>
                            <div className="space-y-2.5">
                              <div className="text-sm font-medium leading-relaxed text-foreground/90 block">
                                <span className="inline-flex items-baseline gap-2">
                                  <span className="text-muted-foreground font-normal text-xs bg-muted/50 px-2 py-0.5 rounded-full min-w-[24px] text-center">
                                    {globalIndex + 1}
                                  </span>
                                  <span className="flex-1">{pregunta.question}</span>
                                </span>
                                {pregunta.description && (
                                  <span className="block text-xs text-muted-foreground mt-1 ml-8">
                                    {pregunta.description}
                                  </span>
                                )}
                              </div>
                              <div className="ml-6">
                                {renderQuestionField(pregunta, globalIndex)}
                              </div>
                              <input type="hidden" {...register(`respuestas.${globalIndex}.idPregunta`)} value={pregunta.id} />
                            </div>
                          </div>
                          {questionIndex < groupQuestions.length - 1 && <Separator className="opacity-20 my-1" />}
                        </div>
                      )
                    })}
                  </div>

                  {/* Separador entre grupos */}
                  {groupIndex < Object.entries(questionGroups).length - 1 && (
                    <Separator className="opacity-40 my-6" />
                  )}
                </div>
              ))}
            </div>
          </form>
        </Form>
      </FormProvider>
    </div>
  )
}
