'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@una-gc/ui/components'

import { ErrorCard } from '@/modules/auth/components'

export default function AuthErrorPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
      <ErrorCard
        title="¡Error de autenticación!"
        message="No pudimos verificar tus credenciales. Por favor intentá de nuevo o volvé al inicio."
      />
      <div className="mt-6">
        <Button onClick={() => router.push('/')}>Volver al inicio</Button>
      </div>
    </div>
  )
}
