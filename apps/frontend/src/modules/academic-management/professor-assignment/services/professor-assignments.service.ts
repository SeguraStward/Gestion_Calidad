// Este archivo simula las llamadas a la API para obtener datos de cursos, profesores y asignaciones

import { Course, Professor, Assignment } from '@/modules/academic-management/professor-assignment/hooks/useProfessorAssignments'

let assignmentsMock: Assignment[] = [
  {
    id: 'x1',
    course: { id: '1', name: 'Matemática' },
    professor: { id: 'a', name: 'Profe Ana' }
  }
]

const coursesMock: Course[] = [
  { id: '1', name: 'Matemática' },
  { id: '2', name: 'Programación' },
  { id: '3', name: 'Física' },
  { id: '4', name: 'Química' }
]

const professorsMock: Professor[] = [
  { id: 'a', name: 'Profe Ana' },
  { id: 'b', name: 'Profe Boris' },
  { id: 'c', name: 'Profe Carlos' }
]

export const fetchCourses = async (): Promise<Course[]> => {
  return new Promise((resolve) =>
    setTimeout(() => {
      resolve([...coursesMock])
    }, 1000)
  )
}

export const fetchProfessors = async (): Promise<Professor[]> => {
  return new Promise((resolve) =>
    setTimeout(() => {
      resolve([...professorsMock])
    }, 1000)
  )
}

export const fetchAssignments = async (): Promise<Assignment[]> => {
  return new Promise((resolve) =>
    setTimeout(() => {
      resolve([...assignmentsMock])
    }, 1000)
  )
}

export const addAssignment = async (courseId: string, professorId: string): Promise<Assignment | null> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const course = coursesMock.find((c) => c.id === courseId)
      const professor = professorsMock.find((p) => p.id === professorId)

      if (course && professor) {
        const newAssignment = {
          id: crypto.randomUUID(),
          course,
          professor
        }
        assignmentsMock.push(newAssignment)
        resolve(newAssignment)
      } else {
        resolve(null)
      }
    }, 500)
  })
}

export const deleteAssignment = async (id: string): Promise<boolean> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      assignmentsMock = assignmentsMock.filter((a) => a.id !== id)
      resolve(true)
    }, 500)
  })
}

export const updateAssignment = async (id: string, courseId: string, professorId: string): Promise<boolean> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const index = assignmentsMock.findIndex((a) => a.id === id)
      const course = coursesMock.find((c) => c.id === courseId)
      const professor = professorsMock.find((p) => p.id === professorId)

      if (index === -1 || !course || !professor) {
        resolve(false)
        return
      }

      // Validación duplicado (ignorando el mismo id que se actualiza)
      const exists = assignmentsMock.some((a) => a.course.id === courseId && a.professor.id === professorId && a.id !== id)
      if (exists) {
        resolve(false) // ya existe otro con esa combinación
        return
      }

      assignmentsMock[index] = {
        id,
        course,
        professor
      }
      resolve(true)
    }, 500)
  })
}
