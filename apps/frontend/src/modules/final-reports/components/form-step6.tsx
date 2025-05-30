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
        return cr && typeof cr.idPregunta === 'string' && cr.idPregunta === dr.idPregunta
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
    }, 0) || 0

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

                          {/* Opciones agrupadas por categoría - Styled subtly */}
                          <div className="ml-8 space-y-4">
                            {Object.entries(groupedOptions).map(([category, options]) => {
                              const IconComponent = getCategoryIcon(category)
                              const seleccionesCategoria = options.filter((opt) => seleccionesActuales.includes(opt.value)).length
                              const categoryStyling = getCategoryBackgroundColor(category)

                              return (
                                <div key={category} className={`rounded-lg p-4 transition-all duration-200 ${categoryStyling}`}>
                                  <div className="flex items-center gap-2 mb-3">
                                    <IconComponent className="w-4 h-4 text-muted-foreground" />
                                    <h4 className="font-medium text-sm text-foreground/85">{category}</h4>
                                    {/* Always render the Badge for per-category selection count */}
                                    <div className="ml-auto">
                                      {' '}
                                      {/* Wrapper to push badge to the right */}
                                      <Badge variant="outline" className="text-xs border-border/50 text-muted-foreground">
                                        {seleccionesCategoria}
                                      </Badge>
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {options.map((option) => {
                                      const isSelected = seleccionesActuales.includes(option.value)
                                      return (
                                        <FormField
                                          key={option.value}
                                          control={control}
                                          name={`respuestasMultiples.${preguntaIndex}.respuestasSeleccionadas`}
                                          render={({ field }) => (
                                            <FormItem>
                                              <div
                                                className={`flex items-start space-x-2 p-2.5 rounded-md transition-all duration-200 cursor-pointer border border-transparent hover:border-border/30 hover:bg-muted/30 
                                                  ${isSelected ? 'bg-muted/50 border-border/40' : 'bg-background/30'}`}
                                              >
                                                <FormControl className="mt-[3px]">
                                                  <Checkbox
                                                    checked={field.value?.includes(option.value) || false}
                                                    onCheckedChange={(checked) => {
                                                      const currentValue = field.value || []
                                                      return checked
                                                        ? field.onChange([...currentValue, option.value])
                                                        : field.onChange(
                                                            currentValue.filter((value: string) => value !== option.value)
                                                          )
                                                    }}
                                                  />
                                                </FormControl>
                                                <FormLabel className="text-sm font-normal leading-relaxed cursor-pointer flex-1 text-foreground/80">
                                                  {option.label}
                                                </FormLabel>
                                              </div>
                                            </FormItem>
                                          )}
                                        />
                                      )
                                    })}
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                          <FormMessage className="text-xs mt-2 ml-8 text-destructive">
                            {formState.errors.respuestasMultiples?.[preguntaIndex]?.root?.message ||
                              formState.errors.respuestasMultiples?.[preguntaIndex]?.respuestasSeleccionadas?.message}
                          </FormMessage>
                        </div>
                        {preguntaIndex < preguntasPaso6Mock.length - 1 && <Separator className="opacity-30" />}
                      </div>
                    )
                  })}

                  {/* Otras Herramientas - Styled like Step 5's Textarea */}
                  <div className="py-5 px-1">
                    <Separator className="opacity-30 mb-5" />
                    <FormField
                      control={control}
                      name="otrasHerramientas"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-foreground/90">
                            Otras herramientas o metodologías no listadas
                          </FormLabel>
                          <div className="mt-2">
                            <FormControl>
                              <Textarea
                                placeholder="Especifique aquí otras herramientas, plataformas, o metodologías utilizadas..."
                                rows={3}
                                className="resize-y bg-background/60 border-border/60 focus:border-border focus:bg-background transition-all duration-200 text-sm leading-relaxed shadow-sm"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage className="text-xs mt-1.5 text-destructive" />
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Botones de navegación - Styled like Step 5 */}
            <div className="flex justify-between pt-6 mt-auto">
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
