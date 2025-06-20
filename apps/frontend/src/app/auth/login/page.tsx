'use client'

import { useCallback } from 'react'
import { Button } from '@una-gc/ui/components/button'
import { CardContent, CardHeader, CardTitle, CardDescription } from '@una-gc/ui/components/card'
import { Badge } from '@una-gc/ui/components/badge'
import { LogIn, Shield, BookOpen } from 'lucide-react'
import { AuthLayout } from '@/modules/auth/components'

export default function LoginPage() {
  const handleGoogleLogin = useCallback(() => {
    const url = process.env.NEXT_PUBLIC_GOOGLE_LOGIN_URL
    if (!url) {
      throw new Error('NEXT_PUBLIC_GOOGLE_LOGIN_URL is not defined')
    }
    window.location.href = url
  }, [])

  return (
    <AuthLayout
      title="Sistema de Gestión de Calidad"
      subtitle="Universidad Nacional de Costa Rica"
      icon={<BookOpen className="w-8 h-8 text-primary" />}
      maxWidth="md"
    >
      <div className="w-full max-w-lg mx-auto bg-white/90 dark:bg-zinc-900/90 rounded-xl shadow-xl border border-border p-0 overflow-hidden">
        <CardHeader className="text-center space-y-3 bg-primary/5 py-8 px-6">
          <CardTitle className="text-3xl font-bold flex items-center justify-center gap-2 text-primary">
            <Shield className="w-7 h-7 text-primary" />
            Iniciar Sesión
          </CardTitle>
          <CardDescription className="text-base text-muted-foreground">
            Accede con tu cuenta institucional de Google
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-8 py-8 px-6">
          {/* Botón de login */}
          <Button
            onClick={handleGoogleLogin}
            className="w-full h-12 text-base font-semibold shadow-md hover:shadow-lg transition-all duration-200 bg-primary"
          >
            <LogIn className="mr-2 h-5 w-5" />
            Iniciar sesión con Google
          </Button>

          {/* Footer info */}
          <div className="text-center space-y-2">
            <Badge variant="secondary" className="text-xs">
              Acceso exclusivo @est.una.ac.cr
            </Badge>
            <p className="text-xs text-muted-foreground">Sistema de gestión de calidad académica</p>
          </div>
        </CardContent>
      </div>
    </AuthLayout>
  )
}
