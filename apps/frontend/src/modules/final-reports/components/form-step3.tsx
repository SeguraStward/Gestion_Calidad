'use client'

import React, { useState } from 'react'
import { UseFormReturn, FormProvider, useFieldArray, Controller } from 'react-hook-form'
import * as z from 'zod'
import { Button } from '@una-gc/ui/components/button'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@una-gc/ui/components/form'
import { Input } from '@una-gc/ui/components/input'
import { Textarea } from '@una-gc/ui/components/textarea'
import { Card, CardHeader, CardTitle, CardContent } from '@una-gc/ui/components/card'
import { Separator } from '@una-gc/ui/components/separator'
import { PlusCircle, Trash2, Users, Edit3, Check, X } from 'lucide-react'

// Esquema para un solo estudiante de salvaguarda
const salvaguardaEstudianteSchema = z.object({
  cedula: z
    .string()
    .min(1, 'La cédula es requerida')
    .regex(/^[0-9]+$/, 'La cédula solo debe contener números')
    .min(9, 'La cédula debe tener al menos 9 dígitos'), // <--- NUEVA VALIDACIÓN
  nombre: z.string().min(1, 'El nombre es requerido'),
  nota: z.coerce
    .number({ invalid_type_error: 'La nota debe ser un número' })
    .min(0, 'La nota no puede ser negativa')
    .max(100, 'La nota no puede ser mayor a 100'),
  observacion: z.string().optional()
})

// Esquema de validación con Zod para el Paso 3
export const step3Schema = z.object({
  salvaguardaEstudiantes: z.array(salvaguardaEstudianteSchema).min(0)
})

export type Step3FormData = z.infer<typeof step3Schema>

interface Step3FormProps {
  formMethods: UseFormReturn<Step3FormData>
  onSaveAndNext: (data: Step3FormData) => void
  onPrevious: () => void
  totalSteps: number
  tipoInforme?: string // Add this if Step3Form needs it
}

