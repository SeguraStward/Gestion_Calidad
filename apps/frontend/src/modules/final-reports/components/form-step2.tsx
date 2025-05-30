'use client'

import { UseFormReturn, FormProvider } from 'react-hook-form'
import * as z from 'zod'
import { Button } from '@una-gc/ui/components/button'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@una-gc/ui/components/form'
import { Input } from '@una-gc/ui/components/input'
import { Card, CardHeader, CardTitle, CardContent } from '@una-gc/ui/components/card'
import { Separator } from '@una-gc/ui/components/separator'
import { Calculator, Users, UserCheck, UserX, UserMinus } from 'lucide-react'

// Esquema de validación con Zod para el Paso 2
export const step2Schema = z
  .object({
    totalMatriculados: z.coerce.number().min(0, 'El total debe ser 0 o más.'),
    totalRetirados: z.coerce.number().min(0, 'El total debe ser 0 o más.'),
    totalAprobados: z.coerce.number().min(0, 'El total debe ser 0 o más.'),
    totalReprobados: z.coerce.number().min(0, 'El total debe ser 0 o más.')
  })
  .refine(
    (data) => {
      const suma = data.totalRetirados + data.totalAprobados + data.totalReprobados
      return data.totalMatriculados >= suma
    },
    {
      message: 'La suma de retirados, aprobados y reprobados no puede exceder el total de matriculados.',
      path: ['totalMatriculados']
    }
  )

export type Step2FormData = z.infer<typeof step2Schema>

interface Step2FormProps {
  formMethods: UseFormReturn<Step2FormData>
  onSaveAndNext: (data: Step2FormData) => void
  onPrevious: () => void
  totalSteps: number
}

export function Step2Form({ formMethods, onSaveAndNext, onPrevious, totalSteps }: Step2FormProps) {
  const watchedValues = formMethods.watch()
  const suma = (watchedValues.totalRetirados || 0) + (watchedValues.totalAprobados || 0) + (watchedValues.totalReprobados || 0)
  const isValidSum = (watchedValues.totalMatriculados || 0) >= suma

  return (
    <div className="p-6 h-full flex flex-col">
      {/* Header compacto */}
      <div className="mb-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Calculator className="w-5 h-5" />
          Datos Estadísticos
        </h2>
        <p className="text-muted-foreground text-sm">Ingrese la información estadística del curso</p>
      </div>

      <FormProvider {...formMethods}>
        <Form {...formMethods}>
          <form onSubmit={formMethods.handleSubmit(onSaveAndNext)} className="flex-1 flex flex-col">
            {/* Contenido principal en 2 columnas */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* COLUMNA 1: Total Matriculados y Validación */}
              <div className="space-y-6">
                <Card className="border-primary/20 bg-primary/5 h-fit">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Información Base
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Total Matriculados */}
                    <FormField
                      control={formMethods.control}
                      name="totalMatriculados"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-medium">
                            Total de Estudiantes Matriculados <span className="text-destructive">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="Ej: 30"
                              className="h-10"
                              {...field}
                              onChange={(event) => field.onChange(+event.target.value)}
                            />
                          </FormControl>
                          <FormDescription className="text-xs">
                            Número total de estudiantes inscritos al inicio del curso
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Indicador de validación */}
                    <div
                      className={`p-3 rounded-lg border ${
                        isValidSum ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'
                      }`}
                    >
                      <div className="flex items-center gap-2 text-sm font-medium">
                        {isValidSum ? (
                          <>
                            <UserCheck className="w-4 h-4" />
                            Validación correcta
                          </>
                        ) : (
                          <>
                            <UserX className="w-4 h-4" />
                            Validación pendiente
                          </>
                        )}
                      </div>
                      <p className="text-xs mt-1">
                        {isValidSum
                          ? `Suma: ${suma} ≤ Total: ${watchedValues.totalMatriculados || 0}`
                          : `Suma: ${suma} > Total: ${watchedValues.totalMatriculados || 0}`}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* COLUMNA 2: Resultados del Curso */}
              <div className="space-y-6">
                <Card className="border-primary/20 bg-primary/5 h-fit">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <UserMinus className="w-4 h-4" />
                      Resultados del Curso
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Total Retirados */}
                    <FormField
                      control={formMethods.control}
                      name="totalRetirados"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-medium flex items-center gap-2">
                            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                            Estudiantes Desertores <span className="text-destructive">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="Ej: 2"
                              className="h-10"
                              {...field}
                              onChange={(event) => field.onChange(+event.target.value)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Total Aprobados */}
                    <FormField
                      control={formMethods.control}
                      name="totalAprobados"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-medium flex items-center gap-2">
                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                            Estudiantes Aprobados <span className="text-destructive">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="Ej: 25"
                              className="h-10"
                              {...field}
                              onChange={(event) => field.onChange(+event.target.value)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Total Reprobados */}
                    <FormField
                      control={formMethods.control}
                      name="totalReprobados"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-medium flex items-center gap-2">
                            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                            Estudiantes Reprobados <span className="text-destructive">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="Ej: 3"
                              className="h-10"
                              {...field}
                              onChange={(event) => field.onChange(+event.target.value)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Botones de navegación - FIJOS EN LA PARTE INFERIOR */}
            <div className="flex justify-between pt-6 mt-auto">
              <Button type="button" variant="outline" onClick={onPrevious} className="px-8">
                Anterior
              </Button>

              <Button type="submit" className="px-8" disabled={!isValidSum}>
                Siguiente
              </Button>
            </div>
          </form>
        </Form>
      </FormProvider>
    </div>
  )
}
