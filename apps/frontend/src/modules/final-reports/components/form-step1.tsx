'use client'

import React, { useMemo, useEffect } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@una-gc/ui/components/button'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@una-gc/ui/components/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@una-gc/ui/components/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@una-gc/ui/components/select'
import { Input } from '@una-gc/ui/components/input'
import { UseFormReturn, FormProvider } from 'react-hook-form'
import { Loader2 } from 'lucide-react'
import useDevStore from '@/store/devStore'
import { useAcademicLoadsByProfessor } from '@/modules/academic-loads/service/academic-loads.service'
import type { FullAcademicLoad } from '@/modules/academic-loads/types/academic-loads.types'

export const step1Schema = z.object({
  academicLoadId: z.string().min(1, 'Debe seleccionar una carga académica.'), // Ahora siempre requerido
  nrc: z.string().min(1, 'Debe seleccionar un NRC'),
  courseName: z.string().optional(),
  groupNumber: z.string().optional(),
  professorName: z.string().optional(),
  courseCode: z.string().optional(),
  groupLevel: z.string().optional(),
  enrolledCapacity: z.number().optional()
})

export type Step1FormData = z.infer<typeof step1Schema>

interface TransformedAcademicLoad {
  id: string
  nrc: string
  courseName?: string
  courseCode?: string
  professorName?: string
  groupNumber?: string
  groupLevel?: string
  enrolledCapacity?: number
}

interface Step1FormProps {
  formMethods: UseFormReturn<Step1FormData>
  onSaveAndNext: (data: Step1FormData) => void
  totalSteps: number
  isEditing?: boolean

  initialData?: Step1FormData | null
  onCancel?: () => void
  onPrevious?: () => void // Add this new optional prop
}

