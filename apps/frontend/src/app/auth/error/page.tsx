'use client'

import { Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button, Card, CardContent, CardHeader, CardTitle, Badge, Separator } from '@una-gc/ui/components'
import { Mail, AlertTriangle, RefreshCw, Home, Sparkles } from 'lucide-react'

import { ErrorCard } from '@/modules/auth/components'
import { getAuthErrorInfo } from '@/modules/auth/utils/code-respone'

function ErrorContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const errorCode = searchParams.get('code')
  const action = searchParams.get('action')

  const errorInfo = getAuthErrorInfo(errorCode || undefined)

  // Ensure errorInfo is properly structured
  const safeErrorInfo = {
    title: typeof errorInfo?.title === 'string' ? errorInfo.title : 'Error de autenticación',
    message: typeof errorInfo?.message === 'string' ? errorInfo.message : 'Ha ocurrido un error durante la autenticación.',
    severity:
      errorInfo?.severity === 'error' || errorInfo?.severity === 'warning' || errorInfo?.severity === 'info'
        ? errorInfo.severity
        : ('error' as const)
  }
  const showContactAdmin = errorCode?.startsWith('AUTH_01') || errorCode === 'AUTH_003' || errorCode === 'AUTH_004'
  const showRegisterOption = action === 'register' && errorCode === 'AUTH_010'

  const contactEmail = process.env.NEXT_PUBLIC_ADMIN_CONTACT_EMAIL || 'admin@una.ac.cr'

  // Ensure contactEmail is a string for SSR
  const safeContactEmail = typeof contactEmail === 'string' ? contactEmail : 'admin@una.ac.cr'

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-background to-muted/20 px-4">
      {/* Error code badge */}
      {errorCode && (
        <div className="absolute top-6 right-6">
          <Badge variant="outline" className="text-xs font-mono bg-muted/50">
            Código: {errorCode}
          </Badge>
        </div>
      )}

      <div className="w-full max-w-md space-y-8">
        <ErrorCard title={safeErrorInfo.title} message={safeErrorInfo.message} severity={safeErrorInfo.severity} />

        <Card className="shadow-2xl border-0 bg-gradient-to-br from-white to-gray-50/80 dark:from-zinc-900 dark:to-zinc-800/80 overflow-hidden">
          <CardHeader className="text-center bg-gradient-to-r from-muted/10 to-muted/20 pb-6">
            <div className="mx-auto w-12 h-12 bg-orange-100 dark:bg-orange-900/50 rounded-full flex items-center justify-center ring-4 ring-orange-200/50 dark:ring-orange-800/50 mb-4">
              <AlertTriangle className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
            <CardTitle className="text-lg font-semibold text-foreground">Opciones disponibles</CardTitle>
          </CardHeader>

          <CardContent className="space-y-6 py-8 px-8">
            {showRegisterOption && (
              <>
                <div className="text-center space-y-4">
                  <p className="text-sm text-muted-foreground">¿Es tu primera vez en el sistema? Puedes solicitar acceso:</p>
                  <Button
                    onClick={() => router.push('/auth/register')}
                    className="w-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-300 group"
                    size="lg"
                  >
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      <span>Solicitar registro</span>
                      <Sparkles className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </Button>
                </div>
                <Separator />
              </>
            )}

            {showContactAdmin && (
              <>
                <a
                  href={`mailto:${safeContactEmail}?subject=Solicitud de acceso - Sistema GC&body=Hola, solicito verificar mi acceso al sistema. Mi correo electrónico es: `}
                  className="block w-full"
                >
                  <Button
                    variant="outline"
                    className="w-full hover:bg-blue-50 dark:hover:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 shadow-sm hover:shadow-md transition-all duration-200"
                    size="lg"
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Contactar al administrador
                  </Button>
                </a>
                <Separator />
              </>
            )}

            <div className="grid grid-cols-1 gap-3">
              <Button
                onClick={() => router.push('/auth/login')}
                variant="outline"
                className="w-full font-medium shadow-sm hover:shadow-md transition-all duration-200"
                size="lg"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Intentar de nuevo
              </Button>

              <Button onClick={() => router.push('/')} variant="ghost" className="w-full font-medium" size="lg">
                <Home className="w-4 h-4 mr-2" />
                Ir al inicio
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function AuthErrorClient() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-background to-muted/20 px-4">
          <div className="w-full max-w-md space-y-8">
            <Card className="shadow-2xl border-0 bg-gradient-to-br from-white to-gray-50/80 dark:from-zinc-900 dark:to-zinc-800/80 overflow-hidden">
              <CardContent className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Cargando...</p>
              </CardContent>
            </Card>
          </div>
        </div>
      }
    >
      <ErrorContent />
    </Suspense>
  )
}
