'use client'

import { useEffect, useState } from 'react'
import { Loader2, CheckCircle, XCircle, RefreshCw, AlertTriangle, Sparkles } from 'lucide-react'

import { Alert, AlertDescription, Button, Card, CardContent, CardHeader, CardTitle, Progress, Badge } from '@una-gc/ui/components'

import { useLoginCallback } from '@/modules/auth/hooks/useLoginCallback'

export default function AuthCallbackPage() {
  const [isMounted, setIsMounted] = useState(false)
  const { isLoading, error, retry } = useLoginCallback()

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Prevenir que el usuario cierre la pestaña durante la autenticación
  useEffect(() => {
    if (isLoading) {
      const handleBeforeUnload = (e: BeforeUnloadEvent) => {
        e.preventDefault()
      }

      window.addEventListener('beforeunload', handleBeforeUnload)
      return () => window.removeEventListener('beforeunload', handleBeforeUnload)
    }
    // Always return undefined if not loading
    return undefined
  }, [isLoading])

  // Mostrar loading inicial
  if (!isMounted) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-background to-muted/20">
        <Card className="w-full max-w-md shadow-2xl border-0 bg-gradient-to-br from-white to-gray-50/80 dark:from-zinc-900 dark:to-zinc-800/80 overflow-hidden">
          <CardHeader className="text-center pb-4 bg-gradient-to-r from-primary/5 to-primary/10">
            <div className="mx-auto w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center ring-4 ring-primary/10 mb-4">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
            <CardTitle className="flex items-center justify-center gap-2 text-xl">Cargando...</CardTitle>
          </CardHeader>
          <CardContent className="text-center py-8">
            <Progress value={33} className="w-full mb-4" />
            <p className="text-muted-foreground">Inicializando autenticación...</p>
          </CardContent>
        </Card>
      </div>
    )
  }
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-background to-muted/20 p-4">
      <Card className="w-full max-w-md shadow-2xl border-0 bg-gradient-to-br from-white to-gray-50/80 dark:from-zinc-900 dark:to-zinc-800/80 overflow-hidden backdrop-blur-sm">
        <CardHeader className="text-center pb-6 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5">
          <div className="mx-auto w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center ring-4 ring-primary/10 mb-4">
            {isLoading && <Loader2 className="h-8 w-8 animate-spin text-primary" />}
            {error && <XCircle className="h-8 w-8 text-destructive" />}
            {!isLoading && !error && <CheckCircle className="h-8 w-8 text-green-600" />}
          </div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
            {isLoading && 'Procesando autenticación...'}
            {error && 'Error de autenticación'}
            {!isLoading && !error && 'Autenticación exitosa'}
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6 py-8 px-8">
          {/* Estado de carga */}
          {isLoading && (
            <div className="text-center space-y-4 animate-in fade-in duration-300">
              <Progress value={66} className="w-full" />
              <div className="space-y-3">
                <p className="text-muted-foreground font-medium">Validando credenciales...</p>
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <div className="w-2 h-2 bg-primary/60 rounded-full animate-pulse" />
                  <span>Verificando permisos</span>
                </div>
              </div>

              <Alert className="border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/30">
                <AlertTriangle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <AlertDescription className="text-blue-800 dark:text-blue-200">
                  <strong>Importante:</strong> No cierres esta ventana durante el proceso.
                </AlertDescription>
              </Alert>
            </div>
          )}

          {/* Estado de error */}
          {error && (
            <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
              <Alert variant="destructive" className="border-red-200 bg-red-50 dark:bg-red-900/30">
                <XCircle className="h-4 w-4" />
                <AlertDescription className="text-red-800 dark:text-red-200">{error}</AlertDescription>
              </Alert>

              <div className="flex gap-3 justify-center">
                <Button
                  onClick={retry}
                  size="lg"
                  className="flex items-center gap-2 shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <RefreshCw className="h-4 w-4" />
                  Reintentar
                </Button>

                <Button
                  onClick={() => {
                    if (typeof window !== 'undefined') {
                      window.location.href = '/auth/login'
                    }
                  }}
                  variant="outline"
                  size="lg"
                  className="shadow-sm hover:shadow-md transition-all duration-200"
                >
                  Volver al inicio
                </Button>
              </div>
            </div>
          )}

          {/* Estado de éxito */}
          {!error && !isLoading && (
            <div className="text-center space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
              <Progress value={100} className="w-full" />
              <div className="space-y-3">
                <div className="flex items-center justify-center gap-2">
                  <Badge
                    variant="outline"
                    className="bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800"
                  >
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Completado
                  </Badge>
                </div>
                <div className="space-y-2">
                  <p className="text-green-600 dark:text-green-400 font-semibold flex items-center justify-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    ¡Autenticación completada!
                  </p>
                  <p className="text-muted-foreground text-sm">Redirigiendo al sistema...</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
