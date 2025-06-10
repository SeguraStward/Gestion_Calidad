'use client'

import React, { useEffect, useMemo, useState } from 'react' // Removed useCallback if not using the direct function call pattern
import { UseFormReturn, FormProvider } from 'react-hook-form'
import * as z from 'zod'
import { Button } from '@una-gc/ui/components/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@una-gc/ui/components/form'
import { Card, CardHeader, CardTitle, CardContent } from '@una-gc/ui/components/card'
import { Textarea } from '@una-gc/ui/components/textarea'
import {
  step6QuestionsPageMock,
  // Step6Question, // Not directly used if toolsQuestion is derived correctly
  OptionFE
} from '../mocks/questions'
import { MoveRight, MoveLeft, Settings2, AlertTriangle } from 'lucide-react'
import { cn } from '@una-gc/ui/lib/utils'
import type { FullFinalReport } from '@/modules/final-reports/types/final-reports.types'

// Schema for a single multiple response item
const multipleResponseSchema = z.object({
  idPregunta: z.string(),
  respuestasSeleccionadas: z.array(z.string())
})

// Schema for the entire step 6 form data
export const step6Schema = z
  .object({
    respuestasMultiples: z
      .array(multipleResponseSchema)
      .min(1, 'Debe seleccionar al menos una herramienta o indicar que no usó otras.')
      .refine((data) => data.length === 1, { message: 'Debe haber exactamente un conjunto de respuestas múltiples.' }),
    otrasHerramientas: z.string().optional()
  })
  .refine(
    (data) => {
      const herramientasSeleccionadas = data.respuestasMultiples[0]?.respuestasSeleccionadas || []
      return herramientasSeleccionadas.length > 0 || (data.otrasHerramientas && data.otrasHerramientas.trim() !== '')
    },
    {
      message: 'Debe seleccionar al menos una herramienta tecnológica o especificar otras.',
      path: ['respuestasMultiples']
    }
  )

export type Step6FormData = z.infer<typeof step6Schema>

export const OTHER_TOOLS_QUESTION_ID = 'otras_herramientas_utilizadas' // Define and export
const MAIN_TOOLS_QUESTION_ID_INTERNAL = 'herramientas_utilizadas' // Internal usage if different from exported

interface Step6EditFormProps {
  formMethods: UseFormReturn<Step6FormData>
  onSaveAndNext: (data: Step6FormData) => void
  onPrevious?: (data: Step6FormData) => void
  totalSteps: number
  initialData?: Step6FormData | null
  isEditing?: boolean // isEditing is used in useEffect
}

const MAIN_TOOLS_QUESTION_ID = 'herramientas_utilizadas'

