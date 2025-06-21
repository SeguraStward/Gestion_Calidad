'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, CheckCircle } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@una-gc/ui/components'

interface RoleTransitionProps {
  roleName: string
  onComplete: () => void
}

export function RoleTransition({ roleName }: RoleTransitionProps) {
  const [step, setStep] = useState<'saving' | 'saved' | 'redirecting'>('saving')
  const [isMounted, setIsMounted] = useState(false)
  const router = useRouter()
  const [redirected, setRedirected] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (!isMounted || redirected) return
    const waitForRoleCookie = async () => {
      const maxWait = 3000
      const interval = 100
      let waited = 0
      while (waited < maxWait) {
        if (typeof document !== 'undefined' && document.cookie.includes('user_active_role_id=')) {
          return true
        }
        await new Promise((r) => setTimeout(r, interval))
        waited += interval
      }
      return false
    }

    const sequence = async () => {
      // Paso 1: Simular guardado
      await new Promise((resolve) => setTimeout(resolve, 1200))
      setStep('saved')

      // Paso 2: Confirmación
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setStep('redirecting')

      // Paso 3: Esperar cookie y redirigir
      await waitForRoleCookie()
      await new Promise((resolve) => setTimeout(resolve, 400)) // delay extra para evitar parpadeo
      setRedirected(true)
      // Redirigir directamente aquí y no llamar onComplete
      router.replace('/')
    }

    sequence()
  }, [router, isMounted, redirected])

  if (!isMounted) return null

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
      <Card className="rounded-lg shadow-lg max-w-md w-full mx-4 text-center">
        {step === 'saving' && (
          <>
            <CardHeader>
              <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Guardando rol...</h3>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Configurando tu rol: {roleName}</p>
            </CardContent>
          </>
        )}

        {step === 'saved' && (
          <>
            <CardHeader>
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">¡Rol seleccionado!</h3>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Has seleccionado: {roleName}</p>
            </CardContent>
          </>
        )}

        {step === 'redirecting' && (
          <>
            <CardHeader>
              <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Redirigiendo...</h3>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Te estamos llevando a la página principal</p>
            </CardContent>
          </>
        )}
      </Card>
    </div>
  )
}

export default RoleTransition
