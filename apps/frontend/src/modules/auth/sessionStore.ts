import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

import { Role, UserProfile } from './types'

export type UserActiveRole = Role

interface SessionState {
  user: UserProfile | null
  role: UserActiveRole | null
  setUser: (user: UserProfile) => void
  setRole: (role: UserActiveRole | null) => void
  clearSession: () => void
  isAuthenticated: () => boolean
  hasActiveRole: () => boolean
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set, get) => ({
      user: null,
      role: null,
      setUser: (user) => {
        // Validate required fields
        if (!user.id || !user.email || !user.fullName) {
          console.error('Cannot save user: missing required fields', user)
          throw new Error('Cannot save user: missing required fields (id, email, name)')
        }

        set({ user })
        console.log('User saved to session store:', user)
      },
      setRole: (role) => {
        if (role === null) {
          set({ role: null })
          console.log('Role cleared from session store')
          return
        }

        // Validate required fields
        if (!role.id || !role.name) {
          console.error('Cannot save role: missing required fields', role)
          throw new Error('Cannot save role: missing required fields (id, name)')
        }

        set({ role })
        console.log('Role saved to session store:', role)
      },
      clearSession: () => {
        set({ user: null, role: null })
        console.log('Session cleared')
      },
      isAuthenticated: () => {
        const state = get()
        return !!state.user
      },
      hasActiveRole: () => {
        const state = get()
        return !!(state.user && state.role)
      }
    }),
    {
      name: 'auth-session',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        user: state.user,
        role: state.role
      })
    }
  )
)