export function Step6EditForm({
  formMethods,
  onSaveAndNext,
  onPrevious,
  totalSteps,
  initialData,
  isEditing = true // Default to true as it's an edit form
}: Step6EditFormProps) {
  const { control, handleSubmit, reset, watch, setValue, getValues, formState } = formMethods
  const [initialDataProcessedTick, setInitialDataProcessedTick] = useState(0)
  const [initialSelectionsFromData, setInitialSelectionsFromData] = useState<string[]>([])

  const toolsQuestion = useMemo(() => {
    return (
      step6QuestionsPageMock.find((p) => p.questionId === MAIN_TOOLS_QUESTION_ID && p.options && p.options.length > 0) ||
      step6QuestionsPageMock.find((p) => p.options && p.options.length > 0 && p.responseType === 'SELECCION_MULTIPLE') ||
      step6QuestionsPageMock.find((p) => p.options && p.options.length > 0)
    )
  }, []) // step6QuestionsPageMock is static

  const toolOptions = useMemo(() => {
    return toolsQuestion?.options || []
  }, [toolsQuestion])

  useEffect(() => {
    const currentToolsQuestionId = toolsQuestion?.questionId || MAIN_TOOLS_QUESTION_ID

    if (isEditing && initialData) {
      const rawSelectedData = initialData.respuestasMultiples?.find(
        (rm) => rm.idPregunta === currentToolsQuestionId
      )?.respuestasSeleccionadas
      let normalizedSelectedArray: string[]

      if (rawSelectedData === undefined || rawSelectedData === null) {
        normalizedSelectedArray = []
      } else if (Array.isArray(rawSelectedData)) {
        normalizedSelectedArray = rawSelectedData
      } else {
        normalizedSelectedArray = [String(rawSelectedData)]
      }
      const otras = initialData.otrasHerramientas || ''
      reset({
        respuestasMultiples: [{ idPregunta: currentToolsQuestionId, respuestasSeleccionadas: normalizedSelectedArray }],
        otrasHerramientas: otras
      })
      setInitialSelectionsFromData(normalizedSelectedArray)
      setInitialDataProcessedTick((prev) => prev + 1)
    } else if (!isEditing) {
      // Should ideally not happen if this is Step6EditForm, but good for robustness
      reset({
        respuestasMultiples: [{ idPregunta: currentToolsQuestionId, respuestasSeleccionadas: [] }],
        otrasHerramientas: ''
      })
      setInitialSelectionsFromData([])
      setInitialDataProcessedTick((prev) => prev + 1)
    }
  }, [isEditing, initialData, reset, toolsQuestion])

  const watchedSelectedResponses = watch('respuestasMultiples.0.respuestasSeleccionadas')

  const currentSelectedResponses = useMemo(() => {
    if (initialDataProcessedTick === 1 && initialData) {
      return initialSelectionsFromData
    }
    return watchedSelectedResponses || []
  }, [initialDataProcessedTick, initialData, initialSelectionsFromData, watchedSelectedResponses])

  const availableOptions = useMemo(() => {
    return toolOptions.filter((opt) => !currentSelectedResponses.includes(opt.value))
  }, [toolOptions, currentSelectedResponses]) // This is the correct pattern

  const usedOptionsMapped = useMemo(() => {
    return toolOptions.filter((opt) => currentSelectedResponses.includes(opt.value))
  }, [toolOptions, currentSelectedResponses]) // This is the correct pattern

  const handleMoveToUsed = (optionValue: string) => {
    const currentSelected = getValues('respuestasMultiples.0.respuestasSeleccionadas') || []
    if (!currentSelected.includes(optionValue)) {
      const newSelected = [...currentSelected, optionValue]
      setValue('respuestasMultiples.0.respuestasSeleccionadas', newSelected, { shouldDirty: true, shouldValidate: true })
    }
  }

  const handleMoveToAvailable = (optionValue: string) => {
    const currentSelected = getValues('respuestasMultiples.0.respuestasSeleccionadas') || []
    const newSelected = currentSelected.filter((v) => v !== optionValue)
    setValue('respuestasMultiples.0.respuestasSeleccionadas', newSelected, { shouldDirty: true, shouldValidate: true })
  }

  const handleFormSubmitError = (errors: any) => {
    console.error('Step 6 Edit Form Validation Errors:', errors)
  }
  const handlePreviousClick = () => {
    if (onPrevious) {
      const currentData = getValues()
      onPrevious(currentData)
    }
  }
  return (
    <div className="p-4 md:p-6 h-full flex flex-col">
      {/* Header Section - MODIFIED to match form-step6.tsx */}
      <div className="mb-4">
        <h2 className="text-xl font-semibold flex items-center gap-3">
          <Settings2 className="w-5 h-5 text-foreground/70" />
          {/* Assuming you want a dynamic title for edit mode, or a static one like Step 6 */}
          Paso 6 (Editando): Herramientas Tecnológicas y Metodologías
          {/* Or, if totalSteps is available and relevant:
          Paso {totalSteps > 0 ? `6 de ${totalSteps}: ` : ''}
          Herramientas Tecnológicas y Metodologías (Editando)
          */}
        </h2>
        <p className="text-muted-foreground text-sm mt-1">
          Seleccione las herramientas utilizadas y describa otras si es necesario.
        </p>
      </div>

      {/* Error Display - MODIFIED to match form-step6.tsx styling */}
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
          <form onSubmit={handleSubmit(onSaveAndNext, handleFormSubmitError)} className="flex-1 flex flex-col min-h-0 space-y-0">
            <div className="flex-1 overflow-y-auto pr-1 pb-4">
              <Card className="h-full flex flex-col">
                {/* CardHeader for toolsQuestion - ADDED to match form-step6.tsx */}
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
                <CardContent className="flex-1 space-y-4 p-4 md:px-6 md:pb-6">
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 space-y-1.5">
                      {/* FormLabel for "No usadas" - MODIFIED */}
                      <FormLabel className="block font-medium text-sm">
                        Herramientas no usadas ({availableOptions.length})
                      </FormLabel>
                      <div className="border rounded-md h-[200px] overflow-y-auto p-1.5 space-y-1 bg-muted/20">
                        {availableOptions.map((opt: OptionFE) => (
                          <div
                            key={`disponible-${opt.value}`} // MODIFIED key prefix for claridad
                            onClick={() => handleMoveToUsed(opt.value)}
                            // MODIFIED className to match form-step6.tsx
                            className="p-1.5 rounded hover:bg-primary/10 bg-background cursor-pointer flex items-center justify-between group min-h-[2.25rem] text-sm"
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
                      {/* FormLabel for "Usadas" - MODIFIED */}
                      <FormLabel className="block font-medium text-sm">
                        Herramientas usadas ({usedOptionsMapped.length})
                      </FormLabel>
                      <div className="border rounded-md h-[200px] overflow-y-auto p-1.5 space-y-1 bg-muted/20">
                        {usedOptionsMapped.map((opt: OptionFE) => (
                          <div
                            key={`usada-${opt.value}`} // MODIFIED key prefix for claridad
                            onClick={() => handleMoveToAvailable(opt.value)}
                            // MODIFIED className to match form-step6.tsx
                            className="p-1.5 rounded hover:bg-destructive/10 bg-background cursor-pointer flex items-center justify-between group min-h-[2.25rem] text-sm"
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
                  <FormField
                    control={control}
                    name="otrasHerramientas"
                    render={({ field }) => (
                      <FormItem className="mt-3">
                        <FormLabel className="text-sm font-medium">
                          Otras herramientas o metodologías utilizadas (opcional)
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Si utilizó otras no listadas, descríbalas aquí..."
                            {...field}
                            className="min-h-[70px] text-sm bg-background/60"
                          />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </div>

            <div className="flex justify-between pt-4 border-t border-border/20 mt-auto">
              {/* MODIFIED: Ensure onPrevious is called correctly if it exists */}
              <Button
                type="button"
                variant="outline"
                onClick= {handlePreviousClick}
                className="px-8 shadow-sm"
              >
                Anterior
              </Button>
              <Button type="submit" className="px-8 shadow-sm">
                {/* Assuming "Guardar Cambios" or similar for edit mode */}
                Guardar Cambios
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
