'use client'

import { useCallback } from 'react'
import { LogIn, Shield, BookOpen, Sparkles } from 'lucide-react'

import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Badge, Separator } from '@una-gc/ui/components'

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
      <Card className="shadow-2xl border-0 bg-gradient-to-br from-white to-gray-50/80 dark:from-zinc-900 dark:to-zinc-800/80 overflow-hidden backdrop-blur-sm">
        <CardHeader className="text-center space-y-4 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 pb-8">
          <div className="mx-auto w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center ring-4 ring-primary/10">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <div className="space-y-2">
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              Iniciar Sesión
            </CardTitle>
            <CardDescription className="text-base text-muted-foreground">
              Accede con tu cuenta institucional de Google
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 py-8 px-8">
          {/* Botón de login principal */}
          <Button
            onClick={handleGoogleLogin}
            size="lg"
            className="w-full h-14 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-full group-hover:bg-white/30 transition-colors">
                <LogIn className="h-5 w-5" />
              </div>
              <span>Iniciar sesión con Google</span>
              <Sparkles className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </Button>

          <Separator className="my-6" />
        </CardContent>
      </Card>
    </AuthLayout>
  )
}
