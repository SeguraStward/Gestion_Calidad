'use client'

import React, { useEffect, useMemo } from 'react'
import { UseFormReturn, FormProvider } from 'react-hook-form'
import * as z from 'zod'
import { Button } from '@una-gc/ui/components/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@una-gc/ui/components/form'
import { Textarea } from '@una-gc/ui/components/textarea'
import { Card, CardHeader, CardTitle, CardContent } from '@una-gc/ui/components/card' // CardFooter removed from here if only used for nav
import { MoveRight, MoveLeft, Settings2, AlertTriangle } from 'lucide-react' // Added Settings2, AlertTriangle
import { cn } from '@una-gc/ui/lib/utils'

interface Option {
  value: string
  label: string
  category: string
}

interface PreguntaStep6 {
  idPregunta: string
  pregunta: string
  grupo_pregunta: string
  opciones: Option[]
  descripcion?: string
}

export const preguntasPaso6FormMock: PreguntaStep6[] = [
  {
    idPregunta: 'herramientas_tec',
    pregunta: '¿Qué herramientas tecnológicas utilizó principalmente durante el curso?',
    grupo_pregunta: 'Recursos Tecnológicos',
    descripcion: 'Haga clic en una herramienta para moverla entre las listas.',
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
]

const respuestaMultipleSchema = z.object({
  idPregunta: z.string(),
  respuestasSeleccionadas: z.array(z.string())
})

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
      // Validation: at least one tool selected OR "otrasHerramientas" has content
      const herramientasSeleccionadas = data.respuestasMultiples[0]?.respuestasSeleccionadas || []
      return herramientasSeleccionadas.length > 0 || (data.otrasHerramientas && data.otrasHerramientas.trim() !== '')
    },
    {
      message: 'Debe seleccionar al menos una herramienta tecnológica o especificar otras.',
      path: ['respuestasMultiples'] // Path to the field that should display the error
    }
  )

export type Step6FormData = z.infer<typeof step6Schema>

interface Step6FormProps {
  formMethods: UseFormReturn<Step6FormData>
  onSaveAndNext: (data: Step6FormData) => void
  onPrevious: () => void
  totalSteps: number
}

export function Step6Form({ formMethods, onSaveAndNext, onPrevious, totalSteps }: Step6FormProps) {
  const { control, handleSubmit, reset, watch, setValue, getValues, formState } = formMethods

  const preguntaHerramientas = useMemo(() => {
    return preguntasPaso6FormMock.find((p) => p.idPregunta === 'herramientas_tec')
  }, [])

  const opcionesHerramientas = useMemo(() => {
    return preguntaHerramientas?.opciones || []
  }, [preguntaHerramientas])

  const usadas = watch('respuestasMultiples.0.respuestasSeleccionadas') || []

  useEffect(() => {
    reset({
      respuestasMultiples: [
        {
          idPregunta: preguntaHerramientas?.idPregunta || 'herramientas_tec',
          respuestasSeleccionadas: []
        }
      ],
      otrasHerramientas: ''
    })
  }, [reset, preguntaHerramientas])

  const disponibles = useMemo(() => {
    return opcionesHerramientas.filter((opt) => !usadas.includes(opt.value))
  }, [opcionesHerramientas, usadas])

  const usadasOptions = useMemo(() => {
    return opcionesHerramientas.filter((opt) => usadas.includes(opt.value))
  }, [opcionesHerramientas, usadas])

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

  const handleFormSubmitError = (errors: any) => {
    console.error('Step 6 Form Validation Errors:', errors)
  }

  return (
    <div className="p-4 md:p-6 h-full flex flex-col">
      {/* Header Section (Stays Visible) */}
      <div className="mb-4">
        <h2 className="text-xl font-semibold flex items-center gap-3">
          <Settings2 className="w-5 h-5 text-foreground/70" />
          Paso {totalSteps > 0 ? `6 de ${totalSteps}: ` : ''}
          Herramientas Tecnológicas y Metodologías
        </h2>
        <p className="text-muted-foreground text-sm mt-1">
          Seleccione las herramientas utilizadas y describa otras si es necesario.
        </p>
      </div>

      {/* General Form Error Message for array-level validation */}
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
                {/* Ensure card takes full height of its container */}
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
