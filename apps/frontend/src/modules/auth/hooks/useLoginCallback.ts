import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'

import { AuthService } from '@/modules/auth/services/auth.service'
import { useSessionStore } from '@/modules/auth/sessionStore'

export interface UseLoginCallbackReturn {
  isLoading: boolean
  error: string | null
  retry: () => void
}

/**
 * Login Callback Hook - Reescrito completamente
 * Maneja el flujo de callback OAuth sin bucles infinitos
 */
export function useLoginCallback(): UseLoginCallbackReturn {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const router = useRouter()
  const { setUser } = useSessionStore()

  // Refs para evitar bucles infinitos
  const hasStarted = useRef(false)
  const autoRetryCount = useRef(0)
  const isExecuting = useRef(false)

  const MAX_AUTO_RETRIES = 3
  const RETRY_DELAY = 1500
  const INITIAL_DELAY = 2000

  // Función principal de autenticación
  // Función principal de autenticación
  const authenticate = async (): Promise<void> => {
    if (isExecuting.current) return
    isExecuting.current = true

    try {
      setError(null)

      console.log('[LoginCallback] Obteniendo perfil de usuario...')
      const UserBasicInfo = await AuthService.getUserBasicInfo()

      // Validar datos del usuario
      if (!UserBasicInfo?.id || !UserBasicInfo?.email || !UserBasicInfo?.fullName) {
        console.error('[LoginCallback] Datos inválidos recibidos:', UserBasicInfo)
        throw new Error('Datos de usuario incompletos')
      }

      console.log('[LoginCallback] Usuario autenticado:', UserBasicInfo.email)

      // Guardar en sesión
      setUser(UserBasicInfo)
      setIsLoading(false)

      // Mostrar éxito y redirigir
      toast.success('¡Bienvenido! Autenticación exitosa')

      setTimeout(() => {
        router.push('/auth/select-role')
      }, 1000)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error de autenticación'
      console.error('[LoginCallback] Error de autenticación:', errorMessage)

      // Lógica de reintentos automáticos
      if (autoRetryCount.current < MAX_AUTO_RETRIES) {
        autoRetryCount.current++
        console.log(`[LoginCallback] Reintento automático ${autoRetryCount.current}/${MAX_AUTO_RETRIES}`)

        setTimeout(() => {
          isExecuting.current = false
          authenticate()
        }, RETRY_DELAY)

        return
      }

      // Máximo de reintentos alcanzado
      console.log('[LoginCallback] Máximo de reintentos automáticos alcanzado')
      setError(errorMessage)
      setIsLoading(false)
      toast.error('Error de autenticación. Puedes reintentar manualmente.')
    }

    isExecuting.current = false
  }

  // Ejecutar una sola vez al montar
  useEffect(() => {
    if (!hasStarted.current) {
      hasStarted.current = true

      console.log('[LoginCallback] Iniciando proceso de autenticación...')
      setTimeout(() => {
        authenticate()
      }, INITIAL_DELAY)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Sin dependencias para evitar bucles
  // Función de reintento manual
  const retry = () => {
    console.log('[LoginCallback] Reintento manual iniciado')
    autoRetryCount.current = 0 // Resetear contador automático
    setError(null)
    setIsLoading(true)
    isExecuting.current = false
    authenticate()
  }

  return {
    isLoading,
    error,
    retry
  }
}
