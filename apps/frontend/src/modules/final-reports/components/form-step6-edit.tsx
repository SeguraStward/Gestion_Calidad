'use client'

import React, { useEffect, useMemo } from 'react'
import { UseFormReturn, FormProvider } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@una-gc/ui/components/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@una-gc/ui/components/form'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@una-gc/ui/components/card'
import { Textarea } from '@una-gc/ui/components/textarea'
import { preguntasPaso6PageMock } from '@/modules/final-reports/mocks/questions'
import { MoveRight, MoveLeft } from 'lucide-react'

// Schema for a single multiple response item
const respuestaMultipleSchema = z.object({
  idPregunta: z.string(),
  respuestasSeleccionadas: z.array(z.string()) // Removed .min(1, 'Debe seleccionar al menos una herramienta.')
})

// Schema for the entire step 6 form data
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
  isEditing?: boolean
}

export function Step6EditForm({
  formMethods,
  onSaveAndNext,
  onPrevious,
  totalSteps,
  initialData,
  isEditing = false
}: Step6EditFormProps) {
  const { control, handleSubmit, reset, watch, setValue, getValues } = formMethods

  const preguntaHerramientas = useMemo(() => {
    return preguntasPaso6PageMock.find((p) => p.idPregunta === 'herramientas_utilizadas')
  }, [])

  const opcionesHerramientas = useMemo(() => {
    return preguntaHerramientas?.opciones || []
  }, [preguntaHerramientas])

  const usadas = watch('respuestasMultiples.0.respuestasSeleccionadas') || []

  useEffect(() => {
    if (isEditing && initialData) {
      reset(initialData)
    } else if (!isEditing) {
      reset({
        respuestasMultiples: [
          {
            idPregunta: preguntaHerramientas?.idPregunta || 'herramientas_utilizadas',
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

  return (
    <FormProvider {...formMethods}>
      <Form {...formMethods}>
        <form onSubmit={handleSubmit(onSaveAndNext)} className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>
                Paso {totalSteps > 0 ? `6 de ${totalSteps}: ` : ''}
                Herramientas Tecnológicas {isEditing ? '(Editando)' : ''}
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
                    {' '}
                    {/* Fixed height */}
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
                        {' '}
                        {/* Added justify-center */}
                        Todas las herramientas seleccionadas
                      </div>
                    )}
                  </div>
                </div>

                {/* Lista de usadas */}
                <div className="flex-1">
                  <FormLabel className="block mb-2 font-semibold">Usadas ({usadasOptions.length})</FormLabel>
                  <div className="border rounded h-[200px] overflow-y-scroll p-2 space-y-1">
                    {' '}
                    {/* Fixed height */}
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
                        {' '}
                        {/* Added justify-center */}
                        Ninguna herramienta seleccionada
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <FormField
                control={control}
                name="respuestasMultiples.0.respuestasSeleccionadas"
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
              {onPrevious && (
                <Button type="button" variant="outline" onClick={onPrevious}>
                  Anterior
                </Button>
              )}
              <Button type="submit">{isEditing ? 'Guardar y Continuar' : 'Siguiente'}</Button>
            </CardFooter>
          </Card>
        </form>
      </Form>
    </FormProvider>
  )
}
