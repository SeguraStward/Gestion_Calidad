'use client'

import { UseFormReturn, FormProvider } from 'react-hook-form'
import * as z from 'zod'
import { Button } from '@una-gc/ui/components/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@una-gc/ui/components/form'
import { Textarea } from '@una-gc/ui/components/textarea'
import { Card, CardHeader, CardTitle, CardContent } from '@una-gc/ui/components/card'
import { Separator } from '@una-gc/ui/components/separator'
import { MessageSquareText } from 'lucide-react'

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

export function Step5Form({ formMethods, onSaveAndNext, onPrevious }: Step5FormProps) {
  const { control, watch } = formMethods

  const respuestasActuales = watch('respuestas')
  if (!respuestasActuales || respuestasActuales.length !== preguntasPaso5FormMock.length) {
    formMethods.setValue(
      'respuestas',
      preguntasPaso5FormMock.map((p) => ({
        idPregunta: p.idPregunta,
        respuesta: respuestasActuales?.find((r) => r.idPregunta === p.idPregunta)?.respuesta || ''
      }))
    )
  }

  return (
    <div className="p-0 h-full flex flex-col">
      <div className="mb-2 px-6 pt-6">
        <h2 className="text-xl font-semibold flex items-center gap-3">
          <MessageSquareText className="w-5 h-5 text-foreground/70" />
          Reflexión y Análisis del Curso
        </h2>
        <p className="text-muted-foreground text-sm mt-1">
          Responda las siguientes preguntas sobre el desarrollo y resultados del curso
        </p>
      </div>

      <FormProvider {...formMethods}>
        <Form {...formMethods}>
          <form onSubmit={formMethods.handleSubmit(onSaveAndNext)} className="flex-1 flex flex-col">
            <div className="flex-1 overflow-auto px-6 pb-4" style={{ maxHeight: '60vh' }}>
              <Card className="border-none shadow-none bg-transparent">
                <CardHeader className="pb-4 px-0">
                  <CardTitle className="text-base font-medium text-foreground/90">
                    Cuestionario de Evaluación
                    <span className="text-xs text-muted-foreground ml-2 font-normal">
                      ({preguntasPaso5FormMock.length} preguntas)
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-0 px-0">
                  {preguntasPaso5FormMock.map((pregunta, index) => (
                    <div key={pregunta.idPregunta}>
                      <div className="py-5 px-1">
                        <FormField
                          control={control}
                          name={`respuestas.${index}.respuesta`}
                          render={({ field }) => (
                            <FormItem className="space-y-3">
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
                            </FormItem>
                          )}
                        />
                      </div>
                      {index < preguntasPaso5FormMock.length - 1 && <Separator className="opacity-30" />}
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
            <div className="sticky bottom-0 left-0 right-0 bg-background/95 border-t pt-4 pb-4 px-6 flex justify-between z-10">
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
