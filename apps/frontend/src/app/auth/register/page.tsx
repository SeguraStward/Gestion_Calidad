'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Loader2, UserPlus, ArrowLeft, CheckCircle } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@una-gc/ui/components/card'
import { Button } from '@una-gc/ui/components/button'
import { Input } from '@una-gc/ui/components/input'
import { Label } from '@una-gc/ui/components/label'
import { Alert, AlertDescription } from '@una-gc/ui/components/alert'

const registerSchema = z.object({
  email: z
    .string()
    .email('Debe ser un email válido')
    .refine((email) => email.endsWith('@est.una.ac.cr'), {
      message: 'Debe usar un correo institucional @est.una.ac.cr'
    }),
  fullName: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(50, 'El nombre no puede tener más de 50 caracteres'),
  fullLastName: z
    .string()
    .min(2, 'Los apellidos deben tener al menos 2 caracteres')
    .max(50, 'Los apellidos no pueden tener más de 50 caracteres')
})

type RegisterForm = z.infer<typeof registerSchema>

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema)
  })

  const onSubmit = async (data: RegisterForm) => {
    setIsLoading(true)

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(data)
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Error en el registro')
      }

      setIsSuccess(true)
      reset()
      toast.success('¡Solicitud de registro enviada exitosamente!')
    } catch (error) {
      console.error('Registration error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      toast.error(`Error: ${errorMessage}`)
    } finally {
      setIsLoading(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <Card className="shadow-xl border border-border bg-white/90 dark:bg-zinc-900/90 rounded-xl overflow-hidden max-w-md w-full">
          <CardHeader className="text-center space-y-3 bg-green-50 py-8 px-6">
            <div className="flex justify-center">
              <CheckCircle className="w-12 h-12 text-green-500" />
            </div>
            <CardTitle className="text-2xl font-bold text-green-800">¡Solicitud enviada!</CardTitle>
          </CardHeader>

          <CardContent className="space-y-6 py-8 px-6">
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription className="text-green-800">
                Tu solicitud de registro ha sido enviada exitosamente. Un administrador revisará tu solicitud y te notificará
                cuando tu cuenta esté activa.
              </AlertDescription>
            </Alert>

            <div className="bg-muted/50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">¿Qué sigue?</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Tu solicitud será revisada por un administrador</li>
                <li>• Recibirás una notificación por email cuando esté aprobada</li>
                <li>• Una vez aprobada, podrás iniciar sesión normalmente</li>
              </ul>
            </div>

            <div className="text-center space-y-4">
              <Button onClick={() => (window.location.href = '/auth/login')} className="w-full">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver al inicio de sesión
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <Card className="shadow-xl border border-border bg-white/90 dark:bg-zinc-900/90 rounded-xl overflow-hidden max-w-md w-full">
        <CardHeader className="text-center space-y-3 bg-primary/5 py-8 px-6">
          <div className="flex justify-center">
            <UserPlus className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">Solicitar registro</CardTitle>
          <p className="text-muted-foreground">Completa tus datos para solicitar acceso al sistema</p>
        </CardHeader>

        <CardContent className="py-8 px-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Correo electrónico institucional</Label>
              <Input id="email" type="email" placeholder="tu.nombre@est.una.ac.cr" {...register('email')} disabled={isLoading} />
              {errors.email && <p className="text-sm text-red-600">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="fullName">Nombre completo</Label>
              <Input id="fullName" type="text" placeholder="Juan Carlos" {...register('fullName')} disabled={isLoading} />
              {errors.fullName && <p className="text-sm text-red-600">{errors.fullName.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="fullLastName">Apellidos</Label>
              <Input
                id="fullLastName"
                type="text"
                placeholder="Pérez González"
                {...register('fullLastName')}
                disabled={isLoading}
              />
              {errors.fullLastName && <p className="text-sm text-red-600">{errors.fullLastName.message}</p>}
            </div>

            <Alert className="border-blue-200 bg-blue-50">
              <AlertDescription className="text-blue-800">
                <strong>Importante:</strong> Solo se aceptan correos institucionales con dominio @est.una.ac.cr. Tu solicitud será
                revisada por un administrador antes de ser aprobada.
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Enviando solicitud...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Enviar solicitud
                  </>
                )}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() => (window.location.href = '/auth/login')}
                disabled={isLoading}
                className="w-full"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver al inicio de sesión
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
