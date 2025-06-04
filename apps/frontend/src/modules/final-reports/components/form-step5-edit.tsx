'use client'

import React, { useEffect } from 'react'
import { useForm, UseFormReturn, FormProvider } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@una-gc/ui/components/button'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@una-gc/ui/components/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@una-gc/ui/components/form'
import { Textarea } from '@una-gc/ui/components/textarea'
import { preguntasPaso5Mock } from '@/modules/final-reports/mocks/questions' // Using central mock

// Schema for a single response item
const respuestaStep5Schema = z.object({
  idPregunta: z.string(),
  respuesta: z.string().min(1, 'Este campo es requerido.') // Or make it optional if appropriate
})

// Schema for the entire step 5 form data
export const step5Schema = z.object({
  respuestas: z.array(respuestaStep5Schema)
})

export type Step5FormData = z.infer<typeof step5Schema>

interface Step5EditFormProps {
  formMethods: UseFormReturn<Step5FormData>
  onSaveAndNext: (data: Step5FormData) => void
  onPrevious?: () => void
  totalSteps: number
  initialData?: Step5FormData | null
  isEditing?: boolean // To know if we are editing
}

// Mock data for questions (ensure this matches your central mock structure)
// Using preguntasPaso5Mock imported from central mocks

export function Step5EditForm({
  formMethods,
  onSaveAndNext,
  onPrevious,
  totalSteps,
  initialData,
  isEditing = false
}: Step5EditFormProps) {
  const { control, handleSubmit, reset, watch, setValue } = formMethods

  // Initialize form with initialData if provided (for editing)
  useEffect(() => {
    if (isEditing && initialData) {
      reset(initialData)
    } else if (!isEditing) {
      // For new forms, ensure all questions from mock are present
      const initialRespuestas = preguntasPaso5Mock.map((p) => ({
        idPregunta: p.idPregunta,
        respuesta: ''
      }))
      setValue('respuestas', initialRespuestas)
    }
  }, [isEditing, initialData, reset, setValue])

  // Watch for changes in respuestas to ensure UI updates if needed (optional)
  // const currentRespuestas = watch('respuestas');

  return (
    <FormProvider {...formMethods}>
      <Form {...formMethods}>
        <form onSubmit={handleSubmit(onSaveAndNext)} className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>
                Paso {totalSteps > 0 ? `5 de ${totalSteps}: ` : ''}
                Logros, Dificultades y Recomendaciones {isEditing ? '(Editando)' : ''}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 p-6 overflow-y-auto max-h-[60vh]">
              {' '}
              {/* Added p-6, overflow-y-auto, max-h-[60vh] */}
              {preguntasPaso5Mock.map((pregunta, index) => (
                <FormField
                  key={pregunta.idPregunta}
                  control={control}
                  name={`respuestas.${index}.respuesta`} // Path to the specific answer
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-semibold">{pregunta.pregunta}</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder={`Escriba aquí ${pregunta.pregunta.toLowerCase().startsWith('¿cuáles') || pregunta.pregunta.toLowerCase().startsWith('¿qué') ? 'sus' : 'la'} ${pregunta.pregunta.toLowerCase().replace('¿cuáles han sido los principales ', '').replace('¿cuáles han sido las principales ', '').replace('¿qué ', '').replace('?', '')}...`}
                          rows={5}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                      {/* Hidden field for idPregunta if needed, or ensure it's set on init */}
                      <input
                        type="hidden"
                        {...formMethods.register(`respuestas.${index}.idPregunta`)}
                        value={pregunta.idPregunta}
                      />
                    </FormItem>
                  )}
                />
              ))}
            </CardContent>
            <CardFooter className="flex justify-between">
              {onPrevious && (
                <Button type="button" variant="outline" onClick={onPrevious}>
                  Anterior
                </Button>
              )}
              <Button type="submit">{isEditing ? 'Guardar y Continuar' : 'Siguiente'}</Button>
            </CardFooter>
          </Card>
        </form>
      </Form>
    </FormProvider>
  )
}
