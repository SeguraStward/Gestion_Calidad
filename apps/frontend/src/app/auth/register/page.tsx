'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Loader2, UserPlus, ArrowLeft, CheckCircle, Mail, User, FileText, Shield, Sparkles } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@una-gc/ui/components/card'
import { Button } from '@una-gc/ui/components/button'
import { Input } from '@una-gc/ui/components/input'
import { Alert, AlertDescription } from '@una-gc/ui/components/alert'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@una-gc/ui/components/form'
import { Separator } from '@una-gc/ui/components/separator'

const registerSchema = z.object({
  email: z
    .string()
    .email('Debe ser un email válido')
    .refine(
      (email) =>
        email.endsWith('@gmail.com') ||
        email.endsWith('@est.una.ac.cr') || {
          message:
            'Debe usar un correo válido de Google o institucional, la cuenta se debe verificar con google para el inicio de sesión'
        }
    ),
  fullName: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(50, 'El nombre no puede tener más de 50 caracteres')
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'El nombre solo puede contener letras y espacios'),
  fullLastName: z
    .string()
    .min(2, 'Los apellidos deben tener al menos 2 caracteres')
    .max(50, 'Los apellidos no pueden tener más de 50 caracteres')
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'Los apellidos solo pueden contener letras y espacios')
})

type RegisterForm = z.infer<typeof registerSchema>

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const form = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: '',
      fullName: '',
      fullLastName: ''
    }
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
      form.reset()
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
        <Card className="shadow-2xl border-0 bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-900/20 dark:to-green-800/20 overflow-hidden max-w-md w-full">
          <CardHeader className="text-center space-y-4 bg-gradient-to-r from-green-500/10 to-green-600/10 pb-8">
            <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center ring-4 ring-green-200/50 dark:ring-green-800/50">
              <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <div className="space-y-2">
              <CardTitle className="text-2xl font-bold text-green-800 dark:text-green-200">¡Solicitud enviada!</CardTitle>
              <CardDescription className="text-green-700 dark:text-green-300">
                Tu solicitud de registro ha sido procesada exitosamente
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-6 py-8 px-8">
            <Alert className="border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/30">
              <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
              <AlertDescription className="text-green-800 dark:text-green-200">
                Tu solicitud de registro ha sido enviada exitosamente. Un administrador revisará tu solicitud y te notificará
                cuando tu cuenta esté activa.
              </AlertDescription>
            </Alert>

            <div className="bg-gradient-to-r from-green-50 to-green-100/50 dark:from-green-900/20 dark:to-green-800/20 p-6 rounded-lg border border-green-200 dark:border-green-800">
              <h3 className="font-semibold mb-3 text-green-800 dark:text-green-200 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                ¿Qué sigue?
              </h3>
              <ul className="text-sm text-green-700 dark:text-green-300 space-y-2">
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-1.5 flex-shrink-0" />
                  Tu solicitud será revisada por un administrador
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-1.5 flex-shrink-0" />
                  Recibirás una notificación por email cuando esté aprobada
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-1.5 flex-shrink-0" />
                  Una vez aprobada, podrás iniciar sesión normalmente
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <Button
                onClick={() => (window.location.href = '/auth/login')}
                className="w-full bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 shadow-lg"
                size="lg"
              >
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
      <Card className="shadow-2xl border-0 bg-gradient-to-br from-white to-gray-50/80 dark:from-zinc-900 dark:to-zinc-800/80 overflow-hidden max-w-md w-full">
        <CardHeader className="text-center space-y-4 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 pb-8">
          <div className="mx-auto w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center ring-4 ring-primary/10">
            <UserPlus className="w-8 h-8 text-primary" />
          </div>
          <div className="space-y-2">
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              Solicitar registro
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Completa tus datos para solicitar acceso al sistema
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="py-8 px-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2 font-medium">
                      <Mail className="w-4 h-4 text-primary" />
                      Correo electrónico institucional
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="tu.nombre@est.una.ac.cr"
                        type="email"
                        disabled={isLoading}
                        className="h-12"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2 font-medium">
                      <User className="w-4 h-4 text-primary" />
                      Nombre completo
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Juan Carlos" disabled={isLoading} className="h-12" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="fullLastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2 font-medium">
                      <FileText className="w-4 h-4 text-primary" />
                      Apellidos
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Pérez González" disabled={isLoading} className="h-12" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Separator className="my-6" />

              <Alert className="border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/30">
                <Shield className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <AlertDescription className="text-blue-800 dark:text-blue-200">
                  <strong>Importante:</strong> Solo se aceptan correos institucionales con dominio @est.una.ac.cr o de lo
                  contrario un correo de google. Tu solicitud será revisada por un administrador antes de ser aprobada.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 font-semibold shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary group"
                  size="lg"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Enviando solicitud...
                    </>
                  ) : (
                    <>
                      <div className="flex items-center gap-2">
                        <UserPlus className="w-5 h-5" />
                        <span>Enviar solicitud</span>
                        <Sparkles className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </>
                  )}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => (window.location.href = '/auth/login')}
                  disabled={isLoading}
                  className="w-full h-12 font-medium"
                  size="lg"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Volver al inicio de sesión
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
