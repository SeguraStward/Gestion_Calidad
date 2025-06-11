import { useMemo } from 'react'
import { useCampus } from '../../../../shared/hooks/useCampus'
import { useAcademicGroup } from '../../../../shared/hooks/useAcademicGroup'
import { useClassroom } from '../../../../shared/hooks/useClassroom'
import { useSchedule } from '../../../../shared/hooks/useSchedule'
import { useUsersByRole } from '../../../../shared/hooks/useUser'
import { useCourses } from '../../../../shared/hooks/useCourses'
import { useAcademicCycle } from '../../../../shared/hooks/useAcademicCycle'

// Define types for form data
interface FormDataItem {
  id: string
  name: string
  [key: string]: any
}

interface FormData {
  courses: FormDataItem[]
  isLoadingCourses: boolean
  professors: FormDataItem[]
  isLoadingProfessors: boolean
  academicCycles: FormDataItem[]
  isLoadingAcademicCycles: boolean
  campuses: FormDataItem[]
  isLoadingCampuses: boolean
  groups: FormDataItem[]
  isLoadingGroups: boolean
  classrooms: FormDataItem[]
  isLoadingClassrooms: boolean
  schedules: FormDataItem[]
  isLoadingSchedules: boolean
}

export function useAcademicLoadFormData(): FormData {
  // Use the new hooks for each entity
  const { data: campuses = [], isLoading: isLoadingCampuses } = useCampus()
  const { data: groups = [], isLoading: isLoadingGroups } = useAcademicGroup()
  const { data: classrooms = [], isLoading: isLoadingClassrooms } = useClassroom()
  const { data: schedules = [], isLoading: isLoadingSchedules } = useSchedule()
  const { data: professors = [], isLoading: isLoadingProfessors } = useUsersByRole('PROFESOR', 'ACTIVE', 1, 1000)
  const { data: courses = [], isLoading: isLoadingCourses } = useCourses()
  const { data: academicCycles = [], isLoading: isLoadingAcademicCycles } = useAcademicCycle()

  // DEBUG: Mostrar los datos de profesores en consola para depuración
  console.log('professors hook data:', professors)

  return useMemo(
    () => ({
      courses,
      isLoadingCourses,
      professors: Array.isArray(professors)
        ? professors.map((p: any) => ({
            id: p.id,
            name: `${p.name} (${p.email})`,
            email: p.email,
            roles: p.roles // Mostrar roles si existen
          }))
        : [],
      isLoadingProfessors,
      academicCycles,
      isLoadingAcademicCycles,
      campuses: campuses.map((c: any) => ({
        id: c.id,
        name: c.name ?? '', // Asegura que name nunca sea null
        code: c.code
      })),
      isLoadingCampuses,
      groups,
      isLoadingGroups,
      classrooms,
      isLoadingClassrooms,
      schedules,
      isLoadingSchedules
    }),
    [
      courses,
      isLoadingCourses,
      professors,
      isLoadingProfessors,
      academicCycles,
      isLoadingAcademicCycles,
      campuses,
      isLoadingCampuses,
      groups,
      isLoadingGroups,
      classrooms,
      isLoadingClassrooms,
      schedules,
      isLoadingSchedules
    ]
  )
}
