import { useMemo } from 'react'
import { useCampus } from '../../../../shared/hooks/useCampus'
import { useAcademicGroup } from '../../../../shared/hooks/useAcademicGroup'
import { useClassroom } from '../../../../shared/hooks/useClassroom'
import { useSchedule } from '../../../../shared/hooks/useSchedule'
import { useUser } from '../../../../shared/hooks/useUser'
import { useCourses } from '../../../../shared/hooks/useCourses'
import { useQuery } from '@tanstack/react-query'
import { academicLoadService } from '../services/academic-load.service'

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

// Helper function to fetch and transform data
async function fetchAndTransformData(endpoint: string, transform: (item: any) => FormDataItem) {
  try {
    const res = await academicLoadService.list({ include: endpoint })
    return res.data
      .map((item: any) => transform(item[endpoint]))
      .filter(Boolean)
      .filter((item: FormDataItem, index: number, self: FormDataItem[]) => index === self.findIndex((t) => t.id === item.id))
  } catch (error) {
    console.error(`Error fetching ${endpoint}:`, error)
    return []
  }
}

// Transform functions for each entity
const transforms = {
  academicCycle: (cycle: any) => ({
    id: cycle.id,
    name: cycle.name,
    year: cycle.year,
    cycleNumber: cycle.cycleNumber
  })
}

export function useAcademicLoadFormData(): FormData {
  // Use the new hooks for each entity
  const { data: campuses = [], isLoading: isLoadingCampuses } = useCampus()
  const { data: groups = [], isLoading: isLoadingGroups } = useAcademicGroup()
  const { data: classrooms = [], isLoading: isLoadingClassrooms } = useClassroom()
  const { data: schedules = [], isLoading: isLoadingSchedules } = useSchedule()
  const { data: professors = [], isLoading: isLoadingProfessors } = useUser()
  const { data: courses = [], isLoading: isLoadingCourses } = useCourses()

  // Fetch academic cycles using the existing pattern
  const { data: academicCycles = [], isLoading: isLoadingAcademicCycles } = useQuery({
    queryKey: ['academicCycles'],
    queryFn: () => fetchAndTransformData('academicCycle', transforms.academicCycle)
  })

  return useMemo(
    () => ({
      courses,
      isLoadingCourses,
      professors: professors.map((p: any) => ({
        id: p.id,
        name: `${p.name} (${p.email})`,
        email: p.email
      })),
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
