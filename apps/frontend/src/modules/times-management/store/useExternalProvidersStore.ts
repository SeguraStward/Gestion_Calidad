// ============================================================
//   useExternalProvidersStore
//  Store Zustand para gestión de proveedores externos
// ============================================================

import { create } from 'zustand'
import {
  ExternalProvidersService,
  ExternalProvider,
  CreateExternalProviderDto,
  UpdateExternalProviderDto
} from '../services/external-providers.service'

interface ExternalProvidersStore {
  //  Estado
  providers: ExternalProvider[]
  selectedProvider: ExternalProvider | null
  loading: boolean
  error: string | null

  //  Estadísticas
  totalProvidedTime: number

  //  Acciones - Lectura
  fetchProviders: () => Promise<void>
  fetchProviderById: (id: string) => Promise<void>
  fetchProvidersByAnnualAllocation: (annualAllocationId: string) => Promise<void>
  fetchTotalProvidedTime: (annualAllocationId: string) => Promise<void>

  //  Acciones - Escritura
  createProvider: (data: CreateExternalProviderDto) => Promise<ExternalProvider | null>
  updateProvider: (id: string, data: UpdateExternalProviderDto) => Promise<boolean>
  deleteProvider: (id: string) => Promise<boolean>

  //  Acciones - UI
  selectProvider: (provider: ExternalProvider | null) => void
  clearError: () => void
  reset: () => void
}

const initialState = {
  providers: [],
  selectedProvider: null,
  loading: false,
  error: null,
  totalProvidedTime: 0
}

export const useExternalProvidersStore = create<ExternalProvidersStore>((set, get) => ({
  ...initialState,

  // ============================================================
  //   Lectura de Datos
  // ============================================================

  fetchProviders: async () => {
    set({ loading: true, error: null })
    try {
      const providers = await ExternalProvidersService.getAll()
      set({ providers, loading: false })
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error al cargar proveedores'
      set({ error: errorMsg, loading: false })
      console.error(' Error en fetchProviders:', err)
    }
  },

  fetchProviderById: async (id: string) => {
    set({ loading: true, error: null })
    try {
      const provider = await ExternalProvidersService.getById(id)
      if (provider) {
        set({ selectedProvider: provider, loading: false })
      } else {
        set({ error: 'Proveedor no encontrado', loading: false })
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error al cargar proveedor'
      set({ error: errorMsg, loading: false })
      console.error(' Error en fetchProviderById:', err)
    }
  },

  fetchProvidersByAnnualAllocation: async (annualAllocationId: string) => {
    set({ loading: true, error: null })
    try {
      const providers = await ExternalProvidersService.getByAnnualAllocation(annualAllocationId)
      set({ providers, loading: false })
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error al cargar proveedores por año'
      set({ error: errorMsg, loading: false })
      console.error(' Error en fetchProvidersByAnnualAllocation:', err)
    }
  },

  fetchTotalProvidedTime: async (annualAllocationId: string) => {
    try {
      const total = await ExternalProvidersService.getTotalProvidedTime(annualAllocationId)
      set({ totalProvidedTime: total })
    } catch (err) {
      console.error(' Error en fetchTotalProvidedTime:', err)
    }
  },

  // ============================================================
  //   Escritura de Datos
  // ============================================================

  createProvider: async (data: CreateExternalProviderDto) => {
    set({ loading: true, error: null })
    try {
      const newProvider = await ExternalProvidersService.create(data)
      if (newProvider) {
        const { providers } = get()
        set({
          providers: [...providers, newProvider],
          selectedProvider: newProvider,
          loading: false
        })
        return newProvider
      }
      set({ loading: false })
      return null
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error al crear proveedor'
      set({ error: errorMsg, loading: false })
      console.error(' Error en createProvider:', err)
      throw err
    }
  },

  updateProvider: async (id: string, data: UpdateExternalProviderDto) => {
    set({ loading: true, error: null })
    try {
      const updated = await ExternalProvidersService.update(id, data)
      if (updated) {
        const { providers, selectedProvider } = get()
        set({
          providers: providers.map((p) => (p.id === id ? updated : p)),
          selectedProvider: selectedProvider?.id === id ? updated : selectedProvider,
          loading: false
        })
        return true
      }
      set({ loading: false })
      return false
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error al actualizar proveedor'
      set({ error: errorMsg, loading: false })
      console.error(' Error en updateProvider:', err)
      throw err
    }
  },

  deleteProvider: async (id: string) => {
    set({ loading: true, error: null })
    try {
      const success = await ExternalProvidersService.delete(id)
      if (success) {
        const { providers, selectedProvider } = get()
        set({
          providers: providers.filter((p) => p.id !== id),
          selectedProvider: selectedProvider?.id === id ? null : selectedProvider,
          loading: false
        })
        return true
      }
      set({ loading: false })
      return false
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error al eliminar proveedor'
      set({ error: errorMsg, loading: false })
      console.error(' Error en deleteProvider:', err)
      return false
    }
  },

  // ============================================================
  //   Control de UI
  // ============================================================

  selectProvider: (provider: ExternalProvider | null) => {
    set({ selectedProvider: provider })
  },

  clearError: () => {
    set({ error: null })
  },

  reset: () => {
    set(initialState)
  }
}))

