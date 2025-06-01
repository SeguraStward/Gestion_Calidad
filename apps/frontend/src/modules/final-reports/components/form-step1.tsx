'use client'

import React, { useMemo } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@una-gc/ui/components/button'
import { Card, CardContent, CardHeader, CardTitle } from '@una-gc/ui/components/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@una-gc/ui/components/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@una-gc/ui/components/select'
import { Input } from '@una-gc/ui/components/input'
import { UseFormReturn } from 'react-hook-form'
import { Loader2 } from 'lucide-react' // For loading indicator
import useDevStore from '@/store/devStore' // To get professor ID
import { useAcademicLoadsByProfessor } from '@/modules/academic-loads/service/academic-loads.service' // Hook to fetch academic loads
import type { FullAcademicLoad } from '@/modules/academic-loads/types/academic-loads.types' // Type for academic load

// Updated schema - include academicLoadId and English field names for the core 5 fields
export const step1Schema = z.object({
  academicLoadId: z.string().optional(), // ID of the selected academic load
  nrc: z.string().min(1, 'Debe seleccionar un NRC'), // User message in Spanish
  courseName: z.string().optional(),
  groupNumber: z.string().optional(),
  professorName: z.string().optional(),
  courseCode: z.string().optional(),
  groupLevel: z.string().optional()
  // Removed: campusName, cycleStartDate, enrollmentCapacity
})

export type Step1FormData = z.infer<typeof step1Schema>

// Interface for transformed data used by Select and useEffect
interface TransformedAcademicLoad {
  id: string // Corresponds to FullAcademicLoad.id
  nrc: string
  courseName?: string
  courseCode?: string
  professorName?: string
  groupNumber?: string
  groupLevel?: string
  // Removed: enrollmentCapacity, campusName, cycleStartDate
}

interface Step1FormProps {
  formMethods: UseFormReturn<Step1FormData>
  onSaveAndNext: (data: Step1FormData) => void
  onPrevious?: () => void
  totalSteps: number
}

export function Step1Form({ formMethods, onSaveAndNext, onPrevious, totalSteps }: Step1FormProps) {
  const { control, watch, setValue, handleSubmit, formState } = formMethods
  const currentProfessorId = useDevStore((state) => state.mockProfessorId)

  const {
    data: paginatedAcademicLoads,
    isLoading: isLoadingAcademicLoads,
    error: academicLoadsError
  } = useAcademicLoadsByProfessor(
    currentProfessorId,
    {
      status: 'ACTIVE', // Filter by active academic loads
      include: 'course,academicCycle,professor,group' // Include necessary relations
    },
    { enabled: !!currentProfessorId }
  )

  // Transform FullAcademicLoad data for the Select component and auto-completion logic
  const availableCourses = useMemo((): TransformedAcademicLoad[] => {
    if (!paginatedAcademicLoads?.data) return []
    return paginatedAcademicLoads.data.map((load: FullAcademicLoad) => ({
      id: load.id,
      nrc: load.nrc,
      courseName: load.course?.name,
      courseCode: load.course?.code,
      professorName: load.professor?.fullName, // Assuming fullName is on the professor object
      groupNumber: load.group?.number, // Assuming number is on the group object
      groupLevel: load.course?.level ? String(load.course.level) : undefined // Assuming level is on the course object
      // Removed mapping for: enrollmentCapacity, campusName, cycleStartDate
    }))
  }, [paginatedAcademicLoads])

  const selectedNrc = watch('nrc')
  // Find selected academic load data using NRC from the transformed data
  const selectedCourseData = availableCourses.find((course) => course.nrc === selectedNrc)

  React.useEffect(() => {
    if (selectedCourseData) {
      setValue('academicLoadId', selectedCourseData.id) // Store the academic load ID
      setValue('courseName', selectedCourseData.courseName)
      setValue('groupNumber', selectedCourseData.groupNumber)
      setValue('professorName', selectedCourseData.professorName)
      setValue('courseCode', selectedCourseData.courseCode)
      setValue('groupLevel', selectedCourseData.groupLevel)
      // Removed setValue for: enrollmentCapacity, campusName, cycleStartDate
    } else {
      // Clear fields if no course is selected or selection is cleared
      setValue('academicLoadId', undefined)
      setValue('courseName', '')
      setValue('groupNumber', '')
      setValue('professorName', '')
      setValue('courseCode', '')
      setValue('groupLevel', '')
      // Removed setValue for: enrollmentCapacity, campusName, cycleStartDate
    }
  }, [selectedCourseData, setValue])

  const onSubmitHandler = (data: Step1FormData) => {
    // Data should already be updated by the useEffect hook
    // Ensure academicLoadId is present if an NRC was selected
    const finalData = {
      ...data,
      academicLoadId: selectedCourseData?.id || data.academicLoadId
    }
    onSaveAndNext(finalData)
  }

  if (isLoadingAcademicLoads) {
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
    <div className="p-6 h-full flex flex-col">
      <div className="mb-4">
        <h2 className="text-xl font-semibold">Información del Curso</h2>
        <p className="text-muted-foreground text-sm">Seleccione el NRC del curso para cargar la información</p>
      </div>

      <Form {...formMethods}>
        <form onSubmit={handleSubmit(onSubmitHandler)} className="flex-1 flex flex-col">
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* First Column: NRC Selector, Course Name, Group Number */}
            <div className="space-y-6">
              <Card className="border-primary/20 bg-primary/5 h-fit">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Selección de Curso</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={control}
                    name="nrc"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-medium">
                          NRC del Curso <span className="text-destructive">*</span>
                        </FormLabel>
                        <Select onValueChange={field.onChange} value={field.value || ''} disabled={availableCourses.length === 0}>
                          <FormControl>
                            <SelectTrigger className="h-10">
                              <SelectValue
                                placeholder={
                                  availableCourses.length === 0
                                    ? 'No hay cursos activos para este profesor'
                                    : 'Seleccione un NRC...'
                                }
                              />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {availableCourses.map((course) => (
                              <SelectItem key={course.nrc} value={course.nrc}>
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
                </CardContent>
              </Card>
            </div>

            {/* Second Column: Professor Name, Course Code, Group Level */}
            <div className="space-y-6">
              <Card className="border-primary/20 bg-primary/5 h-fit">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Detalles Adicionales</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
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
                  {/* Removed FormFields for campusName, cycleStartDate, enrollmentCapacity */}
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="flex justify-between pt-6 mt-auto">
            <Button type="button" variant="outline" onClick={onPrevious} disabled={!onPrevious} className="px-8">
              Anterior
            </Button>
            <Button type="submit" disabled={!selectedCourseData || formState.isSubmitting} className="px-8">
              Siguiente
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
