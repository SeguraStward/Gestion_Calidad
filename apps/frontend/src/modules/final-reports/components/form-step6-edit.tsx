'use client'

import React, { useEffect, useMemo } from 'react'
import { UseFormReturn, FormProvider } from 'react-hook-form'
import * as z from 'zod'
import { Button } from '@una-gc/ui/components/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@una-gc/ui/components/form'
import { Textarea } from '@una-gc/ui/components/textarea'
import { Card, CardHeader, CardContent } from '@una-gc/ui/components/card'
import { MoveRight, MoveLeft, Settings2, AlertTriangle } from 'lucide-react'

// Import centralized mock data and types
import { step6QuestionsPageMock } from '../mocks/questions'
import type { FullFinalReport } from '@/modules/final-reports/types/final-reports.types'

// Schema for a single multiple response item
const multipleResponseSchema = z.object({
  idPregunta: z.string(),
  respuestasSeleccionadas: z.array(z.string())
})

// Zod validation schema for Step 6
export const step6Schema = z
  .object({
    respuestasMultiples: z.array(multipleResponseSchema).refine((data) => data.length === 1, {
      message: 'Error interno: La estructura de datos para herramientas no es la esperada.'
    }),
    otrasHerramientas: z.string().optional()
  })
  .refine(
    (data) => {
      const herramientasSeleccionadas = data.respuestasMultiples[0]?.respuestasSeleccionadas || []
      return herramientasSeleccionadas.length > 0 || (data.otrasHerramientas && data.otrasHerramientas.trim() !== '')
    },
    {
      message: 'Debe seleccionar al menos una herramienta tecnológica de la lista o especificar otras herramientas utilizadas.',
      path: ['respuestasMultiples']
    }
  )

export type Step6FormData = z.infer<typeof step6Schema>

export const OTHER_TOOLS_QUESTION_ID = 'otras_herramientas_utilizadas'
const MAIN_TOOLS_QUESTION_ID_INTERNAL = 'herramientas_utilizadas'

interface Step6EditFormProps {
  formMethods: UseFormReturn<Step6FormData>
  onSaveAndNext: (data: Step6FormData) => void
  onPrevious?: (data: Step6FormData) => void
  totalSteps: number
  initialData?: Step6FormData | null
  isEditing?: boolean
}

