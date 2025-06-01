import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

interface DevState {
  mockProfessorId: string | null
  setMockProfessorId: (id: string | null) => void
}

// You can change this default mock ID to one that exists in your dev database
const DEFAULT_MOCK_PROFESSOR_ID = '6817035e6fde93aab0b56e60' // Example ID

export const useDevStore = create<DevState>()(
  persist(
    (set) => ({
      mockProfessorId: DEFAULT_MOCK_PROFESSOR_ID,
      setMockProfessorId: (id) => set({ mockProfessorId: id })
    }),
    {
      name: 'dev-settings-storage', // Unique name for localStorage
      storage: createJSONStorage(() => localStorage) // Uses localStorage
    }
  )
)

export default useDevStore
