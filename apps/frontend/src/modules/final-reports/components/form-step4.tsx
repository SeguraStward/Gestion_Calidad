'use client'

import React, { useState, useEffect } from 'react' // Added useEffect
import { UseFormReturn, FormProvider, useFieldArray } from 'react-hook-form'
import * as z from 'zod'
import { Button } from '@una-gc/ui/components/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@una-gc/ui/components/form'
import { Input } from '@una-gc/ui/components/input'
import { Textarea } from '@una-gc/ui/components/textarea'
import { Card, CardHeader, CardTitle, CardContent } from '@una-gc/ui/components/card'
import { PlusCircle, Trash2, Settings, Edit3, Check, X } from 'lucide-react'
import type { FullFinalReport } from '@/modules/final-reports/types/final-reports.types'

// Esquema para un solo estudiante con ajustes
const ajusteEstudianteSchema = z.object({
  id: z.string().optional(), // Keep this for existing items, new ones will get UUID
  cedula: z
    .string()
    .min(1, 'La cédula es requerida.')
    .regex(/^[0-9]+$/, 'La cédula solo debe contener números')
    .min(9, 'La cédula debe tener al menos 9 dígitos'),
  nombre: z.string().min(1, 'El nombre es requerido.'),
  apoyo: z.string().min(1, 'El tipo de apoyo es requerido.'),
  nota: z.coerce.number().min(0, 'La nota debe ser 0 o más.').max(100, 'La nota no puede ser mayor a 100.').optional().nullable(), // Match step 2 schema
  observacion: z.string().optional()
})

// Esquema de validación con Zod para el Paso 4
export const step4Schema = z.object({
  ajustesEstudiantes: z.array(ajusteEstudianteSchema).min(0) // Allow empty array
})

export type Step4FormData = z.infer<typeof step4Schema>

export function transformReportToStep4Data(report: FullFinalReport): Step4FormData | null {
  if (!report.studentInformation?.adjustments) return { ajustesEstudiantes: [] }
  return {
    ajustesEstudiantes: report.studentInformation.adjustments.map((adj) => ({
      cedula: adj.idNumber,
      nombre: adj.name,
      apoyo: adj.support,
      nota: parseFloat(adj.grade),
      observacion: adj.observation || ''
    }))
  }
}

interface Step4FormProps {
  formMethods: UseFormReturn<Step4FormData>
  onSaveAndNext: (data: Step4FormData) => void
  onPrevious: (data: Step4FormData) => void // MODIFIED: Make it accept data
  totalSteps: number
  initialData?: Step4FormData | null
  isEditing?: boolean
}

