'use client'

import React, { useEffect, useMemo } from 'react'
import { UseFormReturn, FormProvider } from 'react-hook-form'
// import { zodResolver } from '@hookform/resolvers/zod' // Already in page
import * as z from 'zod' // Already in page
import { toast } from 'sonner' // <--- IMPORT TOAST HERE
import { Button } from '@una-gc/ui/components/button'
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from '@una-gc/ui/components/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@una-gc/ui/components/form'
import { RadioGroup, RadioGroupItem } from '@una-gc/ui/components/radio-group'
// Import the translated mock name and its types (Step7Question, ReportType)
import { step7QuestionsPageMock, Step7Question, ReportType } from '@/modules/final-reports/mocks/questions' // Was preguntasPaso7PageMock, PreguntaPaso7, TipoInforme
import { Separator } from '@una-gc/ui/components/separator'

import { Activity } from 'lucide-react'

// Schema for a single radio response item (ensure this is identical to form-step7.tsx if it's not already)
const respuestaRadioStep7Schema = z.object({
  idPregunta: z.string(),
  respuesta: z.string().min(1, 'Debe seleccionar una opción.')
})

// Schema for the entire step 7 form data (ensure this is identical)
export const step7Schema = z.object({
  respuestasRadio: z.array(respuestaRadioStep7Schema)
})

export type Step7FormData = z.infer<typeof step7Schema>

interface Step7EditFormProps {
  formMethods: UseFormReturn<Step7FormData>
  onSaveAndNext: (data: Step7FormData) => void // Para actualizar estado local si navega hacia atrás
  onPrevious?: (data: Step7FormData) => void
  totalSteps: number
  initialData?: Step7FormData | null
  isEditing?: boolean
  reportType: ReportType
  onFinalSubmit: () => Promise<void> // Prop para el guardado final
}

// Helper to group questions
// Use translated Step7Question and ReportType
const groupQuestions = (questions: Step7Question[], currentReportType: ReportType) => {
  const grupos: Record<string, Step7Question[]> = {}
  // Use translated 'appliesTo' property
  const filteredQuestions = questions.filter((q) => {
    if (Array.isArray(q.appliesTo)) {
      return q.appliesTo.includes(currentReportType) || q.appliesTo.includes('TODOS')
    }
    return false
  })

  filteredQuestions.forEach((p) => {
    // Use translated 'group' property
    const groupName = p.group || 'General'
    if (!grupos[groupName]) {
      grupos[groupName] = []
    }
    grupos[groupName].push(p)
  })
  return { gruposDePreguntas: grupos, todasLasPreguntasFiltradas: filteredQuestions }
}

// Ensure getOptionColors is identical to form-step7.tsx
const getOptionColors = (value: string, isSelected: boolean) => {
  if (!isSelected) {
    return 'border-border/30 bg-transparent hover:border-border/50 hover:bg-muted/20 dark:hover:bg-muted/10'
  }
  const colorMap = {
    '5': 'border-emerald-500/80 bg-emerald-500/25 dark:border-emerald-600/80 dark:bg-emerald-600/30', // Muy bueno
    '4': 'border-green-500/80 bg-green-500/25 dark:border-green-600/80 dark:bg-green-600/30', // Bueno
    '3': 'border-amber-500/80 bg-yellow-500/25 dark:border-amber-600/80 dark:bg-yellow-600/30', // Regular
    '2': 'border-orange-500/80 bg-orange-500/25 dark:border-orange-600/80 dark:bg-orange-600/30', // Malo
    '1': 'border-red-500/80 bg-red-500/25 dark:border-red-600/80 dark:bg-red-600/30' // Muy malo
  }
  return (
    colorMap[value as keyof typeof colorMap] || 'border-blue-500/80 bg-blue-500/25 dark:border-blue-600/80 dark:bg-blue-600/30'
  )
}

