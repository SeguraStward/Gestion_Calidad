import { create } from 'zustand'
import {
  ProfessorAssignment,
  CreateProfessorAssignmentDto,
  UpdateProfessorAssignmentDto,
  ProfessorAssignmentsService
} from '../services/professor-assignments.service'

interface ProfessorAssignmentsState {
  // State
  assignments: ProfessorAssignment[]
  loading: boolean
  error: string | null

  // Actions
  fetchAll: () => Promise<void>
  fetchById: (id: string) => Promise<ProfessorAssignment | null>
  fetchByProfessor: (professorId: string) => Promise<void>
  fetchByCampusAllocation: (campusAllocationId: string) => Promise<void>
  create: (data: CreateProfessorAssignmentDto) => Promise<ProfessorAssignment | null>
  update: (id: string, data: UpdateProfessorAssignmentDto) => Promise<ProfessorAssignment | null>
  delete: (id: string) => Promise<boolean>
  clearError: () => void
}

export const useProfessorAssignmentsStore = create<ProfessorAssignmentsState>((set) => ({
  // Initial state
  assignments: [],
  loading: false,
  error: null,

  // Fetch all assignments
  fetchAll: async () => {
    set({ loading: true, error: null })
    try {
      const assignments = await ProfessorAssignmentsService.getAll()
      set({ assignments, loading: false })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al cargar asignaciones'
      set({ error: errorMessage, loading: false })
      console.error('Error fetching assignments:', error)
    }
  },

  // Fetch by ID
  fetchById: async (id: string) => {
    set({ loading: true, error: null })
    try {
      const assignment = await ProfessorAssignmentsService.getById(id)
      set({ loading: false })
      return assignment
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al cargar asignación'
      set({ error: errorMessage, loading: false })
      console.error('Error fetching assignment:', error)
      return null
    }
  },

  // Fetch by professor
  fetchByProfessor: async (professorId: string) => {
    set({ loading: true, error: null })
    try {
      const assignments = await ProfessorAssignmentsService.getByProfessor(professorId)
      set({ assignments, loading: false })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al cargar asignaciones del profesor'
      set({ error: errorMessage, loading: false })
      console.error('Error fetching professor assignments:', error)
    }
  },

  // Fetch by campus allocation
  fetchByCampusAllocation: async (campusAllocationId: string) => {
    set({ loading: true, error: null })
    try {
      const assignments = await ProfessorAssignmentsService.getByCampusAllocation(campusAllocationId)
      set({ assignments, loading: false })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al cargar asignaciones del campus'
      set({ error: errorMessage, loading: false })
      console.error('Error fetching campus assignments:', error)
    }
  },

  // Create new assignment
  create: async (data: CreateProfessorAssignmentDto) => {
    set({ loading: true, error: null })
    try {
      const newAssignment = await ProfessorAssignmentsService.create(data)
      if (newAssignment) {
        // 🔄 Refrescar todos los datos desde el backend para obtener relaciones pobladas
        const assignments = await ProfessorAssignmentsService.getAll()
        set({ assignments, loading: false })
      }
      return newAssignment
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al crear asignación'
      set({ error: errorMessage, loading: false })
      console.error('Error creating assignment:', error)
      throw error
    }
  },

  // Update existing assignment
  update: async (id: string, data: UpdateProfessorAssignmentDto) => {
    set({ loading: true, error: null })
    try {
      const updatedAssignment = await ProfessorAssignmentsService.update(id, data)
      if (updatedAssignment) {
        set((state) => ({
          assignments: state.assignments.map((a) => (a.id === id ? updatedAssignment : a)),
          loading: false
        }))
      }
      return updatedAssignment
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al actualizar asignación'
      set({ error: errorMessage, loading: false })
      console.error('Error updating assignment:', error)
      throw error
    }
  },

  // Delete assignment
  delete: async (id: string) => {
    set({ loading: true, error: null })
    try {
      const success = await ProfessorAssignmentsService.delete(id)
      if (success) {
        set((state) => ({
          assignments: state.assignments.filter((a) => a.id !== id),
          loading: false
        }))
      }
      return success
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al eliminar asignación'
      set({ error: errorMessage, loading: false })
      console.error('Error deleting assignment:', error)
      return false
    }
  },

  // Clear error
  clearError: () => {
    set({ error: null })
  }
}))
