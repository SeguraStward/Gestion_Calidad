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
import { step5QuestionsMock } from '@/modules/final-reports/mocks/questions' // Use centralized mock
import { cn } from '@una-gc/ui/lib/utils' // For conditional class names

// Esquema para una sola respuesta
const respuestaSchema = z.object({
  idPregunta: z.string(),
  respuesta: z.string().min(1, 'Este campo es requerido.') // Updated error message for consistency
})

// Esquema de validación con Zod para el Paso 5
export const step5Schema = z.object({
  respuestas: z
    .array(respuestaSchema)
    .min(step5QuestionsMock.length, 'Debe responder todas las preguntas.')
    // Opcional: Añadir un refine para verificar que cada respuesta individual no esté vacía,
    // aunque el `respuestaSchema` ya lo hace. Esto es más para un error a nivel de array si alguna está vacía.
    .refine((respuestas) => respuestas.every((r) => r.respuesta.trim() !== ''), {
      message: 'Todas las preguntas deben tener una respuesta.',
      // Este path ayuda a que el error se asocie con el array 'respuestas' en general
      path: ['respuestas'] // O path: [] para un error a nivel de raíz del formulario
    })
})

export type Step5FormData = z.infer<typeof step5Schema>

interface Step5FormProps {
  formMethods: UseFormReturn<Step5FormData>
  onSaveAndNext: (data: Step5FormData) => void
  onPrevious: (data: Step5FormData) => void // Asegúrate que acepte Step5FormData
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
    // Para evitar el error de JSON.stringify con estructuras circulares en el log:
    // console.log(`[Step5Form] useEffect triggered. isEditing: ${isEditing}`, 'Initial data (raw):', initialData);
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

  const handleStep5SubmitError = (errorsFromSubmitHandler: any) => {
    console.error('[Step5Form] Validation Errors on Next:', errorsFromSubmitHandler)
    console.error('[Step5Form] formState.errors on Next:', formState.errors)
  }

  const handlePreviousClick = () => {
    const currentData = getValues() // Obtiene los datos actuales del formulario
    console.log('[Step5Form] Going back, saving data:', currentData)
    onPrevious(currentData) // Pasa los datos al padre
  }

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

      {/* General Form Error Message for array-level validation */}
      {/* Prioritize root error on 'respuestas' if refine path is ['respuestas'] */}
      {formState.errors.respuestas?.root?.message && (
        <div className="mb-3 p-3 rounded-md flex items-center text-sm bg-destructive/10 text-destructive border border-destructive/30">
          <AlertTriangle className="mr-2 h-5 w-5" />
          <span>{formState.errors.respuestas.root.message}</span>
        </div>
      )}
      {/* Fallback for message directly on 'respuestas' (e.g., from .min()) */}
      {formState.errors.respuestas?.message && !formState.errors.respuestas.root?.message && (
        <div className="mb-3 p-3 rounded-md flex items-center text-sm bg-destructive/10 text-destructive border border-destructive/30">
          <AlertTriangle className="mr-2 h-5 w-5" />
          <span>{formState.errors.respuestas.message}</span>
        </div>
      )}
      {/* Error a nivel de raíz del formulario si el path del refine fuera [] */}
      {formState.errors.root?.message && (
        <div className="mb-3 p-3 rounded-md flex items-center text-sm bg-destructive/10 text-destructive border border-destructive/30">
          <AlertTriangle className="mr-2 h-5 w-5" />
          <span>{formState.errors.root.message}</span>
        </div>
      )}

      <FormProvider {...formMethods}>
        <Form {...formMethods}>
          <form onSubmit={handleSubmit(onSaveAndNext, handleStep5SubmitError)} className="flex-1 flex flex-col min-h-0">
            {' '}
            {/* Ensure form can shrink and grow */}
            {/* Scrollable Questions Area */}
            <div className="flex-1 space-y-0 overflow-y-auto pr-2 pb-4">
              {' '}
              {/* Added pb-4 for spacing */}
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
                            {/* Individual FormMessage removed */}
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
            {/* Navigation Buttons (Stays Visible at the bottom) */}
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
