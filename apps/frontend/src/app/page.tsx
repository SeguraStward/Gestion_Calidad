'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@una-gc/ui/components/card'
import { Button } from '@una-gc/ui/components/button'
import { useRouter } from 'next/navigation'
import { Banana, LogIn } from 'lucide-react'
import { Input } from '@una-gc/ui/components/input'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6 text-xl">
        <a href="#" className="flex items-center gap-2 self-center font-medium">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Banana className="w-4 h-4" />
          </div>

          <span className="font-bold text-2xl">Sistema Gestión de la Calidad</span>
        </a>
        <Card>
          <CardHeader>
            <CardTitle>Sistema Gestión de la Calidad</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Input type="text" placeholder="Identificación" />
            <Input type="password" placeholder="Contraseña" />
            <div className="self-start text-sm">
              <Link href="/forgot-password" className="text-primary hover:underline">
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
            <Button
              onClick={() => {
                router.push('/profile')
              }}
              type="button"
              className="w-full"
            >
              Iniciar sesi&oacute;n
              <LogIn className="w-24 h-24" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