export function Step6EditForm({
  formMethods,
  onSaveAndNext,
  onPrevious,
  totalSteps,
  initialData,
  isEditing = true
}: Step6EditFormProps) {
  const { control, handleSubmit, reset, watch, setValue, getValues, formState } = formMethods

  const toolsQuestion = useMemo(() => {
    return (
      step6QuestionsPageMock.find((p) => p.options && p.options.length > 0 && p.questionId === MAIN_TOOLS_QUESTION_ID_INTERNAL) ||
      step6QuestionsPageMock.find((p) => p.options && p.options.length > 0)
    )
  }, [])

  useEffect(() => {
    if (initialData) {
      const currentRespuestasMultiples =
        initialData.respuestasMultiples && initialData.respuestasMultiples.length > 0
          ? initialData.respuestasMultiples
          : [
              {
                idPregunta: toolsQuestion?.questionId || MAIN_TOOLS_QUESTION_ID_INTERNAL,
                respuestasSeleccionadas: []
              }
            ]

      reset({
        respuestasMultiples: currentRespuestasMultiples,
        otrasHerramientas: initialData.otrasHerramientas || ''
      })
    } else if (!isEditing) {
      reset({
        respuestasMultiples: [
          {
            idPregunta: toolsQuestion?.questionId || MAIN_TOOLS_QUESTION_ID_INTERNAL,
            respuestasSeleccionadas: []
          }
        ],
        otrasHerramientas: ''
      })
    }
  }, [initialData, isEditing, reset, toolsQuestion])

  const toolOptions = useMemo(() => {
    return toolsQuestion?.options || []
  }, [toolsQuestion])

  const selectedResponsesRaw = watch('respuestasMultiples.0.respuestasSeleccionadas')

  const availableOptions = useMemo(() => {
    const currentSelected = selectedResponsesRaw || []
    return toolOptions.filter((opt) => !currentSelected.includes(opt.value))
  }, [toolOptions, selectedResponsesRaw])

  const usedOptionsMapped = useMemo(() => {
    const currentSelected = selectedResponsesRaw || []
    return toolOptions.filter((opt) => currentSelected.includes(opt.value))
  }, [toolOptions, selectedResponsesRaw])

  const handleMoveToUsed = (optionValue: string) => {
    const currentSelected = getValues('respuestasMultiples.0.respuestasSeleccionadas') || []
    if (!currentSelected.includes(optionValue)) {
      setValue('respuestasMultiples.0.respuestasSeleccionadas', [...currentSelected, optionValue], {
        shouldDirty: true,
        shouldValidate: true
      })
    }
  }

  const handleMoveToAvailable = (optionValue: string) => {
    const currentSelected = getValues('respuestasMultiples.0.respuestasSeleccionadas') || []
    setValue(
      'respuestasMultiples.0.respuestasSeleccionadas',
      currentSelected.filter((v) => v !== optionValue),
      { shouldDirty: true, shouldValidate: true }
    )
  }

  const handleFormSubmitError = (errorsFromSubmitHandler: any) => {
    if (Object.keys(formMethods.formState.errors).length > 0) {
      // toast.error('Por favor, corrija los errores indicados en el Paso 6.');
    }
  }

  const handlePreviousClick = () => {
    if (onPrevious) {
      const currentData = getValues()
      onPrevious(currentData)
    }
  }

  return (
    <div className="p-4 md:p-6 h-full flex flex-col">
      {/* Header Section */}
      <div className="mb-4">
        <h2 className="text-xl font-semibold flex items-center gap-3">
          <Settings2 className="w-5 h-5 text-foreground/70" />
          Paso {totalSteps > 0 ? `6 de ${totalSteps}: ` : ''}
          Herramientas Tecnológicas y Metodologías (Editando)
        </h2>
        <p className="text-muted-foreground text-sm mt-1">
          Seleccione las herramientas utilizadas y describa otras si es necesario.
        </p>
      </div>

      {/* General Form Error Message for array-level validation */}
      {formState.errors.respuestasMultiples?.message && !formState.errors.respuestasMultiples?.root?.message && (
        <div className="mb-3 p-3 rounded-md flex items-center text-sm bg-destructive/10 text-destructive border border-destructive/30">
          <AlertTriangle className="mr-2 h-5 w-5" />
          <span>{formState.errors.respuestasMultiples.message}</span>
        </div>
      )}
      {formState.errors.respuestasMultiples?.root?.message && (
        <div className="mb-3 p-3 rounded-md flex items-center text-sm bg-destructive/10 text-destructive border border-destructive/30">
          <AlertTriangle className="mr-2 h-5 w-5" />
          <span>{formState.errors.respuestasMultiples.root.message}</span>
        </div>
      )}
      {formState.errors.root?.message && (
        <div className="mb-3 p-3 rounded-md flex items-center text-sm bg-destructive/10 text-destructive border border-destructive/30">
          <AlertTriangle className="mr-2 h-5 w-5" />
          <span>{formState.errors.root.message}</span>
        </div>
      )}

      <FormProvider {...formMethods}>
        <Form {...formMethods}>
          <form onSubmit={handleSubmit(onSaveAndNext, handleFormSubmitError)} className="flex-1 flex flex-col min-h-0">
            {/* Scrollable content area */}
            <div className="flex-1 overflow-y-auto pr-2 pb-4 space-y-6">
              <Card>
                <CardHeader className="py-4 px-6">
                  {toolsQuestion && (
                    <div>
                      <FormLabel className="text-base font-semibold">{toolsQuestion.question}</FormLabel>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        {toolsQuestion.description || 'Haga clic en una herramienta para moverla entre las listas.'}
                      </p>
                    </div>
                  )}
                </CardHeader>
                <CardContent className="p-4 md:px-6 md:pb-6">
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 space-y-1.5">
                      <FormLabel className="block font-medium text-sm">No usadas ({availableOptions.length})</FormLabel>
                      <div className="border rounded-md h-[200px] overflow-y-auto p-1.5 space-y-1 bg-muted/20">
                        {availableOptions.map((opt) => (
                          <div
                            key={`disponible-${opt.value}`}
                            className="p-1.5 rounded hover:bg-primary/10 bg-background cursor-pointer flex items-center justify-between group min-h-[2.25rem] text-sm"
                            onClick={() => handleMoveToUsed(opt.value)}
                            title={`Mover "${opt.label}" a usadas`}
                          >
                            <span className="flex-grow truncate mx-1 text-center">{opt.label}</span>
                            <MoveRight className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                          </div>
                        ))}
                        {availableOptions.length === 0 && (
                          <div className="p-1.5 text-muted-foreground text-xs min-h-[2.25rem] flex items-center justify-center">
                            Todas las herramientas seleccionadas
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex-1 space-y-1.5">
                      <FormLabel className="block font-medium text-sm">Usadas ({(selectedResponsesRaw || []).length})</FormLabel>
                      <div className="border rounded-md h-[200px] overflow-y-auto p-1.5 space-y-1 bg-muted/20">
                        {usedOptionsMapped.map((opt) => (
                          <div
                            key={`usada-${opt.value}`}
                            className="p-1.5 rounded hover:bg-destructive/10 bg-background cursor-pointer flex items-center justify-between group min-h-[2.25rem] text-sm"
                            onClick={() => handleMoveToAvailable(opt.value)}
                            title={`Mover "${opt.label}" a no usadas`}
                          >
                            <MoveLeft className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                            <span className="flex-grow truncate mx-1 text-center">{opt.label}</span>
                          </div>
                        ))}
                        {usedOptionsMapped.length === 0 && (
                          <div className="p-1.5 text-muted-foreground text-xs min-h-[2.25rem] flex items-center justify-center">
                            Ninguna herramienta seleccionada
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <FormField
                control={control}
                name="otrasHerramientas"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-semibold">
                      Otras herramientas o metodologías utilizadas (opcional)
                    </FormLabel>
                    <p className="text-sm text-muted-foreground mt-0.5">Si utilizó otras no listadas, descríbalas aquí.</p>
                    <FormControl className="pt-1">
                      <Textarea
                        placeholder="Ej: Kahoot, Socrative, metodologías activas..."
                        {...field}
                        className="min-h-[80px] text-sm bg-background/60"
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-4 border-t border-border/20 mt-auto">
              <Button type="button" variant="outline" onClick={handlePreviousClick} className="px-8 shadow-sm">
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

export function transformReportToStep6Data(report: FullFinalReport): Step6FormData | null {
  const herramientasEval = report.evaluation?.find((e) => e.questionId === MAIN_TOOLS_QUESTION_ID_INTERNAL)
  const otrasHerramientasEval = report.evaluation?.find((e) => e.questionId === OTHER_TOOLS_QUESTION_ID)

  return {
    respuestasMultiples: [
      {
        idPregunta: MAIN_TOOLS_QUESTION_ID_INTERNAL,
        respuestasSeleccionadas: herramientasEval?.multipleResponse || []
      }
    ],
    otrasHerramientas: otrasHerramientasEval?.response || ''
  }
}
