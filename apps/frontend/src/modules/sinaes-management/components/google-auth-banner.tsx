'use client'

import { AlertCircle, LogOut } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@una-gc/ui/components/alert'
import { Button } from '@una-gc/ui/components/button'
import { useAuth } from '@/modules/auth/hooks/useAuth'

export function GoogleAuthBanner() {
  const { user, role, logout } = useAuth()

  // Solo mostrar si el usuario es admin pero no tiene token de Google
  // El backend valida el rol y retorna error si falta el token
  // Por ahora, solo mostramos el banner si el role es 'admin'
  const isAdmin = role?.name === 'admin'

  // En frontend no tenemos forma directa de saber si tiene googleAccessToken
  // así que este banner será opcional y solo informativo
  // El backend se encargará de validar y retornar errores apropiados

  // Por ahora no mostraremos el banner proactivamente
  // El usuario verá los errores cuando intente subir
  return null

  // Código comentado para referencia futura:
  /*
  if (!isAdmin) {
    return null
  }

  const handleReLogin = () => {
    // Redirigir al logout y luego al login con Google
    logout()
  }

  return (
    <Alert variant="warning" className="mb-4">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Autenticación con Google requerida</AlertTitle>
      <AlertDescription className="flex items-center justify-between">
        <span>
          Para subir archivos a Google Drive, debes volver a iniciar sesión con Google.
          Los archivos se guardarán en tu Google Drive personal.
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={handleReLogin}
          className="ml-4 whitespace-nowrap"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Cerrar sesión y volver a entrar
        </Button>
      </AlertDescription>
    </Alert>
  )
  */
}
