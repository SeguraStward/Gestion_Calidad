'use client'

import React, { useEffect } from 'react' // Make sure React and useEffect are imported
import { UseFormReturn, FormProvider } from 'react-hook-form'
import * as z from 'zod'
import { Button } from '@una-gc/ui/components/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@una-gc/ui/components/form'
import { Checkbox } from '@una-gc/ui/components/checkbox'
import { Textarea } from '@una-gc/ui/components/textarea'
import { Card, CardHeader, CardTitle, CardContent } from '@una-gc/ui/components/card'
import { Separator } from '@una-gc/ui/components/separator'
import { Badge } from '@una-gc/ui/components/badge'
import { Settings, Monitor, MessageCircle, Gamepad2, Users, Video, Laptop } from 'lucide-react'

// Estructura de las opciones para las preguntas de selección múltiple
interface Option {
  value: string
  label: string
  category: string
}

// Estructura de una pregunta para el Paso 6
interface PreguntaStep6 {
  idPregunta: string
  pregunta: string
  opciones: Option[]
  grupo_pregunta?: string
}

// Mock data expandido basado en el proyecto anterior
const preguntasPaso6Mock: PreguntaStep6[] = [
  {
    idPregunta: 'herramientas_tec',
    pregunta: '¿Qué herramientas tecnológicas utilizó principalmente durante el curso?',
    grupo_pregunta: 'Recursos Tecnológicos',
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
  },
  {
    idPregunta: 'metodologias_ensenanza',
    pregunta: '¿Qué metodologías de enseñanza implementó durante el curso?',
    grupo_pregunta: 'Metodologías Pedagógicas',
    opciones: [
      { value: 'clase_magistral', label: 'Clase Magistral', category: 'Métodos Tradicionales' },
      { value: 'seminarios', label: 'Seminarios', category: 'Métodos Tradicionales' },
      { value: 'talleres_practicos', label: 'Talleres Prácticos', category: 'Métodos Activos' },
      { value: 'aprendizaje_basado_problemas', label: 'Aprendizaje Basado en Problemas', category: 'Métodos Activos' },
      { value: 'estudio_casos', label: 'Estudio de Casos', category: 'Métodos Activos' },
      { value: 'aprendizaje_colaborativo', label: 'Aprendizaje Colaborativo', category: 'Métodos Activos' },
      { value: 'flipped_classroom', label: 'Aula Invertida', category: 'Metodologías Innovadoras' },
      { value: 'gamificacion', label: 'Gamificación', category: 'Metodologías Innovadoras' },
      { value: 'design_thinking', label: 'Design Thinking', category: 'Metodologías Innovadoras' },
      { value: 'proyecto_investigacion', label: 'Proyectos de Investigación', category: 'Metodologías Innovadoras' }
    ]
  }
]

// Esquema para una respuesta de selección múltiple
const respuestaMultipleSchema = z.object({
  idPregunta: z.string(),
  respuestasSeleccionadas: z.array(z.string()).min(0, 'Las selecciones son opcionales.')
})

// Esquema de validación con Zod para el Paso 6
export const step6Schema = z.object({
  respuestasMultiples: z.array(respuestaMultipleSchema),
  otrasHerramientas: z.string().optional()
})

export type Step6FormData = z.infer<typeof step6Schema>

interface Step6FormProps {
  formMethods: UseFormReturn<Step6FormData>
  onSaveAndNext: (data: Step6FormData) => void
  onPrevious: () => void
  totalSteps: number
}

// Función para obtener el icono según la categoría (similar to Step 5's MessageSquareText for header)
const getCategoryIcon = (category: string) => {
  const iconMap = {
    'Plataformas LMS': Monitor,
    Comunicación: MessageCircle,
    Gamificación: Gamepad2,
    Interacción: Users,
    'Material Multimedia': Video,
    'Software Especializado': Laptop,
    'Métodos Tradicionales': Settings, // Using Settings as a generic icon
    'Métodos Activos': Users,
    'Metodologías Innovadoras': Settings // Using Settings as a generic icon
  }
  return iconMap[category as keyof typeof iconMap] || Settings // Default icon
}

// Función para obtener el color según la categoría (for badges, if needed, similar to Step 5's muted style)
const getCategoryColor = (category: string) => {
  // This function might not be directly used if we simplify badges to match Step 5's muted style
  const colorMap = {
    'Plataformas LMS': 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300',
    Comunicación: 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300',
    Gamificación: 'bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300',
    Interacción: 'bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-300',
    'Material Multimedia': 'bg-pink-100 text-pink-700 dark:bg-pink-900/20 dark:text-pink-300',
    'Software Especializado': 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-300',
    'Métodos Tradicionales': 'bg-slate-100 text-slate-700 dark:bg-slate-900/20 dark:text-slate-300',
    'Métodos Activos': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300',
    'Metodologías Innovadoras': 'bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300'
  }
  return colorMap[category as keyof typeof colorMap] || 'bg-slate-100 text-slate-700 dark:bg-slate-900/20 dark:text-slate-300'
}

