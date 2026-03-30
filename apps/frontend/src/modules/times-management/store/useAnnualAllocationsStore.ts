// ============================================================
//   useAnnualAllocationsStore
//  Store Zustand para gestión de asignaciones anuales
// ============================================================

import { create } from 'zustand'
import {
  AnnualJourneyTimeAllocationsService,
  AnnualJourneyTimeAllocation,
  CreateAnnualAllocationDto,
  UpdateAnnualAllocationDto,
  YearSummary
} from '../services/annual-allocations.service'

interface AnnualAllocationsStore {
  //  Estado
  allocations: AnnualJourneyTimeAllocation[]
  activeAllocation: AnnualJourneyTimeAllocation | null
  selectedAllocation: AnnualJourneyTimeAllocation | null
  yearSummary: YearSummary | null
  loading: boolean
  error: string | null

  //  Acciones - Lectura
  fetchAll: () => Promise<void>
  fetchById: (id: string) => Promise<void>
  fetchByYear: (year: number) => Promise<void>
  fetchActive: () => Promise<void>
  fetchYearSummary: (year: number) => Promise<void>

  //  Acciones - Escritura
  create: (data: CreateAnnualAllocationDto) => Promise<AnnualJourneyTimeAllocation | null>
  update: (id: string, data: UpdateAnnualAllocationDto) => Promise<boolean>
  delete: (id: string) => Promise<boolean>

  //  Acciones - UI
  selectAllocation: (allocation: AnnualJourneyTimeAllocation | null) => void
  clearError: () => void
  reset: () => void
}

const initialState = {
  allocations: [],
  activeAllocation: null,
  selectedAllocation: null,
  yearSummary: null,
  loading: false,
  error: null
}

export const useAnnualAllocationsStore = create<AnnualAllocationsStore>((set, get) => ({
  ...initialState,

  // ============================================================
  //   Lectura de Datos
  // ============================================================

  fetchAll: async () => {
    set({ loading: true, error: null })
    try {
      const allocations = await AnnualJourneyTimeAllocationsService.getAll()
      set({ allocations, loading: false })
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error al cargar asignaciones anuales'
      set({ error: errorMsg, loading: false })
      console.error(' Error en fetchAll:', err)
    }
  },

  fetchById: async (id: string) => {
    set({ loading: true, error: null })
    try {
      const allocation = await AnnualJourneyTimeAllocationsService.getById(id)
      if (allocation) {
        set({ selectedAllocation: allocation, loading: false })
      } else {
        set({ error: 'Asignación anual no encontrada', loading: false })
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error al cargar asignación anual'
      set({ error: errorMsg, loading: false })
      console.error(' Error en fetchById:', err)
    }
  },

  fetchByYear: async (year: number) => {
    set({ loading: true, error: null })
    try {
      const allocation = await AnnualJourneyTimeAllocationsService.getByYear(year)
      if (allocation) {
        set({ selectedAllocation: allocation, loading: false })
      } else {
        set({ error: `No se encontró asignación para el año ${year}`, loading: false })
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error al cargar asignación por año'
      set({ error: errorMsg, loading: false })
      console.error(' Error en fetchByYear:', err)
    }
  },

  fetchActive: async () => {
    set({ loading: true, error: null })
    try {
      const activeAllocation = await AnnualJourneyTimeAllocationsService.getActive()
      set({ activeAllocation, loading: false })
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error al cargar asignación activa'
      set({ error: errorMsg, loading: false })
      console.error(' Error en fetchActive:', err)
    }
  },

  fetchYearSummary: async (year: number) => {
    set({ loading: true, error: null })
    try {
      const yearSummary = await AnnualJourneyTimeAllocationsService.getYearSummary(year)
      set({ yearSummary, loading: false })
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error al cargar resumen del año'
      set({ error: errorMsg, loading: false })
      console.error(' Error en fetchYearSummary:', err)
    }
  },

  // ============================================================
  //   Escritura de Datos
  // ============================================================

  create: async (data: CreateAnnualAllocationDto) => {
    set({ loading: true, error: null })
    try {
      const newAllocation = await AnnualJourneyTimeAllocationsService.create(data)
      if (newAllocation) {
        const { allocations } = get()
        set({
          allocations: [...allocations, newAllocation],
          selectedAllocation: newAllocation,
          loading: false
        })
        return newAllocation
      }
      set({ loading: false })
      return null
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error al crear asignación anual'
      set({ error: errorMsg, loading: false })
      console.error(' Error en create:', err)
      throw err
    }
  },

  update: async (id: string, data: UpdateAnnualAllocationDto) => {
    set({ loading: true, error: null })
    try {
      const updated = await AnnualJourneyTimeAllocationsService.update(id, data)
      if (updated) {
        const { allocations, selectedAllocation, activeAllocation } = get()
        set({
          allocations: allocations.map((a) => (a.id === id ? updated : a)),
          selectedAllocation: selectedAllocation?.id === id ? updated : selectedAllocation,
          activeAllocation: activeAllocation?.id === id ? updated : activeAllocation,
          loading: false
        })
        return true
      }
      set({ loading: false })
      return false
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error al actualizar asignación anual'
      set({ error: errorMsg, loading: false })
      console.error(' Error en update:', err)
      throw err
    }
  },

  delete: async (id: string) => {
    set({ loading: true, error: null })
    try {
      const success = await AnnualJourneyTimeAllocationsService.delete(id)
      if (success) {
        const { allocations, selectedAllocation, activeAllocation } = get()
        set({
          allocations: allocations.filter((a) => a.id !== id),
          selectedAllocation: selectedAllocation?.id === id ? null : selectedAllocation,
          activeAllocation: activeAllocation?.id === id ? null : activeAllocation,
          loading: false
        })
        return true
      }
      set({ loading: false })
      return false
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error al eliminar asignación anual'
      set({ error: errorMsg, loading: false })
      console.error(' Error en delete:', err)
      return false
    }
  },

  // ============================================================
  //   Control de UI
  // ============================================================

  selectAllocation: (allocation: AnnualJourneyTimeAllocation | null) => {
    set({ selectedAllocation: allocation })
  },

  clearError: () => {
    set({ error: null })
  },

  reset: () => {
    set(initialState)
  }
}))

