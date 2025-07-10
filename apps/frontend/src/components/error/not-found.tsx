import { Button, Card, CardContent, CardHeader, CardTitle } from '@una-gc/ui/components'
import { FileQuestion, Home, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-background to-muted/20 px-4">
      <div className="w-full max-w-md space-y-8">
        <Card className="shadow-2xl border-0 bg-gradient-to-br from-white to-gray-50/80 dark:from-zinc-900 dark:to-zinc-800/80 overflow-hidden">
          <CardHeader className="text-center bg-gradient-to-r from-muted/10 to-muted/20 pb-6">
            <div className="mx-auto w-16 h-16 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center ring-4 ring-blue-200/50 dark:ring-blue-800/50 mb-4">
              <FileQuestion className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <CardTitle className="text-2xl font-bold text-foreground">Página no encontrada</CardTitle>
            <p className="text-muted-foreground">Lo sentimos, la página que buscas no existe o ha sido movida.</p>
          </CardHeader>

          <CardContent className="space-y-6 py-8 px-8">
            <div className="text-center space-y-2">
              <p className="text-4xl font-bold text-muted-foreground">404</p>
              <p className="text-sm text-muted-foreground">Verifica la URL o navega a una página existente.</p>
            </div>

            <div className="grid grid-cols-1 gap-3">
              <Link href="/">
                <Button
                  variant="outline"
                  className="w-full font-medium shadow-sm hover:shadow-md transition-all duration-200"
                  size="lg"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Volver al inicio
                </Button>
              </Link>

              <Link href="/">
                <Button
                  className="w-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-300"
                  size="lg"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Ir al inicio
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
