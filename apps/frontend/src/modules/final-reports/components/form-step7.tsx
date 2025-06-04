'use client'

import React, { useEffect, useMemo } from 'react'
import { UseFormReturn, FormProvider } from 'react-hook-form'
import { useRouter } from 'next/navigation' // Import useRouter
import { Activity } from 'lucide-react'
import { RadioGroup, RadioGroupItem } from '@una-gc/ui/components/radio-group'
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from '@una-gc/ui/components/card'
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
export const preguntasPaso7FormMock: PreguntaStep7[] = [
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
  onSaveAndNext: (data: Step7FormData) => void | Promise<void>
  onPrevious: () => void
  totalSteps: number
  tipoInforme?: string
  isSubmitting?: boolean // <--- AÑADIR PROP
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

export function Step7Form({
  formMethods,
  onSaveAndNext,
  onPrevious,
  totalSteps,
  tipoInforme,
  isSubmitting // <--- USAR PROP
}: Step7FormProps) {
  const router = useRouter() // Initialize router
  const { control, watch, setValue, getValues, handleSubmit, formState } = formMethods

  const todasLasPreguntasMostradas = useMemo(() => {
    const grupos: Record<string, PreguntaStep7[]> = {}
    preguntasPaso7FormMock.forEach((p) => {
      // <--- CORREGIDO AQUÍ
      if (p.tipo_respuesta === 'CHECK') {
        const groupKey = p.grupo_pregunta // Use a variable for the key
        // Ensure the group array exists before any conditional logic that might push to it
        if (!grupos[groupKey]) {
          grupos[groupKey] = []
        }

        const currentGroupArray = grupos[groupKey] // Assign to a new variable

        // Specific filtering based on tipoInforme
        if (
          p.grupo_pregunta === '¿Cómo percibe los siguientes aspectos en el proceso de transición a la presencialidad remota?'
        ) {
          if (tipoInforme === 'INFORME_FINAL_V1') {
            currentGroupArray.push(p) // Push to the new variable
          }
        } else {
          currentGroupArray.push(p) // Push to the new variable
        }
      }
    })
    // Clean up empty groups
    for (const grupo in grupos) {
      if (Object.prototype.hasOwnProperty.call(grupos, grupo) && grupos[grupo] && grupos[grupo].length === 0) {
        delete grupos[grupo]
      }
    }
    return Object.values(grupos).flat()
  }, [tipoInforme]) // Dependency for useMemo; // <--- AÑADIDO PUNTO Y COMA (BUENA PRÁCTICA)

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
      needsUpdate = !currentRespuestasRadio.every((cr, index) => {
        const initialItem = initialRespuestas[index]
        // Ensure both cr (current response) and initialItem are defined before accessing properties
        return cr && initialItem && cr.idPregunta === initialItem.idPregunta
        // More robust check could compare 'respuesta' as well:
        // return cr && initialItem && cr.idPregunta === initialItem.idPregunta && cr.respuesta === initialItem.respuesta;
      })
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
    <FormProvider {...formMethods}>
      <Form {...formMethods}>
        <form onSubmit={handleSubmit(handleFormSubmitSuccess, handleFormSubmitError)} className="space-y-6">
          {' '}
          {/* Reduced space-y-8 to space-y-6 */}
          <Card>
            <CardHeader className="py-4 px-6">
              {' '}
              {/* Adjusted padding */}
              <CardTitle className="flex items-center gap-2 text-lg">
                {' '}
                {/* Reduced gap and text size */}
                <Activity className="w-4 h-4 text-foreground/70" /> {/* Slightly smaller icon */}
                Paso {totalSteps > 0 ? `7 de ${totalSteps}: ` : ''}
                Percepción General y Desempeño
              </CardTitle>
              <CardDescription className="text-xs">
                {' '}
                {/* Smaller text */}
                Evalúe su percepción sobre los aspectos del curso y desempeño estudiantil. ({
                  todasLasPreguntasMostradas.length
                }{' '}
                pregunta{todasLasPreguntasMostradas.length !== 1 ? 's' : ''})
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 space-y-3 overflow-y-auto max-h-[calc(60vh-40px)]">
              {' '}
              {/* MODIFIED: Reduced padding, space-y, adjusted max-h */}
              {todasLasPreguntasMostradas.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  {' '}
                  {/* Reduced py-8 */}
                  <Activity className="w-10 h-10 mx-auto mb-2 opacity-50" /> {/* Reduced size and margin */}
                  <p className="text-xs">No hay preguntas disponibles</p> {/* Smaller text */}
                  <p className="text-xs">para este tipo de informe o configuración.</p>
                </div>
              ) : (
                Object.entries(
                  todasLasPreguntasMostradas.reduce(
                    (acc, p) => {
                      const groupKey = p.grupo_pregunta
                      if (!acc[groupKey]) {
                        acc[groupKey] = []
                      }
                      const currentGroupArray = acc[groupKey]
                      currentGroupArray.push(p)
                      return acc
                    },
                    {} as Record<string, PreguntaStep7[]>
                  )
                ).map(([nombreGrupo, preguntasDelGrupo], grupoIndex, arr) => (
                  <div key={nombreGrupo}>
                    <div className="py-3 px-1">
                      {' '}
                      {/* MODIFIED: Reduced py-5 to py-3 */}
                      <div className="mb-3">
                        {' '}
                        {/* MODIFIED: Reduced mb-5 to mb-3 */}
                        <h3 className="text-xs font-medium text-foreground/90 leading-normal flex items-center gap-1.5">
                          {' '}
                          {/* Smaller text, gap, leading */}
                          <div className="w-1 h-1 bg-muted-foreground/70 rounded-full"></div> {/* Smaller dot */}
                          {nombreGrupo}
                        </h3>
                      </div>
                      <div className="ml-3 space-y-3">
                        {' '}
                        {/* MODIFIED: Reduced ml-4 to ml-3, space-y-5 to space-y-3 */}
                        {preguntasDelGrupo.map((pregunta) => {
                          const globalPreguntaIndex = todasLasPreguntasMostradas.findIndex(
                            (pItem) => pItem.idPregunta === pregunta.idPregunta
                          )
                          if (globalPreguntaIndex === -1) return null

                          const currentValue = watch(`respuestasRadio.${globalPreguntaIndex}.respuesta`)

                          return (
                            <FormField
                              key={pregunta.idPregunta}
                              control={control}
                              name={`respuestasRadio.${globalPreguntaIndex}.respuesta`}
                              render={({ field }) => (
                                <FormItem className="space-y-1.5">
                                  {' '}
                                  {/* MODIFIED: Reduced space-y-3 to space-y-1.5 */}
                                  <FormLabel className="text-xs font-medium text-foreground/85 leading-normal block">
                                    {' '}
                                    {/* Smaller text, leading */}
                                    {pregunta.pregunta}
                                  </FormLabel>
                                  <div className="ml-2">
                                    {' '}
                                    {/* Reduced ml-3 to ml-2 */}
                                    <FormControl>
                                      <RadioGroup
                                        onValueChange={field.onChange}
                                        value={field.value || ''}
                                        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2" /* MODIFIED: Reduced gap-3 to gap-2 */
                                      >
                                        {pregunta.opciones.map((opcion) => {
                                          const isSelected = currentValue === opcion.value
                                          const colorClasses = getOptionColors(opcion.value, isSelected)
                                          return (
                                            // Each option is a FormItem for layout and click handling
                                            <FormItem key={opcion.value} className="space-y-0">
                                              {/* This div is the clickable area and handles styling */}
                                              <div
                                                className={`flex items-center space-x-1.5 p-2 rounded-md border transition-all duration-200 cursor-pointer ${colorClasses}`}
                                                // onClick={() => field.onChange(opcion.value)} // Optional: if you want the whole div to be clickable to change value
                                              >
                                                <FormControl>
                                                  <RadioGroupItem
                                                    value={opcion.value}
                                                    id={`${field.name}-${opcion.value}`} // Add unique id for accessibility
                                                    className="mt-0 w-3.5 h-3.5"
                                                  />
                                                </FormControl>
                                                <FormLabel
                                                  htmlFor={`${field.name}-${opcion.value}`} // Associate label with RadioGroupItem
                                                  className="text-xs font-normal cursor-pointer flex-1 leading-normal text-foreground/80"
                                                >
                                                  {opcion.label}
                                                </FormLabel>
                                              </div>
                                            </FormItem>
                                          )
                                        })}
                                      </RadioGroup>
                                    </FormControl>
                                    <FormMessage className="text-xs mt-1 text-destructive" /> {/* Reduced mt-2 to mt-1 */}
                                  </div>
                                </FormItem>
                              )}
                            />
                          )
                        })}
                      </div>
                    </div>
                    {grupoIndex < arr.length - 1 && <Separator className="opacity-20 my-2" />} {/* Reduced opacity, added my-2 */}
                  </div>
                ))
              )}
            </CardContent>
            <CardFooter className="flex justify-between py-3 px-6">
              {' '}
              {/* Adjusted padding */}
              <Button
                type="button"
                variant="outline"
                onClick={onPrevious}
                className="px-6 py-1.5 text-xs shadow-sm" /* Adjusted padding, text size */
                disabled={isSubmitting}
              >
                Anterior
              </Button>
              <Button
                type="submit"
                className="px-6 py-1.5 text-xs shadow-sm" /* Adjusted padding, text size */
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Finalizando...' : 'Finalizar Informe'}
              </Button>
            </CardFooter>
          </Card>
        </form>
      </Form>
    </FormProvider>
  )
}
