import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { ApiError, PaginatedResponse } from '../types/base.types'

export interface BaseEntityState<T> {
  // Data
  items: T[]
  selectedItem: T | null
  total: number
  page: number
  limit: number
  totalPages: number

  // Loading states
  loading: boolean
  loadingItem: boolean
  creating: boolean
  updating: boolean
  deleting: boolean

  // Error handling
  error: ApiError | null
  itemError: ApiError | null

  // Filters and search
  filters: Record<string, any>
  searchTerm: string
}

export interface BaseEntityActions<T, C, U = Partial<C>> {
  // Data operations
  setItems: (response: PaginatedResponse<T>) => void
  setSelectedItem: (item: T | null) => void
  addItem: (item: T) => void
  updateItem: (item: T) => void
  removeItem: (id: string) => void

  // Loading states
  setLoading: (loading: boolean) => void
  setLoadingItem: (loading: boolean) => void
  setCreating: (creating: boolean) => void
  setUpdating: (updating: boolean) => void
  setDeleting: (deleting: boolean) => void

  // Error handling
  setError: (error: ApiError | null) => void
  setItemError: (error: ApiError | null) => void
  clearErrors: () => void

  // Filters and search
  setFilters: (filters: Record<string, any>) => void
  updateFilter: (key: string, value: any) => void
  clearFilters: () => void
  setSearchTerm: (term: string) => void

  // Pagination
  setPage: (page: number) => void
  setLimit: (limit: number) => void

  // Reset
  reset: () => void
}

export type BaseEntityStore<T, C, U = Partial<C>> = BaseEntityState<T> & BaseEntityActions<T, C, U>

export const createBaseEntityStore = <T, C, U = Partial<C>>(name: string, initialFilters: Record<string, any> = {}) => {
  const initialState: BaseEntityState<T> = {
    items: [],
    selectedItem: null,
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
    loading: false,
    loadingItem: false,
    creating: false,
    updating: false,
    deleting: false,
    error: null,
    itemError: null,
    filters: initialFilters,
    searchTerm: ''
  }

  return create<BaseEntityStore<T, C, U>>()(
    devtools(
      (set, get) => ({
        ...initialState,

        // Data operations
        setItems: (response: PaginatedResponse<T>) =>
          set({
            items: response.data,
            total: response.meta.total,
            page: response.meta.page,
            limit: response.meta.limit,
            totalPages: response.meta.totalPages
          }),

        setSelectedItem: (item: T | null) => set({ selectedItem: item }),

        addItem: (item: T) =>
          set((state) => ({
            items: [item, ...state.items],
            total: state.total + 1
          })),

        updateItem: (item: T) =>
          set((state) => ({
            items: state.items.map((i) => ((i as any).id === (item as any).id ? item : i)),
            selectedItem: state.selectedItem && (state.selectedItem as any).id === (item as any).id ? item : state.selectedItem
          })),

        removeItem: (id: string) =>
          set((state) => ({
            items: state.items.filter((i) => (i as any).id !== id),
            total: state.total - 1,
            selectedItem: state.selectedItem && (state.selectedItem as any).id === id ? null : state.selectedItem
          })),

        // Loading states
        setLoading: (loading: boolean) => set({ loading }),
        setLoadingItem: (loadingItem: boolean) => set({ loadingItem }),
        setCreating: (creating: boolean) => set({ creating }),
        setUpdating: (updating: boolean) => set({ updating }),
        setDeleting: (deleting: boolean) => set({ deleting }),

        // Error handling
        setError: (error: ApiError | null) => set({ error }),
        setItemError: (itemError: ApiError | null) => set({ itemError }),
        clearErrors: () => set({ error: null, itemError: null }),

        // Filters and search
        setFilters: (filters: Record<string, any>) => set({ filters }),
        updateFilter: (key: string, value: any) =>
          set((state) => ({
            filters: { ...state.filters, [key]: value }
          })),
        clearFilters: () => set({ filters: initialFilters }),
        setSearchTerm: (searchTerm: string) => set({ searchTerm }),

        // Pagination
        setPage: (page: number) => set({ page }),
        setLimit: (limit: number) => set({ limit }),

        // Reset
        reset: () => set(initialState)
      }),
      {
        name: `${name}-store`
      }
    )
  )
}
