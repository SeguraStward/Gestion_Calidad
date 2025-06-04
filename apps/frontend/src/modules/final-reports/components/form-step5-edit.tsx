'use client'

import React, { useEffect } from 'react'
import { UseFormReturn, FormProvider } from 'react-hook-form'
// import { zodResolver } from '@hookform/resolvers/zod'; // Already in page
import * as z from 'zod' // Already in page
import { Button } from '@una-gc/ui/components/button'
// Card components are removed as we are not using an internal card here
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@una-gc/ui/components/form'
import { Textarea } from '@una-gc/ui/components/textarea'
import { preguntasPaso5Mock } from '@/modules/final-reports/mocks/questions'
import { Separator } from '@una-gc/ui/components/separator' // For consistency
import { MessageSquareText } from 'lucide-react' // For consistency

// Schema for a single response item
const respuestaStep5Schema = z.object({
  idPregunta: z.string(),
  respuesta: z.string().min(1, 'Este campo es requerido.')
})

// Schema for the entire step 5 form data
export const step5Schema = z.object({
  respuestas: z.array(respuestaStep5Schema).min(preguntasPaso5Mock.length, 'Debe responder todas las preguntas.')
})

export type Step5FormData = z.infer<typeof step5Schema>

interface Step5EditFormProps {
  formMethods: UseFormReturn<Step5FormData>
  onSaveAndNext: (data: Step5FormData) => void
  onPrevious?: () => void
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
  isEditing = true // Default to true for edit form
}: Step5EditFormProps) {
  const { control, handleSubmit, reset, register, setValue } = formMethods // Added register

  useEffect(() => {
    const currentAnswers = initialData?.respuestas || []
    const initialFormValues = preguntasPaso5Mock.map((p) => {
      const existing = currentAnswers.find((r) => r.idPregunta === p.idPregunta)
      return {
        idPregunta: p.idPregunta,
        respuesta: existing?.respuesta || ''
      }
    })
    // Use reset to set the whole form, including the hidden idPregunta fields
    reset({ respuestas: initialFormValues })
  }, [initialData, reset])

  return (
    // Root div with padding, similar to form-step5.tsx
    <div className="p-4 md:p-6">
      <div className="mb-4">
        {' '}
        {/* Header section for the step */}
        <h2 className="text-xl font-semibold flex items-center gap-3">
          <MessageSquareText className="w-5 h-5 text-foreground/70" />
          Paso {totalSteps > 0 ? `5 de ${totalSteps}: ` : ''} Reflexión y Análisis del Curso (Editando)
        </h2>
        <p className="text-muted-foreground text-sm mt-1">Modifique sus respuestas sobre el desarrollo y resultados del curso.</p>
      </div>

      <FormProvider {...formMethods}>
        <Form {...formMethods}>
          <form onSubmit={handleSubmit(onSaveAndNext)} className="space-y-6">
            <div className="space-y-0">
              {' '}
              {/* Container for questions */}
              {preguntasPaso5Mock.map((pregunta, index) => (
                <div key={pregunta.idPregunta}>
                  <div className="py-4 px-1">
                    {' '}
                    {/* Adjusted padding for compactness */}
                    <FormField
                      control={control}
                      name={`respuestas.${index}.respuesta`}
                      render={({ field }) => (
                        <FormItem className="space-y-2.5">
                          {' '}
                          {/* Adjusted spacing */}
                          <FormLabel className="text-sm font-medium leading-relaxed text-foreground/90 block">
                            <span className="inline-flex items-baseline gap-2">
                              <span className="text-muted-foreground font-normal text-xs bg-muted/50 px-2 py-0.5 rounded-full min-w-[24px] text-center">
                                {index + 1}
                              </span>
                              <span className="flex-1">{pregunta.pregunta}</span>
                            </span>
                          </FormLabel>
                          <div className="ml-6">
                            {' '}
                            {/* Indent textarea slightly */}
                            <FormControl>
                              <Textarea
                                placeholder="Escriba su respuesta aquí..."
                                rows={3} // Consistent row count
                                className="resize-y bg-background/60 border-border/60 focus:border-border focus:bg-background transition-all duration-200 text-sm leading-relaxed shadow-sm"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage className="text-xs mt-1.5" />
                          </div>
                          {/* Hidden field for idPregunta, ensure it's registered */}
                          <input type="hidden" {...register(`respuestas.${index}.idPregunta`)} value={pregunta.idPregunta} />
                        </FormItem>
                      )}
                    />
                  </div>
                  {index < preguntasPaso5Mock.length - 1 && <Separator className="opacity-20 my-1" />}{' '}
                  {/* More subtle separator */}
                </div>
              ))}
            </div>

            <div className="flex justify-between pt-4">
              {onPrevious && (
                <Button type="button" variant="outline" onClick={onPrevious} className="px-8 shadow-sm">
                  Anterior
                </Button>
              )}
              <Button type="submit" className="px-8 shadow-sm">
                {isEditing ? 'Guardar Cambios' : 'Siguiente'}
              </Button>
            </div>
          </form>
        </Form>
      </FormProvider>
    </div>
  )
}
