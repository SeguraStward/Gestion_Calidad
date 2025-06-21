import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

import { Role } from '@/modules/auth/types'

export type UserActiveRole = Role

export type UserData = {
  id: string
  name: string
  email: string
  photoUrl: string | null
  fullName?: string
  fullLastName?: string
  status?: string
}

interface SessionState {
  user: UserData | null
  role: UserActiveRole | null
  setUser: (user: UserData) => void
  setRole: (role: UserActiveRole) => void
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
        const timestamp = new Date().toISOString()
        // Log de entrada
        if (typeof window !== 'undefined' && window.console) {
          window.console.log(`[${timestamp}][sessionStore.setUser] 🚀 Iniciando guardado de usuario:`, user)
        }

        // Validar datos obligatorios antes de guardar
        const validationErrors: string[] = []
        if (!user.id) validationErrors.push('id')
        if (!user.name) validationErrors.push('name')
        if (!user.email) validationErrors.push('email')

        if (validationErrors.length > 0) {
          const error = `No se puede guardar usuario. Faltan campos obligatorios: ${validationErrors.join(', ')}`
          if (typeof window !== 'undefined' && window.console) {
            window.console.error(`[${timestamp}][sessionStore.setUser] ❌ Error de validación:`, error, {
              user,
              validationErrors,
              hasId: !!user.id,
              hasName: !!user.name,
              hasEmail: !!user.email
            })
          }
          throw new Error(error)
        }

        // Guardar también en sessionStorageManager para consistencia cross-tab
        try {
          if (typeof window !== 'undefined' && window.console) {
            window.console.log(`[${timestamp}][sessionStore.setUser] 💾 Guardando en SessionStorageManager...`)
          }

          const { SessionStorageManager } = require('@/utils/session-storage.manager')
          SessionStorageManager.saveUserData(user)

          if (typeof window !== 'undefined' && window.console) {
            window.console.log(`[${timestamp}][sessionStore.setUser] ✅ Usuario guardado en SessionStorageManager`)
          }
        } catch (sessionStorageError) {
          // Si hay error en el manager, loguear y relanzar el error (no continuar)
          if (typeof window !== 'undefined' && window.console) {
            window.console.error(
              `[${timestamp}][sessionStore.setUser] ❌ Error crítico en SessionStorageManager:`,
              sessionStorageError
            )
          }
          throw sessionStorageError // Relanzar error para que el callback lo maneje
        }

        // Guardar en Zustand solo si SessionStorageManager fue exitoso
        try {
          set({ user })
          if (typeof window !== 'undefined' && window.console) {
            window.console.log(`[${timestamp}][sessionStore.setUser] ✅ Usuario guardado en Zustand store`)
          }
        } catch (zustandError) {
          if (typeof window !== 'undefined' && window.console) {
            window.console.error(`[${timestamp}][sessionStore.setUser] ❌ Error guardando en Zustand:`, zustandError)
          }
          throw zustandError
        }

        // Verificación final cruzada
        try {
          const { SessionStorageManager } = require('@/utils/session-storage.manager')
          const storedData = SessionStorageManager.getUserData()
          const zustandData = get().user

          if (!storedData || !zustandData || storedData.id !== zustandData.id) {
            const error = 'Inconsistencia detectada entre SessionStorage y Zustand'
            if (typeof window !== 'undefined' && window.console) {
              window.console.error(`[${timestamp}][sessionStore.setUser] ❌ ${error}:`, {
                storedData,
                zustandData,
                idsMatch: storedData?.id === zustandData?.id
              })
            }
            throw new Error(error)
          }

          if (typeof window !== 'undefined' && window.console) {
            window.console.log(`[${timestamp}][sessionStore.setUser] 🎉 Verificación cruzada exitosa`)
          }
        } catch (verificationError) {
          if (typeof window !== 'undefined' && window.console) {
            window.console.error(`[${timestamp}][sessionStore.setUser] ❌ Error en verificación cruzada:`, verificationError)
          }
          throw verificationError
        }
      },
      setRole: (role) => set({ role }),
      clearSession: () => set({ user: null, role: null }),
      isAuthenticated: () => !!get().user,
      hasActiveRole: () => !!get().role
    }),
    {
      name: 'session-storage',
      storage: createJSONStorage(() => sessionStorage), // Cambiado a sessionStorage para consistencia
      partialize: (state) => ({
        user: state.user,
        role: state.role
      })
    }
  )
)