export function Step7EditForm({
  formMethods,
  onSaveAndNext,
  onPrevious,
  totalSteps,
  initialData, // Se espera que initialData.respuestasRadio[n].respuesta sea el valor numérico
  isEditing = true,
  reportType,
  onFinalSubmit
}: Step7EditFormProps) {
  const { control, handleSubmit, reset, watch, register, getValues } = formMethods

  const { gruposDePreguntas, todasLasPreguntasFiltradas } = useMemo(
    () => groupQuestions(step7QuestionsPageMock, reportType),
    [reportType]
  )

  useEffect(() => {
    // initialData.respuestasRadio ya debería tener los valores numéricos correctos para 'respuesta'
    // gracias a la transformación en `transformReportToStep7Data`
    if (initialData && initialData.respuestasRadio) {
      // Asegurarse de que solo reseteamos las preguntas que realmente se van a mostrar
      const formValuesForVisibleQuestions = {
        respuestasRadio: todasLasPreguntasFiltradas.map((visibleQuestion) => {
          const existingAnswer = initialData.respuestasRadio.find((r) => r.idPregunta === visibleQuestion.questionId)
          return {
            idPregunta: visibleQuestion.questionId,
            respuesta: existingAnswer?.respuesta || '' // Usar el valor numérico existente o vacío
          }
        })
      }
      console.log('[Step7EditForm] Resetting form with initial (numeric) values:', formValuesForVisibleQuestions)
      reset(formValuesForVisibleQuestions)
    } else if (!isEditing) {
      // Solo para el modo de creación, si no hay initialData
      const defaultValues = {
        respuestasRadio: todasLasPreguntasFiltradas.map((p) => ({ idPregunta: p.questionId, respuesta: '' }))
      }
      console.log('[Step7EditForm] No initialData, resetting with default empty values for visible questions.')
      reset(defaultValues)
    }
  }, [initialData, reset, todasLasPreguntasFiltradas, reportType, isEditing]) // Añadir isEditing

  // Función para manejar errores de validación
  const handleValidationErrors = (errors: any) => {
    toast.error('Por favor, corrija los errores en el formulario del Paso 7.')
  }

  // Esta función se llamará cuando el formulario del Paso 7 sea válido y se envíe.
  const localSubmitAndFinalize = async (data: Step7FormData) => {
    console.log('[Step7EditForm] localSubmitAndFinalize INVOCADA. Data del form:', JSON.stringify(data, null, 2))
    // Opcional: actualizar el estado en la página padre con los datos de este form ANTES de la llamada final.
    // Esto asegura que si onFinalSubmit (handleSubmitAllSteps) usa step7Data del estado, esté actualizado.
    // Sin embargo, la versión actual de handleSubmitAllSteps usa getValues(), así que esto es redundante pero inofensivo.
    onSaveAndNext(data)

    await onFinalSubmit() // Llama a handleSubmitAllSteps de la página padre
  }

  const handlePreviousClickInternal = () => {
    const currentData = getValues() // Obtener datos actuales del formulario
    // No es estrictamente necesario llamar a onSaveAndNext aquí si la página padre
    // ya usa los datos pasados a onPrevious para actualizar su estado.
    // onSaveAndNext(currentData)
    if (onPrevious) {
      onPrevious(currentData) // <--- CORRECCIÓN: Pasar currentData
    }
  }

  return (
    <div className="flex flex-col">
      {/* Header Section (Stays Visible) */}
      <div className="mb-4">
        <h2 className="text-xl font-semibold flex items-center gap-3">
          <Activity className="w-5 h-5 text-foreground/70" />
          Paso {totalSteps > 0 ? `7 de ${totalSteps}: ` : ''}
          Percepción General y Desempeño (Editando)
        </h2>
        <p className="text-muted-foreground text-sm mt-1">
          Modifique su percepción sobre los aspectos del curso y desempeño estudiantil. ({todasLasPreguntasFiltradas.length}{' '}
          pregunta{todasLasPreguntasFiltradas.length !== 1 ? 's' : ''})
        </p>
      </div>

      <FormProvider {...formMethods}>
        <Form {...formMethods}>
          <form onSubmit={handleSubmit(localSubmitAndFinalize, handleValidationErrors)} className="flex-1 flex flex-col min-h-0">
            {/* Scrollable Questions Area */}
            <div className="flex-1 overflow-y-auto pr-2 pb-4 space-y-2 sm:space-y-2.5 md:space-y-3">
              {todasLasPreguntasFiltradas.length === 0 ? (
                <div className="text-center py-4 sm:py-5 text-muted-foreground">
                  <Activity className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 mx-auto mb-1 sm:mb-1.5 md:mb-2 opacity-50" />
                  <p className="text-xs sm:text-sm">No hay preguntas disponibles para este tipo de informe.</p>
                </div>
              ) : (
                Object.entries(gruposDePreguntas).map(([nombreGrupo, preguntasDelGrupo], grupoIndex, arr) => (
                  <div key={nombreGrupo}>
                    <div className="py-1.5 sm:py-2 px-1">
                      <div className="mb-1.5 sm:mb-2">
                        <h3 className="text-xs sm:text-sm font-medium text-foreground/90 leading-normal flex items-center gap-1 sm:gap-1.5">
                          <div className="w-1.5 h-1.5 bg-muted-foreground/70 rounded-full"></div>
                          {nombreGrupo}
                        </h3>
                      </div>
                      <div className="ml-1 sm:ml-2 space-y-2.5 sm:space-y-3">
                        {preguntasDelGrupo.map((pregunta) => {
                          const overallIndex = todasLasPreguntasFiltradas.findIndex((p) => p.questionId === pregunta.questionId)
                          if (overallIndex === -1) return null

                          const currentValue = watch(`respuestasRadio.${overallIndex}.respuesta`)

                          return (
                            <FormField
                              key={pregunta.questionId}
                              control={control}
                              name={`respuestasRadio.${overallIndex}.respuesta`}
                              render={({ field }) => (
                                <FormItem className="space-y-1 sm:space-y-1.5">
                                  <FormLabel className="text-xs sm:text-sm font-medium text-foreground/85 leading-normal block">
                                    {pregunta.question}
                                  </FormLabel>
                                  <div className="ml-0.5 sm:ml-1">
                                    <FormControl>
                                      <RadioGroup
                                        onValueChange={field.onChange}
                                        value={field.value || ''}
                                        className="flex flex-wrap items-center gap-2 sm:gap-3" // AJUSTADO: Para consistencia
                                      >
                                        {pregunta.options?.map((opcion) => {
                                          const isSelected = currentValue === opcion.value
                                          const colorClasses = getOptionColors(opcion.value, isSelected)
                                          return (
                                            <FormItem key={opcion.value} className="space-y-0">
                                              <div
                                                className={`flex items-center space-x-1 sm:space-x-1.5 p-1.5 sm:p-2 rounded-md border transition-all duration-200 cursor-pointer ${colorClasses}`}
                                              >
                                                <FormControl>
                                                  <RadioGroupItem
                                                    value={opcion.value}
                                                    id={`${field.name}-${overallIndex}-${opcion.value}`}
                                                    className="mt-0 w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4"
                                                  />
                                                </FormControl>
                                                <FormLabel
                                                  htmlFor={`${field.name}-${overallIndex}-${opcion.value}`}
                                                  className="text-xs sm:text-sm font-normal cursor-pointer flex-1 leading-snug text-foreground/90"
                                                >
                                                  {opcion.label}
                                                </FormLabel>
                                              </div>
                                            </FormItem>
                                          )
                                        })}
                                      </RadioGroup>
                                    </FormControl>
                                    <FormMessage className="text-xs mt-0.5 sm:mt-1 text-destructive" />
                                    <input
                                      type="hidden"
                                      {...register(`respuestasRadio.${overallIndex}.idPregunta`)}
                                      value={pregunta.questionId}
                                    />
                                  </div>
                                </FormItem>
                              )}
                            />
                          )
                        })}
                      </div>
                    </div>
                    {grupoIndex < arr.length - 1 && <Separator className="opacity-20 my-3" />}
                  </div>
                ))
              )}
            </div>

            {/* Navigation Buttons (Stays Visible at the bottom) */}
            <div className="flex justify-between pt-4 border-t border-border/20 mt-auto">
              {onPrevious && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePreviousClickInternal}
                  className="px-6 py-2 text-sm shadow-sm"
                >
                  Anterior
                </Button>
              )}
              <Button type="submit" className="px-6 py-2 text-sm shadow-sm">
                Guardar y Finalizar Informe
              </Button>
            </div>
          </form>
        </Form>
      </FormProvider>
    </div>
  )
}
