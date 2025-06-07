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

interface Step6EditFormProps {
  formMethods: UseFormReturn<Step6FormData>
  onSaveAndNext: (data: Step6FormData) => void
  onPrevious?: () => void
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

  return (
    <div className="p-4 md:p-6 h-full flex flex-col">
      {/* Header and Error Display */}
      <div className="mb-3 md:mb-4">
        <h2 className="text-xl md:text-2xl font-semibold text-foreground">Paso 6: Herramientas Tecnológicas</h2>
        <p className="text-sm text-muted-foreground">Seleccione las herramientas que utilizó y describa otras si es necesario.</p>
      </div>

      {formState.errors.respuestasMultiples?.message && (
        <div className="mb-3 p-2.5 text-xs text-destructive-foreground bg-destructive/90 border border-destructive rounded-md flex items-center">
          <AlertTriangle className="h-4 w-4 mr-2" />
          {formState.errors.respuestasMultiples.message}
        </div>
      )}
      {formState.errors.respuestasMultiples?.root?.message && (
        <div className="mb-3 p-2.5 text-xs text-destructive-foreground bg-destructive/90 border border-destructive rounded-md flex items-center">
          <AlertTriangle className="h-4 w-4 mr-2" />
          {formState.errors.respuestasMultiples.root.message}
        </div>
      )}

      <FormProvider {...formMethods}>
        <Form {...formMethods}>
          <form onSubmit={handleSubmit(onSaveAndNext, handleFormSubmitError)} className="flex-1 flex flex-col min-h-0 space-y-0">
            {/* Scrollable Content Area */}
            <div className="flex-1 overflow-y-auto pr-1 pb-4">
              {' '}
              {/* Added pr-1 for scrollbar space */}
              <Card className="h-full flex flex-col">
                {' '}
                {/* Ensure card can grow */}
                <CardContent className="flex-1 space-y-4 p-4 md:px-6 md:pb-6">
                  {' '}
                  {/* Allow content to grow */}
                  {/* Tool selection UI */}
                  <div className="flex flex-col md:flex-row gap-4">
                    {/* Available Tools Column */}
                    <div className="flex-1 space-y-1.5">
                      <div className="flex justify-between items-center mb-1">
                        <FormLabel className="text-sm font-medium">Herramientas no usadas ({availableOptions.length})</FormLabel>
                        <Settings2 className="h-3.5 w-3.5 text-muted-foreground" />
                      </div>
                      <div className="border rounded-md h-[200px] overflow-y-auto p-1.5 space-y-1 bg-muted/20">
                        {availableOptions.map((opt: OptionFE) => (
                          <div
                            key={opt.value}
                            onClick={() => handleMoveToUsed(opt.value)}
                            className="group flex items-center justify-between p-1.5 rounded-sm text-xs cursor-pointer hover:bg-primary/10 transition-colors"
                          >
                            <span className="truncate mx-1 text-center flex-1">{opt.label}</span>
                            <MoveRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        ))}
                        {availableOptions.length === 0 && (
                          <div className="p-1.5 text-muted-foreground text-xs min-h-[2.25rem] flex items-center justify-center">
                            Todas las herramientas seleccionadas
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Used Tools Column */}
                    <div className="flex-1 space-y-1.5">
                      <div className="flex justify-between items-center mb-1">
                        <FormLabel className="text-sm font-medium">Herramientas usadas ({usedOptionsMapped.length})</FormLabel>
                        <Settings2 className="h-3.5 w-3.5 text-muted-foreground" />
                      </div>
                      <div className="border rounded-md h-[200px] overflow-y-auto p-1.5 space-y-1 bg-muted/20">
                        {usedOptionsMapped.map((opt: OptionFE) => (
                          <div
                            key={opt.value}
                            onClick={() => handleMoveToAvailable(opt.value)}
                            className="group flex items-center justify-between p-1.5 rounded-sm text-xs cursor-pointer hover:bg-destructive/10 transition-colors"
                          >
                            <MoveLeft className="h-3.5 w-3.5 text-muted-foreground group-hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity" />
                            <span className="truncate mx-1 text-center flex-1">{opt.label}</span>
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
                  {/* Other Tools Textarea */}
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
                            className="min-h-[70px] text-sm bg-background/60" // Adjusted styling
                          />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                </CardContent>
                {/* CardFooter is removed from here as navigation is outside */}
              </Card>
            </div>

            {/* Navigation Buttons (Stays Visible at the bottom) */}
            <div className="flex justify-between pt-4 border-t border-border/20 mt-auto">
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
