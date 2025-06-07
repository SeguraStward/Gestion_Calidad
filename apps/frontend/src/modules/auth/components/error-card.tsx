import { AlertTriangle, XCircle } from 'lucide-react'
import { Card, CardContent } from '@una-gc/ui/components/card'
import { Badge } from '@una-gc/ui/components/badge'

interface ErrorCardProps {
  title?: string
  message?: string
  variant?: 'error' | 'warning'
}

export const ErrorCard: React.FC<ErrorCardProps> = ({
  title = '¡Ups! Algo salió mal',
  message = 'No pudimos procesar tu solicitud. Intentá más tarde o volvé al inicio.',
  variant = 'error'
}) => {
  const isError = variant === 'error'

  return (
    <Card className="w-full max-w-md backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 border-0 shadow-2xl">
      <CardContent className="p-8 text-center space-y-6">
        <div
          className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${
            isError ? 'bg-red-100 dark:bg-red-900/20' : 'bg-yellow-100 dark:bg-yellow-900/20'
          }`}
        >
          {isError ? (
            <XCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
          ) : (
            <AlertTriangle className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
          )}
        </div>

        <div className="space-y-3">
          <h2
            className={`text-xl font-bold ${isError ? 'text-red-700 dark:text-red-300' : 'text-yellow-700 dark:text-yellow-300'}`}
          >
            {title}
          </h2>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{message}</p>
        </div>

        <Badge variant={isError ? 'destructive' : 'secondary'} className="px-3 py-1 text-xs font-medium">
          {isError ? 'Error de autenticación' : 'Advertencia'}
        </Badge>
      </CardContent>
    </Card>
  )
}
