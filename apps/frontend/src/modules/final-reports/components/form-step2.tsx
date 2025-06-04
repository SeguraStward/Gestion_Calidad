'use client'

import React, { useEffect, useMemo } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@una-gc/ui/components/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@una-gc/ui/components/card'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@una-gc/ui/components/form'
import { Input } from '@una-gc/ui/components/input'
import { UseFormReturn } from 'react-hook-form'
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
      // CREATE MODE: initialData is provided by the parent (new/page.tsx).
      // This initialData should contain totalEnrolled derived from Step 1.
      // When step1Data.enrolledCapacity updates in the parent, the initialData prop
      // passed to this component will be a new object, triggering this effect.
      // console.log('[Step2Form] Create Mode: Resetting with initialData from parent:', initialData);
      reset(initialData)
    } else if (!isEditing && !initialData) {
      // CREATE MODE (fallback): If Step2Form is somehow used in create mode
      // WITHOUT initialData being passed from the parent (e.g. initialData={null}).
      // This is not the current case for new/page.tsx, which always passes an object.
      // console.log('[Step2Form] Create Mode: No initialData object passed, resetting to defaults.');
      reset({
        totalEnrolled: 0,
        totalWithdrawn: 0,
        totalPassed: 0,
        totalFailed: 0
      })
    }
    // EDIT MODE (isEditing is true):
    // The parent page (edit/[id]/page.tsx) is responsible for calling
    // formStep2Methods.reset() directly with its own 'step2Data' state.
    // So, this useEffect doesn't need to handle 'initialData' for edit mode.
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
    // Ensure that null values are converted to 0 or handled as per backend requirements
    // The schema already coerces, but this ensures submission consistency if needed.
    const processedData: Step2FormData = {
      totalEnrolled: data.totalEnrolled ?? undefined, // Keep undefined if that's what schema expects for optional
      totalWithdrawn: data.totalWithdrawn ?? undefined,
      totalPassed: data.totalPassed ?? undefined,
      totalFailed: data.totalFailed ?? undefined
    }
    onSaveAndNext(processedData)
  }

  // Mejor manera de manejar el input numérico:
  // - El input sigue siendo type="text" para un control total.
  // - Se permite solo entrada numérica.
  // - onChange convierte a número o undefined.
  const handleNumericInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: any // El field de RHF
  ) => {
    const value = e.target.value
    // Permitir campo vacío o solo números
    if (value === '' || /^[0-9]+$/.test(value)) {
      field.onChange(value === '' ? undefined : parseInt(value, 10))
    }
  }

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="mb-6">
        <h2 className="text-xl font-semibold">Paso 2 de {totalSteps}: Estadísticas del Curso</h2>
        <p className="text-muted-foreground text-sm">
          Ingrese las estadísticas finales del curso. El total de matriculados se carga automáticamente.
        </p>
      </div>

      <Form {...formMethods}>
        <form onSubmit={handleSubmit(onSubmitHandler)} className="flex-1 flex flex-col space-y-8">
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="text-lg">Resumen Estadístico</CardTitle>
              <CardDescription>
                Asegúrese de que la suma de retirados, aprobados y reprobados coincida con el total de matriculados.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                        type="text" // Cambiado a text para mejor control, pero se mostrará como número
                        placeholder="Cargando..."
                        {...field}
                        value={field.value === undefined || field.value === null ? '' : String(field.value)} // Handle null as well
                        disabled
                        className="bg-muted/70 h-10"
                        readOnly // Adicional a disabled para inputs de texto
                      />
                    </FormControl>
                    <FormDescription>Este valor se carga desde la información del curso (Paso 1).</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Campos editables */}
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
                            type="text" // Cambiado a text para mejor control
                            inputMode="numeric" // Ayuda en móviles a mostrar teclado numérico
                            pattern="[0-9]*" // Ayuda a la validación del navegador
                            placeholder="0"
                            {...field}
                            value={field.value === undefined || field.value === null ? '' : String(field.value)} // Handle null
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
            </CardContent>
          </Card>

          {/* Indicador de validación de suma */}
          {(typeof watchedValues.totalEnrolled === 'number' ||
            currentSum > 0 ||
            Object.values(formState.dirtyFields).some(Boolean)) && ( // Show if totalEnrolled is loaded, or if there's any sum, or if any field is dirty
            <div
              className={`p-3 rounded-md flex items-center text-sm ${
                isValidSum && typeof watchedValues.totalEnrolled === 'number'
                  ? 'bg-green-100 text-green-700'
                  : typeof watchedValues.totalEnrolled !== 'number' && currentSum === 0 // Special case: no enrolled, no sum yet
                    ? 'bg-blue-100 text-blue-700' // A different state for "waiting for enrolled"
                    : 'bg-red-100 text-red-700' // Error state
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

          <div className="flex justify-between pt-6 mt-auto">
            <Button type="button" variant="outline" onClick={onPrevious} disabled={!onPrevious} className="px-8">
              Anterior
            </Button>
            <Button
              type="submit"
              // Enable submit if totalEnrolled is a number AND the sum is valid, OR if totalEnrolled is not yet loaded (allowing submission of 0s if that's intended)
              // This might need refinement based on whether submitting with "N/A" for enrolled is allowed.
              disabled={
                !(
                  (
                    (typeof watchedValues.totalEnrolled === 'number' && isValidSum) ||
                    (typeof watchedValues.totalEnrolled !== 'number' &&
                      currentSum === 0 &&
                      !Object.values(formState.dirtyFields).some(Boolean))
                  ) // Allow submitting if nothing is entered and enrolled not loaded
                ) || formState.isSubmitting // Use formState.isSubmitting here
              }
              className="px-8"
            >
              Siguiente
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
