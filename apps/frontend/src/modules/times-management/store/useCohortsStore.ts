import { create } from 'zustand'
import { CohortsService, Cohort, CohortAlert, CreateCohortDto, UpdateCohortDto } from '../services/cohorts.service'

interface CohortsStore {
  cohorts: Cohort[]
  alerts: CohortAlert[]
  loading: boolean
  loadingAlerts: boolean
  error: string | null

  fetchAll: () => Promise<void>
  fetchByCareer: (careerId: string) => Promise<void>
  fetchAlerts: (campusId: string) => Promise<void>
  create: (data: CreateCohortDto) => Promise<Cohort | null>
  update: (id: string, data: UpdateCohortDto) => Promise<boolean>
  delete: (id: string) => Promise<boolean>
  clearError: () => void
}

export const useCohortsStore = create<CohortsStore>((set, get) => ({
  cohorts: [],
  alerts: [],
  loading: false,
  loadingAlerts: false,
  error: null,

  fetchAll: async () => {
    set({ loading: true, error: null })
    try {
      const cohorts = await CohortsService.getAll()
      set({ cohorts, loading: false })
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Error al cargar cohortes', loading: false })
    }
  },

  fetchByCareer: async (careerId: string) => {
    set({ loading: true, error: null })
    try {
      const cohorts = await CohortsService.getByCareer(careerId)
      set({ cohorts, loading: false })
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Error al cargar cohortes', loading: false })
    }
  },

  fetchAlerts: async (campusId: string) => {
    set({ loadingAlerts: true })
    try {
      const alerts = await CohortsService.getAlerts(campusId)
      set({ alerts, loadingAlerts: false })
    } catch {
      set({ alerts: [], loadingAlerts: false })
    }
  },

  create: async (data: CreateCohortDto) => {
    set({ loading: true, error: null })
    try {
      const newCohort = await CohortsService.create(data)
      if (newCohort) {
        set({ cohorts: [...get().cohorts, newCohort], loading: false })
        return newCohort
      }
      set({ loading: false })
      return null
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Error al crear cohorte', loading: false })
      throw err
    }
  },

  update: async (id: string, data: UpdateCohortDto) => {
    set({ loading: true, error: null })
    try {
      const updated = await CohortsService.update(id, data)
      if (updated) {
        set({ cohorts: get().cohorts.map((c) => (c.id === id ? updated : c)), loading: false })
        return true
      }
      set({ loading: false })
      return false
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Error al actualizar cohorte', loading: false })
      throw err
    }
  },

  delete: async (id: string) => {
    set({ loading: true, error: null })
    try {
      const ok = await CohortsService.delete(id)
      if (ok) set({ cohorts: get().cohorts.filter((c) => c.id !== id), loading: false })
      else set({ loading: false })
      return ok
    } catch {
      set({ loading: false })
      return false
    }
  },

  clearError: () => set({ error: null })
}))
