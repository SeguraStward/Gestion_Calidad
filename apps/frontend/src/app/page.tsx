'use client'

import { Button } from '@una-gc/ui/components/button'
import { Card, CardContent, CardHeader, CardTitle } from '@una-gc/ui/components/card'
import { LogIn } from 'lucide-react'

export default function HomePage() {
  const handleGoogleLogin = () => {
    const url = process.env.NEXT_PUBLIC_GOOGLE_LOGIN_URL
    if (!url) {
      throw new Error('NEXT_PUBLIC_GOOGLE_LOGIN_URL is not defined')
    }
    window.location.href = url
  }

  return (
    <main className="flex items-center justify-center min-h-screen px-4">
      <Card className="w-full max-w-md shadow-md border border-muted">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-semibold">Inicia sesión</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          <p className="text-muted-foreground text-center text-sm">Usa tu cuenta institucional de Google para acceder</p>
          <Button onClick={handleGoogleLogin} className="w-full">
            Iniciar sesión con Google
            <LogIn className="ml-2 h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    </main>
  )
}
