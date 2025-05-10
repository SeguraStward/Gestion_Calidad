import { useEffect, useState } from 'react'
import * as professorAssignmentsService from '@/modules/academic-management/professor-assignment/services/professor-assignments-service'

export interface Course {
  id: string
  name: string
}

export interface Professor {
  id: string
  name: string
}

export interface Assignment {
  id: string
  course: Course
  professor: Professor
}

export const useProfessorAssignments = () => {
  const [courses, setCourses] = useState<Course[]>([])
  const [professors, setProfessors] = useState<Professor[]>([])
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [filter, setFilter] = useState<string>('')

  const [isLoadingCourses, setIsLoadingCourses] = useState(true)
  const [isLoadingProfessors, setIsLoadingProfessors] = useState(true)

  useEffect(() => {
    // Cargar datos de la API simulada
    const loadData = async () => {
      setIsLoadingCourses(true)
      setIsLoadingProfessors(true)

      const fetchedCourses = await professorAssignmentsService.fetchCourses()
      const fetchedProfessors = await professorAssignmentsService.fetchProfessors()
      const fetchedAssignments = await professorAssignmentsService.fetchAssignments()

      setCourses(fetchedCourses)
      setProfessors(fetchedProfessors)
      setAssignments(fetchedAssignments)

      setIsLoadingCourses(false)
      setIsLoadingProfessors(false)
    }

    loadData()
  }, [])

  const filteredAssignments = assignments.filter(
    (a) =>
      a.course.name.toLowerCase().includes(filter.toLowerCase()) || a.professor.name.toLowerCase().includes(filter.toLowerCase())
  )

  const addAssignment = async (courseId: string, professorId: string) => {
    const course = courses.find((c) => c.id === courseId)
    const professor = professors.find((p) => p.id === professorId)

    if (!course || !professor) return false

    const exists = assignments.some((a) => a.course.id === courseId && a.professor.id === professorId)

    if (exists) return false

    const success = await professorAssignmentsService.addAssignment(courseId, professorId)

    if (success) {
      setAssignments((prev) => [...prev, { id: crypto.randomUUID(), course, professor }])
    }

    return success
  }

  const deleteAssignment = async (id: string) => {
    const success = await professorAssignmentsService.deleteAssignment(id)

    if (success) {
      setAssignments((prev) => prev.filter((a) => a.id !== id))
    }
  }

  return {
    courses,
    professors,
    assignments: filteredAssignments,
    addAssignment,
    deleteAssignment,
    setFilter,
    filter,
    isLoadingCourses,
    isLoadingProfessors
  }
}
