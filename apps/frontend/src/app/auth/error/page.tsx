'use client'

import { Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@una-gc/ui/components'
import { Mail } from 'lucide-react'

import { ErrorCard } from '@/modules/auth/components'
import { getAuthErrorInfo } from '@/modules/auth/utils/code-respone'

function ErrorContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const errorCode = searchParams.get('code')

  const errorInfo = getAuthErrorInfo(errorCode || undefined)
  const showContactAdmin = errorCode?.startsWith('AUTH_01') || errorCode === 'AUTH_003' || errorCode === 'AUTH_004'

  const contactEmail = process.env.NEXT_PUBLIC_ADMIN_CONTACT_EMAIL || 'admin@una.ac.cr'

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
      <div className="absolute top-4 right-4 text-xs text-muted-foreground">{errorCode && <span>Código: {errorCode}</span>}</div>

      <ErrorCard title={errorInfo.title} message={errorInfo.message} severity={errorInfo.severity} />

      <div className="mt-6 space-y-4 flex flex-col items-center">
        {showContactAdmin && (
          <a
            href={`mailto:${contactEmail}?subject=Solicitud de acceso - Sistema GC&body=Hola, solicito verificar mi acceso al sistema. Mi correo electrónico es: `}
            className="flex items-center gap-2 text-sm text-primary hover:underline mb-2"
          >
            <Mail className="h-4 w-4" />
            Contactar al administrador
          </a>
        )}

        <div className="space-x-4">
          <Button onClick={() => router.push('/auth/login')} variant="outline" className="border-white border-2 text-lg">
            Intentar de nuevo
          </Button>
          {/* <Button onClick={() => router.push('/')} className="bg-primary">
            <Shield className="mr-2 h-4 w-4" />
            Volver al inicio
          </Button> */}
        </div>
      </div>
    </div>
  )
}

export default function AuthErrorClient() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <ErrorContent />
    </Suspense>
  )
}