export function Step3Form({ formMethods, onSaveAndNext, onPrevious, totalSteps, tipoInforme }: Step3FormProps) {
  const { control } = formMethods
  const [editingObservacion, setEditingObservacion] = useState<number | null>(null)

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'salvaguardaEstudiantes'
  })

  const addNewStudent = () => {
    append({
      cedula: '',
      nombre: '',
      nota: 0,
      observacion: ''
    })
  }

  const handleEditObservacion = (index: number) => {
    setEditingObservacion(index)
  }

  const handleSaveObservacion = () => {
    setEditingObservacion(null)
  }

  const handleCancelObservacion = () => {
    setEditingObservacion(null)
  }

  const tituloPaso =
    tipoInforme === 'INFORME_FINAL_V1' ? 'Registro de Estudiantes (Plan Indígena)' : 'Registro de Estudiantes (Salvaguarda)'

  return (
    <div className="p-6 h-full flex flex-col">
      {/* Header compacto */}
      <div className="mb-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Users className="w-5 h-5" />
          {tituloPaso}
        </h2>
        <p className="text-muted-foreground text-sm">Registre la información de los estudiantes del programa de salvaguarda</p>
      </div>

      <FormProvider {...formMethods}>
        <Form {...formMethods}>
          <form onSubmit={formMethods.handleSubmit(onSaveAndNext)} className="flex-1 flex flex-col">
            {/* Contenido principal */}
            <div className="flex-1">
              <Card className="border-primary/20 bg-primary/5 h-fit">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center justify-between">
                    <span className="flex items-center gap-2">Estudiantes Registrados ({fields.length})</span>
                    <Button
                      type="button"
                      variant="default"
                      size="sm"
                      onClick={addNewStudent}
                      className="h-8 bg-emerald-500 hover:bg-emerald-600 dark:bg-emerald-700 dark:hover:bg-emerald-800 text-white"
                    >
                      <PlusCircle className="h-4 w-4 mr-1" />
                      Añadir
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {fields.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p className="text-sm">No hay estudiantes registrados</p>
                      <p className="text-xs">Haga clic en &quot;Añadir&quot; para agregar un estudiante</p> {/* Changed here */}
                    </div>
                  ) : (
                    <>
                      {/* Header de la tabla */}
                      <div className="grid grid-cols-12 gap-2 px-3 py-2 bg-muted/50 dark:bg-muted/20 rounded-md text-xs font-medium text-muted-foreground">
                        <div className="col-span-2">Cédula</div>
                        <div className="col-span-4">Nombre Completo</div>
                        <div className="col-span-1">Nota</div>
                        <div className="col-span-4">Observaciones</div>
                        <div className="col-span-1">Acción</div>
                      </div>

                      {/* Filas de estudiantes */}
                      {fields.map((item, index) => (
                        <div
                          key={item.id}
                          className="grid grid-cols-12 gap-2 p-3 border border-border rounded-md bg-card hover:bg-accent/50 transition-colors"
                        >
                          {/* Cédula */}
                          <div className="col-span-2">
                            <FormField
                              control={control}
                              name={`salvaguardaEstudiantes.${index}.cedula`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    <Input placeholder="Cédula..." className="h-8 text-xs bg-background" {...field} />
                                  </FormControl>
                                  <FormMessage className="text-xs" />
                                </FormItem>
                              )}
                            />
                          </div>

                          {/* Nombre */}
                          <div className="col-span-4">
                            <FormField
                              control={control}
                              name={`salvaguardaEstudiantes.${index}.nombre`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    <Input placeholder="Nombre completo..." className="h-8 text-xs bg-background" {...field} />
                                  </FormControl>
                                  <FormMessage className="text-xs" />
                                </FormItem>
                              )}
                            />
                          </div>

                          {/* Nota */}
                          <div className="col-span-1">
                            <FormField
                              control={control}
                              name={`salvaguardaEstudiantes.${index}.nota`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    <Input
                                      type="number"
                                      placeholder="0-100"
                                      className="h-8 text-xs bg-background"
                                      {...field}
                                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                    />
                                  </FormControl>
                                  <FormMessage className="text-xs" />
                                </FormItem>
                              )}
                            />
                          </div>

                          {/* Observaciones */}
                          <div className="col-span-4">
                            <FormField
                              control={control}
                              name={`salvaguardaEstudiantes.${index}.observacion`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    {editingObservacion === index ? (
                                      <div className="space-y-2">
                                        <Textarea
                                          placeholder="Escriba las observaciones..."
                                          className="text-xs min-h-[80px] bg-background"
                                          {...field}
                                        />
                                        <div className="flex gap-1">
                                          <Button
                                            type="button"
                                            size="sm"
                                            variant="default"
                                            onClick={handleSaveObservacion}
                                            className="h-6 px-2 text-xs"
                                          >
                                            <Check className="w-3 h-3" />
                                          </Button>
                                          <Button
                                            type="button"
                                            size="sm"
                                            variant="outline"
                                            onClick={handleCancelObservacion}
                                            className="h-6 px-2 text-xs"
                                          >
                                            <X className="w-3 h-3" />
                                          </Button>
                                        </div>
                                      </div>
                                    ) : (
                                      <div
                                        className="flex items-center h-8 px-2 border border-border rounded-md bg-background cursor-pointer hover:bg-accent transition-colors"
                                        onClick={() => handleEditObservacion(index)}
                                      >
                                        <span className="text-xs text-foreground/70 truncate flex-1">
                                          {field.value || 'Clic para agregar observaciones...'}
                                        </span>
                                        <Edit3 className="w-3 h-3 ml-1 text-muted-foreground" />
                                      </div>
                                    )}
                                  </FormControl>
                                  <FormMessage className="text-xs" />
                                </FormItem>
                              )}
                            />
                          </div>

                          {/* Acción - Eliminar */}
                          <div className="col-span-1 flex justify-center items-center">
                            <Button
                              type="button"
                              variant="ghost" // Use ghost variant for no background
                              size="icon" // Use icon size for a compact button, or adjust padding if needed
                              onClick={() => remove(index)}
                              className="h-8 w-8 p-0 text-red-500 hover:text-red-700 dark:text-red-500 dark:hover:text-red-400 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 group" // group class for icon scaling
                            >
                              <span className="sr-only">Eliminar estudiante</span> {/* For accessibility */}
                              <Trash2 className="h-5 w-5 transition-transform duration-150 ease-in-out group-hover:scale-125" />{' '}
                              {/* Icon scales on parent hover */}
                            </Button>
                          </div>
                        </div>
                      ))}
                    </>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Botones de navegación - FIJOS EN LA PARTE INFERIOR */}
            <div className="flex justify-between pt-6 mt-auto">
              <Button type="button" variant="outline" onClick={onPrevious} className="px-8">
                Anterior
              </Button>

              <Button type="submit" className="px-8">
                Siguiente
              </Button>
            </div>
          </form>
        </Form>
      </FormProvider>
    </div>
  )
}
