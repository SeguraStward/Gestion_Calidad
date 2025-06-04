'use client'

import { UseFormReturn, FormProvider } from 'react-hook-form'
import * as z from 'zod'
import { Button } from '@una-gc/ui/components/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@una-gc/ui/components/form'
import { Textarea } from '@una-gc/ui/components/textarea'
import { Card, CardHeader, CardTitle, CardContent } from '@una-gc/ui/components/card'
import { Separator } from '@una-gc/ui/components/separator'
import { MessageSquareText } from 'lucide-react'
import { useEffect } from 'react'

// Mock data para las preguntas
export const preguntasPaso5FormMock = [
  {
    idPregunta: 'p1',
    pregunta: '¿Cuáles fueron las principales fortalezas observadas en el desarrollo del curso?',
    tipo_respuesta: 'texto_largo',
    grupo_pregunta: 'Desempeño General'
  },
  {
    idPregunta: 'p2',
    pregunta: '¿Cuáles fueron las principales debilidades o áreas de mejora identificadas?',
    tipo_respuesta: 'texto_largo',
    grupo_pregunta: 'Desempeño General'
  },
  {
    idPregunta: 'p3',
    pregunta: '¿Se cumplieron los objetivos de aprendizaje propuestos? Justifique.',
    tipo_respuesta: 'texto_largo',
    grupo_pregunta: 'Objetivos de Aprendizaje'
  },
  {
    idPregunta: 'p4',
    pregunta: '¿Qué estrategias metodológicas resultaron más efectivas?',
    tipo_respuesta: 'texto_largo',
    grupo_pregunta: 'Metodología'
  },
  {
    idPregunta: 'p5',
    pregunta: '¿Qué ajustes se realizaron durante el curso y cuál fue su impacto?',
    tipo_respuesta: 'texto_largo',
    grupo_pregunta: 'Metodología'
  },
  {
    idPregunta: 'p6',
    pregunta: '¿Cómo fue la participación y el compromiso de los estudiantes?',
    tipo_respuesta: 'texto_largo',
    grupo_pregunta: 'Participación Estudiantil'
  },
  {
    idPregunta: 'p7',
    pregunta: 'Sugerencias para futuras iteraciones de este curso.',
    tipo_respuesta: 'texto_largo',
    grupo_pregunta: 'Sugerencias'
  }
]

// Esquema para una sola respuesta
const respuestaSchema = z.object({
  idPregunta: z.string(),
  respuesta: z.string().min(1, 'La respuesta no puede estar vacía.')
})

// Esquema de validación con Zod para el Paso 5
export const step5Schema = z.object({
  respuestas: z.array(respuestaSchema).min(preguntasPaso5FormMock.length, 'Debe responder todas las preguntas.')
})

export type Step5FormData = z.infer<typeof step5Schema>

interface Step5FormProps {
  formMethods: UseFormReturn<Step5FormData>
  onSaveAndNext: (data: Step5FormData) => void
  onPrevious: () => void
  totalSteps: number
}

export function Step5Form({ formMethods, onSaveAndNext, onPrevious, totalSteps }: Step5FormProps) {
  const { control, watch, setValue, register } = formMethods // Added register

  // Ensure initial values are set, including idPregunta for each item
  useEffect(() => {
    const respuestasActuales = watch('respuestas')
    const needsInitialization =
      !respuestasActuales ||
      respuestasActuales.length !== preguntasPaso5FormMock.length ||
      respuestasActuales.some((r, idx) => r.idPregunta !== preguntasPaso5FormMock[idx].idPregunta)

    if (needsInitialization) {
      setValue(
        'respuestas',
        preguntasPaso5FormMock.map((p) => ({
          idPregunta: p.idPregunta,
          respuesta: respuestasActuales?.find((r) => r.idPregunta === p.idPregunta)?.respuesta || ''
        })),
        { shouldDirty: false, shouldValidate: false } // Avoid validation on init
      )
    }
  }, [watch, setValue, preguntasPaso5FormMock])

  // The root of this component will now be a div providing padding.
  // The parent CardContent (in page.tsx) handles scrolling.
  return (
    <div className="p-4 md:p-6">
      {' '}
      {/* Provides padding for the step content */}
      <div className="mb-4">
        {' '}
        {/* Header section for the step */}
        <h2 className="text-xl font-semibold flex items-center gap-3">
          <MessageSquareText className="w-5 h-5 text-foreground/70" />
          Paso {totalSteps > 0 ? `5 de ${totalSteps}: ` : ''} Reflexión y Análisis del Curso
        </h2>
        <p className="text-muted-foreground text-sm mt-1">
          Responda las siguientes preguntas sobre el desarrollo y resultados del curso
        </p>
      </div>
      <FormProvider {...formMethods}>
        <Form {...formMethods}>
          {/* The form itself will not be flex-col or manage its own height/scroll */}
          <form onSubmit={formMethods.handleSubmit(onSaveAndNext)} className="space-y-6">
            {/* Removed the Card and CardHeader/CardContent that were here for question grouping */}
            {/* Directly map questions */}
            <div className="space-y-0">
              {' '}
              {/* Container for questions */}
              {preguntasPaso5FormMock.map((pregunta, index) => (
                <div key={pregunta.idPregunta}>
                  <div className="py-4 px-1">
                    {' '}
                    {/* Adjusted padding */}
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
                            <FormControl>
                              <Textarea
                                placeholder="Escriba su respuesta aquí..."
                                rows={3}
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
                  {index < preguntasPaso5FormMock.length - 1 && <Separator className="opacity-20 my-1" />}{' '}
                  {/* More subtle separator */}
                </div>
              ))}
            </div>

            {/* Navigation buttons are now part of the normal form flow, not sticky */}
            <div className="flex justify-between pt-4">
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
