'use client'

import { useEffect, useState } from 'react'
import { Loader2, CheckCircle, XCircle, RefreshCw, AlertTriangle, Eye } from 'lucide-react'

import { Alert, AlertDescription, Button, Card, CardContent, CardHeader, CardTitle, Badge } from '@una-gc/ui/components'

import { useLoginCallback } from '@/modules/auth/hooks/useLoginCallback'

export default function AuthCallbackPage() {
  const [isMounted, setIsMounted] = useState(false)
  const [showDebugInfo, setShowDebugInfo] = useState(false)
  const { isLoading, error, isProcessing, missingFields, retry, debugInfo } = useLoginCallback()

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Función para determinar el estado actual del proceso
  const getCurrentStatus = () => {
    if (isLoading || isProcessing) {
      return {
        icon: <Loader2 className="w-6 h-6 animate-spin text-primary" />,
        title: 'Procesando autenticación...',
        description: 'Validando credenciales y configurando sesión'
      }
    }

    if (error) {
      return {
        icon: <XCircle className="w-6 h-6 text-red-500" />,
        title: 'Error de autenticación',
        description: 'Se ha producido un error durante el proceso'
      }
    }

    return {
      icon: <CheckCircle className="w-6 h-6 text-green-500" />,
      title: 'Autenticación exitosa',
      description: 'Redirigiendo a la aplicación...'
    }
  }

  const currentStatus = getCurrentStatus()

  // Función para determinar el progreso visual
  const getProgressSteps = () => {
    const steps = [
      {
        key: 'cookies',
        label: 'Verificación de cookies',
        completed: debugInfo.step !== 'initializing' && debugInfo.step !== 'starting'
      },
      {
        key: 'profile',
        label: 'Obtención de perfil',
        completed: debugInfo.userDataReceived
      },
      {
        key: 'validation',
        label: 'Validación de datos',
        completed: debugInfo.userDataReceived && missingFields.length === 0
      },
      {
        key: 'storage',
        label: 'Guardado en storage',
        completed: debugInfo.userDataSaved
      },
      {
        key: 'verification',
        label: 'Verificación final',
        completed: debugInfo.sessionStorageValid
      }
    ]

    return steps
  }

  const progressSteps = getProgressSteps()
  const currentStep = progressSteps.findIndex((step) => !step.completed)
  const completedSteps = progressSteps.filter((step) => step.completed).length

  // Prevenir que el usuario cierre la pestaña/ventana durante el proceso crítico
  useEffect(() => {
    if (isLoading || isProcessing) {
      const handleBeforeUnload = (e: BeforeUnloadEvent) => {
        e.preventDefault()
        e.returnValue = 'El proceso de autenticación está en curso. ¿Estás seguro de que quieres salir?'
        return e.returnValue
      }

      window.addEventListener('beforeunload', handleBeforeUnload)
      return () => window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [isLoading, isProcessing])

  // Mostrar loading inicial mientras se monta el componente
  if (!isMounted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background">
        <div className="w-full max-w-md">
          <Card className="shadow-xl border bg-white/90 dark:bg-zinc-900/90 rounded-xl overflow-hidden">
            <CardHeader className="text-center space-y-3 bg-primary/5 py-8 px-6">
              <CardTitle className="text-2xl font-bold flex items-center justify-center gap-3">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
                Cargando...
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 py-8 px-6">
              <div className="text-center space-y-4">
                <div className="flex justify-center">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
                <p className="text-muted-foreground">Inicializando...</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background">
      <div className="w-full max-w-2xl">
        <Card className="shadow-xl border bg-white/90 dark:bg-zinc-900/90 rounded-xl overflow-hidden">
          <CardHeader className="text-center space-y-3 bg-primary/5 py-8 px-6">
            <CardTitle className="text-2xl font-bold flex items-center justify-center gap-3">
              {currentStatus.icon}
              {currentStatus.title}
            </CardTitle>
            <p className="text-muted-foreground">{currentStatus.description}</p>

            {/* Barra de progreso */}
            <div className="w-full bg-gray-200 rounded-full h-2.5 mt-4">
              <div
                className="bg-primary h-2.5 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${(completedSteps / progressSteps.length) * 100}%` }}
              ></div>
            </div>
            <p className="text-sm text-muted-foreground">
              {completedSteps}/{progressSteps.length} pasos completados
            </p>
          </CardHeader>

          <CardContent className="space-y-6 py-8 px-6">
            {/* Información del proceso actual */}
            <div className="space-y-4">
              {progressSteps.map((step, index) => (
                <div key={step.key} className="flex items-center gap-3">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      step.completed
                        ? 'bg-green-500 text-white'
                        : index === currentStep
                          ? 'bg-primary text-white animate-pulse'
                          : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {step.completed ? '✓' : index + 1}
                  </div>
                  <span
                    className={`text-sm ${
                      step.completed
                        ? 'text-green-600 font-medium'
                        : index === currentStep
                          ? 'text-primary font-medium'
                          : 'text-muted-foreground'
                    }`}
                  >
                    {step.label}
                  </span>
                  {index === currentStep && isProcessing && <Loader2 className="w-4 h-4 animate-spin text-primary ml-auto" />}
                </div>
              ))}
            </div>

            {/* Información de debugging */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Información técnica</span>
                <Button variant="ghost" size="sm" onClick={() => setShowDebugInfo(!showDebugInfo)} className="text-xs">
                  <Eye className="w-4 h-4 mr-2" />
                  {showDebugInfo ? 'Ocultar' : 'Mostrar'} detalles
                </Button>
              </div>

              {showDebugInfo && (
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-2 text-xs font-mono">
                  <div>
                    <strong>Estado actual:</strong> {debugInfo.step}
                  </div>
                  <div>
                    <strong>Intento:</strong> {debugInfo.attempt}/15
                  </div>
                  <div>
                    <strong>Datos recibidos:</strong> {debugInfo.userDataReceived ? '✅' : '❌'}
                  </div>
                  <div>
                    <strong>Datos guardados:</strong> {debugInfo.userDataSaved ? '✅' : '❌'}
                  </div>
                  <div>
                    <strong>Storage válido:</strong> {debugInfo.sessionStorageValid ? '✅' : '❌'}
                  </div>
                  {debugInfo.lastError && (
                    <div>
                      <strong>Último error:</strong> <span className="text-red-600">{debugInfo.lastError}</span>
                    </div>
                  )}
                  {missingFields.length > 0 && (
                    <div>
                      <strong>Campos faltantes:</strong> <span className="text-orange-600">{missingFields.join(', ')}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Manejo de errores */}
            {error && (
              <div className="space-y-4">
                <Alert variant="destructive" className="border-red-200 bg-red-50">
                  <XCircle className="h-4 w-4" />
                  <AlertDescription className="text-red-800">
                    <div className="space-y-2">
                      <p className="font-medium">Error en el proceso de autenticación:</p>
                      <p className="text-sm">{error}</p>
                      {missingFields.length > 0 && (
                        <p className="text-sm">
                          <strong>Campos faltantes:</strong> {missingFields.join(', ')}
                        </p>
                      )}
                    </div>
                  </AlertDescription>
                </Alert>

                <div className="text-center space-y-4">
                  <p className="text-muted-foreground text-sm">
                    {debugInfo.attempt < 15
                      ? 'El sistema intentará automáticamente otra vez...'
                      : 'Se ha alcanzado el máximo de intentos. Puedes reintentar manualmente.'}
                  </p>

                  <div className="flex gap-2 justify-center">
                    <Button onClick={retry} variant="outline" className="flex items-center gap-2" disabled={isProcessing}>
                      <RefreshCw className={`w-4 h-4 ${isProcessing ? 'animate-spin' : ''}`} />
                      Reintentar
                    </Button>

                    {debugInfo.attempt >= 15 && (
                      <Button
                        onClick={() => {
                          if (typeof window !== 'undefined') {
                            window.location.href = '/auth/login'
                          }
                        }}
                        variant="outline"
                        className="text-red-600 border-red-200 hover:bg-red-50"
                      >
                        Volver al inicio
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Estado de éxito */}
            {!error && !isLoading && !isProcessing && (
              <div className="text-center space-y-4">
                <CheckCircle className="w-12 h-12 mx-auto text-green-500" />
                <div className="space-y-2">
                  <p className="text-green-600 font-medium">¡Autenticación completada exitosamente!</p>
                  <p className="text-muted-foreground text-sm">Redirigiendo a la aplicación...</p>
                </div>
              </div>
            )}

            {/* Advertencia de no cerrar la ventana */}
            {(isLoading || isProcessing) && (
              <Alert className="border-amber-200 bg-amber-50">
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-amber-800">
                  <strong>Importante:</strong> No cierres esta ventana mientras se completa el proceso de autenticación.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
