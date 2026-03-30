// ============================================================
//   useRepitenciasStore
//  Store Zustand para gestión de repitencias
// ============================================================

import { create } from 'zustand'
import {
  RepitenciasService,
  Repitencia,
  CreateRepitenciaDto,
  UpdateRepitenciaDto,
  RepitenciaStatistics
} from '../services/repitencias.service'

interface RepitenciasStore {
  //  Estado
  repitencias: Repitencia[]
  selectedRepitencia: Repitencia | null
  statistics: RepitenciaStatistics | null
  loading: boolean
  error: string | null

  //  Acciones - Lectura
  fetchAll: () => Promise<void>
  fetchById: (id: string) => Promise<void>
  fetchByCampus: (campusId: string) => Promise<void>
  fetchByCourse: (courseId: string) => Promise<void>
  fetchByAcademicCycle: (academicCycleId: string) => Promise<void>
  fetchByCampusAllocation: (campusAllocationId: string) => Promise<void>
  fetchStatistics: () => Promise<void>

  //  Acciones - Escritura
  create: (data: CreateRepitenciaDto) => Promise<Repitencia | null>
  update: (id: string, data: UpdateRepitenciaDto) => Promise<boolean>
  delete: (id: string) => Promise<boolean>

  //  Acciones - UI
  selectRepitencia: (repitencia: Repitencia | null) => void
  clearError: () => void
  reset: () => void
}

const initialState = {
  repitencias: [],
  selectedRepitencia: null,
  statistics: null,
  loading: false,
  error: null
}

export const useRepitenciasStore = create<RepitenciasStore>((set, get) => ({
  ...initialState,

  // ============================================================
  //   Lectura de Datos
  // ============================================================

  fetchAll: async () => {
    set({ loading: true, error: null })
    try {
      const repitencias = await RepitenciasService.getAll()
      set({ repitencias, loading: false })
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error al cargar repitencias'
      set({ error: errorMsg, loading: false })
      console.error(' Error en fetchAll:', err)
    }
  },

  fetchById: async (id: string) => {
    set({ loading: true, error: null })
    try {
      const repitencia = await RepitenciasService.getById(id)
      if (repitencia) {
        set({ selectedRepitencia: repitencia, loading: false })
      } else {
        set({ error: 'Repitencia no encontrada', loading: false })
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error al cargar repitencia'
      set({ error: errorMsg, loading: false })
      console.error(' Error en fetchById:', err)
    }
  },

  fetchByCampus: async (campusId: string) => {
    set({ loading: true, error: null })
    try {
      const repitencias = await RepitenciasService.getByCampus(campusId)
      set({ repitencias, loading: false })
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error al cargar repitencias por campus'
      set({ error: errorMsg, loading: false })
      console.error(' Error en fetchByCampus:', err)
    }
  },

  fetchByCourse: async (courseId: string) => {
    set({ loading: true, error: null })
    try {
      const repitencias = await RepitenciasService.getByCourse(courseId)
      set({ repitencias, loading: false })
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error al cargar repitencias por curso'
      set({ error: errorMsg, loading: false })
      console.error(' Error en fetchByCourse:', err)
    }
  },

  fetchByAcademicCycle: async (academicCycleId: string) => {
    set({ loading: true, error: null })
    try {
      const repitencias = await RepitenciasService.getByAcademicCycle(academicCycleId)
      set({ repitencias, loading: false })
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error al cargar repitencias por ciclo'
      set({ error: errorMsg, loading: false })
      console.error(' Error en fetchByAcademicCycle:', err)
    }
  },

  fetchByCampusAllocation: async (campusAllocationId: string) => {
    set({ loading: true, error: null })
    try {
      const repitencias = await RepitenciasService.getByCampusAllocation(campusAllocationId)
      set({ repitencias, loading: false })
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error al cargar repitencias por asignación'
      set({ error: errorMsg, loading: false })
      console.error(' Error en fetchByCampusAllocation:', err)
    }
  },

  fetchStatistics: async () => {
    set({ loading: true, error: null })
    try {
      const statistics = await RepitenciasService.getStatistics()
      set({ statistics, loading: false })
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error al cargar estadísticas'
      set({ error: errorMsg, loading: false })
      console.error(' Error en fetchStatistics:', err)
    }
  },

  // ============================================================
  //   Escritura de Datos
  // ============================================================

  create: async (data: CreateRepitenciaDto) => {
    set({ loading: true, error: null })
    try {
      const newRepitencia = await RepitenciasService.create(data)
      if (newRepitencia) {
        const { repitencias } = get()
        set({
          repitencias: [...repitencias, newRepitencia],
          selectedRepitencia: newRepitencia,
          loading: false
        })
        return newRepitencia
      }
      set({ loading: false })
      return null
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error al crear repitencia'
      set({ error: errorMsg, loading: false })
      console.error(' Error en create:', err)
      throw err
    }
  },

  update: async (id: string, data: UpdateRepitenciaDto) => {
    set({ loading: true, error: null })
    try {
      const updated = await RepitenciasService.update(id, data)
      if (updated) {
        const { repitencias, selectedRepitencia } = get()
        set({
          repitencias: repitencias.map((r) => (r.id === id ? updated : r)),
          selectedRepitencia: selectedRepitencia?.id === id ? updated : selectedRepitencia,
          loading: false
        })
        return true
      }
      set({ loading: false })
      return false
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error al actualizar repitencia'
      set({ error: errorMsg, loading: false })
      console.error(' Error en update:', err)
      throw err
    }
  },

  delete: async (id: string) => {
    set({ loading: true, error: null })
    try {
      const success = await RepitenciasService.delete(id)
      if (success) {
        const { repitencias, selectedRepitencia } = get()
        set({
          repitencias: repitencias.filter((r) => r.id !== id),
          selectedRepitencia: selectedRepitencia?.id === id ? null : selectedRepitencia,
          loading: false
        })
        return true
      }
      set({ loading: false })
      return false
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error al eliminar repitencia'
      set({ error: errorMsg, loading: false })
      console.error(' Error en delete:', err)
      return false
    }
  },

  // ============================================================
  //   Control de UI
  // ============================================================

  selectRepitencia: (repitencia: Repitencia | null) => {
    set({ selectedRepitencia: repitencia })
  },

  clearError: () => {
    set({ error: null })
  },

  reset: () => {
    set(initialState)
  }
}))

