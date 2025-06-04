'use client'

import React, { useEffect } from 'react' // Added React for clarity
import { UseFormReturn, FormProvider } from 'react-hook-form'
import * as z from 'zod'
import { Button } from '@una-gc/ui/components/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@una-gc/ui/components/form'
import { Textarea } from '@una-gc/ui/components/textarea'
// import { Card, CardHeader, CardTitle, CardContent } from '@una-gc/ui/components/card' // No longer needed for main layout
import { Separator } from '@una-gc/ui/components/separator'
import { MessageSquareText, AlertTriangle } from 'lucide-react' // Added AlertTriangle
import { preguntasPaso5Mock } from '@/modules/final-reports/mocks/questions' // Use centralized mock
import { cn } from '@una-gc/ui/lib/utils' // For conditional class names

// Esquema para una sola respuesta
const respuestaSchema = z.object({
  idPregunta: z.string(),
  respuesta: z.string().min(1, 'Este campo es requerido.') // Updated error message for consistency
})

// Esquema de validación con Zod para el Paso 5
export const step5Schema = z.object({
  respuestas: z.array(respuestaSchema).min(preguntasPaso5Mock.length, 'Debe responder todas las preguntas.') // Use imported mock
})

export type Step5FormData = z.infer<typeof step5Schema>

interface Step5FormProps {
  formMethods: UseFormReturn<Step5FormData>
  onSaveAndNext: (data: Step5FormData) => void
  onPrevious: () => void
  totalSteps: number
  // Removed initialData and isEditing as they are not typically used in the non-edit version
}

export function Step5Form({ formMethods, onSaveAndNext, onPrevious, totalSteps }: Step5FormProps) {
  const { control, handleSubmit, reset, register, formState } = formMethods // Added handleSubmit, reset, formState

  useEffect(() => {
    // Initialize form with question IDs and empty answers
    const initialFormValues = preguntasPaso5Mock.map((p) => ({
      idPregunta: p.idPregunta,
      respuesta: ''
    }))
    reset({ respuestas: initialFormValues })
  }, [reset]) // Dependency array only needs reset

  return (
    <div className="p-4 md:p-6 h-full flex flex-col">
      {/* Header Section (Stays Visible) */}
      <div className="mb-4">
        <h2 className="text-xl font-semibold flex items-center gap-3">
          <MessageSquareText className="w-5 h-5 text-foreground/70" />
          Paso {totalSteps > 0 ? `5 de ${totalSteps}: ` : ''} Reflexión y Análisis del Curso
        </h2>
        <p className="text-muted-foreground text-sm mt-1">
          Responda las siguientes preguntas sobre el desarrollo y resultados del curso.
        </p>
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
          <form onSubmit={handleSubmit(onSaveAndNext)} className="flex-1 flex flex-col min-h-0">
            {' '}
            {/* Ensure form can shrink and grow */}
            {/* Scrollable Questions Area */}
            <div className="flex-1 space-y-0 overflow-y-auto pr-2 pb-4">
              {' '}
              {/* Added pb-4 for spacing */}
              {preguntasPaso5Mock.map((pregunta, index) => (
                <div key={pregunta.idPregunta}>
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
                              <span className="flex-1">{pregunta.pregunta}</span>
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
                            {/* Individual FormMessage removed */}
                          </div>
                          <input type="hidden" {...register(`respuestas.${index}.idPregunta`)} value={pregunta.idPregunta} />
                        </FormItem>
                      )}
                    />
                  </div>
                  {index < preguntasPaso5Mock.length - 1 && <Separator className="opacity-20 my-1" />}
                </div>
              ))}
            </div>
            {/* Navigation Buttons (Stays Visible at the bottom) */}
            <div className="flex justify-between pt-4 border-t border-border/20 mt-auto">
              <Button type="button" variant="outline" onClick={onPrevious} className="px-8 shadow-sm">
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
