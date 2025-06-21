import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

import { useSessionStore } from '@/store/sessionStore'
import { AuthService } from '@/modules/auth/auth.service'
import { CookieManager } from '@/utils'

export interface UseLoginCallbackReturn {
  isLoading: boolean
  error: string | null
  isProcessing: boolean
  missingFields: string[]
  retry: () => void
  debugInfo: {
    step: string
    lastError: string | null
    attempt: number
    userDataReceived: boolean
    userDataSaved: boolean
    sessionStorageValid: boolean
  }
}

/**
 * Hook para manejar el callback de login desde Google OAuth
 * Se ejecuta después de que el usuario regresa de Google con tokens válidos
 *
 * VERSIÓN MEJORADA CON VALIDACIONES ROBUSTAS Y DEBUGGING
 */
export function useLoginCallback(): UseLoginCallbackReturn {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [missingFields, setMissingFields] = useState<string[]>([])
  const [attempt, setAttempt] = useState(0)

  // Estado de debugging detallado
  const [debugInfo, setDebugInfo] = useState({
    step: 'initializing',
    lastError: null as string | null,
    attempt: 0,
    userDataReceived: false,
    userDataSaved: false,
    sessionStorageValid: false
  })

  const router = useRouter()
  const { setUser } = useSessionStore()

  // Configuración de timeouts desde variables de entorno (aumentados)
  const MAX_RETRIES = 3 // Aumentado para ser más tolerante
  const RETRY_DELAY_BASE = 2000 // 2 segundos base

  // Función para logging detallado
  const logDebug = useCallback((step: string, message: string, data?: any) => {
    const timestamp = new Date().toISOString()
    const logEntry = `[${timestamp}][useLoginCallback][${step}] ${message}`

    if (typeof window !== 'undefined' && window.console) {
      if (data) {
        window.console.log(logEntry, data)
      } else {
        window.console.log(logEntry)
      }
    }

    setDebugInfo((prev) => ({
      ...prev,
      step,
      lastError: message.includes('Error') || message.includes('❌') ? message : prev.lastError
    }))
  }, [])

  // Función para validar estructura de datos de usuario
  const validateUserData = useCallback(
    (userData: any): { isValid: boolean; missing: string[]; processed: any } => {
      const timestamp = new Date().toISOString()
      logDebug('validation', 'Iniciando validación de datos de usuario', userData)

      // Log extensivo para debugging crítico
      if (typeof window !== 'undefined' && window.console) {
        window.console.log(`[${timestamp}][useLoginCallback.validateUserData] 🔍 ANÁLISIS DETALLADO:`)
        window.console.log(`  - userData recibido:`, userData)
        window.console.log(`  - Tipo de userData:`, typeof userData)
        window.console.log(`  - Es null:`, userData === null)
        window.console.log(`  - Es undefined:`, userData === undefined)
        window.console.log(`  - Es array:`, Array.isArray(userData))

        if (userData && typeof userData === 'object') {
          window.console.log(`  - Claves disponibles:`, Object.keys(userData))
          window.console.log(`  - Valores de campos críticos:`)
          window.console.log(`    - id: "${userData.id}" (tipo: ${typeof userData.id})`)
          window.console.log(`    - email: "${userData.email}" (tipo: ${typeof userData.email})`)
          window.console.log(`    - name: "${userData.name}" (tipo: ${typeof userData.name})`)
          window.console.log(`    - fullName: "${userData.fullName}" (tipo: ${typeof userData.fullName})`)
          window.console.log(`    - fullLastName: "${userData.fullLastName}" (tipo: ${typeof userData.fullLastName})`)
          window.console.log(`    - photoUrl: "${userData.photoUrl}" (tipo: ${typeof userData.photoUrl})`)
          window.console.log(`    - status: "${userData.status}" (tipo: ${typeof userData.status})`)
        }
      }

      const missing: string[] = []
      let processed = null

      if (!userData) {
        missing.push('userData completo')
        logDebug('validation', '❌ userData es null/undefined')
        return { isValid: false, missing, processed }
      }

      // Validaciones obligatorias con logging detallado
      if (!userData.id || (typeof userData.id === 'string' && userData.id.trim() === '')) {
        missing.push('id')
        if (typeof window !== 'undefined' && window.console) {
          window.console.log(`[${timestamp}][useLoginCallback.validateUserData] ❌ Campo ID faltante o vacío: "${userData.id}"`)
        }
      }

      if (!userData.email || (typeof userData.email === 'string' && userData.email.trim() === '')) {
        missing.push('email')
        if (typeof window !== 'undefined' && window.console) {
          window.console.log(
            `[${timestamp}][useLoginCallback.validateUserData] ❌ Campo email faltante o vacío: "${userData.email}"`
          )
        }
      }

      // Procesar nombre (lógica consistente con backend)
      const name = userData.name || userData.fullName || userData.email?.split('@')[0] || ''
      if (!name || (typeof name === 'string' && name.trim() === '')) {
        missing.push('name')
        if (typeof window !== 'undefined' && window.console) {
          window.console.log(`[${timestamp}][useLoginCallback.validateUserData] ❌ Campo name faltante o vacío:`)
          window.console.log(`    - userData.name: "${userData.name}" (tipo: ${typeof userData.name})`)
          window.console.log(`    - userData.fullName: "${userData.fullName}" (tipo: ${typeof userData.fullName})`)
          window.console.log(`    - email split: "${userData.email?.split('@')[0]}"`)
          window.console.log(`    - name final: "${name}"`)
        }
      }

      // Si tenemos los datos mínimos, crear objeto procesado
      if (missing.length === 0) {
        processed = {
          id: userData.id,
          name: name,
          email: userData.email,
          photoUrl: userData.photoUrl || null,
          fullName: userData.fullName || undefined,
          fullLastName: userData.fullLastName || undefined,
          status: userData.status || undefined
        }

        if (typeof window !== 'undefined' && window.console) {
          window.console.log(`[${timestamp}][useLoginCallback.validateUserData] ✅ Datos procesados correctamente:`, processed)
        }
      } else {
        if (typeof window !== 'undefined' && window.console) {
          window.console.log(`[${timestamp}][useLoginCallback.validateUserData] ❌ Faltan campos obligatorios:`, missing)
        }
      }

      logDebug('validation', `Validación completada. Válido: ${missing.length === 0}`, {
        missing,
        processed
      })

      return {
        isValid: missing.length === 0,
        missing,
        processed
      }
    },
    [logDebug]
  )

  // Función para validar SessionStorage
  const validateSessionStorage = useCallback((): boolean => {
    try {
      const { SessionStorageManager } = require('@/utils/session-storage.manager')
      const stored = SessionStorageManager.getUserData()

      if (!stored) {
        logDebug('storage-validation', '❌ No hay datos en SessionStorage')
        return false
      }

      const validation = validateUserData(stored)
      if (!validation.isValid) {
        logDebug('storage-validation', '❌ Datos en SessionStorage son inválidos', {
          stored,
          missing: validation.missing
        })
        return false
      }

      logDebug('storage-validation', '✅ SessionStorage válido', stored)
      return true
    } catch (e) {
      logDebug('storage-validation', '❌ Error validando SessionStorage', e)
      return false
    }
  }, [logDebug, validateUserData])

  const handleCallback = useCallback(async () => {
    let isMounted = true
    const currentAttempt = attempt + 1

    setIsProcessing(true)
    setError(null)
    setMissingFields([])

    logDebug('start', `🚀 Iniciando callback de login (intento ${currentAttempt}/${MAX_RETRIES})`)

    setDebugInfo((prev) => ({
      ...prev,
      attempt: currentAttempt,
      step: 'starting',
      userDataReceived: false,
      userDataSaved: false,
      sessionStorageValid: false
    }))

    try {
      // PASO 1: Esperar y verificar cookies de autenticación
      logDebug('cookies-check', '⏳ Esperando cookies de autenticación...')
      await new Promise((resolve) => setTimeout(resolve, 4000))

      const hasAuthToken = CookieManager.checkAuthenticationStatus()
      logDebug('cookies-check', `Estado inicial de cookies: ${hasAuthToken}`)

      if (!hasAuthToken) {
        logDebug('cookies-retry', '⏳ Reintentando verificación de cookies...')
        await new Promise((resolve) => setTimeout(resolve, 3000))
        const hasAuthTokenRetry = CookieManager.checkAuthenticationStatus()
        logDebug('cookies-retry', `Estado tras reintento: ${hasAuthTokenRetry}`)

        if (!hasAuthTokenRetry) {
          throw new Error('NO_AUTH_TOKENS: No se encontraron tokens de autenticación en cookies')
        }
      }

      // PASO 2: Obtener perfil de usuario con reintentos robustos
      logDebug('profile-fetch', '📡 Iniciando obtención de perfil de usuario...')

      // DEBUG: Test temporal - eliminar después
      if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
        try {
          const { testBackendResponse } = await import('@/utils/debug-auth')
          await testBackendResponse()
        } catch (debugError) {
          console.warn('🧪 [DEBUG] Error en test de debug:', debugError)
        }
      }

      let userProfile = null
      let retryCount = 0

      while (!userProfile && retryCount < MAX_RETRIES && isMounted) {
        try {
          logDebug('profile-attempt', `📡 Intento ${retryCount + 1}/${MAX_RETRIES} para obtener perfil`)

          // Incrementar timeout con cada intento
          const timeoutMs = RETRY_DELAY_BASE * (retryCount + 1)

          userProfile = (await Promise.race([
            AuthService.getUserProfile(),
            new Promise((_, reject) => setTimeout(() => reject(new Error('TIMEOUT: Tiempo de espera agotado')), timeoutMs))
          ])) as any

          // Log adicional para debugging
          if (typeof window !== 'undefined' && window.console) {
            window.console.log(`[useLoginCallback] 🔍 UserProfile recibido en callback:`, userProfile)
            window.console.log(`[useLoginCallback] 🔍 Tipo de userProfile:`, typeof userProfile)
            window.console.log(`[useLoginCallback] 🔍 ¿Es objeto?:`, userProfile && typeof userProfile === 'object')
            if (userProfile && typeof userProfile === 'object') {
              window.console.log(`[useLoginCallback] 🔍 Claves de userProfile:`, Object.keys(userProfile))
            }
          }

          if (userProfile) {
            logDebug('profile-success', '✅ Perfil de usuario recibido exitosamente', userProfile)
            setDebugInfo((prev) => ({ ...prev, userDataReceived: true }))
            break
          }
        } catch (profileError) {
          retryCount++
          const errorMsg = profileError instanceof Error ? profileError.message : String(profileError)
          logDebug('profile-error', `❌ Error intento ${retryCount}: ${errorMsg}`)

          if (retryCount >= MAX_RETRIES) {
            throw new Error(`MAX_RETRIES_EXCEEDED: Falló obtener perfil tras ${MAX_RETRIES} intentos. Último error: ${errorMsg}`)
          }

          // Espera exponencial con jitter
          const delay = RETRY_DELAY_BASE * Math.pow(2, retryCount - 1) + Math.random() * 1000
          logDebug('profile-retry-wait', `⏳ Esperando ${delay}ms antes del siguiente intento...`)
          await new Promise((resolve) => setTimeout(resolve, delay))
        }
      }

      if (!userProfile) {
        throw new Error('NO_USER_PROFILE: No se pudo obtener el perfil de usuario después de todos los reintentos')
      }

      // PASO 3: Validar datos de usuario
      logDebug('validation', '🔍 Validando estructura de datos de usuario...')
      const validation = validateUserData(userProfile)

      if (!validation.isValid) {
        setMissingFields(validation.missing)
        throw new Error(`INVALID_USER_DATA: Datos de usuario incompletos. Faltan: ${validation.missing.join(', ')}`)
      }

      const userData = validation.processed!
      logDebug('validation', '✅ Datos de usuario válidos', userData)

      // PASO 4: Guardar en Zustand con validación
      logDebug('zustand-save', '💾 Guardando usuario en Zustand store...')
      try {
        setUser(userData)
        logDebug('zustand-save', '✅ Usuario guardado exitosamente en Zustand')
        setDebugInfo((prev) => ({ ...prev, userDataSaved: true }))
      } catch (zustandError) {
        const errorMsg = zustandError instanceof Error ? zustandError.message : String(zustandError)
        throw new Error(`ZUSTAND_SAVE_ERROR: Error guardando en Zustand: ${errorMsg}`)
      }

      // PASO 5: Validar SessionStorage
      logDebug('storage-validation', '🔍 Validando datos en SessionStorage...')
      await new Promise((resolve) => setTimeout(resolve, 1000)) // Esperar para que se complete la escritura

      const isStorageValid = validateSessionStorage()
      if (!isStorageValid) {
        throw new Error('STORAGE_VALIDATION_FAILED: Los datos no se guardaron correctamente en SessionStorage')
      }

      setDebugInfo((prev) => ({ ...prev, sessionStorageValid: true }))

      // PASO 6: Finalización exitosa
      logDebug('success', '🎉 ¡Proceso de autenticación completado exitosamente!')
      setIsProcessing(false)
      setIsLoading(false)

      toast.success('¡Bienvenido! Autenticación exitosa')

      // PASO 7: Redirección
      setTimeout(() => {
        logDebug('redirect', '🔄 Redirigiendo a selección de rol...')
        router.push('/auth/select-role')
      }, 2000) // Dar tiempo para que el usuario vea el éxito
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      logDebug('error', `❌ Error en callback: ${errorMessage}`)

      setError(errorMessage)
      setIsProcessing(false)

      // No cambiar isLoading a false en caso de error - mantener la interfaz bloqueada
      // para evitar que el usuario salga prematuramente
      if (currentAttempt >= MAX_RETRIES) {
        logDebug('final-error', '💥 Máximo de reintentos alcanzado, desbloqueando interfaz')
        setIsLoading(false)
      } else {
        logDebug('retry-available', `🔄 Reintento disponible (${currentAttempt}/${MAX_RETRIES})`)
      }
    }
  }, [attempt, router, setUser, logDebug, validateUserData, validateSessionStorage])

  useEffect(() => {
    handleCallback()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attempt])

  // Permite reintentar manualmente
  const retry = useCallback(() => {
    setAttempt((a) => a + 1)
  }, [])

  return {
    isLoading,
    error,
    isProcessing,
    missingFields,
    retry,
    debugInfo
  }
}
