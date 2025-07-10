'use client'

import React, { useEffect, useMemo } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@una-gc/ui/components/button'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@una-gc/ui/components/form'
import { Input } from '@una-gc/ui/components/input'
import { UseFormReturn, FormProvider } from 'react-hook-form'
import { AlertCircle, CheckCircle2, MinusCircle, Users, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react'
import type { FullFinalReport } from '@/modules/final-reports/types/final-reports.types'

// Schema de validación con Zod para el Paso 2
export const step2Schema = z
  .object({
    totalEnrolled: z.coerce
      .number({ invalid_type_error: 'Debe ser un número' })
      .min(0, 'El total de matriculados no puede ser negativo')
      .optional()
      .nullable(),
    totalWithdrawn: z.coerce
      .number({ invalid_type_error: 'Debe ser un número o estar vacío' })
      .min(0, 'El total de retirados no puede ser negativo')
      .optional()
      .nullable(),
    totalPassed: z.coerce
      .number({ invalid_type_error: 'Debe ser un número o estar vacío' })
      .min(0, 'El total de aprobados no puede ser negativo')
      .optional()
      .nullable(),
    totalFailed: z.coerce
      .number({ invalid_type_error: 'Debe ser un número o estar vacío' })
      .min(0, 'El total de reprobados no puede ser negativo')
      .optional()
      .nullable()
  })
  .refine(
    (data) => {
      const enrolled = data.totalEnrolled ?? 0
      const withdrawn = data.totalWithdrawn ?? 0
      const passed = data.totalPassed ?? 0
      const failed = data.totalFailed ?? 0

      if (typeof data.totalEnrolled !== 'number') {
        // If totalEnrolled is not a number (e.g., still loading/undefined), don't validate sum yet
        return true
      }
      return withdrawn + passed + failed === enrolled
    },
    {
      message: 'La suma de Retirados, Aprobados y Reprobados debe ser igual al Total de Matriculados.',
      path: ['totalEnrolled'] // Or a more general path if preferred, e.g., ['_root']
    }
  )
  .refine(
    (data) => {
      const enrolled = data.totalEnrolled ?? 0
      const withdrawn = data.totalWithdrawn ?? 0
      if (typeof data.totalEnrolled !== 'number') {
        return true
      }
      return withdrawn <= enrolled
    },
    {
      message: 'El total de retirados no puede exceder el total de matriculados.',
      path: ['totalWithdrawn']
    }
  )

export type Step2FormData = z.infer<typeof step2Schema>

export function transformReportToStep2Data(report: FullFinalReport, enrolledCapacity?: number | null): Step2FormData | null {
  return {
    totalEnrolled: enrolledCapacity ?? report.statistics?.totalStudents ?? undefined,
    totalWithdrawn: report.statistics?.dropouts ?? undefined,
    totalPassed: report.statistics?.passed ?? undefined,
    totalFailed: report.statistics?.failed ?? undefined
  }
}

interface Step2FormProps {
  formMethods: UseFormReturn<Step2FormData>
  onSaveAndNext: (data: Step2FormData) => void
  onPrevious?: (data: Step2FormData) => void
  totalSteps: number
  initialData?: Step2FormData | null
  isEditing?: boolean
  enrolledCapacity?: number | null | undefined // <<--- AÑADIR ESTA LÍNEA
}

export function Step2Form({
  formMethods,
  onSaveAndNext,
  onPrevious,
  totalSteps,
  initialData,
  isEditing = false,
  enrolledCapacity
}: Step2FormProps) {
  const { control, handleSubmit, reset, watch, formState, getValues, setValue } = formMethods

  useEffect(() => {
    if (initialData) {
      const dataToReset = { ...initialData } // Crear una copia para modificarla de forma segura

      if (typeof enrolledCapacity === 'number' && initialData.totalEnrolled !== enrolledCapacity) {
        dataToReset.totalEnrolled = enrolledCapacity
      }
      reset(dataToReset)
    } else if (!isEditing) {
      // initialData es null y no estamos en modo edición (creando un nuevo informe)
      reset({
        totalEnrolled: enrolledCapacity ?? undefined, // Usar enrolledCapacity del Paso 1 si está disponible
        totalWithdrawn: 0,
        totalPassed: 0,
        totalFailed: 0
      })
    }
    // Si initialData es null Y isEditing es true (implica que los datos aún están cargando o hubo un error),
    // este useEffect no hace nada, lo cual es correcto, ya que deberíamos esperar a que initialData se cargue.
  }, [initialData, isEditing, reset, enrolledCapacity]) // setValue ya no se llama directamente aquí

  const watchedValues = watch()

  const { currentSum, isValidSum } = useMemo(() => {
    const enrolled = typeof watchedValues.totalEnrolled === 'number' ? watchedValues.totalEnrolled : 0
    const withdrawn = typeof watchedValues.totalWithdrawn === 'number' ? watchedValues.totalWithdrawn : 0
    const passed = typeof watchedValues.totalPassed === 'number' ? watchedValues.totalPassed : 0
    const failed = typeof watchedValues.totalFailed === 'number' ? watchedValues.totalFailed : 0

    const sum = withdrawn + passed + failed
    const valid = typeof watchedValues.totalEnrolled === 'number' && sum === enrolled
    return { currentSum: sum, isValidSum: valid }
  }, [watchedValues])

  const onSubmitHandler = (data: Step2FormData) => {
    const processedData: Step2FormData = {
      totalEnrolled: data.totalEnrolled ?? undefined,
      totalWithdrawn: data.totalWithdrawn ?? undefined,
      totalPassed: data.totalPassed ?? undefined,
      totalFailed: data.totalFailed ?? undefined
    }
    onSaveAndNext(data)
  }

  const handlePreviousClick = () => {
    if (onPrevious) {
      const currentData = getValues()
      onPrevious(currentData)
    }
  }

  return (
    <div className="p-4 md:p-6 h-full flex flex-col">
      <div className="mb-4 md:mb-6">
        <h2 className="text-xl font-semibold">
          Paso 2 de {totalSteps}: Estadísticas del Curso {isEditing ? '(Editando)' : ''}
        </h2>
        <p className="text-muted-foreground text-sm">
          Ingrese las estadísticas finales del curso. El total de matriculados se carga automáticamente.
        </p>
      </div>

      <FormProvider {...formMethods}>
        <Form {...formMethods}>
          <form onSubmit={handleSubmit(onSubmitHandler)} className="flex-1 flex flex-col space-y-4">
            <div className="flex-1 space-y-4 md:space-y-6 overflow-y-auto pr-2">
              <div>
                <h3 className="text-lg font-medium">Resumen Estadístico</h3>
                <p className="text-sm text-muted-foreground">
                  Asegúrese de que la suma de retirados, aprobados y reprobados coincida con el total de matriculados.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                <FormField
                  control={control}
                  name="totalEnrolled"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-medium flex items-center">
                        <Users className="mr-2 h-5 w-5 text-primary" />
                        Total Matriculados
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="text" // Mantener como text si se quiere mostrar '0' para undefined
                          placeholder="0" // O "Cargando..." si es más apropiado
                          {...field}
                          // Si field.value es undefined (ej. aún no cargado de enrolledCapacity), muestra placeholder o "0"
                          // Si es un número, lo muestra.
                          value={field.value === undefined || field.value === null ? '' : String(field.value)}
                          disabled
                          className="bg-muted/70 h-10"
                          readOnly
                        />
                      </FormControl>
                      <FormDescription>Este valor se carga desde la información del curso (Paso 1).</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {(['totalWithdrawn', 'totalPassed', 'totalFailed'] as const).map((fieldName) => {
                  const icons = {
                    totalWithdrawn: <MinusCircle className="mr-2 h-5 w-5 text-orange-500" />,
                    totalPassed: <TrendingUp className="mr-2 h-5 w-5 text-green-600" />,
                    totalFailed: <TrendingDown className="mr-2 h-5 w-5 text-red-600" />
                  }
                  const labels = {
                    totalWithdrawn: 'Total Retirados',
                    totalPassed: 'Total Aprobados',
                    totalFailed: 'Total Reprobados'
                  }
                  return (
                    <FormField
                      key={fieldName}
                      control={control}
                      name={fieldName}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-medium flex items-center">
                            {icons[fieldName]}
                            {labels[fieldName]}
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="text" // Tipo texto para control manual
                              inputMode="numeric" // Ayuda en teclados móviles
                              placeholder="0" // Se muestra si el input está vacío
                              {...field} // Pasa el ref callback aquí
                              value={
                                field.value === 0 && formState.dirtyFields[fieldName]
                                  ? '' // Si es 0 y dirty, mostrar vacío. El usuario verá "0" mientras escribe debido al onChange.
                                  : field.value === undefined || field.value === null
                                    ? '' // Si es undefined/null, mostrar vacío
                                    : String(field.value) // Sino, mostrar el valor
                              }
                              onChange={(e) => {
                                const inputValue = e.target.value
                                const cleanedValue = inputValue.replace(/\D/g, '') // Solo dígitos

                                if (cleanedValue === '') {
                                  field.onChange(0) // Lógica: 0 si está vacío
                                } else {
                                  // Si el valor actual es 0 (y se está mostrando vacío o '0')
                                  // y el usuario escribe un nuevo número, queremos que reemplace el 0.
                                  // Number() se encarga de esto (ej. Number("05") es 5).
                                  field.onChange(Number(cleanedValue))
                                }
                              }}
                              onFocus={(e) => {
                                // Si el valor es 0 (lógico) y el input muestra "0" o está vacío (debido a la lógica del value)
                                // seleccionar para fácil reemplazo.
                                if (field.value === 0) {
                                  // Si el input está vacío porque value lo hizo así, pero lógicamente es 0
                                  if (e.target.value === '') {
                                    // Temporalmente poner '0' para seleccionar, onChange lo manejará
                                    // e.target.value = '0'; // Esto es una mutación directa, no ideal.
                                    // Mejor confiar en que el usuario escriba y onChange lo maneje.
                                    // O, si el input está vacío y el valor es 0, no hacer nada especial en focus.
                                  } else if (e.target.value === '0') {
                                    e.target.select()
                                  }
                                }
                              }}
                              onBlur={() => {
                                field.onBlur() // Marcar como "touched"
                                // Si el valor es 0 y el input está vacío (porque el 'value' prop lo dejó así)
                                // y queremos que muestre "0" al perder el foco si es 0:
                                // if (field.value === 0 && (field.ref as HTMLInputElement)?.value === '') {
                                //   setValue(fieldName, 0, { shouldValidate: false }); // Forzar que se muestre "0"
                                // }
                                // La lógica actual del 'value' prop ya intenta mostrar vacío si es 0 y dirty.
                                // Si el usuario borra todo, onChange pone 0, y 'value' lo muestra vacío.
                              }}
                              className="h-10"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )
                })}
              </div>

              {(typeof watchedValues.totalEnrolled === 'number' ||
                currentSum > 0 ||
                Object.values(formState.dirtyFields).some(Boolean)) && (
                <div
                  className={`p-3 rounded-md flex items-center text-sm ${
                    isValidSum && typeof watchedValues.totalEnrolled === 'number'
                      ? 'bg-green-100 text-green-700'
                      : typeof watchedValues.totalEnrolled !== 'number' && currentSum === 0
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-red-100 text-red-700'
                  }`}
                >
                  {isValidSum && typeof watchedValues.totalEnrolled === 'number' ? (
                    <CheckCircle2 className="mr-2 h-5 w-5" />
                  ) : typeof watchedValues.totalEnrolled !== 'number' && currentSum === 0 ? (
                    <AlertCircle className="mr-2 h-5 w-5 text-blue-500" />
                  ) : (
                    <AlertTriangle className="mr-2 h-5 w-5" />
                  )}
                  <span>
                    Suma (Retirados+Aprobados+Reprobados): <strong>{currentSum}</strong>. Matriculados:{' '}
                    <strong>{typeof watchedValues.totalEnrolled === 'number' ? watchedValues.totalEnrolled : 'N/A'}</strong>.
                    {isValidSum && typeof watchedValues.totalEnrolled === 'number'
                      ? ' Los totales coinciden.'
                      : typeof watchedValues.totalEnrolled !== 'number' && currentSum === 0
                        ? ' Ingrese los datos. El total de matriculados se cargará.'
                        : ' Los totales NO coinciden o faltan datos.'}
                  </span>
                </div>
              )}
            </div>

            <div className="flex justify-between pt-4 border-t border-border/20 mt-auto">
              <Button type="button" variant="outline" onClick={handlePreviousClick} disabled={!onPrevious} className="px-8">
                Anterior
              </Button>
              <Button
                type="submit"
                disabled={
                  !(
                    (typeof watchedValues.totalEnrolled === 'number' && isValidSum) ||
                    // Si totalEnrolled no está cargado, pero los otros campos están en 0 (su estado "vacío" por defecto)
                    // y no han sido modificados, permitir avanzar.
                    (typeof watchedValues.totalEnrolled !== 'number' &&
                      (watchedValues.totalWithdrawn ?? 0) === 0 &&
                      (watchedValues.totalPassed ?? 0) === 0 &&
                      (watchedValues.totalFailed ?? 0) === 0 &&
                      !formState.dirtyFields.totalWithdrawn &&
                      !formState.dirtyFields.totalPassed &&
                      !formState.dirtyFields.totalFailed)
                  ) || formState.isSubmitting
                }
                className="px-8"
              >
                Siguiente
              </Button>
            </div>
          </form>
        </Form>
      </FormProvider>
    </div>
  )
}
