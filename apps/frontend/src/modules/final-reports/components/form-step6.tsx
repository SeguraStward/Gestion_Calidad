'use client'

import React, { useEffect, useMemo } from 'react' // Added useMemo
import { UseFormReturn, FormProvider } from 'react-hook-form'
import * as z from 'zod'
import { Button } from '@una-gc/ui/components/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@una-gc/ui/components/form'
import { Textarea } from '@una-gc/ui/components/textarea'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@una-gc/ui/components/card' // Using CardFooter
import { MoveRight, MoveLeft } from 'lucide-react' // Added

interface Option {
  value: string
  label: string
  category: string // Category might still be useful for display or future filtering, but not directly used in dual list grouping
}

interface PreguntaStep6 {
  idPregunta: string
  pregunta: string
  grupo_pregunta: string // This might be used for the main question text
  opciones: Option[]
  descripcion?: string // Added for consistency if needed, similar to edit form's mock
}

// Mock data: We'll focus on 'herramientas_tec'.
// If 'metodologias_ensenanza' is needed, it would be a separate system or step.
export const preguntasPaso6FormMock: PreguntaStep6[] = [
  {
    idPregunta: 'herramientas_tec',
    pregunta: '¿Qué herramientas tecnológicas utilizó principalmente durante el curso?',
    grupo_pregunta: 'Recursos Tecnológicos', // Can be used as a description or part of the main question.
    descripcion: 'Haga clic en una herramienta para moverla entre las listas.', // Added description
    opciones: [
      { value: 'moodle', label: 'Campus Virtual (Moodle)', category: 'Plataformas LMS' },
      { value: 'blackboard', label: 'Blackboard', category: 'Plataformas LMS' },
      { value: 'canvas', label: 'Canvas', category: 'Plataformas LMS' },
      { value: 'teams', label: 'Microsoft Teams', category: 'Comunicación' },
      { value: 'zoom', label: 'Zoom', category: 'Comunicación' },
      { value: 'meet', label: 'Google Meet', category: 'Comunicación' },
      { value: 'discord', label: 'Discord', category: 'Comunicación' },
      { value: 'whatsapp', label: 'WhatsApp', category: 'Comunicación' },
      { value: 'kahoot', label: 'Kahoot!', category: 'Gamificación' },
      { value: 'quizizz', label: 'Quizizz', category: 'Gamificación' },
      { value: 'mentimeter', label: 'Mentimeter', category: 'Interacción' },
      { value: 'padlet', label: 'Padlet', category: 'Interacción' },
      { value: 'jamboard', label: 'Google Jamboard', category: 'Interacción' },
      { value: 'videos_propios', label: 'Videos Propios', category: 'Material Multimedia' },
      { value: 'youtube', label: 'YouTube', category: 'Material Multimedia' },
      { value: 'vimeo', label: 'Vimeo', category: 'Material Multimedia' },
      { value: 'simuladores', label: 'Simuladores Específicos', category: 'Software Especializado' },
      { value: 'laboratorios_virtuales', label: 'Laboratorios Virtuales', category: 'Software Especializado' },
      { value: 'matlab', label: 'MATLAB', category: 'Software Especializado' },
      { value: 'autocad', label: 'AutoCAD', category: 'Software Especializado' }
    ]
  }
  // The "metodologias_ensenanza" question is removed from this component's direct handling
  // to match the structure of form-step6-edit.tsx which focuses on one question type.
]

// Schema for a single multiple response item (matches edit form)
const respuestaMultipleSchema = z.object({
  idPregunta: z.string(),
  respuestasSeleccionadas: z.array(z.string())
})

// Schema for the entire step 6 form data (matches edit form)
export const step6Schema = z.object({
  respuestasMultiples: z.array(respuestaMultipleSchema).length(1, 'Debe haber exactamente un conjunto de respuestas múltiples.'),
  otrasHerramientas: z.string().optional()
})

export type Step6FormData = z.infer<typeof step6Schema>

interface Step6FormProps {
  formMethods: UseFormReturn<Step6FormData>
  onSaveAndNext: (data: Step6FormData) => void
  onPrevious: () => void
  totalSteps: number
  // initialData and isEditing are not typically used in a 'create' form,
  // but the structure is being mirrored. The useEffect will handle initialization.
}

