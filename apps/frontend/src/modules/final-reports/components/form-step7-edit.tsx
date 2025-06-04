'use client'

import React, { useEffect, useMemo } from 'react'
import { UseFormReturn, FormProvider } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@una-gc/ui/components/button'
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from '@una-gc/ui/components/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@una-gc/ui/components/form'
import { RadioGroup, RadioGroupItem } from '@una-gc/ui/components/radio-group'
import { preguntasPaso7PageMock, PreguntaPaso7, TipoInforme } from '@/modules/final-reports/mocks/questions' // Using central mock
import { Separator } from '@una-gc/ui/components/separator'

// Schema for a single radio response item
const respuestaRadioStep7Schema = z.object({
  idPregunta: z.string(),
  respuesta: z.string().min(1, 'Debe seleccionar una opción.') // Each question requires an answer
})

// Schema for the entire step 7 form data
export const step7Schema = z.object({
  respuestasRadio: z.array(respuestaRadioStep7Schema)
})

export type Step7FormData = z.infer<typeof step7Schema>

interface Step7EditFormProps {
  formMethods: UseFormReturn<Step7FormData>
  onSaveAndNext: (data: Step7FormData) => void
  onPrevious?: () => void
  totalSteps: number
  initialData?: Step7FormData | null
  isEditing?: boolean
  tipoInforme: TipoInforme // To filter questions based on report type
}

// Helper to group questions by 'grupo'
const groupQuestions = (questions: PreguntaPaso7[], tipoInforme: TipoInforme) => {
  const grupos: Record<string, PreguntaPaso7[]> = {}

  // Filter questions based on tipoInforme first
  const filteredQuestions = questions.filter((q) => {
    // Ensure q.aplicaPara exists and is an array before calling .includes
    if (Array.isArray(q.aplicaPara)) {
      return q.aplicaPara.includes(tipoInforme) || q.aplicaPara.includes('TODOS')
    }
    return false // Or handle as appropriate if aplicaPara can be missing/not an array
  })

  filteredQuestions.forEach((p) => {
    const groupName = p.grupo || 'General' // Use 'General' or any default if p.grupo is undefined

    if (!grupos[groupName]) {
      grupos[groupName] = []
    }
    grupos[groupName].push(p) // Now groupName is guaranteed to be a string
  })
  return grupos
}