export function Step1Form({
  formMethods,
  onSaveAndNext,
  onPrevious,
  totalSteps,
  isEditing = false,
  initialData = null,
  onCancel
}: Step1FormProps) {
  const { control, watch, setValue, handleSubmit, formState, reset } = formMethods
  const currentProfessorId = useDevStore((state) => state.mockProfessorId)

  const {
    data: paginatedAcademicLoads,
    isLoading: isLoadingAcademicLoads,
    error: academicLoadsError
  } = useAcademicLoadsByProfessor(
    currentProfessorId,
    {
      include: 'course,academicCycle,professor,group'
    },
    { enabled: !!currentProfessorId }
  )

  const availableCourses = useMemo((): TransformedAcademicLoad[] => {
    let courses: TransformedAcademicLoad[] = []
    if (paginatedAcademicLoads?.data) {
      courses = paginatedAcademicLoads.data.map((load: FullAcademicLoad) => ({
        id: load.id,
        nrc: load.nrc,
        courseName: load.course?.name,
        courseCode: load.course?.code,
        professorName: load.professor?.fullName || undefined,
        groupNumber: load.group?.number,
        groupLevel: load.course?.level ? String(load.course.level) : undefined,
        enrolledCapacity: load.enrolledCapacity
      }))
    }

    // Si estamos editando y tenemos datos iniciales, y la carga del informe no está en la lista
    // (ej. porque no está "activa" o el filtro la excluyó), la añadimos para que se pueda seleccionar.
    if (isEditing && initialData?.nrc && initialData.academicLoadId) {
      const editingCourseInList = courses.find((c) => c.id === initialData.academicLoadId)
      if (!editingCourseInList) {
        courses.unshift({
          // Añadir al principio
          id: initialData.academicLoadId,
          nrc: initialData.nrc,
          courseName: initialData.courseName,
          courseCode: initialData.courseCode,
          professorName: initialData.professorName,
          groupNumber: initialData.groupNumber,
          groupLevel: initialData.groupLevel,
          enrolledCapacity: initialData.enrolledCapacity
        })
      }
    }
    return courses
  }, [paginatedAcademicLoads, isEditing, initialData])

  const selectedNrc = watch('nrc')
  const selectedAcademicLoadId = watch('academicLoadId')

  // Efecto para poblar el formulario con initialData cuando estamos en modo edición (SOLO LA PRIMERA VEZ)
  useEffect(() => {
    if (isEditing && initialData && formState.isDirty === false && !selectedAcademicLoadId) {
      // Solo si no está sucio y no hay academicLoadId ya
      reset(initialData)
    }
  }, [isEditing, initialData, reset, formState.isDirty, selectedAcademicLoadId])

  // Efecto para actualizar campos cuando selectedNrc cambia (para creación y edición si se cambia el NRC)
  useEffect(() => {
    const courseData = availableCourses.find((course) => course.nrc === selectedNrc)
    if (courseData) {
      setValue('academicLoadId', courseData.id, { shouldValidate: true, shouldDirty: true })
      setValue('courseName', courseData.courseName, { shouldValidate: true, shouldDirty: true })
      setValue('groupNumber', courseData.groupNumber, { shouldValidate: true, shouldDirty: true })
      setValue('professorName', courseData.professorName, { shouldValidate: true, shouldDirty: true })
      setValue('courseCode', courseData.courseCode, { shouldValidate: true, shouldDirty: true })
      setValue('groupLevel', courseData.groupLevel, { shouldValidate: true, shouldDirty: true })
      setValue('enrolledCapacity', courseData.enrolledCapacity, { shouldValidate: true, shouldDirty: true })
    } else if (!selectedNrc) {
      // Si se deselecciona (selectedNrc es vacío)
      setValue('academicLoadId', '') // Limpiar academicLoadId también
      setValue('courseName', '')
      setValue('groupNumber', '')
      setValue('professorName', '')
      setValue('courseCode', '')
      setValue('groupLevel', '')
      setValue('enrolledCapacity', undefined)
    }
  }, [selectedNrc, availableCourses, setValue])

  const onSubmitHandler = (data: Step1FormData) => {
    // El academicLoadId y nrc ya deberían estar correctos por la selección y el useEffect.
    // Los demás campos también.
    console.log('Step 1 Data to Save:', data)
    onSaveAndNext(data)
  }

  if (isLoadingAcademicLoads && availableCourses.length === 0) {
    return (
      <div className="p-6 h-full flex flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-2 text-muted-foreground">Cargando información de cursos...</p>
      </div>
    )
  }

  if (academicLoadsError) {
    return (
      <div className="p-6 h-full flex flex-col items-center justify-center">
        <p className="text-destructive">Error al cargar la información de los cursos.</p>
        <p className="text-sm text-muted-foreground">{academicLoadsError.message}</p>
      </div>
    )
  }

  if (!currentProfessorId) {
    return (
      <div className="p-6 h-full flex flex-col items-center justify-center">
        <p className="text-destructive">No se ha configurado un profesor para la demostración.</p>
        <p className="text-sm text-muted-foreground">Por favor, configure un ID de profesor en el store de desarrollo.</p>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 h-full flex flex-col">
      <div className="mb-4 md:mb-6">
        <h2 className="text-xl font-semibold">
          {isEditing ? 'Información del Curso (Edición)' : `Paso 1 de ${totalSteps}: Información del Curso`}
        </h2>
        <p className="text-muted-foreground text-sm">
          {isEditing
            ? 'Verifique o modifique el curso asociado al informe.'
            : 'Seleccione el NRC del curso para cargar la información.'}
        </p>
      </div>

      <FormProvider {...formMethods}>
        <Form {...formMethods}>
          <form onSubmit={handleSubmit(onSubmitHandler)} className="flex-1 flex flex-col space-y-4">
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 overflow-y-auto pr-2">
              {/* Section 1: Selección de Curso */}
              <div className="space-y-4 border border-border/20 p-4 rounded-lg bg-card/50">
                <h3 className="text-base font-medium">Selección de Curso</h3>
                <FormField
                  control={control}
                  name="nrc"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-medium">
                        NRC del Curso <span className="text-destructive">*</span>
                      </FormLabel>
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value)
                        }}
                        value={field.value || ''}
                        disabled={availableCourses.length === 0 && !isLoadingAcademicLoads}
                      >
                        <FormControl>
                          <SelectTrigger className="h-10">
                            <SelectValue
                              placeholder={
                                isLoadingAcademicLoads && availableCourses.length === 0
                                  ? 'Cargando NRCs...'
                                  : availableCourses.length === 0
                                    ? 'No hay cursos disponibles'
                                    : 'Seleccione un NRC...'
                              }
                            />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {availableCourses.map((course) => (
                            <SelectItem key={course.id} value={course.nrc}>
                              <div className="flex flex-col">
                                <span className="font-medium">NRC: {course.nrc}</span>
                                <span className="text-xs text-muted-foreground">
                                  {course.courseCode} - {course.courseName}
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
                {/* Campo oculto o de solo lectura para academicLoadId, se llena por el useEffect */}
                <FormField
                  control={control}
                  name="academicLoadId"
                  render={({ field }) => (
                    <FormItem className="hidden">
                      <FormLabel>Academic Load ID</FormLabel>
                      <FormControl>
                        <Input {...field} readOnly disabled />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name="courseName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-medium">Curso</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value || ''} disabled className="bg-muted/50 h-10" />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name="groupNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-medium">Número de Grupo</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value || ''} disabled className="bg-muted/50 h-10" />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              {/* Section 2: Detalles Adicionales */}
              <div className="space-y-4 border border-border/20 p-4 rounded-lg bg-card/50">
                <h3 className="text-base font-medium">Detalles Adicionales</h3>
                <FormField
                  control={control}
                  name="professorName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-medium">Profesor</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value || ''} disabled className="bg-muted/50 h-10" />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name="courseCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-medium">Código de Curso</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value || ''} disabled className="bg-muted/50 h-10" />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name="groupLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-medium">Nivel de Grupo</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value || ''} disabled className="bg-muted/50 h-10" />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name="enrolledCapacity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-medium">Matriculados (según sistema)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} value={field.value ?? ''} disabled className="bg-muted/50 h-10" />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Standardized Navigation Buttons Container */}
            <div className="flex justify-between pt-4 border-t border-border/20 mt-auto">
              <div>
                {' '}
                {/* Wrapper for optional cancel/previous button */}
                {onCancel && !isEditing && (
                  <Button type="button" variant="outline" onClick={onCancel} className="px-8">
                    Cancelar
                  </Button>
                )}
                {onPrevious && ( // Show Previous if onPrevious is provided (can be create or edit mode)
                  <Button type="button" variant="outline" onClick={onPrevious} className="px-8">
                    Anterior
                  </Button>
                )}
              </div>
              <Button type="submit" disabled={!selectedAcademicLoadId || formState.isSubmitting} className="px-8">
                {isEditing ? 'Guardar y Continuar' : 'Siguiente'}
              </Button>
            </div>
          </form>
        </Form>
      </FormProvider>
    </div>
  )
}
