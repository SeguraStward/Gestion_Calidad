import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

import { AuthService } from '@/modules/auth/services/auth.service'
import { CookieManager } from '../utils/cookie.manager'
import { useSessionStore } from '@/modules/auth/sessionStore'
import { Role } from '../types'

export interface UseRoleSelectionReturn {
  // State
  roles: Role[]
  selectedRole: Role | null
  loading: boolean
  submitting: boolean
  error: string | null
  canSkip: boolean
  hasActiveRole: boolean
  showTransition: boolean

  // Actions
  setSelectedRole: (role: Role | null) => void
  handleSubmit: () => Promise<void>
  handleSkip: () => void
  fetchRoles: () => Promise<void>
  resetError: () => void
}

export function useRoleSelection(): UseRoleSelectionReturn {
  const [roles, setRoles] = useState<Role[]>([])
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [canSkip, setCanSkip] = useState(false)
  const [hasActiveRole, setHasActiveRole] = useState(false)
  const [showTransition, setShowTransition] = useState(false)

  const router = useRouter()
  const { setRole } = useSessionStore()
  const resetError = useCallback(() => {
    setError(null)
  }, [])

  const getErrorMessage = useCallback((error: unknown): string => {
    if (error instanceof Error) {
      return error.message
    }
    if (typeof error === 'string') {
      return error
    }
    return 'Ha ocurrido un error inesperado.'
  }, [])

  const fetchRoles = useCallback(async () => {
    if (loading) return

    setLoading(true)
    setError(null)

    try {
      const userRoles = await AuthService.getUserRoles()

      if (!Array.isArray(userRoles)) {
        throw new Error('Formato de respuesta inválido del servidor.')
      }

      if (userRoles.length === 0) {
        throw new Error('No tienes roles asignados. Contacta al administrador.')
      }

      const mappedRoles = userRoles.map((role: any) => ({
        id: role.id,
        name: role.name,
        description: role.description ?? '',
        permissions: role.permissions ?? []
      }))

      setRoles(mappedRoles)
      // Auto-select if only one role
      if (mappedRoles.length === 1 && mappedRoles[0]) {
        setSelectedRole(mappedRoles[0])
      }
    } catch (err) {
      const errorMessage = getErrorMessage(err)
      setError(errorMessage)

      // Handle auth errors
      if (
        errorMessage.includes('401') ||
        errorMessage.includes('403') ||
        errorMessage.includes('sesión') ||
        errorMessage.includes('token')
      ) {
        toast.error('Sesión expirada. Redirigiendo al login...')
        router.push('/auth/login')
        return
      }

      toast.error(`Error: ${errorMessage}`)
    } finally {
      setLoading(false)
    }
  }, [loading, getErrorMessage, router])
  const handleSubmit = useCallback(async () => {
    if (!selectedRole) {
      toast.error('Por favor selecciona un rol.')
      return
    }

    if (submitting) return

    setSubmitting(true)
    setError(null)

    try {
      setShowTransition(true)

      const success = await AuthService.setActiveRole(selectedRole.id)

      if (!success) {
        throw new Error('Error al configurar el rol en el servidor')
      }

      // Update session store
      setRole(selectedRole)

      // Save to sessionStorage for UI
      CookieManager.setActiveRole(selectedRole)

      toast.success(`Rol activo: ${selectedRole.name}`)

      // Small delay for UX before redirect
      await new Promise((resolve) => setTimeout(resolve, 1000))
    } catch (error) {
      console.error('Error setting active role:', error)
      setShowTransition(false)
      const errorMessage = getErrorMessage(error)
      setError(errorMessage)
      toast.error(`Error: ${errorMessage}`)
    } finally {
      setSubmitting(false)
    }
  }, [selectedRole, submitting, setRole, getErrorMessage])

  const handleSkip = useCallback(() => {
    if (canSkip) {
      router.push('/')
    }
  }, [canSkip, router])

  // Initialize role selection
  useEffect(() => {
    const initializeRoleSelection = async () => {
      try {
        const activeRoleId = await AuthService.getActiveRole()
        const hasServerRole = activeRoleId !== null

        setHasActiveRole(hasServerRole)
        setCanSkip(hasServerRole)
      } catch (error) {
        console.warn('Error checking active role:', error)
        setHasActiveRole(false)
        setCanSkip(false)
      }

      // Load roles if not loaded
      if (roles.length === 0) {
        fetchRoles()
      }
    }

    initializeRoleSelection()
  }, [fetchRoles, roles.length])

  return {
    roles,
    selectedRole,
    loading,
    submitting,
    error,
    canSkip,
    hasActiveRole,
    showTransition,
    setSelectedRole,
    handleSubmit,
    handleSkip,
    fetchRoles,
    resetError
  }
}