export function Step6Form({ formMethods, onSaveAndNext, onPrevious, totalSteps }: Step6FormProps) {
  const { control, handleSubmit, reset, watch, setValue, getValues } = formMethods

  // Focus on the first (and now only) question defined in preguntasPaso6FormMock for tools
  const preguntaHerramientas = useMemo(() => {
    return preguntasPaso6FormMock.find((p) => p.idPregunta === 'herramientas_tec')
  }, [])

  const opcionesHerramientas = useMemo(() => {
    return preguntaHerramientas?.opciones || []
  }, [preguntaHerramientas])

  // Watch for changes in the selected tools for the first (and only) question
  const usadas = watch('respuestasMultiples.0.respuestasSeleccionadas') || []

  useEffect(() => {
    // Initialize the form structure for the single "herramientas_tec" question
    // This ensures the form data structure matches what the UI expects.
    reset({
      respuestasMultiples: [
        {
          idPregunta: preguntaHerramientas?.idPregunta || 'herramientas_tec',
          respuestasSeleccionadas: [] // Start with no tools selected
        }
      ],
      otrasHerramientas: ''
    })
  }, [reset, preguntaHerramientas]) // Depend on reset and preguntaHerramientas

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
    console.error('Step 6 Form Validation Errors:', errors)
    console.log('Form values at time of validation error:', getValues())
  }

  return (
    <FormProvider {...formMethods}>
      <Form {...formMethods}>
        <form onSubmit={handleSubmit(onSaveAndNext, handleFormSubmitError)} className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>
                Paso {totalSteps > 0 ? `6 de ${totalSteps}: ` : ''}
                Herramientas Tecnológicas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {preguntaHerramientas && (
                <div className="mb-4">
                  <FormLabel className="text-base font-semibold">{preguntaHerramientas.pregunta}</FormLabel>
                  <p className="text-sm text-muted-foreground">
                    {preguntaHerramientas.descripcion || 'Haga clic en una herramienta para moverla entre las listas.'}
                  </p>
                </div>
              )}
              <div className="flex flex-col md:flex-row gap-6">
                {/* Lista de disponibles */}
                <div className="flex-1">
                  <FormLabel className="block mb-2 font-semibold">No usadas ({disponibles.length})</FormLabel>
                  <div className="border rounded h-[200px] overflow-y-scroll p-2 space-y-1">
                    {disponibles.map((opt) => (
                      <div
                        key={`disponible-${opt.value}`}
                        className="p-2 rounded hover:bg-muted/80 cursor-pointer flex items-center justify-between group min-h-[2.5rem]"
                        onClick={() => handleMoveToUsed(opt.value)}
                        title={`Mover "${opt.label}" a usadas`}
                      >
                        <span className="flex-grow text-center truncate mx-1">{opt.label}</span>
                        <MoveRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                      </div>
                    ))}
                    {disponibles.length === 0 && (
                      <div className="p-2 text-muted-foreground text-sm min-h-[2.5rem] flex items-center justify-center">
                        Todas las herramientas seleccionadas
                      </div>
                    )}
                  </div>
                </div>

                {/* Lista de usadas */}
                <div className="flex-1">
                  <FormLabel className="block mb-2 font-semibold">Usadas ({usadasOptions.length})</FormLabel>
                  <div className="border rounded h-[200px] overflow-y-scroll p-2 space-y-1">
                    {usadasOptions.map((opt) => (
                      <div
                        key={`usada-${opt.value}`}
                        className="p-2 rounded hover:bg-muted/80 cursor-pointer flex items-center justify-between group min-h-[2.5rem]"
                        onClick={() => handleMoveToAvailable(opt.value)}
                        title={`Mover "${opt.label}" a no usadas`}
                      >
                        <MoveLeft className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                        <span className="flex-grow text-center truncate mx-1">{opt.label}</span>
                      </div>
                    ))}
                    {usadasOptions.length === 0 && (
                      <div className="p-2 text-muted-foreground text-sm min-h-[2.5rem] flex items-center justify-center">
                        Ninguna herramienta seleccionada
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <FormField
                control={control}
                name="respuestasMultiples.0.respuestasSeleccionadas" // Path to the array for validation messages
                render={({ fieldState }) => (fieldState.error ? <FormMessage>{fieldState.error.message}</FormMessage> : null)}
              />
              <FormField
                control={control}
                name="otrasHerramientas"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Otras herramientas utilizadas (opcional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Si utilizó otras herramientas no listadas, descríbalas aquí..."
                        {...field}
                        className="min-h-[80px]"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button type="button" variant="outline" onClick={onPrevious}>
                Anterior
              </Button>
              <Button type="submit">Siguiente</Button>
            </CardFooter>
          </Card>
        </form>
      </Form>
    </FormProvider>
  )
}
