import { create } from 'zustand'
import {
  CampusJourneyTimeAllocation,
  CreateCampusAllocationDto,
  UpdateCampusAllocationDto,
  CampusJourneyTimeAllocationsService,
  AvailableTimeResponse
} from '../services/campus-allocations.service'

interface CampusAllocationsState {
  // State
  allocations: CampusJourneyTimeAllocation[]
  loading: boolean
  error: string | null

  // Actions
  fetchAll: () => Promise<void>
  fetchById: (id: string) => Promise<CampusJourneyTimeAllocation | null>
  create: (data: CreateCampusAllocationDto) => Promise<CampusJourneyTimeAllocation | null>
  update: (id: string, data: UpdateCampusAllocationDto) => Promise<CampusJourneyTimeAllocation | null>
  delete: (id: string) => Promise<boolean>
  getAvailableTime: (id: string) => Promise<AvailableTimeResponse | null>
  validateAvailability: (id: string, requestedTime: number) => Promise<boolean>
  clearError: () => void
}

export const useCampusAllocationsStore = create<CampusAllocationsState>((set) => ({
  // Initial state
  allocations: [],
  loading: false,
  error: null,

  // Fetch all allocations
  fetchAll: async () => {
    set({ loading: true, error: null })
    try {
      const allocations = await CampusJourneyTimeAllocationsService.getAll()
      set({ allocations, loading: false })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al cargar asignaciones'
      set({ error: errorMessage, loading: false })
      console.error('Error fetching allocations:', error)
    }
  },

  // Fetch by ID
  fetchById: async (id: string) => {
    set({ loading: true, error: null })
    try {
      const allocation = await CampusJourneyTimeAllocationsService.getById(id)
      set({ loading: false })
      return allocation
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al cargar asignación'
      set({ error: errorMessage, loading: false })
      console.error('Error fetching allocation:', error)
      return null
    }
  },

  // Create new allocation
  create: async (data: CreateCampusAllocationDto) => {
    set({ loading: true, error: null })
    try {
      const newAllocation = await CampusJourneyTimeAllocationsService.create(data)
      if (newAllocation) {
        // 🔄 Refrescar todos los datos desde el backend para obtener relaciones pobladas
        const allocations = await CampusJourneyTimeAllocationsService.getAll()
        set({ allocations, loading: false })
      }
      return newAllocation
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al crear asignación'
      set({ error: errorMessage, loading: false })
      console.error('Error creating allocation:', error)
      throw error
    }
  },

  // Update existing allocation
  update: async (id: string, data: UpdateCampusAllocationDto) => {
    set({ loading: true, error: null })
    try {
      const updatedAllocation = await CampusJourneyTimeAllocationsService.update(id, data)
      if (updatedAllocation) {
        set((state) => ({
          allocations: state.allocations.map((a) => (a.id === id ? updatedAllocation : a)),
          loading: false
        }))
      }
      return updatedAllocation
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al actualizar asignación'
      set({ error: errorMessage, loading: false })
      console.error('Error updating allocation:', error)
      throw error
    }
  },

  // Delete allocation
  delete: async (id: string) => {
    set({ loading: true, error: null })
    try {
      const success = await CampusJourneyTimeAllocationsService.delete(id)
      if (success) {
        set((state) => ({
          allocations: state.allocations.filter((a) => a.id !== id),
          loading: false
        }))
      }
      return success
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al eliminar asignación'
      set({ error: errorMessage, loading: false })
      console.error('Error deleting allocation:', error)
      return false
    }
  },

  // Get available time for an allocation
  getAvailableTime: async (id: string) => {
    try {
      const availableTime = await CampusJourneyTimeAllocationsService.getAvailableTime(id)
      return availableTime
    } catch (error) {
      console.error('Error getting available time:', error)
      return null
    }
  },

  // Validate availability
  validateAvailability: async (id: string, requestedTime: number) => {
    try {
      const result = await CampusJourneyTimeAllocationsService.validateAvailability(id, requestedTime)
      return result?.isAvailable || false
    } catch (error) {
      console.error('Error validating availability:', error)
      return false
    }
  },

  // Clear error
  clearError: () => {
    set({ error: null })
  }
}))
