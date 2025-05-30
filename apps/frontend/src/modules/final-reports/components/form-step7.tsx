'use client'

import React, { useEffect, useMemo } from 'react'
import { UseFormReturn, FormProvider } from 'react-hook-form'
import { useRouter } from 'next/navigation' // Import useRouter
import { Activity } from 'lucide-react'
import { RadioGroup, RadioGroupItem } from '@una-gc/ui/components/radio-group'
import { Card, CardHeader, CardTitle, CardContent } from '@una-gc/ui/components/card'
import { Separator } from '@una-gc/ui/components/separator'
import { Button } from '@una-gc/ui/components/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@una-gc/ui/components/form'
import * as z from 'zod'

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
  onSaveAndNext: (data: Step7FormData) => void | Promise<void> // Allow onSaveAndNext to be async
  onPrevious: () => void
  totalSteps: number
  tipoInforme?: string
}

// Función para obtener colores según el valor de la opción
const getOptionColors = (value: string, isSelected: boolean) => {
  if (!isSelected) {
    // Style for non-selected items: very neutral border, transparent background, subtle hover
    return 'border-border/30 bg-transparent hover:border-border/50 hover:bg-muted/20 dark:hover:bg-muted/10'
  }

  // Style for selected items: distinct border and background colors
  const colorMap = {
    // Colores para escalas positivas
    muy_bueno: 'border-emerald-500/80 bg-emerald-500/25 dark:border-emerald-600/80 dark:bg-emerald-600/30',
    bueno: 'border-green-500/80 bg-green-500/25 dark:border-green-600/80 dark:bg-green-600/30',
    muy_alto: 'border-emerald-500/80 bg-emerald-500/25 dark:border-emerald-600/80 dark:bg-emerald-600/30',
    alto: 'border-green-500/80 bg-green-500/25 dark:border-green-600/80 dark:bg-green-600/30',

    // Colores para escalas medias
    regular: 'border-amber-500/80 bg-amber-500/25 dark:border-amber-600/80 dark:bg-amber-600/30',
    medio: 'border-yellow-500/80 bg-yellow-500/25 dark:border-yellow-600/80 dark:bg-yellow-600/30',

    // Colores para escalas bajas
    deficiente: 'border-red-500/80 bg-red-500/25 dark:border-red-600/80 dark:bg-red-600/30',
    bajo: 'border-orange-500/80 bg-orange-500/25 dark:border-orange-600/80 dark:bg-orange-600/30'
  }

  return (
    colorMap[value as keyof typeof colorMap] || 'border-blue-500/80 bg-blue-500/25 dark:border-blue-600/80 dark:bg-blue-600/30' // Default selected color
  )
}

