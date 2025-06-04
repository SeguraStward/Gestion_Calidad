'use client'

import React, { useEffect, useMemo } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@una-gc/ui/components/button'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@una-gc/ui/components/form'
import { Input } from '@una-gc/ui/components/input'
import { UseFormReturn, FormProvider } from 'react-hook-form'
import { AlertCircle, CheckCircle2, MinusCircle, Users, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react'

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

interface Step2FormProps {
  formMethods: UseFormReturn<Step2FormData>
  onSaveAndNext: (data: Step2FormData) => void
  onPrevious?: () => void
  totalSteps: number
  initialData?: Step2FormData | null
  isEditing?: boolean
}

export function Step2Form({
  formMethods,
  onSaveAndNext,
  onPrevious,
  totalSteps,
  initialData,
  isEditing = false
}: Step2FormProps) {
  const { control, handleSubmit, reset, watch, formState } = formMethods

  useEffect(() => {
    if (!isEditing && initialData) {
      reset(initialData)
    } else if (!isEditing && !initialData) {
      reset({
        totalEnrolled: 0,
        totalWithdrawn: 0,
        totalPassed: 0,
        totalFailed: 0
      })
    }
  }, [isEditing, initialData, reset])

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
    onSaveAndNext(processedData)
  }

  const handleNumericInputChange = (e: React.ChangeEvent<HTMLInputElement>, field: any) => {
    const value = e.target.value
    if (value === '' || /^[0-9]+$/.test(value)) {
      field.onChange(value === '' ? undefined : parseInt(value, 10))
    }
  }

  return (
    // This is the root div from the previous refactor (p-6 h-full flex flex-col)
    // The Card component for "Resumen Estadístico" was removed
    // and its content placed directly into the scrollable area.
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
          {/* Ensure form takes up remaining space and enables flex column layout for button positioning */}
          <form onSubmit={handleSubmit(onSubmitHandler)} className="flex-1 flex flex-col space-y-4">
            {/* Scrollable content area */}
            <div className="flex-1 space-y-4 md:space-y-6 overflow-y-auto pr-2">
              {/* Section Title and Description (previously CardHeader) */}
              <div>
                <h3 className="text-lg font-medium">Resumen Estadístico</h3>
                <p className="text-sm text-muted-foreground">
                  Asegúrese de que la suma de retirados, aprobados y reprobados coincida con el total de matriculados.
                </p>
              </div>

              {/* Form Fields (previously CardContent) */}
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
                          type="text"
                          placeholder="Cargando..."
                          {...field}
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
                              type="text"
                              inputMode="numeric"
                              pattern="[0-9]*"
                              placeholder="0"
                              {...field}
                              value={field.value === undefined || field.value === null ? '' : String(field.value)}
                              onChange={(e) => handleNumericInputChange(e, field)}
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

              {/* Indicador de validación de suma */}
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

            {/* Standardized Navigation Buttons Container */}
            <div className="flex justify-between pt-4 border-t border-border/20 mt-auto">
              <Button type="button" variant="outline" onClick={onPrevious} disabled={!onPrevious} className="px-8">
                Anterior
              </Button>
              <Button
                type="submit"
                disabled={
                  !(
                    (typeof watchedValues.totalEnrolled === 'number' && isValidSum) ||
                    (typeof watchedValues.totalEnrolled !== 'number' &&
                      currentSum === 0 &&
                      !Object.values(formState.dirtyFields).some(Boolean))
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
