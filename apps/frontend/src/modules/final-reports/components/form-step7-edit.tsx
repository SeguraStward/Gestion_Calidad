'use client'

import { UseFormReturn, FormProvider } from 'react-hook-form' // Removed Controller as it's not used
import * as z from 'zod'
import { Button } from '@una-gc/ui/components/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@una-gc/ui/components/form'
import { RadioGroup, RadioGroupItem } from '@una-gc/ui/components/radio-group'
import { CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@una-gc/ui/components/card'
import { Separator } from '@una-gc/ui/components/separator'
import { Step7FormData } from './form-step7' // Reutilizamos schema y tipo. Removed step7Schema as it's not used here.
import { useEffect, useMemo } from 'react' // Added useMemo

interface OptionRadio {
  value: string
  label: string
}
interface PreguntaStep7 {
  idPregunta: string
  pregunta: string
  opciones: OptionRadio[]
  tipo_respuesta: string
  grupo_pregunta: string
}

// Mock data para las preguntas del Paso 7 (DEBE SER CONSISTENTE)
const preguntasPaso7Mock: PreguntaStep7[] = [
  {
    idPregunta: 'transicion_p1',
    pregunta: 'Acceso a recursos tecnológicos por parte de los estudiantes',
    tipo_respuesta: 'CHECK',
    grupo_pregunta: '¿Cómo percibe los siguientes aspectos en el proceso de transición a la presencialidad remota?',
    opciones: [
      { value: 'muy_bueno', label: 'Muy Bueno' },
      { value: 'bueno', label: 'Bueno' },
      { value: 'regular', label: 'Regular' },
      { value: 'deficiente', label: 'Deficiente' }
    ]
  },
  {
    idPregunta: 'transicion_p2',
    pregunta: 'Adaptación de los estudiantes a las plataformas virtuales',
    tipo_respuesta: 'CHECK',
    grupo_pregunta: '¿Cómo percibe los siguientes aspectos en el proceso de transición a la presencialidad remota?',
    opciones: [
      { value: 'muy_bueno', label: 'Muy Bueno' },
      { value: 'bueno', label: 'Bueno' },
      { value: 'regular', label: 'Regular' },
      { value: 'deficiente', label: 'Deficiente' }
    ]
  },
  {
    idPregunta: 'desempeno_p1',
    pregunta: 'Participación en clases virtuales',
    tipo_respuesta: 'CHECK',
    grupo_pregunta: '¿Cómo percibe el desempeño de los estudiantes con respecto a los siguientes aspectos?',
    opciones: [
      { value: 'muy_alto', label: 'Muy Alto' },
      { value: 'alto', label: 'Alto' },
      { value: 'medio', label: 'Medio' },
      { value: 'bajo', label: 'Bajo' }
    ]
  },
  {
    idPregunta: 'desempeno_p2',
    pregunta: 'Entrega de trabajos y tareas',
    tipo_respuesta: 'CHECK',
    grupo_pregunta: '¿Cómo percibe el desempeño de los estudiantes con respecto a los siguientes aspectos?',
    opciones: [
      { value: 'muy_alto', label: 'Muy Alto' },
      { value: 'alto', label: 'Alto' },
      { value: 'medio', label: 'Medio' },
      { value: 'bajo', label: 'Bajo' }
    ]
  }
]

interface Step7EditFormProps {
  formMethods: UseFormReturn<Step7FormData>
  onSaveAndNext: (data: Step7FormData) => void
  onPrevious: () => void
  totalSteps: number
  tipoInforme?: string
}

export function Step7EditForm({ formMethods, onSaveAndNext, onPrevious, totalSteps, tipoInforme }: Step7EditFormProps) {
  const { control, watch, setValue } = formMethods

  const { gruposDePreguntas, todasLasPreguntasFiltradas } = useMemo(() => {
    const grupos: Record<string, PreguntaStep7[]> = {}
    const filtradas: PreguntaStep7[] = []

    preguntasPaso7Mock.forEach((p) => {
      if (p.tipo_respuesta === 'CHECK') {
        let incluirPregunta = false
        if (
          p.grupo_pregunta === '¿Cómo percibe los siguientes aspectos en el proceso de transición a la presencialidad remota?'
        ) {
          if (tipoInforme === 'INFORME_FINAL_V1') {
            incluirPregunta = true
          }
        } else {
          incluirPregunta = true
        }

        if (incluirPregunta) {
          const groupKey = p.grupo_pregunta
          if (!grupos[groupKey]) {
            grupos[groupKey] = []
          }
          const currentGroupArray = grupos[groupKey]
          currentGroupArray.push(p)
          filtradas.push(p)
        }
      }
    })
    for (const grupo in grupos) {
      // Add a check to ensure grupos[grupo] is not undefined before accessing its length
      if (Object.prototype.hasOwnProperty.call(grupos, grupo) && grupos[grupo] && grupos[grupo].length === 0) {
        delete grupos[grupo]
      }
    }
    return { gruposDePreguntas: grupos, todasLasPreguntasFiltradas: filtradas }
  }, [tipoInforme])

  const respuestasRadioActuales = watch('respuestasRadio')
  useEffect(() => {
    // Sincronizar el array de respuestas con las preguntas filtradas
    // Esto asegura que el form state tenga una entrada para cada pregunta que se va a renderizar.
    const currentAnswersMap = new Map(
      Array.isArray(respuestasRadioActuales)
        ? respuestasRadioActuales.map((r) => (r ? [r.idPregunta, r.respuesta] : [undefined, undefined]))
        : []
    )
    const newRespuestasRadio = todasLasPreguntasFiltradas.map((p) => ({
      idPregunta: p.idPregunta,
      respuesta: currentAnswersMap.get(p.idPregunta) || ''
    }))

    // Check if an update is actually needed to avoid unnecessary re-renders/validation
    if (
      !Array.isArray(respuestasRadioActuales) || // Check if it's an array first
      respuestasRadioActuales.length !== newRespuestasRadio.length ||
      !respuestasRadioActuales.every((val, index) => {
        const newResponseItem = newRespuestasRadio[index]
        // Ensure both val and newResponseItem are defined before accessing properties
        return (
          val && newResponseItem && val.idPregunta === newResponseItem.idPregunta && val.respuesta === newResponseItem.respuesta
        )
      })
    ) {
      setValue('respuestasRadio', newRespuestasRadio, { shouldValidate: true, shouldDirty: true })
    }
  }, [respuestasRadioActuales, todasLasPreguntasFiltradas, setValue]) // tipoInforme is implicitly handled by todasLasPreguntasFiltradas changing

  return (
    <FormProvider {...formMethods}>
      <Form {...formMethods}>
        <form onSubmit={formMethods.handleSubmit(onSaveAndNext)} className="space-y-8">
          <CardHeader>
            <CardTitle>Paso 7 de {totalSteps}: Percepción General y Desempeño (Editando)</CardTitle>
            <CardDescription>Seleccione su percepción sobre los siguientes aspectos.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {Object.entries(gruposDePreguntas).map(([nombreGrupo, preguntasDelGrupo], grupoIndex) => (
              <div key={grupoIndex} className="space-y-4">
                <h3 className="text-lg font-semibold">{nombreGrupo}</h3>
                <Separator />
                {preguntasDelGrupo.map((pregunta) => {
                  const globalPreguntaIndex = todasLasPreguntasFiltradas.findIndex((p) => p.idPregunta === pregunta.idPregunta)
                  if (globalPreguntaIndex === -1) return null

                  return (
                    <FormField
                      key={pregunta.idPregunta}
                      control={control}
                      name={`respuestasRadio.${globalPreguntaIndex}.respuesta`}
                      render={({ field }) => (
                        <FormItem className="space-y-3 p-4 border rounded-md">
                          <FormLabel>
                            <strong>{pregunta.pregunta}</strong>
                          </FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              value={field.value || ''}
                              className="flex flex-col space-y-1"
                            >
                              {pregunta.opciones.map((opcion) => (
                                <FormItem key={opcion.value} className="flex items-center space-x-3 space-y-0">
                                  <FormControl>
                                    <RadioGroupItem value={opcion.value} />
                                  </FormControl>
                                  <FormLabel className="font-normal">{opcion.label}</FormLabel>
                                </FormItem>
                              ))}
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )
                })}
              </div>
            ))}
            {todasLasPreguntasFiltradas.length === 0 && (
              <p className="text-sm text-muted-foreground text-center">No hay preguntas disponibles.</p>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button type="button" variant="outline" onClick={onPrevious}>
              Anterior
            </Button>
            <Button type="submit">Finalizar Edición</Button>
          </CardFooter>
        </form>
      </Form>
    </FormProvider>
  )
}
