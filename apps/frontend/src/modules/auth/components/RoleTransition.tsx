'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, CheckCircle } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@una-gc/ui/components/card'

interface RoleTransitionProps {
  roleName: string
  onComplete: () => void
}

export function RoleTransition({ roleName }: RoleTransitionProps) {
  const [step, setStep] = useState<'saving' | 'saved' | 'redirecting'>('saving')
  const router = useRouter()

  useEffect(() => {
    const sequence = async () => {
      // Step 1: Saving simulation
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setStep('saved')

      // Step 2: Confirmation
      await new Promise((resolve) => setTimeout(resolve, 800))
      setStep('redirecting')

      // Step 3: Redirect
      await new Promise((resolve) => setTimeout(resolve, 500))
      router.replace('/')
    }

    sequence()
  }, [router])

  const steps = {
    saving: {
      icon: <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />,
      title: 'Guardando rol...',
      description: `Configurando tu rol: ${roleName}`
    },
    saved: {
      icon: <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />,
      title: '¡Rol seleccionado!',
      description: `Has seleccionado: ${roleName}`
    },
    redirecting: {
      icon: <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />,
      title: 'Redirigiendo...',
      description: 'Te estamos llevando a la página principal'
    }
  }

  const currentStep = steps[step]

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
      <Card className="rounded-lg shadow-lg max-w-md w-full mx-4 text-center">
        <CardHeader>
          {currentStep.icon}
          <h3 className="text-lg font-semibold mb-2">{currentStep.title}</h3>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{currentStep.description}</p>
        </CardContent>
      </Card>
    </div>
  )
}

export default RoleTransition