export function Step7Form({ formMethods, onSaveAndNext, onPrevious, totalSteps, tipoInforme }: Step7FormProps) {
  const router = useRouter() // Initialize router
  const { control, watch, setValue, getValues, handleSubmit, formState } = formMethods

  const todasLasPreguntasMostradas = useMemo(() => {
    const grupos: Record<string, PreguntaStep7[]> = {}
    preguntasPaso7Mock.forEach((p) => {
      if (p.tipo_respuesta === 'CHECK') {
        if (!grupos[p.grupo_pregunta]) {
          grupos[p.grupo_pregunta] = []
        }
        // Specific filtering based on tipoInforme
        if (
          p.grupo_pregunta === '¿Cómo percibe los siguientes aspectos en el proceso de transición a la presencialidad remota?'
        ) {
          if (tipoInforme === 'INFORME_FINAL_V1') {
            grupos[p.grupo_pregunta].push(p)
          }
        } else {
          grupos[p.grupo_pregunta].push(p)
        }
      }
    })
    // Clean up empty groups
    for (const grupo in grupos) {
      if (grupos[grupo].length === 0) {
        delete grupos[grupo]
      }
    }
    return Object.values(grupos).flat()
  }, [tipoInforme]) // Dependency for useMemo

  useEffect(() => {
    const currentRespuestasRadio = getValues('respuestasRadio')
    const initialRespuestas = todasLasPreguntasMostradas.map((p) => {
      const existing = Array.isArray(currentRespuestasRadio)
        ? currentRespuestasRadio.find((r) => r && r.idPregunta === p.idPregunta)
        : undefined
      return {
        idPregunta: p.idPregunta,
        respuesta: existing?.respuesta || '' // Default to empty string if no existing answer
      }
    })

    let needsUpdate = true
    if (Array.isArray(currentRespuestasRadio) && currentRespuestasRadio.length === initialRespuestas.length) {
      needsUpdate = !currentRespuestasRadio.every(
        (cr, index) => cr && cr.idPregunta === initialRespuestas[index].idPregunta
        // More robust check could compare 'respuesta' as well if needed
      )
    }

    if (needsUpdate) {
      setValue('respuestasRadio', initialRespuestas, { shouldValidate: false, shouldDirty: false })
    }
  }, [setValue, getValues, todasLasPreguntasMostradas])

  const handleFormSubmitSuccess = async (data: Step7FormData) => {
    try {
      await onSaveAndNext(data) // Call the original onSaveAndNext, await if it's async
      // console.log('Step 7 Form Data Submitted (Success), navigating...', data)
      router.push('/final-reports') // Navigate after successful save
    } catch (error) {
      console.error('Error during final save or navigation:', error)
      // Optionally, show an error toast to the user if onSaveAndNext fails
    }
  }

  const handleFormSubmitError = (errors: any) => {
    const currentValues = getValues()
    console.error('Step 7 Form Validation Errors:', errors)
    console.log('Form values at time of validation error (Step 7):', currentValues)
  }

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="mb-6">
        <h2 className="text-xl font-semibold flex items-center gap-3">
          <Activity className="w-5 h-5 text-foreground/70" />
          Percepción General y Desempeño
        </h2>
        <p className="text-muted-foreground text-sm mt-1">
          Evalúe su percepción sobre los aspectos del curso y desempeño estudiantil.
        </p>
      </div>

      <FormProvider {...formMethods}>
        <Form {...formMethods}>
          <form onSubmit={handleSubmit(handleFormSubmitSuccess, handleFormSubmitError)} className="flex-1 flex flex-col">
            <div className="flex-1">
              <Card className="border-border/40 bg-card/50 backdrop-blur-sm shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="text-base font-medium text-foreground/90 flex justify-between items-baseline">
                    <span>Evaluación de Percepción</span>
                    <span className="text-xs text-muted-foreground ml-2 font-normal">
                      ({todasLasPreguntasMostradas.length} pregunta{todasLasPreguntasMostradas.length !== 1 ? 's' : ''}){' '}
                      {/* Display total questions shown */}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-0">
                  {todasLasPreguntasMostradas.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Activity className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p className="text-sm">No hay preguntas disponibles</p>
                      <p className="text-xs">para este tipo de informe o configuración.</p>
                    </div>
                  ) : (
                    Object.entries(
                      // Re-group for rendering, if needed, or iterate directly if flat list is fine
                      todasLasPreguntasMostradas.reduce(
                        (acc, p) => {
                          if (!acc[p.grupo_pregunta]) {
                            acc[p.grupo_pregunta] = []
                          }
                          acc[p.grupo_pregunta].push(p)
                          return acc
                        },
                        {} as Record<string, PreguntaStep7[]>
                      )
                    ).map(([nombreGrupo, preguntasDelGrupo], grupoIndex, arr) => (
                      <div key={nombreGrupo}>
                        {' '}
                        {/* Use nombreGrupo for key if unique */}
                        <div className="py-5 px-1">
                          <div className="mb-5">
                            <h3 className="text-sm font-medium text-foreground/90 leading-relaxed flex items-center gap-2">
                              <div className="w-1.5 h-1.5 bg-muted-foreground/70 rounded-full"></div>
                              {nombreGrupo}
                            </h3>
                          </div>

                          <div className="ml-4 space-y-5">
                            {preguntasDelGrupo.map((pregunta) => {
                              const globalPreguntaIndex = todasLasPreguntasMostradas.findIndex(
                                (pItem) => pItem.idPregunta === pregunta.idPregunta
                              )
                              if (globalPreguntaIndex === -1) return null // Should not happen if logic is correct

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
                                            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3"
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
                                                    <FormLabel className="text-sm font-normal cursor-pointer flex-1 leading-relaxed text-foreground/80">
                                                      {opcion.label}
                                                    </FormLabel>
                                                  </div>
                                                </FormItem>
                                              )
                                            })}
                                          </RadioGroup>
                                        </FormControl>
                                        <FormMessage className="text-xs mt-2 text-destructive" />
                                      </div>
                                    </FormItem>
                                  )}
                                />
                              )
                            })}
                          </div>
                        </div>
                        {/* Use arr.length for separator logic */}
                        {grupoIndex < arr.length - 1 && <Separator className="opacity-30" />}
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="flex justify-between pt-6 mt-auto">
              <Button type="button" variant="outline" onClick={onPrevious} className="px-8 shadow-sm">
                Anterior
              </Button>
              <Button type="submit" className="px-8 shadow-sm">
                Finalizar Informe
              </Button>
            </div>
          </form>
        </Form>
      </FormProvider>
    </div>
  )
}
