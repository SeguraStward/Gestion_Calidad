// Este archivo simula las llamadas a la API para obtener datos de cursos, profesores y asignaciones
import { Course, Professor, Assignment } from '@/modules/academic-management/professor-assignment/hooks/useProfessorAssignments' // O la ruta correcta

export const fetchCourses = async (): Promise<Course[]> => {
  // Simulación de llamada al API (puedes reemplazar con fetch() o axios en el futuro)
  return new Promise((resolve) =>
    setTimeout(() => {
      resolve([
        { id: '1', name: 'Matemática' },
        { id: '2', name: 'Programación' },
        { id: '3', name: 'Física' },
        { id: '4', name: 'Química' }
      ])
    }, 1000)
  )
}

export const fetchProfessors = async (): Promise<Professor[]> => {
  // Simulación de llamada al API
  return new Promise((resolve) =>
    setTimeout(() => {
      resolve([
        { id: 'a', name: 'Profe Ana' },
        { id: 'b', name: 'Profe Boris' },
        { id: 'c', name: 'Profe Carlos' }
      ])
    }, 1000)
  )
}

export const fetchAssignments = async (): Promise<Assignment[]> => {
  // Simulación de llamada al API
  return new Promise((resolve) =>
    setTimeout(() => {
      resolve([{ id: 'x1', course: { id: '1', name: 'Matemática' }, professor: { id: 'a', name: 'Profe Ana' } }])
    }, 1000)
  )
}

export const addAssignment = async (courseId: string, professorId: string): Promise<boolean> => {
  // Simulación de creación de asignación
  return new Promise((resolve) => {
    setTimeout(() => resolve(true), 500) // Suponiendo que la asignación se crea exitosamente
  })
}

export const deleteAssignment = async (id: string): Promise<boolean> => {
  // Simulación de eliminación de asignación
  return new Promise((resolve) => {
    setTimeout(() => resolve(true), 500) // Suponiendo que se elimina exitosamente
  })
}
