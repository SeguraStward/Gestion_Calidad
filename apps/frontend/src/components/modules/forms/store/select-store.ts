import { create } from 'zustand'

interface SelectState {
  values: Record<string, any>
  setValue: (fieldName: string, value: any) => void
  getFieldValue: (fieldName: string) => any
  resetField: (fieldName: string) => void
  resetAll: () => void // Nuevo método
}

export const useSelectStore = create<SelectState>((set, get) => ({
  values: {},
  setValue: (fieldName, value) =>
    set((state) => ({
      values: {
        ...state.values,
        [fieldName]: value
      }
    })),
  getFieldValue: (fieldName) => get().values[fieldName] || '',
  resetField: (fieldName) =>
    set((state) => {
      const newValues = { ...state.values }
      delete newValues[fieldName]
      return { values: newValues }
    }),
  resetAll: () => set({ values: {} }) // Implementación del nuevo método
}))
