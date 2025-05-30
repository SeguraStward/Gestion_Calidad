'use client'

import { UseFormReturn, FormProvider, Controller } from 'react-hook-form'
import * as z from 'zod'
import { Button } from '@una-gc/ui/components/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@una-gc/ui/components/form'
import { Textarea } from '@una-gc/ui/components/textarea'
import { CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@una-gc/ui/components/card'
import { Step5FormData, step5Schema } from './form-step5' // Reutilizamos schema y tipo
import { useEffect } from 'react'

// Mock data para las preguntas (debe ser consistente con lo esperado por los datos del informe)
// En un escenario real, si las preguntas pueden variar por informe, deberían pasarse como props.
const preguntasMock = [
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

interface Step5EditFormProps {
  formMethods: UseFormReturn<Step5FormData>
  onSaveAndNext: (data: Step5FormData) => void
  onPrevious: () => void
  totalSteps: number
}

export function Step5EditForm({ formMethods, onSaveAndNext, onPrevious, totalSteps }: Step5EditFormProps) {
  const { control, watch } = formMethods

  // La lógica de inicialización de `setValue` de form-step5.tsx no es estrictamente necesaria aquí
  // si la página contenedora (`EditFinalReportPage`) ya se encarga de poblar
  // `formMethods` con los datos existentes (incluyendo todas las preguntas) mediante `reset`.
  // Sin embargo, para robustez, podemos mantener una verificación o sincronización.
  const respuestasActuales = watch('respuestas')
  useEffect(() => {
    if (!respuestasActuales || respuestasActuales.length !== preguntasMock.length) {
      // Esto podría sobreescribir datos si el `reset` en la página padre no fue completo
      // o si las preguntasMock aquí difieren de las usadas para inicializar en la página padre.
      // Es crucial que `preguntasMock` aquí y la estructura de datos en `EditFinalReportPage` estén alineadas.
      const currentAnswersMap = new Map(respuestasActuales?.map((r) => [r.idPregunta, r.respuesta]))
      formMethods.setValue(
        'respuestas',
        preguntasMock.map((p) => ({
          idPregunta: p.idPregunta,
          respuesta: currentAnswersMap.get(p.idPregunta) || ''
        })),
        { shouldValidate: true, shouldDirty: true }
      ) // Marcar como dirty para que se pueda guardar
    }
  }, [respuestasActuales, formMethods])

  return (
    <FormProvider {...formMethods}>
      <Form {...formMethods}>
        <form onSubmit={formMethods.handleSubmit(onSaveAndNext)} className="space-y-8">
          <CardHeader>
            <CardTitle>Paso 5 de {totalSteps}: Reflexión y Análisis del Curso (Editando)</CardTitle>
            <CardDescription>Responda a las siguientes preguntas sobre el desarrollo y resultados del curso.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {preguntasMock.map((pregunta, index) => (
              <FormField
                key={pregunta.idPregunta}
                control={control}
                name={`respuestas.${index}.respuesta`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      <strong>
                        {index + 1}. {pregunta.pregunta}
                      </strong>
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={`Agregar respuesta para la pregunta ${index + 1}...`}
                        rows={3}
                        className="resize-y"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button type="button" variant="outline" onClick={onPrevious}>
              Anterior
            </Button>
            <Button type="submit">Siguiente Paso</Button>
          </CardFooter>
        </form>
      </Form>
    </FormProvider>
  )
}
