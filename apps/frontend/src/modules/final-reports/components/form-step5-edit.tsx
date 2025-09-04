'use client'

import React, { useEffect } from 'react'
import { UseFormReturn, FormProvider } from 'react-hook-form'
import * as z from 'zod'
import { Button } from '@una-gc/ui/components/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@una-gc/ui/components/form'
import { Textarea } from '@una-gc/ui/components/textarea'
import { step5QuestionsMock } from '@/modules/final-reports/mocks/questions' // Consolidated mock
import { Separator } from '@una-gc/ui/components/separator'
import { MessageSquareText, AlertTriangle } from 'lucide-react'
import { cn } from '@una-gc/ui/lib/utils' // For conditional class names
import type { FullFinalReport } from '@/modules/final-reports/types/final-reports.types'

// Schema for a single response item
const respuestaStep5Schema = z.object({
  idPregunta: z.string(),
  respuesta: z.string().min(1, 'Este campo es requerido.') // Individual field validation
})

// Schema for the entire step 5 form data
export const step5Schema = z.object({
  // Use the imported English mock name here
  respuestas: z.array(respuestaStep5Schema).min(step5QuestionsMock.length, 'Debe responder todas las preguntas.')
})

export type Step5FormData = z.infer<typeof step5Schema>

export function transformReportToStep5Data(report: FullFinalReport): Step5FormData | null {
  const respuestas = step5QuestionsMock.map((mockQuestion) => {
    const existingEval = report.evaluation?.find((e) => e.questionId === mockQuestion.questionId)
    return {
      idPregunta: mockQuestion.questionId,
      respuesta: existingEval?.response || ''
    }
  })
  return { respuestas }
}

interface Step5EditFormProps {
  formMethods: UseFormReturn<Step5FormData>
  onSaveAndNext: (data: Step5FormData) => void
  onPrevious?: (data: Step5FormData) => void
  totalSteps: number
  initialData?: Step5FormData | null
  isEditing?: boolean
}

export function Step5EditForm({
  formMethods,
  onSaveAndNext,
  onPrevious,
  totalSteps,
  initialData,
  isEditing = true
}: Step5EditFormProps) {
  const { control, handleSubmit, reset, register, formState, getValues } = formMethods // Added getValues

  useEffect(() => {
    const currentAnswers = initialData?.respuestas || []
    // Use the imported English mock name here and its 'questionId' property
    const initialFormValues = step5QuestionsMock.map((p) => {
      const existing = currentAnswers.find((r) => r.idPregunta === p.questionId) // Compare with translated 'questionId'
      return {
        idPregunta: p.questionId, // Use translated 'questionId'
        respuesta: existing?.respuesta || ''
      }
    })
    reset({ respuestas: initialFormValues })
  }, [initialData, reset])

  const handlePreviousClick = () => {
    if (onPrevious) {
      const currentData = getValues() // Obtener los datos actuales del formulario
      onPrevious(currentData) // Pasar los datos al llamar a onPrevious
    }
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
            {' '}
            {/* Ensure form can shrink and grow */}
            {/* Scrollable Questions Area */}
            <div className="flex-1 space-y-0 overflow-y-auto pr-2 pb-4">
              {' '}
              {/* Added pb-4 for spacing before buttons if content is short */}
              {/* Use the imported English mock name here */}
              {step5QuestionsMock.map((pregunta, index) => (
                // Use translated property name 'questionId' for key and hidden input
                <div key={pregunta.questionId}>
                  <div className="py-4 px-1">
                    <FormField
                      control={control}
                      name={`respuestas.${index}.respuesta`}
                      render={({ field, fieldState }) => (
                        <FormItem className="space-y-2.5">
                          <FormLabel className="text-sm font-medium leading-relaxed text-foreground/90 block">
                            <span className="inline-flex items-baseline gap-2">
                              <span className="text-muted-foreground font-normal text-xs bg-muted/50 px-2 py-0.5 rounded-full min-w-[24px] text-center">
                                {index + 1}
                              </span>
                              {/* Use translated property name 'question' */}
                              <span className="flex-1">{pregunta.question}</span>
                              <span className="text-destructive ml-1">*</span> {/* Required indicator */}
                            </span>
                          </FormLabel>
                          <div className="ml-6">
                            <FormControl>
                              <Textarea
                                placeholder="Escriba su respuesta aquí..."
                                rows={3}
                                className={cn(
                                  'resize-y bg-background/60 border-border/60 focus:border-border focus:bg-background transition-all duration-200 text-sm leading-relaxed shadow-sm',
                                  fieldState.error && 'border-destructive focus-visible:ring-destructive/50' // Red border on error
                                )}
                                {...field}
                              />
                            </FormControl>
                            {/* Individual FormMessage removed to avoid layout shift and "advertencias" */}
                            {/* fieldState.error?.message && <FormMessage className="text-xs mt-1 text-destructive">{fieldState.error.message}</FormMessage> */}
                          </div>
                          {/* Use translated property name 'questionId' */}
                          <input type="hidden" {...register(`respuestas.${index}.idPregunta`)} value={pregunta.questionId} />
                        </FormItem>
                      )}
                    />
                  </div>
                  {/* Use the imported English mock name here */}
                  {index < step5QuestionsMock.length - 1 && <Separator className="opacity-20 my-1" />}
                </div>
              ))}
            </div>
          </form>
        </Form>
      </FormProvider>
    </div>
  )
}
