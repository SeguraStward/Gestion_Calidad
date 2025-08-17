'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AlertTriangle, RefreshCw, LogOut } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@una-gc/ui/components/card'
import { Button } from '@una-gc/ui/components/button'
import { useAuth } from '@/modules/auth/hooks/useAuth'

export default function NoRolePage() {
  const { user, logout, refreshAuth } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Si el usuario no está autenticado, redirigir al login
    if (!user) {
      router.push('/auth/login')
    }
  }, [user, router])

  const handleRefresh = async () => {
    await refreshAuth()
    // Si después del refresh tiene rol, redirigir al dashboard
    router.push('/dashboard')
  }

  const handleLogout = async () => {
    await logout()
  }

  if (!user) return null

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="w-6 h-6 text-yellow-600" />
          </div>
          <CardTitle className="text-xl font-semibold text-gray-900">
            Sin Rol Asignado
          </CardTitle>
          <CardDescription className="text-gray-600">
            Tu cuenta no tiene ningún rol asignado. Contacta al administrador del sistema para que te asigne los permisos necesarios.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>Usuario:</strong> {user.fullName} ({user.email})
            </p>
          </div>

          <div className="space-y-2">
            <Button
              onClick={handleRefresh}
              className="w-full"
              variant="outline"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Verificar Nuevamente
            </Button>

            <Button
              onClick={handleLogout}
              className="w-full"
              variant="destructive"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Cerrar Sesión
            </Button>
          </div>

          <div className="text-center text-sm text-gray-500">
            Si el problema persiste, contacta al administrador del sistema.
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
