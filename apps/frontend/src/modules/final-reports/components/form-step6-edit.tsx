'use client'

import React, { useEffect, useMemo } from 'react'
import { UseFormReturn, FormProvider } from 'react-hook-form'
// zodResolver is usually handled by the page component that instantiates the form
import * as z from 'zod'
import { Button } from '@una-gc/ui/components/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@una-gc/ui/components/form'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@una-gc/ui/components/card'
import { Textarea } from '@una-gc/ui/components/textarea'
// Standardize to use the same mock as form-step6.tsx
import { preguntasPaso6FormMock, PreguntaStep6, Option } from './form-step6' // Assuming types are exported from form-step6.tsx or a shared types file
import { MoveRight, MoveLeft } from 'lucide-react'

// Schema for a single multiple response item (matches create form)
const respuestaMultipleSchema = z.object({
  idPregunta: z.string(),
  respuestasSeleccionadas: z.array(z.string())
})

// Schema for the entire step 6 form data (matches create form)
export const step6Schema = z.object({
  respuestasMultiples: z.array(respuestaMultipleSchema).length(1, 'Debe haber exactamente un conjunto de respuestas múltiples.'),
  otrasHerramientas: z.string().optional()
})

export type Step6FormData = z.infer<typeof step6Schema>

interface Step6EditFormProps {
  formMethods: UseFormReturn<Step6FormData>
  onSaveAndNext: (data: Step6FormData) => void
  onPrevious?: () => void
  totalSteps: number
  initialData?: Step6FormData | null
  isEditing?: boolean // Should be true for this form
}

export function Step6EditForm({
  formMethods,
  onSaveAndNext,
  onPrevious,
  totalSteps,
  initialData,
  isEditing = true // Default to true for edit form
}: Step6EditFormProps) {
  const { control, handleSubmit, reset, watch, setValue, getValues } = formMethods

  const preguntaHerramientas = useMemo(() => {
    // Standardize to 'herramientas_tec'
    return preguntasPaso6FormMock.find((p) => p.idPregunta === 'herramientas_tec')
  }, [])

  const opcionesHerramientas = useMemo(() => {
    return preguntaHerramientas?.opciones || []
  }, [preguntaHerramientas])

  const usadas = watch('respuestasMultiples.0.respuestasSeleccionadas') || []

  useEffect(() => {
    if (isEditing && initialData) {
      // Ensure the idPregunta in initialData matches if it's different, or transform if necessary
      const transformedInitialData = {
        ...initialData,
        respuestasMultiples: initialData.respuestasMultiples.map((rm) => ({
          ...rm,
          idPregunta: preguntaHerramientas?.idPregunta || 'herramientas_tec' // Ensure correct ID
        }))
      }
      reset(transformedInitialData)
    } else if (!isEditing) {
      // Should ideally not happen for an "edit" form, but good for completeness
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
    // If initialData is not present but we are in edit mode, initialize with empty structure
    // This handles the case where the form is for editing but no data was previously saved for this step.
    else if (isEditing && !initialData) {
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
    <FormProvider {...formMethods}>
      <Form {...formMethods}>
        {/* Match className from form-step6.tsx */}
        <form onSubmit={handleSubmit(onSaveAndNext, handleFormSubmitError)} className="space-y-6">
          <Card>
            {/* Match CardHeader styling */}
            <CardHeader className="py-4 px-6">
              <CardTitle className="text-lg">
                Paso {totalSteps > 0 ? `6 de ${totalSteps}: ` : ''}
                Herramientas Tecnológicas y Metodologías (Editando)
              </CardTitle>
              {/* <CardDescription>Optional description if needed</CardDescription> */}
            </CardHeader>
            {/* Match CardContent styling */}
            <CardContent className="space-y-4 p-4 md:p-6">
              {preguntaHerramientas && (
                // Match main question label and description styling
                <div className="mb-3">
                  <FormLabel className="text-base font-semibold">{preguntaHerramientas.pregunta}</FormLabel>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {preguntaHerramientas.descripcion || 'Haga clic en una herramienta para moverla entre las listas.'}
                  </p>
                </div>
              )}
              {/* Match dual list container styling */}
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 space-y-1.5">
                  <FormLabel className="block font-medium text-sm">No usadas ({disponibles.length})</FormLabel>
                  {/* Match list box styling */}
                  <div className="border rounded-md h-[200px] overflow-y-auto p-1.5 space-y-1 bg-muted/20">
                    {disponibles.map((opt) => (
                      // Match list item styling
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
                      // Match empty list message styling
                      <div className="p-1.5 text-muted-foreground text-xs min-h-[2.25rem] flex items-center justify-center">
                        Todas las herramientas seleccionadas
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex-1 space-y-1.5">
                  <FormLabel className="block font-medium text-sm">Usadas ({usadasOptions.length})</FormLabel>
                  {/* Match list box styling */}
                  <div className="border rounded-md h-[200px] overflow-y-auto p-1.5 space-y-1 bg-muted/20">
                    {usadasOptions.map((opt) => (
                      // Match list item styling (hover color differs)
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
                      // Match empty list message styling
                      <div className="p-1.5 text-muted-foreground text-xs min-h-[2.25rem] flex items-center justify-center">
                        Ninguna herramienta seleccionada
                      </div>
                    )}
                  </div>
                </div>
              </div>
              {/* Match FormMessage styling for array validation */}
              <FormField
                control={control}
                name="respuestasMultiples.0.respuestasSeleccionadas"
                render={({ fieldState }) =>
                  fieldState.error ? <FormMessage className="text-xs">{fieldState.error.message}</FormMessage> : null
                }
              />
              {/* Match "Otras herramientas" styling */}
              <FormField
                control={control}
                name="otrasHerramientas"
                render={({ field }) => (
                  <FormItem className="mt-3">
                    <FormLabel className="text-sm font-medium">Otras herramientas o metodologías utilizadas (opcional)</FormLabel>
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
            {/* Match CardFooter and button styling */}
            <CardFooter className="flex justify-between py-3 px-6">
              {onPrevious && (
                <Button type="button" variant="outline" onClick={onPrevious} className="px-6 py-1.5 text-xs shadow-sm">
                  Anterior
                </Button>
              )}
              <Button type="submit" className="px-6 py-1.5 text-xs shadow-sm">
                {isEditing ? 'Guardar Cambios' : 'Siguiente'}
              </Button>
            </CardFooter>
          </Card>
        </form>
      </Form>
    </FormProvider>
  )
}
