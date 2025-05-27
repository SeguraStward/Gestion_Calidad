'use client'

import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@una-gc/ui/components/button'
import { Card, CardContent, CardHeader, CardTitle } from '@una-gc/ui/components/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@una-gc/ui/components/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@una-gc/ui/components/select'
import { Input } from '@una-gc/ui/components/input'
import { Separator } from '@una-gc/ui/components/separator'

// Schema actualizado - solo campos necesarios
export const step1Schema = z.object({
  nrc: z.string().min(1, 'Debe seleccionar un NRC'),
  curso: z.string().optional(),
  numeroGrupo: z.string().optional(),
  profesor: z.string().optional(),
  codigo: z.string().optional(),
  nivelGrupo: z.string().optional()
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
    cupoMatricula: 30
  },
  {
    nrc: '67890',
    curso: 'Base de Datos II',
    codigo: 'DB-302',
    profesor: 'Dra. María García',
    numeroGrupo: '02',
    nivelGrupo: 'Intermedio',
    cupoMatricula: 25
  },
  {
    nrc: '11111',
    curso: 'Algoritmos y Estructuras',
    codigo: 'ALGO-201',
    profesor: 'Ing. Carlos López',
    numeroGrupo: '01',
    nivelGrupo: 'Básico',
    cupoMatricula: 35
  }
]

interface Step1FormProps {
  formMethods: any
  onSaveAndNext: (data: Step1FormData) => void
  onPrevious?: () => void
  totalSteps: number
}

export function Step1Form({ formMethods, onSaveAndNext, onPrevious, totalSteps }: Step1FormProps) {
  const form = useForm<Step1FormData>({
    resolver: zodResolver(step1Schema),
    defaultValues: {
      nrc: '',
      curso: '',
      numeroGrupo: '',
      profesor: '',
      codigo: '',
      nivelGrupo: ''
    }
  })

  const selectedNrc = form.watch('nrc')
  const selectedCourse = cursosDisponibles.find((curso) => curso.nrc === selectedNrc)

  // Actualizar campos automáticamente cuando se selecciona NRC
  React.useEffect(() => {
    if (selectedCourse) {
      form.setValue('curso', selectedCourse.curso)
      form.setValue('numeroGrupo', selectedCourse.numeroGrupo)
      form.setValue('profesor', selectedCourse.profesor)
      form.setValue('codigo', selectedCourse.codigo)
      form.setValue('nivelGrupo', selectedCourse.nivelGrupo)
    } else {
      form.setValue('curso', '')
      form.setValue('numeroGrupo', '')
      form.setValue('profesor', '')
      form.setValue('codigo', '')
      form.setValue('nivelGrupo', '')
    }
  }, [selectedCourse, form])

  const onSubmit = (data: Step1FormData) => {
    // Añadir cupoMatricula para los siguientes pasos
    const dataWithCupo = {
      ...data,
      cupoMatricula: selectedCourse?.cupoMatricula || 0
    }
    onSaveAndNext(dataWithCupo as any)
  }

  return (
    <div className="p-6 h-full flex flex-col">
      {/* Header compacto */}
      <div className="mb-4">
        <h2 className="text-xl font-semibold">Información del Curso</h2>
        <p className="text-muted-foreground text-sm">Seleccione el NRC del curso para cargar la información</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex-1 flex flex-col">
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
                    control={form.control}
                    name="nrc"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-medium">
                          NRC del Curso <span className="text-destructive">*</span>
                        </FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
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
                    control={form.control}
                    name="curso"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-medium">Curso</FormLabel>
                        <FormControl>
                          <Input {...field} disabled className="bg-muted/50 h-10" />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  {/* Número de Grupo */}
                  <FormField
                    control={form.control}
                    name="numeroGrupo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-medium">Número de Grupo</FormLabel>
                        <FormControl>
                          <Input {...field} disabled className="bg-muted/50 h-10" />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </div>

            {/* COLUMNA 2: Profesor, Código, Nivel de Grupo */}
            <div className="space-y-6">
              <Card className="border-green-200 bg-green-50/50 h-fit">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Información del Curso</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Profesor */}
                  <FormField
                    control={form.control}
                    name="profesor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-medium">Profesor</FormLabel>
                        <FormControl>
                          <Input {...field} disabled className="bg-muted/50 h-10" />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  {/* Código */}
                  <FormField
                    control={form.control}
                    name="codigo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-medium">Código</FormLabel>
                        <FormControl>
                          <Input {...field} disabled className="bg-muted/50 h-10" />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  {/* Nivel de Grupo */}
                  <FormField
                    control={form.control}
                    name="nivelGrupo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-medium">Nivel de Grupo</FormLabel>
                        <FormControl>
                          <Input {...field} disabled className="bg-muted/50 h-10" />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Botones de navegación - FIJOS EN LA PARTE INFERIOR */}
          <div className="flex justify-between pt-6 mt-auto">
            <Button type="button" variant="outline" onClick={onPrevious} disabled={!onPrevious} className="px-8">
              Anterior
            </Button>

            <Button type="submit" disabled={!selectedCourse} className="px-8">
              Siguiente
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
