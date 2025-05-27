'use client'

import { UseFormReturn, FormProvider, Controller } from 'react-hook-form'
import * as z from 'zod'
import { Button } from '@una-gc/ui/components/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@una-gc/ui/components/form'
import { RadioGroup, RadioGroupItem } from '@una-gc/ui/components/radio-group'
import { Card, CardHeader, CardTitle, CardContent } from '@una-gc/ui/components/card'
import { Separator } from '@una-gc/ui/components/separator'
import { Activity } from 'lucide-react'

// Estructura de las opciones para las preguntas de RadioGroup
interface OptionRadio {
  value: string
  label: string
}

// Estructura de una pregunta para el Paso 7
interface PreguntaStep7 {
  idPregunta: string
  pregunta: string
  opciones: OptionRadio[]
  tipo_respuesta: string
  grupo_pregunta: string
}

// Mock data para las preguntas del Paso 7
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

// Esquema para una sola respuesta de RadioGroup
const respuestaRadioSchema = z.object({
  idPregunta: z.string(),
  respuesta: z.string().min(1, 'Debe seleccionar una opción.')
})

// Esquema de validación con Zod para el Paso 7
export const step7Schema = z.object({
  respuestasRadio: z.array(respuestaRadioSchema)
})

export type Step7FormData = z.infer<typeof step7Schema>

interface Step7FormProps {
  formMethods: UseFormReturn<Step7FormData>
  onSaveAndNext: (data: Step7FormData) => void
  onPrevious: () => void
  totalSteps: number
  tipoInforme?: string
}

// Función para obtener colores según el valor de la opción
const getOptionColors = (value: string, isSelected: boolean) => {
  if (!isSelected) {
    return 'border-border/40 hover:border-border/60 hover:bg-accent/30'
  }

  const colorMap = {
    // Colores para escalas positivas
    muy_bueno: 'border-emerald-300/60 bg-emerald-50/50 dark:border-emerald-600/60 dark:bg-emerald-950/30',
    bueno: 'border-green-300/60 bg-green-50/50 dark:border-green-600/60 dark:bg-green-950/30',
    muy_alto: 'border-emerald-300/60 bg-emerald-50/50 dark:border-emerald-600/60 dark:bg-emerald-950/30',
    alto: 'border-green-300/60 bg-green-50/50 dark:border-green-600/60 dark:bg-green-950/30',

    // Colores para escalas medias
    regular: 'border-amber-300/60 bg-amber-50/50 dark:border-amber-600/60 dark:bg-amber-950/30',
    medio: 'border-yellow-300/60 bg-yellow-50/50 dark:border-yellow-600/60 dark:bg-yellow-950/30',

    // Colores para escalas bajas
    deficiente: 'border-red-300/60 bg-red-50/50 dark:border-red-600/60 dark:bg-red-950/30',
    bajo: 'border-orange-300/60 bg-orange-50/50 dark:border-orange-600/60 dark:bg-orange-950/30'
  }

  return (
    colorMap[value as keyof typeof colorMap] || 'border-blue-300/60 bg-blue-50/50 dark:border-blue-600/60 dark:bg-blue-950/30'
  )
}

