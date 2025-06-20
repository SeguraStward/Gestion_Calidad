'use client'

import React, { useEffect } from 'react'
import { UseFormReturn, FormProvider } from 'react-hook-form'
import * as z from 'zod'
import { Button } from '@una-gc/ui/components/button'
import { Form, FormControl, FormField, FormItem, FormLabel } from '@una-gc/ui/components/form'
import { Textarea } from '@una-gc/ui/components/textarea'
import { Separator } from '@una-gc/ui/components/separator'
import { MessageSquareText, AlertTriangle } from 'lucide-react'
import { step5QuestionsMock } from '@/modules/final-reports/mocks/questions'
import { cn } from '@una-gc/ui/lib/utils'

const respuestaSchema = z.object({
  idPregunta: z.string(),
  respuesta: z.string().min(1, 'Este campo es requerido.')
})

export const step5Schema = z.object({
  respuestas: z
    .array(respuestaSchema)
    .min(step5QuestionsMock.length, 'Debe responder todas las preguntas.')
    .refine((respuestas) => respuestas.every((r) => r.respuesta.trim() !== ''), {
      message: 'Todas las preguntas deben tener una respuesta.',
      path: ['respuestas']
    })
})

export type Step5FormData = z.infer<typeof step5Schema>

interface Step5FormProps {
  formMethods: UseFormReturn<Step5FormData>
  onSaveAndNext: (data: Step5FormData) => void
  onPrevious: (data: Step5FormData) => void
  totalSteps: number
  initialData?: Step5FormData | null
  isEditing?: boolean
}

export function Step5Form({
  formMethods,
  onSaveAndNext,
  onPrevious,
  totalSteps,
  initialData,
  isEditing = false
}: Step5FormProps) {
  const { control, handleSubmit, reset, register, formState, getValues } = formMethods

  useEffect(() => {
    if (initialData) {
      reset(initialData)
    } else if (!isEditing) {
      const initialFormValues = step5QuestionsMock.map((p) => ({
        idPregunta: p.questionId,
        respuesta: ''
      }))
      reset({ respuestas: initialFormValues })
    }
  }, [initialData, isEditing, reset])

  const handlePreviousClick = () => {
    const currentData = getValues()
    onPrevious(currentData)
  }

  // Mensaje de error consolidado
  const formError = formState.errors.respuestas?.root?.message || 
                   formState.errors.respuestas?.message ||
                   formState.errors.root?.message;

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

      <FormProvider {...formMethods}>
        <Form {...formMethods}>
          <form onSubmit={handleSubmit(onSaveAndNext)} className="flex-1 flex flex-col min-h-0">
            <div className="flex-1 space-y-0 overflow-y-auto pr-2 pb-4">
              {step5QuestionsMock.map((pregunta, index) => (
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
                              <span className="flex-1">{pregunta.question}</span>
                              <span className="text-destructive ml-1">*</span>
                            </span>
                          </FormLabel>
                          <div className="ml-6">
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
                          </div>
                          <input type="hidden" {...register(`respuestas.${index}.idPregunta`)} value={pregunta.questionId} />
                        </FormItem>
                      )}
                    />
                  </div>
                  {index < step5QuestionsMock.length - 1 && <Separator className="opacity-20 my-1" />}
                </div>
              ))}
            </div>
            <div className="flex justify-between pt-4 border-t border-border/20 mt-auto">
              <Button type="button" variant="outline" onClick={handlePreviousClick} className="px-8 shadow-sm">
                Anterior
              </Button>
              <Button type="submit" className="px-8 shadow-sm">
                Siguiente
              </Button>
            </div>
          </form>
        </Form>
      </FormProvider>
    </div>
  )
}