// Función para obtener colores de fondo de categoría (for category group boxes)
const getCategoryBackgroundColor = (category: string) => {
  // To match Step 5, category groups might not need distinct background colors,
  // but rather rely on borders and spacing. If distinct backgrounds are kept, ensure they are subtle.
  // For now, let's use a generic subtle background for the category groups.
  return 'bg-muted/20 dark:bg-muted/10 border border-border/30 dark:border-border/20'
  // Original distinct colors (can be re-enabled if preferred):
  // const colorMap = {
  //   'Plataformas LMS': 'border-blue-200/50 dark:border-blue-700/50 bg-blue-50/30 dark:bg-blue-950/15',
  // ...
  // }
  // return colorMap[category as keyof typeof colorMap] || 'border-slate-200/50 dark:border-slate-700/50 bg-slate-50/30 dark:bg-slate-950/15'
}

export function Step6Form({ formMethods, onSaveAndNext, onPrevious, totalSteps }: Step6FormProps) {
  const { control, watch, setValue, getValues, handleSubmit, formState } = formMethods

  useEffect(() => {
    const currentFormState = getValues()
    const currentRespuestasMultiples = currentFormState.respuestasMultiples

    const desiredStructure = preguntasPaso6Mock.map((p) => {
      const existingEntry = Array.isArray(currentRespuestasMultiples)
        ? currentRespuestasMultiples.find((r) => r && r.idPregunta === p.idPregunta)
        : undefined
      return {
        idPregunta: p.idPregunta,
        respuestasSeleccionadas: existingEntry?.respuestasSeleccionadas || []
      }
    })

    let needsUpdate = true
    if (Array.isArray(currentRespuestasMultiples) && currentRespuestasMultiples.length === desiredStructure.length) {
      needsUpdate = !currentRespuestasMultiples.every((cr, index) => {
        const dr = desiredStructure[index]
        // Add a check for dr to ensure it's not undefined
        return cr && dr && typeof cr.idPregunta === 'string' && cr.idPregunta === dr.idPregunta
      })
    }

    if (needsUpdate) {
      setValue('respuestasMultiples', desiredStructure, {
        shouldDirty: false,
        shouldValidate: false
      })
    }
  }, [setValue, getValues])

  const respuestasMultiplesActuales = watch('respuestasMultiples')

  const groupOptionsByCategory = (options: Option[]) => {
    return options.reduce(
      (acc, option) => {
        ;(acc[option.category] = acc[option.category] || []).push(option)
        return acc
      },
      {} as Record<string, Option[]>
    )
  }

  const totalSelections =
    respuestasMultiplesActuales?.reduce((total, resp) => {
      return total + (resp && Array.isArray(resp.respuestasSeleccionadas) ? resp.respuestasSeleccionadas.length : 0)
    }, 0) || 0 // Added semicolon here

  const handleFormSubmitSuccess = (data: Step6FormData) => {
    onSaveAndNext(data)
  }

  const handleFormSubmitError = (errors: any) => {
    const currentValues = getValues()
    console.error('Step 6 Form Validation Errors:', errors)
    console.log('Form values at time of validation error:', currentValues)
  }

  return (
    <div className="p-6 h-full flex flex-col">
      {/* Header - Styled like Step 5 */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold flex items-center gap-3">
          <Settings className="w-5 h-5 text-foreground/70" /> {/* Generic icon like Step 5 */}
          Herramientas y Metodologías
        </h2>
        <p className="text-muted-foreground text-sm mt-1">
          Seleccione las herramientas y metodologías utilizadas durante el curso.
        </p>
      </div>

      <FormProvider {...formMethods}>
        <Form {...formMethods}>
          {/* Ensure handleSubmit uses both success and error callbacks */}
          <form onSubmit={handleSubmit(handleFormSubmitSuccess, handleFormSubmitError)} className="flex-1 flex flex-col">
            <div className="flex-1">
              {/* Card - Styled like Step 5 */}
              <Card className="border-border/40 bg-card/50 backdrop-blur-sm shadow-sm">
                <CardHeader className="pb-4">
                  {/* Modified CardTitle to always show selection count span */}
                  <CardTitle className="text-base font-medium text-foreground/90 flex justify-between items-baseline">
                    <span>Selección de Recursos</span>
                    <span className="text-xs text-muted-foreground ml-2 font-normal">
                      ({totalSelections} seleccionada{totalSelections !== 1 ? 's' : ''})
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-0">
                  {preguntasPaso6Mock.map((pregunta, preguntaIndex) => {
                    const groupedOptions = groupOptionsByCategory(pregunta.opciones)
                    const seleccionesActuales = watch(`respuestasMultiples.${preguntaIndex}.respuestasSeleccionadas`) || []

                    return (
                      <div key={pregunta.idPregunta}>
                        <div className="py-5 px-1">
                          <div className="mb-4">
                            <FormLabel className="text-sm font-medium leading-relaxed text-foreground/90 block">
                              <span className="inline-flex items-baseline gap-2">
                                <span className="text-muted-foreground font-normal text-xs bg-muted/50 px-2 py-0.5 rounded-full min-w-[24px] text-center">
                                  {preguntaIndex + 1}
                                </span>
                                <span className="flex-1">{pregunta.pregunta}</span>
                              </span>
                            </FormLabel>
                            {/* Always render the div and Badge for per-question selection count */}
                            <div className="mt-2 ml-8 h-7 flex items-center">
                              {' '}
                              {/* Added fixed height h-7 (adjust if needed) */}
                              <Badge variant="outline" className="text-xs border-border/50 text-muted-foreground">
                                {seleccionesActuales.length} seleccionada{seleccionesActuales.length !== 1 ? 's' : ''}
                              </Badge>
                            </div>
                          </div>

                          {/* Opciones agrupadas por categoría - Styled similar to Step 5 */}
                          <div className="space-y-4">
                            {Object.entries(groupedOptions).map(([category, options]) => {
                              const isFirstCategory = true // For controlling border radius
                              const isLastCategory = false // For controlling border radius

                              return (
                                <div
                                  key={category}
                                  className={`rounded-lg border ${
                                    isFirstCategory ? 'border-t-0' : ''
                                  } ${isLastCategory ? 'border-b-0' : ''} border-border/50 bg-muted/10`}
                                >
                                  {/* Category Header - With icon and badge for selected count */}
                                  <div className="flex items-center justify-between py-3 px-4 rounded-t-lg bg-muted/50">
                                    <div className="flex items-center gap-3">
                                      {/* Icon */}
                                      <div className="flex-shrink-0">
                                        {getCategoryIcon(category)({ className: 'w-5 h-5 text-foreground' })}
                                      </div>
                                      {/* Category Name and Selection Count */}
                                      <div className="flex-1">
                                        <span className="block text-sm font-medium text-foreground/90">{category}</span>
                                        <span className="text-xs text-muted-foreground">
                                          {options.length} opción{options.length !== 1 ? 'es' : ''} disponible
                                          {options.length !== 1 ? 's' : ''}
                                        </span>
                                      </div>
                                    </div>
                                    {/* Badge for selected count */}
                                    <Badge variant="outline" className="text-xs border-border/50 text-muted-foreground">
                                      {
                                        seleccionesActuales.filter((value) => options.find((option) => option.value === value))
                                          .length
                                      }{' '}
                                      seleccionada
                                      {seleccionesActuales.filter((value) => options.find((option) => option.value === value))
                                        .length !== 1
                                        ? 's'
                                        : ''}
                                    </Badge>
                                  </div>

                                  {/* Opciones - Rendered as checkboxes */}
                                  <div className="py-2 px-4 space-y-2">
                                    {options.map((option) => {
                                      const isSelected = seleccionesActuales.includes(option.value)
                                      return (
                                        <FormItem key={option.value} className="flex items-center">
                                          <FormControl>
                                            <Checkbox
                                              checked={isSelected}
                                              onCheckedChange={(checked) => {
                                                const newSelections = checked
                                                  ? [...seleccionesActuales, option.value]
                                                  : seleccionesActuales.filter((value) => value !== option.value)
                                                setValue(
                                                  `respuestasMultiples.${preguntaIndex}.respuestasSeleccionadas`,
                                                  newSelections,
                                                  {
                                                    shouldDirty: true,
                                                    shouldValidate: true
                                                  }
                                                )
                                              }}
                                              className="h-5 w-5 rounded-md border-border/50"
                                            />
                                          </FormControl>
                                          <FormLabel className="text-sm font-medium text-foreground/90 ml-3">
                                            {option.label}
                                          </FormLabel>
                                        </FormItem>
                                      )
                                    })}
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </div>

                        {/* Divider between questions - Styled like Step 5 */}
                        {preguntaIndex < preguntasPaso6Mock.length - 1 && <Separator className="my-4 border-border/50" />}
                      </div>
                    )
                  })}
                </CardContent>
              </Card>
            </div>

            {/* Footer - Styled like Step 5 */}
            <div className="flex justify-end gap-4 mt-4">
              <Button variant="outline" onClick={onPrevious} className="px-4 py-2 text-sm">
                Volver
              </Button>
              <Button type="submit" className="px-4 py-2 text-sm">
                Siguiente
              </Button>
            </div>
          </form>
        </Form>
      </FormProvider>
    </div>
  )
}
