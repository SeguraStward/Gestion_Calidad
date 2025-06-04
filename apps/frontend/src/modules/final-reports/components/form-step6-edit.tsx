'use client'

import React, { useEffect, useMemo } from 'react'
import { UseFormReturn, FormProvider } from 'react-hook-form'
import * as z from 'zod'
import { Button } from '@una-gc/ui/components/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@una-gc/ui/components/form'
import { Card, CardHeader, CardTitle, CardContent } from '@una-gc/ui/components/card' // CardFooter removed
import { Textarea } from '@una-gc/ui/components/textarea'
import { preguntasPaso6FormMock, PreguntaStep6, Option } from './form-step6'
import { MoveRight, MoveLeft, Settings2, AlertTriangle } from 'lucide-react' // Added Settings2, AlertTriangle
import { cn } from '@una-gc/ui/lib/utils'

// Schema for a single multiple response item (matches create form)
const respuestaMultipleSchema = z.object({
  idPregunta: z.string(),
  respuestasSeleccionadas: z.array(z.string())
})

// Schema for the entire step 6 form data (matches create form)
export const step6Schema = z
  .object({
    respuestasMultiples: z
      .array(respuestaMultipleSchema)
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

  const preguntaHerramientas = useMemo(() => {
    return preguntasPaso6FormMock.find((p) => p.idPregunta === 'herramientas_tec')
  }, [])

  const opcionesHerramientas = useMemo(() => {
    return preguntaHerramientas?.opciones || []
  }, [preguntaHerramientas])

  const usadas = watch('respuestasMultiples.0.respuestasSeleccionadas') || []

  useEffect(() => {
    if (isEditing && initialData) {
      const transformedInitialData = {
        ...initialData,
        respuestasMultiples: initialData.respuestasMultiples.map((rm) => ({
          ...rm,
          idPregunta: preguntaHerramientas?.idPregunta || 'herramientas_tec'
        }))
      }
      reset(transformedInitialData)
    } else {
      // Handles both !isEditing (though unlikely for edit form) and isEditing without initialData
      reset({
        respuestasMultiples: [
          {
            idPregunta: preguntaHerramientas?.idPregunta || 'herramientas_tec',
            respuestasSeleccionadas: []
          }
        ],
        otrasHerramientas: ''
      })
    }
  }, [isEditing, initialData, reset, preguntaHerramientas])

  const disponibles = useMemo(() => {
    return opcionesHerramientas.filter((opt) => !usadas.includes(opt.value))
  }, [opcionesHerramientas, usadas])

  const usadasOptions = useMemo(() => {
    return opcionesHerramientas.filter((opt) => usadas.includes(opt.value))
  }, [opcionesHerramientas, usadas])

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
      {/* Header Section (Stays Visible) */}
      <div className="mb-4">
        <h2 className="text-xl font-semibold flex items-center gap-3">
          <Settings2 className="w-5 h-5 text-foreground/70" />
          Paso {totalSteps > 0 ? `6 de ${totalSteps}: ` : ''}
          Herramientas Tecnológicas y Metodologías (Editando)
        </h2>
        <p className="text-muted-foreground text-sm mt-1">
          Modifique las herramientas utilizadas y otras descripciones si es necesario.
        </p>
      </div>

      {/* General Form Error Message */}
      {formState.errors.respuestasMultiples?.message && (
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

      <FormProvider {...formMethods}>
        <Form {...formMethods}>
          <form onSubmit={handleSubmit(onSaveAndNext, handleFormSubmitError)} className="flex-1 flex flex-col min-h-0 space-y-0">
            {/* Scrollable Card Area */}
            <div className="flex-1 overflow-y-auto pr-1 pb-4">
              <Card className="h-full flex flex-col">
                {' '}
                {/* Ensure card takes full height */}
                <CardHeader className="py-4 px-6">
                  {preguntaHerramientas && (
                    <div>
                      <FormLabel className="text-base font-semibold">{preguntaHerramientas.pregunta}</FormLabel>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        {preguntaHerramientas.descripcion || 'Haga clic en una herramienta para moverla entre las listas.'}
                      </p>
                    </div>
                  )}
                </CardHeader>
                <CardContent className="flex-1 space-y-4 p-4 md:px-6 md:pb-6">
                  {' '}
                  {/* Allow content to grow */}
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 space-y-1.5">
                      <FormLabel className="block font-medium text-sm">No usadas ({disponibles.length})</FormLabel>
                      <div className="border rounded-md h-[200px] overflow-y-auto p-1.5 space-y-1 bg-muted/20">
                        {disponibles.map((opt) => (
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
                        {disponibles.length === 0 && (
                          <div className="p-1.5 text-muted-foreground text-xs min-h-[2.25rem] flex items-center justify-center">
                            Todas las herramientas seleccionadas
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex-1 space-y-1.5">
                      <FormLabel className="block font-medium text-sm">Usadas ({usadasOptions.length})</FormLabel>
                      <div className="border rounded-md h-[200px] overflow-y-auto p-1.5 space-y-1 bg-muted/20">
                        {usadasOptions.map((opt) => (
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
                        {usadasOptions.length === 0 && (
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
                {/* CardFooter is removed from here */}
              </Card>
            </div>

            {/* Navigation Buttons (Stays Visible at the bottom) */}
            <div className="flex justify-between pt-4 border-t border-border/20 mt-auto">
              {onPrevious && (
                <Button type="button" variant="outline" onClick={onPrevious} className="px-8 shadow-sm">
                  Anterior
                </Button>
              )}
              <Button type="submit" className="px-8 shadow-sm">
                {isEditing ? 'Guardar Cambios' : 'Siguiente'}
              </Button>
            </div>
          </form>
        </Form>
      </FormProvider>
    </div>
  )
}
