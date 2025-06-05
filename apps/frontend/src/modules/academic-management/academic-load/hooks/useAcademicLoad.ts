import { SimpleCourse, SimpleProfessor, AcademicCycle, AcademicLoadGroup, Schedule } from '../types/academic-load' // Adjusted path
import * as academicLoadService from '../services/academic-load.service'
import { useEffect, useState } from 'react'
import type { CampusWithRelations } from '@/modules/academic-management/academic-maintenance/types/institutional/campus'
import type { ClassroomWithRelations } from '@/modules/academic-management/academic-maintenance/types/institutional/classroom'

export interface AcademicLoadFormData {
  courses: SimpleCourse[]
  professors: SimpleProfessor[]
  academicCycles: AcademicCycle[]
  campuses: CampusWithRelations[] // Or a simplified version if available/preferred
  classrooms: ClassroomWithRelations[] // Or a simplified version
  groups: AcademicLoadGroup[]
  schedules: Schedule[]
}

export interface AcademicLoadFormDataLoadingStates {
  isLoadingCourses: boolean
  isLoadingProfessors: boolean
  isLoadingAcademicCycles: boolean
  isLoadingCampuses: boolean
  isLoadingClassrooms: boolean
  isLoadingGroups: boolean
  isLoadingSchedules: boolean
  isLoadingAll: boolean
}

export const useAcademicLoadFormData = () => {
  const [formData, setFormData] = useState<AcademicLoadFormData>({
    courses: [],
    professors: [],
    academicCycles: [],
    campuses: [],
    classrooms: [],
    groups: [],
    schedules: []
  })

  const [loadingStates, setLoadingStates] = useState<AcademicLoadFormDataLoadingStates>({
    isLoadingCourses: true,
    isLoadingProfessors: true,
    isLoadingAcademicCycles: true,
    isLoadingCampuses: true,
    isLoadingClassrooms: true,
    isLoadingGroups: true,
    isLoadingSchedules: true,
    isLoadingAll: true
  })

  useEffect(() => {
    const fetchAllFormData = async () => {
      try {
        setLoadingStates((prev) => ({ ...prev, isLoadingAll: true }))

        const [coursesData, professorsData, academicCyclesData, campusesData, classroomsData, groupsData, schedulesData] =
          await Promise.all([
            academicLoadService
              .fetchSimplifiedCourses()
              .finally(() => setLoadingStates((prev) => ({ ...prev, isLoadingCourses: false }))),
            academicLoadService
              .fetchSimplifiedProfessors()
              .finally(() => setLoadingStates((prev) => ({ ...prev, isLoadingProfessors: false }))),
            academicLoadService
              .fetchAcademicCycles()
              .finally(() => setLoadingStates((prev) => ({ ...prev, isLoadingAcademicCycles: false }))),
            academicLoadService
              .fetchCampuses()
              .finally(() => setLoadingStates((prev) => ({ ...prev, isLoadingCampuses: false }))),
            academicLoadService
              .fetchClassrooms()
              .finally(() => setLoadingStates((prev) => ({ ...prev, isLoadingClassrooms: false }))),
            academicLoadService
              .fetchAcademicLoadGroups()
              .finally(() => setLoadingStates((prev) => ({ ...prev, isLoadingGroups: false }))),
            academicLoadService
              .fetchSchedules()
              .finally(() => setLoadingStates((prev) => ({ ...prev, isLoadingSchedules: false })))
          ])

        setFormData({
          courses: coursesData || [],
          professors: professorsData || [],
          academicCycles: academicCyclesData || [],
          campuses: campusesData || [],
          classrooms: classroomsData || [],
          groups: groupsData || [],
          schedules: schedulesData || []
        })
      } catch (error) {
        console.error('Failed to fetch academic load form data:', error)
        // Optionally, set error states here
      } finally {
        setLoadingStates((prev) => ({ ...prev, isLoadingAll: false }))
      }
    }

    fetchAllFormData()
  }, [])

  return { ...formData, ...loadingStates }
}
