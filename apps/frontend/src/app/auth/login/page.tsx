'use client'

import { useCallback } from 'react'
import { Button } from '@una-gc/ui/components/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@una-gc/ui/components/card'
import { Badge } from '@una-gc/ui/components/badge'
import { LogIn, Shield, Users, BookOpen } from 'lucide-react'
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
      icon={<BookOpen className="w-6 h-6 text-primary" />}
      maxWidth="md"
    >
      {/* Card principal */}
      <Card className="shadow-lg border-0 bg-card/50 backdrop-blur-sm">
        <CardHeader className="text-center space-y-3">
          <CardTitle className="text-2xl font-semibold flex items-center justify-center gap-2">
            <Shield className="w-6 h-6 text-primary" />
            Iniciar Sesión
          </CardTitle>
          <CardDescription className="text-base">Accede con tu cuenta institucional de Google</CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Características del sistema */}
          {/* <div className="grid grid-cols-2 gap-3">
            <div className="text-center p-3 bg-primary/5 rounded-lg">
              <Users className="w-6 h-6 text-primary mx-auto mb-1" />
              <p className="text-xs text-muted-foreground">Gestión de Roles</p>
            </div>
            <div className="text-center p-3 bg-primary/5 rounded-lg">
              <Shield className="w-6 h-6 text-primary mx-auto mb-1" />
              <p className="text-xs text-muted-foreground">Acceso Seguro</p>
            </div>
          </div> */}

          {/* Botón de login */}
          <Button
            onClick={handleGoogleLogin}
            className="w-full h-12 text-base font-medium bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md hover:shadow-lg transition-all duration-200"
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
      </Card>
    </AuthLayout>
  )
}
