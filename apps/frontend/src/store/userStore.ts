import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type User = {
  id: string
  name: string
  email: string
  role?: string
}

type State = {
  user: User | null
  loading: boolean
  setUser: (user: User) => void
  clearUser: () => void
  fetchUser: () => Promise<void>
}

export const useUserStore = create<State>()(
  persist(
    (set) => ({
      user: null,
      loading: true,
      setUser: (user) => set({ user }),
      clearUser: () => set({ user: null }),
      fetchUser: async () => {
        try {
          const res = await fetch('/api/auth/profile', { credentials: 'include' })
          if (res.ok) {
            const userData = await res.json()
            set({ user: userData })
          } else {
            set({ user: null })
          }
        } catch (err) {
          set({ user: null })
        } finally {
          set({ loading: false })
        }
      }
    }),
    {
      name: 'public-user-profile-storage' //no puede tener el mismo nombre que el otro store, crearia conflicto
    }
  )
)