export function Step7Form({ formMethods, onSaveAndNext, onPrevious, totalSteps, tipoInforme }: Step7FormProps) {
  const { control, watch, setValue } = formMethods

  // Filtrar preguntas y agruparlas
  const gruposDePreguntas: Record<string, PreguntaStep7[]> = {}
  preguntasPaso7Mock.forEach((p) => {
    if (p.tipo_respuesta === 'CHECK') {
      if (!gruposDePreguntas[p.grupo_pregunta]) {
        gruposDePreguntas[p.grupo_pregunta] = []
      }
      // Lógica condicional para el primer grupo
      if (p.grupo_pregunta === '¿Cómo percibe los siguientes aspectos en el proceso de transición a la presencialidad remota?') {
        if (tipoInforme === 'INFORME_FINAL_V1') {
          gruposDePreguntas[p.grupo_pregunta].push(p)
        }
      } else {
        gruposDePreguntas[p.grupo_pregunta].push(p)
      }
    }
  })

  // Eliminar grupos vacíos
  for (const grupo in gruposDePreguntas) {
    if (gruposDePreguntas[grupo].length === 0) {
      delete gruposDePreguntas[grupo]
    }
  }

  // Inicializar respuestasRadio si es necesario
  const respuestasRadioActuales = watch('respuestasRadio')
  const todasLasPreguntasMostradas = Object.values(gruposDePreguntas).flat()

  if (!respuestasRadioActuales || respuestasRadioActuales.length !== todasLasPreguntasMostradas.length) {
    setValue(
      'respuestasRadio',
      todasLasPreguntasMostradas.map((p) => ({
        idPregunta: p.idPregunta,
        respuesta: respuestasRadioActuales?.find((r) => r.idPregunta === p.idPregunta)?.respuesta || ''
      }))
    )
  }

  return (
    <div className="p-6 h-full flex flex-col">
      {/* Header compacto y minimalista */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold flex items-center gap-3">
          <Activity className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          Percepción General y Desempeño
        </h2>
        <p className="text-muted-foreground text-sm mt-1">
          Evalúe su percepción sobre los aspectos del curso y desempeño estudiantil
        </p>
      </div>

      <FormProvider {...formMethods}>
        <Form {...formMethods}>
          <form onSubmit={formMethods.handleSubmit(onSaveAndNext)} className="flex-1 flex flex-col">
            {/* Contenido principal */}
            <div className="flex-1">
              <Card className="border-indigo-200/50 dark:border-indigo-700/50 bg-indigo-50/20 dark:bg-indigo-950/10 backdrop-blur-sm shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="text-base font-medium text-foreground/90 flex items-center gap-2">
                    <div className="w-2 h-2 bg-indigo-500 dark:bg-indigo-400 rounded-full"></div>
                    Evaluación de Percepción
                    <span className="text-xs text-muted-foreground ml-auto font-normal">
                      ({Object.keys(gruposDePreguntas).length} categoría{Object.keys(gruposDePreguntas).length !== 1 ? 's' : ''})
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-0">
                  {todasLasPreguntasMostradas.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Activity className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p className="text-sm">No hay preguntas disponibles</p>
                      <p className="text-xs">para este tipo de informe o configuración</p>
                    </div>
                  ) : (
                    Object.entries(gruposDePreguntas).map(([nombreGrupo, preguntasDelGrupo], grupoIndex) => (
                      <div key={grupoIndex}>
                        <div className="py-5 px-1">
                          {/* Título del grupo */}
                          <div className="mb-5">
                            <h3 className="text-sm font-medium text-foreground/90 leading-relaxed flex items-center gap-2">
                              <div className="w-1.5 h-1.5 bg-slate-400 dark:bg-slate-500 rounded-full"></div>
                              {nombreGrupo}
                            </h3>
                          </div>

                          {/* Preguntas del grupo */}
                          <div className="ml-4 space-y-5">
                            {preguntasDelGrupo.map((pregunta) => {
                              const globalPreguntaIndex = todasLasPreguntasMostradas.findIndex(
                                (p) => p.idPregunta === pregunta.idPregunta
                              )
                              if (globalPreguntaIndex === -1) return null

                              const currentValue = watch(`respuestasRadio.${globalPreguntaIndex}.respuesta`)

                              return (
                                <FormField
                                  key={pregunta.idPregunta}
                                  control={control}
                                  name={`respuestasRadio.${globalPreguntaIndex}.respuesta`}
                                  render={({ field }) => (
                                    <FormItem className="space-y-3">
                                      <FormLabel className="text-sm font-medium text-foreground/85 leading-relaxed block">
                                        {pregunta.pregunta}
                                      </FormLabel>
                                      <div className="ml-3">
                                        <FormControl>
                                          <RadioGroup
                                            onValueChange={field.onChange}
                                            value={field.value || ''}
                                            className="grid grid-cols-2 lg:grid-cols-4 gap-3"
                                          >
                                            {pregunta.opciones.map((opcion) => {
                                              const isSelected = currentValue === opcion.value
                                              const colorClasses = getOptionColors(opcion.value, isSelected)

                                              return (
                                                <FormItem key={opcion.value} className="space-y-0">
                                                  <div
                                                    className={`flex items-center space-x-2 p-3 rounded-lg border transition-all duration-200 cursor-pointer ${colorClasses}`}
                                                  >
                                                    <FormControl>
                                                      <RadioGroupItem value={opcion.value} className="mt-0" />
                                                    </FormControl>
                                                    <FormLabel className="text-sm font-normal cursor-pointer flex-1 leading-relaxed">
                                                      {opcion.label}
                                                    </FormLabel>
                                                  </div>
                                                </FormItem>
                                              )
                                            })}
                                          </RadioGroup>
                                        </FormControl>
                                        <FormMessage className="text-xs mt-2" />
                                      </div>
                                    </FormItem>
                                  )}
                                />
                              )
                            })}
                          </div>
                        </div>

                        {/* Separador sutil entre grupos */}
                        {grupoIndex < Object.keys(gruposDePreguntas).length - 1 && <Separator className="opacity-20" />}
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Botones de navegación - FIJOS EN LA PARTE INFERIOR */}
            <div className="flex justify-between pt-6 mt-auto">
              <Button type="button" variant="outline" onClick={onPrevious} className="px-8 shadow-sm">
                Anterior
              </Button>

              <Button
                type="submit"
                className="px-8 shadow-sm bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-800"
              >
                Finalizar Informe
              </Button>
            </div>
          </form>
        </Form>
      </FormProvider>
    </div>
  )
}
