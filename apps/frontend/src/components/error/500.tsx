import { Card, CardContent, CardHeader, CardTitle } from '@una-gc/ui/components/card'
import { Button } from '@una-gc/ui/components/button'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'

export default function Custom500() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-background to-muted/20 px-4">
      <div className="w-full max-w-md space-y-8">
        <Card className="shadow-2xl border-0 bg-gradient-to-br from-white to-gray-50/80 dark:from-zinc-900 dark:to-zinc-800/80 overflow-hidden">
          <CardHeader className="text-center bg-gradient-to-r from-muted/10 to-muted/20 pb-6">
            <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/50 rounded-full flex items-center justify-center ring-4 ring-red-200/50 dark:ring-red-800/50 mb-4">
              <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
            <CardTitle className="text-2xl font-bold text-foreground">Error del servidor</CardTitle>
            <p className="text-muted-foreground">Ha ocurrido un error inesperado. Por favor, intenta nuevamente.</p>
          </CardHeader>

          <CardContent className="space-y-6 py-8 px-8">
            <div className="text-center space-y-2">
              <p className="text-4xl font-bold text-muted-foreground">500</p>
              <p className="text-sm text-muted-foreground">Error interno del servidor</p>
            </div>

            <div className="grid grid-cols-1 gap-3">
              <Button
                onClick={() => window.location.reload()}
                variant="outline"
                className="w-full font-medium shadow-sm hover:shadow-md transition-all duration-200"
                size="lg"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Intentar nuevamente
              </Button>

              <Button
                onClick={() => (window.location.href = '/')}
                className="w-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-300"
                size="lg"
              >
                <Home className="w-4 h-4 mr-2" />
                Ir al inicio
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
