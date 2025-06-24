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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/20 p-4">
      <Card className="w-full max-w-md shadow-2xl border-0 bg-gradient-to-br from-white to-gray-50/80 dark:from-zinc-900 dark:to-zinc-800/80 overflow-hidden backdrop-blur-sm">
        <CardHeader className="text-center bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 pb-8">
          <div className="mx-auto w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center ring-4 ring-primary/10 mb-4">
            <User className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
            Completa tu Perfil
          </CardTitle>
          <CardDescription className="text-muted-foreground text-base">
            Para finalizar tu registro, necesitamos algunos datos adicionales.
          </CardDescription>
        </CardHeader>

        <CardContent className="py-8 px-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2 font-medium">
                      <User className="w-4 h-4 text-primary" />
                      Nombres
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: Juan Carlos" {...field} disabled={isSubmitting} className="h-12" />
                    </FormControl>
                    <FormDescription className="text-sm text-muted-foreground">
                      Tu nombre completo tal como aparece en documentos oficiales
                    </FormDescription>
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
                      <User className="w-4 h-4 text-primary" />
                      Apellidos
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: Pérez González" {...field} disabled={isSubmitting} className="h-12" />
                    </FormControl>
                    <FormDescription className="text-sm text-muted-foreground">Tus apellidos completos</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2 font-medium">
                      <span className="w-4 h-4 text-center text-xs">📞</span>
                      Número de Teléfono (Opcional)
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: +506 8888-8888" {...field} disabled={isSubmitting} className="h-12" />
                    </FormControl>
                    <FormDescription className="text-sm text-muted-foreground">Número de contacto (opcional)</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full h-12 font-semibold shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary group"
                size="lg"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Completando perfil...
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-2">
                      <span>Completar Perfil</span>
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" />
                    </div>
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
