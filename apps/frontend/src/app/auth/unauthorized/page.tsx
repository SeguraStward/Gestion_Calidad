'use client'

import { useRouter } from 'next/navigation'
import { Shield, ArrowLeft } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@una-gc/ui/components/card'
import { Button } from '@una-gc/ui/components/button'
import { useAuth } from '@/modules/auth/hooks/useAuth'

export default function UnauthorizedPage() {
  const { user, role } = useAuth()
  const router = useRouter()

  const handleGoBack = () => {
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <Shield className="w-6 h-6 text-red-600" />
          </div>
          <CardTitle className="text-xl font-semibold text-gray-900">
            Acceso Denegado
          </CardTitle>
          <CardDescription className="text-gray-600">
            No tienes permisos suficientes para acceder a esta sección del sistema.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
            <p className="text-sm text-blue-800">
              <strong>Usuario:</strong> {user?.fullName} ({user?.email})
            </p>
            <p className="text-sm text-blue-800">
              <strong>Rol Actual:</strong> {role?.name || 'Sin rol asignado'}
            </p>
          </div>

          <Button
            onClick={handleGoBack}
            className="w-full"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al Dashboard
          </Button>

          <div className="text-center text-sm text-gray-500">
            Si necesitas acceso a esta función, contacta al administrador del sistema.
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
