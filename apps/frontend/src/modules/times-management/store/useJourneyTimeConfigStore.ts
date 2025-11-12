import { create } from 'zustand'
import {
  JourneyTimeConfig,
  CreateJourneyTimeConfigDto,
  UpdateJourneyTimeConfigDto,
  JourneyTimeConfigService
} from '../services/journey-time-config.service'

interface JourneyTimeConfigState {
  // State
  configs: JourneyTimeConfig[]
  activeConfig: JourneyTimeConfig | null
  loading: boolean
  error: string | null

  // Actions
  fetchAll: () => Promise<void>
  fetchActive: () => Promise<void>
  create: (data: CreateJourneyTimeConfigDto) => Promise<JourneyTimeConfig | null>
  update: (id: string, data: UpdateJourneyTimeConfigDto) => Promise<JourneyTimeConfig | null>
  delete: (id: string) => Promise<boolean>
  setActiveConfig: (config: JourneyTimeConfig | null) => void
  clearError: () => void
}

export const useJourneyTimeConfigStore = create<JourneyTimeConfigState>((set, get) => ({
  // Initial state
  configs: [],
  activeConfig: null,
  loading: false,
  error: null,

  // Fetch all configurations
  fetchAll: async () => {
    set({ loading: true, error: null })
    try {
      const configs = await JourneyTimeConfigService.getAll()
      set({ configs, loading: false })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al cargar configuraciones'
      set({ error: errorMessage, loading: false })
      console.error('Error fetching configs:', error)
    }
  },

  // Fetch active configuration
  fetchActive: async () => {
    set({ loading: true, error: null })
    try {
      const activeConfig = await JourneyTimeConfigService.getActive()
      set({ activeConfig, loading: false })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al cargar configuración activa'
      set({ error: errorMessage, loading: false })
      console.error('Error fetching active config:', error)
    }
  },

  // Create new configuration
  create: async (data: CreateJourneyTimeConfigDto) => {
    set({ loading: true, error: null })
    try {
      const newConfig = await JourneyTimeConfigService.create(data)
      if (newConfig) {
        set((state) => ({
          configs: [...state.configs, newConfig],
          loading: false
        }))

        // If the new config is active, set it as activeConfig
        if (newConfig.status === 'ACTIVE') {
          set({ activeConfig: newConfig })
        }
      }
      return newConfig
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al crear configuración'
      set({ error: errorMessage, loading: false })
      console.error('Error creating config:', error)
      throw error
    }
  },

  // Update existing configuration
  update: async (id: string, data: UpdateJourneyTimeConfigDto) => {
    set({ loading: true, error: null })
    try {
      const updatedConfig = await JourneyTimeConfigService.update(id, data)
      if (updatedConfig) {
        set((state) => ({
          configs: state.configs.map((c) => (c.id === id ? updatedConfig : c)),
          loading: false
        }))

        // Update activeConfig if it's the same one
        const currentActive = get().activeConfig
        if (currentActive && currentActive.id === id) {
          set({ activeConfig: updatedConfig })
        }
      }
      return updatedConfig
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al actualizar configuración'
      set({ error: errorMessage, loading: false })
      console.error('Error updating config:', error)
      throw error
    }
  },

  // Delete configuration
  delete: async (id: string) => {
    set({ loading: true, error: null })
    try {
      const success = await JourneyTimeConfigService.delete(id)
      if (success) {
        set((state) => ({
          configs: state.configs.filter((c) => c.id !== id),
          loading: false
        }))

        // Clear activeConfig if it's the deleted one
        const currentActive = get().activeConfig
        if (currentActive && currentActive.id === id) {
          set({ activeConfig: null })
        }
      }
      return success
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al eliminar configuración'
      set({ error: errorMessage, loading: false })
      console.error('Error deleting config:', error)
      return false
    }
  },

  // Set active config manually
  setActiveConfig: (config: JourneyTimeConfig | null) => {
    set({ activeConfig: config })
  },

  // Clear error
  clearError: () => {
    set({ error: null })
  }
}))
