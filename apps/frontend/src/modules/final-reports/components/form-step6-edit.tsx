'use client'

import { UseFormReturn, FormProvider, Controller } from 'react-hook-form'
import * as z from 'zod'
import { Button } from '@una-gc/ui/components/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@una-gc/ui/components/form'
import { Checkbox } from '@una-gc/ui/components/checkbox'
import { Textarea } from '@una-gc/ui/components/textarea'
import { CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@una-gc/ui/components/card'
import { Separator } from '@una-gc/ui/components/separator'
import { Step6FormData, step6Schema } from './form-step6' // Reutilizamos schema y tipo
import { useEffect } from 'react'

interface Option {
  value: string
  label: string
  category: string
}
interface PreguntaStep6 {
  idPregunta: string
  pregunta: string
  opciones: Option[]
  grupo_pregunta?: string
}

// Mock data para las preguntas del Paso 6 (DEBE SER CONSISTENTE)
const preguntasPaso6Mock: PreguntaStep6[] = [
  {
    idPregunta: 'herramientas_tec',
    pregunta: '¿Qué herramientas tecnológicas utilizó principalmente durante el curso?',
    grupo_pregunta: 'Recursos Tecnológicos',
    opciones: [
      { value: 'moodle', label: 'Campus Virtual (Moodle)', category: 'Plataformas LMS' },
      { value: 'teams', label: 'Microsoft Teams', category: 'Comunicación' },
      { value: 'zoom', label: 'Zoom', category: 'Comunicación' },
      { value: 'kahoot', label: 'Kahoot!', category: 'Gamificación' },
      { value: 'mentimeter', label: 'Mentimeter', category: 'Interacción' },
      { value: 'videos_propios', label: 'Videos Propios', category: 'Material Multimedia' },
      { value: 'simuladores', label: 'Simuladores Específicos', category: 'Software Especializado' }
    ]
  }
]

interface Step6EditFormProps {
  formMethods: UseFormReturn<Step6FormData>
  onSaveAndNext: (data: Step6FormData) => void
  onPrevious: () => void
  totalSteps: number
}

export function Step6EditForm({ formMethods, onSaveAndNext, onPrevious, totalSteps }: Step6EditFormProps) {
  const { control, watch, setValue } = formMethods

  const respuestasMultiplesActuales = watch('respuestasMultiples')
  useEffect(() => {
    if (!respuestasMultiplesActuales || respuestasMultiplesActuales.length !== preguntasPaso6Mock.length) {
      const currentAnswersMap = new Map(respuestasMultiplesActuales?.map((r) => [r.idPregunta, r.respuestasSeleccionadas]))
      setValue(
        'respuestasMultiples',
        preguntasPaso6Mock.map((p) => ({
          idPregunta: p.idPregunta,
          respuestasSeleccionadas: currentAnswersMap.get(p.idPregunta) || []
        })),
        { shouldValidate: true, shouldDirty: true }
      )
    }
  }, [respuestasMultiplesActuales, setValue])

  const groupOptionsByCategory = (options: Option[]) => {
    return options.reduce(
      (acc, option) => {
        ;(acc[option.category] = acc[option.category] || []).push(option)
        return acc
      },
      {} as Record<string, Option[]>
    )
  }

  return (
    <FormProvider {...formMethods}>
      <Form {...formMethods}>
        <form onSubmit={formMethods.handleSubmit(onSaveAndNext)} className="space-y-8">
          <CardHeader>
            <CardTitle>Paso 6 de {totalSteps}: Herramientas y Metodologías (Editando)</CardTitle>
            <CardDescription>
              Seleccione las herramientas y metodologías utilizadas y especifique otras si es necesario.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {preguntasPaso6Mock.map((pregunta, preguntaIndex) => {
              const groupedOptions = groupOptionsByCategory(pregunta.opciones)
              return (
                <div key={pregunta.idPregunta} className="space-y-4 p-4 border rounded-md">
                  <FormLabel className="text-base font-semibold">
                    {preguntaIndex + 1}. {pregunta.pregunta}
                  </FormLabel>
                  {Object.entries(groupedOptions).map(([category, options]) => (
                    <div key={category} className="space-y-2">
                      <h4 className="font-medium text-sm text-muted-foreground">{category}</h4>
                      {options.map((option) => (
                        <FormField
                          key={option.value}
                          control={control}
                          name={`respuestasMultiples.${preguntaIndex}.respuestasSeleccionadas`}
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(option.value)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([...(field.value || []), option.value])
                                      : field.onChange((field.value || []).filter((value: string) => value !== option.value))
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="font-normal">{option.label}</FormLabel>
                            </FormItem>
                          )}
                        />
                      ))}
                    </div>
                  ))}
                  <FormMessage>
                    {formMethods.formState.errors.respuestasMultiples?.[preguntaIndex]?.respuestasSeleccionadas?.message}
                  </FormMessage>
                </div>
              )
            })}
            <Separator />
            <FormField
              control={control}
              name="otrasHerramientas"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <strong>En caso de utilizar otras herramientas o metodologías no listadas, especifique:</strong>
                  </FormLabel>
                  <FormControl>
                    <Textarea placeholder="Especifique aquí..." rows={3} className="resize-y" {...field} />
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
            <Button type="submit">Siguiente Paso</Button>
          </CardFooter>
        </form>
      </Form>
    </FormProvider>
  )
}
