'use client'

import React from 'react'
// Remove useForm from here if formMethods is passed from parent
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@una-gc/ui/components/button'
import { Card, CardContent, CardHeader, CardTitle } from '@una-gc/ui/components/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@una-gc/ui/components/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@una-gc/ui/components/select'
import { Input } from '@una-gc/ui/components/input'
// import { Separator } from '@una-gc/ui/components/separator' // Not used in the provided snippet
import { UseFormReturn } from 'react-hook-form' // Import UseFormReturn

// Schema actualizado - incluir campus, fecha y cupoMatricula
export const step1Schema = z.object({
  nrc: z.string().min(1, 'Debe seleccionar un NRC'),
  curso: z.string().optional(),
  numeroGrupo: z.string().optional(),
  profesor: z.string().optional(),
  codigo: z.string().optional(),
  nivelGrupo: z.string().optional(),
  campus: z.string().optional(), // Added campus
  fecha: z.string().optional(), // Added fecha (consider using z.date() if it's a date object)
  cupoMatricula: z.number().optional() // Added cupoMatricula
})

export type Step1FormData = z.infer<typeof step1Schema>

// Mock data actualizado
const cursosDisponibles = [
  {
    nrc: '12345',
    curso: 'Programación Avanzada',
    codigo: 'PROG-401',
    profesor: 'Dr. Juan Pérez',
    numeroGrupo: '01',
    nivelGrupo: 'Avanzado',
    cupoMatricula: 30,
    campus: 'Campus Central', // Example data
    fecha: '2025-08-01' // Example data
  },
  {
    nrc: '67890',
    curso: 'Base de Datos II',
    codigo: 'DB-302',
    profesor: 'Dra. María García',
    numeroGrupo: '02',
    nivelGrupo: 'Intermedio',
    cupoMatricula: 25,
    campus: 'Campus Tecnológico', // Example data
    fecha: '2025-08-05' // Example data
  },
  {
    nrc: '11111',
    curso: 'Algoritmos y Estructuras',
    codigo: 'ALGO-201',
    profesor: 'Ing. Carlos López',
    numeroGrupo: '01',
    nivelGrupo: 'Básico',
    cupoMatricula: 35,
    campus: 'Campus Central', // Example data
    fecha: '2025-08-10' // Example data
  }
]

interface Step1FormProps {
  formMethods: UseFormReturn<Step1FormData> // Corrected type
  onSaveAndNext: (data: Step1FormData) => void
  onPrevious?: () => void // onPrevious is optional
  totalSteps: number
}

export function Step1Form({ formMethods, onSaveAndNext, onPrevious, totalSteps }: Step1FormProps) {
  // Use form methods passed from parent
  const { control, watch, setValue, handleSubmit, formState } = formMethods

  const selectedNrc = watch('nrc')
  const selectedCourse = cursosDisponibles.find((curso) => curso.nrc === selectedNrc)

  // Actualizar campos automáticamente cuando se selecciona NRC
  React.useEffect(() => {
    if (selectedCourse) {
      setValue('curso', selectedCourse.curso)
      setValue('numeroGrupo', selectedCourse.numeroGrupo)
      setValue('profesor', selectedCourse.profesor)
      setValue('codigo', selectedCourse.codigo)
      setValue('nivelGrupo', selectedCourse.nivelGrupo)
      setValue('cupoMatricula', selectedCourse.cupoMatricula)
      setValue('campus', selectedCourse.campus) // Assuming campus comes from selectedCourse
      setValue('fecha', selectedCourse.fecha) // Assuming fecha comes from selectedCourse
    } else {
      // Clear fields if no course is selected (or handle as per your logic)
      setValue('curso', '')
      setValue('numeroGrupo', '')
      setValue('profesor', '')
      setValue('codigo', '')
      setValue('nivelGrupo', '')
      setValue('cupoMatricula', undefined) // Or 0, depending on desired default
      setValue('campus', '')
      setValue('fecha', '')
    }
  }, [selectedCourse, setValue])

  // The data passed to onSubmit will already include cupoMatricula if set by useEffect
  const onSubmitHandler = (data: Step1FormData) => {
    // Ensure cupoMatricula is part of the data if not already set by setValue
    const finalData = {
      ...data,
      cupoMatricula: selectedCourse?.cupoMatricula ?? data.cupoMatricula ?? 0
      // campus and fecha should be in 'data' if set by setValue
    }
    onSaveAndNext(finalData)
  }

  return (
    <div className="p-6 h-full flex flex-col">
      {/* Header compacto */}
      <div className="mb-4">
        <h2 className="text-xl font-semibold">Información del Curso</h2>
        <p className="text-muted-foreground text-sm">Seleccione el NRC del curso para cargar la información</p>
      </div>

      {/* Pass the control from formMethods to FormProvider/Form */}
      <Form {...formMethods}>
        <form onSubmit={handleSubmit(onSubmitHandler)} className="flex-1 flex flex-col">
          {/* Contenido principal en 2 columnas */}
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* COLUMNA 1: NRC, Curso, Número de Grupo */}
            <div className="space-y-6">
              <Card className="border-primary/20 bg-primary/5 h-fit">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Selección de Curso</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* NRC Selector */}
                  <FormField
                    control={control} // Use control from formMethods
                    name="nrc"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-medium">
                          NRC del Curso <span className="text-destructive">*</span>
                        </FormLabel>
                        <Select onValueChange={field.onChange} value={field.value || ''}>
                          <FormControl>
                            <SelectTrigger className="h-10">
                              <SelectValue placeholder="Seleccione un NRC..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {cursosDisponibles.map((curso) => (
                              <SelectItem key={curso.nrc} value={curso.nrc}>
                                <div className="flex flex-col">
                                  <span className="font-medium">NRC: {curso.nrc}</span>
                                  <span className="text-xs text-muted-foreground">
                                    {curso.codigo} - {curso.curso}
                                  </span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Curso */}
                  <FormField
                    control={control} // Use control from formMethods
                    name="curso"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-medium">Curso</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value || ''} disabled className="bg-muted/50 h-10" />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  {/* Número de Grupo */}
                  <FormField
                    control={control} // Use control from formMethods
                    name="numeroGrupo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-medium">Número de Grupo</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value || ''} disabled className="bg-muted/50 h-10" />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </div>

            {/* COLUMNA 2: Profesor, Código, Nivel de Grupo */}
            <div className="space-y-6">
              <Card className="border-primary/20 bg-primary/5 h-fit">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Información del Curso</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Profesor */}
                  <FormField
                    control={control} // Use control from formMethods
                    name="profesor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-medium">Profesor</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value || ''} disabled className="bg-muted/50 h-10" />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  {/* Código */}
                  <FormField
                    control={control} // Use control from formMethods
                    name="codigo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-medium">Código</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value || ''} disabled className="bg-muted/50 h-10" />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  {/* Nivel de Grupo */}
                  <FormField
                    control={control} // Use control from formMethods
                    name="nivelGrupo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-medium">Nivel de Grupo</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value || ''} disabled className="bg-muted/50 h-10" />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  {/* You would add FormFields for campus, fecha, cupoMatricula here if they were editable */}
                  {/* For now, they are derived and set via setValue */}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Botones de navegación - FIJOS EN LA PARTE INFERIOR */}
          <div className="flex justify-between pt-6 mt-auto">
            <Button type="button" variant="outline" onClick={onPrevious} disabled={!onPrevious} className="px-8">
              Anterior
            </Button>

            <Button type="submit" disabled={!selectedCourse || formState.isSubmitting} className="px-8">
              Siguiente
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