export function Step7EditForm({
  formMethods,
  onSaveAndNext,
  onPrevious,
  totalSteps,
  initialData,
  isEditing = false,
  tipoInforme
}: Step7EditFormProps) {
  const { control, handleSubmit, reset, watch } = formMethods // Removed setValue as it's not used directly here now

  // Option 1: Use the corrected groupQuestions helper
  const groupedQuestionsFromHelper = useMemo(() => groupQuestions(preguntasPaso7PageMock, tipoInforme), [tipoInforme])

  // Option 2: Your existing, more integrated grouping logic (RECOMMENDED to keep this one)
  const { gruposDePreguntas, todasLasPreguntasFiltradas } = useMemo(() => {
    const grupos: Record<string, PreguntaPaso7[]> = {}
    const filtradas: PreguntaPaso7[] = []

    preguntasPaso7PageMock.forEach((p) => {
      // Ensure 'aplicaPara' is the correct property and an array
      if (Array.isArray(p.aplicaPara) && (p.aplicaPara.includes(tipoInforme) || p.aplicaPara.includes('TODOS'))) {
        filtradas.push(p)
        const groupName = p.grupo || 'General'
        if (!grupos[groupName]) {
          grupos[groupName] = []
        }
        grupos[groupName].push(p)
      }
    })
    return { gruposDePreguntas: grupos, todasLasPreguntasFiltradas: filtradas }
  }, [tipoInforme])

  // Decide which grouping to use. If `gruposDePreguntas` from the second useMemo is used for rendering,
  // then `groupedQuestionsFromHelper` might be redundant.
  // For the rest of the logic (useEffect, rendering), I'll assume you use `gruposDePreguntas` and `todasLasPreguntasFiltradas`.

  useEffect(() => {
    if (isEditing && initialData) {
      const relevantInitialData = {
        respuestasRadio: initialData.respuestasRadio.filter((r) =>
          todasLasPreguntasFiltradas.some((p) => p.idPregunta === r.idPregunta)
        )
      }
      todasLasPreguntasFiltradas.forEach((p) => {
        if (!relevantInitialData.respuestasRadio.some((r) => r.idPregunta === p.idPregunta)) {
          relevantInitialData.respuestasRadio.push({ idPregunta: p.idPregunta, respuesta: '' })
        }
      })
      reset(relevantInitialData)
    } else if (!isEditing) {
      const initialRespuestas = todasLasPreguntasFiltradas.map((p) => ({
        idPregunta: p.idPregunta,
        respuesta: '' // Default empty answer for new forms
      }))
      reset({ respuestasRadio: initialRespuestas })
    }
  }, [isEditing, initialData, reset, todasLasPreguntasFiltradas, tipoInforme])

  return (
    <FormProvider {...formMethods}>
      <Form {...formMethods}>
        <form onSubmit={handleSubmit(onSaveAndNext)} className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>
                Paso {totalSteps > 0 ? `7 de ${totalSteps}: ` : ''}
                Percepción General y Desempeño {isEditing ? '(Editando)' : ''}
              </CardTitle>
              <CardDescription>Responda a las siguientes afirmaciones según su percepción.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 p-6 overflow-y-auto max-h-[60vh]">
              {' '}
              {/* Added p-6, overflow-y-auto, max-h-[60vh] */}
              {Object.entries(gruposDePreguntas).map(([nombreGrupo, preguntasDelGrupo], grupoIndex) => (
                <div key={nombreGrupo}>
                  <h3 className="text-lg font-semibold mb-3 mt-4">{nombreGrupo}</h3>
                  {preguntasDelGrupo.map((pregunta, indexWithinGrupo) => {
                    // Find the overall index of this question in the form's respuestasRadio array
                    const overallIndex = watch('respuestasRadio')?.findIndex((r) => r.idPregunta === pregunta.idPregunta) ?? -1

                    if (overallIndex === -1 && !isEditing) {
                      // This case should ideally be handled by the useEffect initialization
                      // console.warn(`Question ${pregunta.idPregunta} not found in form state during render.`);
                      return null
                    }
                    if (overallIndex === -1 && isEditing && initialData) {
                      // If editing and question is new for this tipoInforme but was not in initialData
                      // This also should be handled by useEffect. If still -1, it means it's missing.
                      // console.warn(`Question ${pregunta.idPregunta} missing in form state for editing.`);
                      return null
                    }

                    return (
                      <FormField
                        key={pregunta.idPregunta}
                        control={control}
                        name={`respuestasRadio.${overallIndex}.respuesta`}
                        render={({ field }) => (
                          <FormItem className="space-y-3 mb-6 border-b pb-4">
                            <FormLabel className="text-base font-medium">{pregunta.pregunta}</FormLabel>
                            <FormControl>
                              <RadioGroup
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                                value={field.value}
                                className="flex flex-col space-y-1"
                              >
                                {pregunta.opciones?.map((opcion) => (
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
                            <input
                              type="hidden"
                              {...formMethods.register(`respuestasRadio.${overallIndex}.idPregunta`)}
                              value={pregunta.idPregunta}
                            />
                          </FormItem>
                        )}
                      />
                    )
                  })}
                  {grupoIndex < Object.keys(gruposDePreguntas).length - 1 && <Separator className="my-6" />}
                </div>
              ))}
            </CardContent>
            <CardFooter className="flex justify-between">
              {onPrevious && (
                <Button type="button" variant="outline" onClick={onPrevious}>
                  Anterior
                </Button>
              )}
              <Button type="submit">{isEditing ? 'Guardar Cambios' : 'Finalizar y Guardar'}</Button>
            </CardFooter>
          </Card>
        </form>
      </Form>
    </FormProvider>
  )
}
