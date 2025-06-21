'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import { User, ArrowRight, Loader2 } from 'lucide-react'

import { Button } from '@una-gc/ui/components/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@una-gc/ui/components/card'
import { Input } from '@una-gc/ui/components/input'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@una-gc/ui/components/form'

import { HttpClient } from '@/lib/http-client'
import { toast } from 'sonner'

const completeProfileSchema = z.object({
  fullName: z.string().min(1, 'El nombre es requerido').min(2, 'El nombre debe tener al menos 2 caracteres'),
  fullLastName: z.string().min(1, 'Los apellidos son requeridos').min(2, 'Los apellidos deben tener al menos 2 caracteres'),
  phoneNumber: z
    .string()
    .optional()
    .refine((value) => !value || value.length >= 8, {
      message: 'El número de teléfono debe tener al menos 8 dígitos'
    })
})

type CompleteProfileFormData = z.infer<typeof completeProfileSchema>

export function CompleteProfileForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  const form = useForm<CompleteProfileFormData>({
    resolver: zodResolver(completeProfileSchema),
    defaultValues: {
      fullName: '',
      fullLastName: '',
      phoneNumber: ''
    }
  })

  const handleSubmit = async (data: CompleteProfileFormData) => {
    setIsSubmitting(true)
    try {
      await HttpClient.post('/auth/complete-profile', {
        fullName: data.fullName,
        fullLastName: data.fullLastName,
        phoneNumber: data.phoneNumber || undefined
      })

      toast.success('Perfil completado exitosamente. Ahora puedes acceder al sistema.')

      // Redirect to role selection or dashboard
      router.push('/auth/select-role')
    } catch (error: any) {
      console.error('Error completing profile:', error)

      const errorMessage = error?.message || 'Error al completar el perfil. Intenta nuevamente.'
      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <User className="w-6 h-6 text-blue-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">Completa tu Perfil</CardTitle>
          <CardDescription className="text-gray-600">
            Para finalizar tu registro, necesitamos algunos datos adicionales.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombres</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: Juan Carlos" {...field} disabled={isSubmitting} />
                    </FormControl>
                    <FormDescription>Tu nombre completo tal como aparece en documentos oficiales</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="fullLastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Apellidos</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: Pérez González" {...field} disabled={isSubmitting} />
                    </FormControl>
                    <FormDescription>Tus apellidos completos</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número de Teléfono (Opcional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: +506 8888-8888" {...field} disabled={isSubmitting} />
                    </FormControl>
                    <FormDescription>Número de contacto (opcional)</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Completando perfil...
                  </>
                ) : (
                  <>
                    Completar Perfil
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