export function Step4Form({
  formMethods,
  onSaveAndNext,
  onPrevious,
  totalSteps,
  initialData,
  isEditing = false
}: Step4FormProps) {
  const { control, reset, handleSubmit, getValues, formState } = formMethods // Added getValues and formState
  const [editingObservacion, setEditingObservacion] = useState<number | null>(null)

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'ajustesEstudiantes'
  })

  useEffect(() => {
    if (initialData) {
      reset(initialData)
    } else if (!isEditing) {
      reset({ ajustesEstudiantes: [] })
    }
  }, [initialData, isEditing, reset])

  const addNewStudent = () => {
    append({
      id: crypto.randomUUID(), // Generate a new UUID for new students
      cedula: '',
      nombre: '',
      apoyo: '',
      nota: 0, // Default to 0 to match step 2 logic
      observacion: ''
    })
  }

  const handleEditObservacion = (index: number) => setEditingObservacion(index)
  const handleSaveObservacion = () => setEditingObservacion(null)
  const handleCancelObservacion = () => setEditingObservacion(null)

  const handlePreviousClick = () => {
    const currentData = getValues()
    onPrevious(currentData)
  }

  const tituloPaso = 'Ajustes Metodológicos y de Evaluación'

  return (
    <div className="p-4 md:p-6 h-full flex flex-col">
      {' '}
      {/* Consistent padding */}
      <div className="mb-4 md:mb-6">
        {' '}
        {/* Consistent margin */}
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Settings className="w-5 h-5" />
          {tituloPaso}
        </h2>
        <p className="text-muted-foreground text-sm">Estudiantes que requirieron algún tipo de adecuación o apoyo pedagógico.</p>
      </div>

      {/* Fixed Navigation Buttons at Top */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border/20 pb-4 mb-6">
        <div className="flex justify-between">
          <Button type="button" variant="outline" onClick={handlePreviousClick} className="px-8">
            Anterior
          </Button>
          <Button type="submit" form="step4-form" className="px-8">
            Continuar
          </Button>
        </div>
      </div>

      <FormProvider {...formMethods}>
        <Form {...formMethods}>
          <form id="step4-form" onSubmit={handleSubmit(onSaveAndNext)} className="flex-1 flex flex-col min-h-0">
            {/* Scrollable content area for the student list card */}
            <div className="flex-1 space-y-3 md:space-y-4 overflow-y-auto pr-2 pb-4">
              <Card className="border-primary/20 bg-primary/5 h-fit">
                <CardHeader className="pb-3 pt-4 px-4 md:px-6">
                  {' '}
                  {/* Consistent padding */}
                  <CardTitle className="text-base flex items-center justify-between">
                    <span className="flex items-center gap-2">Estudiantes con Ajustes ({fields.length})</span>
                    <Button
                      type="button"
                      variant="default"
                      size="sm"
                      onClick={addNewStudent}
                      className="h-8 bg-emerald-500 hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white" // Dark mode consistency
                    >
                      <PlusCircle className="h-4 w-4 mr-1" />
                      Añadir
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 px-4 pb-4 md:px-6 md:pb-6">
                  {' '}
                  {/* Consistent padding */}
                  {fields.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground border border-dashed border-border/50 rounded-md mt-2">
                      <Settings className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p className="text-sm">No hay estudiantes con ajustes registrados</p>
                      <p className="text-xs">Haga clic en &quot;Añadir&quot; para agregar un estudiante</p>
                    </div>
                  ) : (
                    <>
                      {/* Header de la tabla */}
                      <div className="grid grid-cols-12 gap-2 px-3 py-2 bg-muted/50 dark:bg-muted/20 rounded-md text-xs font-medium text-muted-foreground">
                        {' '}
                        {/* Standardized background */}
                        <div className="col-span-2">Cédula</div>
                        <div className="col-span-3">Nombre Completo</div>
                        <div className="col-span-2">Tipo de Apoyo</div>
                        <div className="col-span-1">Nota</div>
                        <div className="col-span-3">Observaciones</div>
                        <div className="col-span-1 text-center">Acción</div>
                      </div>

                      {/* Filas de estudiantes */}
                      {fields.map((item, index) => (
                        <div
                          key={item.id}
                          className="grid grid-cols-12 gap-2 p-3 border border-border rounded-md bg-card hover:bg-accent/50 transition-colors items-center" // Standardized border and hover
                        >
                          {/* Cédula */}
                          <div className="col-span-2">
                            <FormField
                              control={control}
                              name={`ajustesEstudiantes.${index}.cedula`}
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
                          <div className="col-span-3">
                            <FormField
                              control={control}
                              name={`ajustesEstudiantes.${index}.nombre`}
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
                          {/* Tipo de Apoyo */}
                          <div className="col-span-2">
                            <FormField
                              control={control}
                              name={`ajustesEstudiantes.${index}.apoyo`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    <Input placeholder="Tipo de apoyo..." className="h-8 text-xs bg-background" {...field} />
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
                              name={`ajustesEstudiantes.${index}.nota`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    <Input
                                      type="text"
                                      inputMode="numeric"
                                      placeholder="0"
                                      className="h-8 text-xs bg-background"
                                      {...field}
                                      value={
                                        field.value === 0 && formState.dirtyFields.ajustesEstudiantes?.[index]?.nota
                                          ? ''
                                          : field.value === undefined || field.value === null
                                            ? ''
                                            : String(field.value)
                                      }
                                      onChange={(e) => {
                                        const inputValue = e.target.value
                                        const cleanedValue = inputValue.replace(/\D/g, '')

                                        if (cleanedValue === '') {
                                          field.onChange(0)
                                        } else {
                                          const num = Number(cleanedValue)
                                          if (num <= 100) {
                                            field.onChange(num)
                                          }
                                        }
                                      }}
                                      onFocus={(e) => {
                                        if (field.value === 0 && e.target.value === '0') {
                                          e.target.select()
                                        }
                                      }}
                                      onBlur={() => {
                                        field.onBlur()
                                      }}
                                    />
                                  </FormControl>
                                  <FormMessage className="text-xs" />
                                </FormItem>
                              )}
                            />
                          </div>
                          {/* Observaciones */}
                          <div className="col-span-3">
                            <FormField
                              control={control}
                              name={`ajustesEstudiantes.${index}.observacion`}
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
                                            className="h-6 px-2 text-xs bg-emerald-500 hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white" // Standardized save button
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
                              variant="ghost"
                              size="icon"
                              onClick={() => remove(index)}
                              className="h-8 w-8 p-0 text-red-500 hover:text-red-700 dark:text-red-500 dark:hover:text-red-400 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 group"
                            >
                              <span className="sr-only">Eliminar estudiante</span>
                              <Trash2 className="h-5 w-5 transition-transform duration-150 ease-in-out group-hover:scale-125" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </form>
        </Form>
      </FormProvider>
    </div>
  )
}
