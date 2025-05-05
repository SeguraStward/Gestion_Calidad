// src/(components)/auth/error-card.tsx
import { AlertTriangle } from 'lucide-react'
import { Card, CardContent } from '@una-gc/ui/components/card'

interface ErrorCardProps {
  title?: string
  message?: string
}

export const ErrorCard: React.FC<ErrorCardProps> = ({
  title = '¡Ups! Algo salió mal',
  message = 'No pudimos procesar tu solicitud. Intentá más tarde o volvé al inicio.'
}) => {
  return (
    <Card className="w-full max-w-md text-center border-red-400">
      <CardContent className="p-6 flex flex-col items-center justify-center space-y-4">
        <AlertTriangle className="text-red-500 w-12 h-12" />
        <h2 className="text-xl font-semibold text-red-600">{title}</h2>
        <p className="text-sm text-muted-foreground">{message}</p>
      </CardContent>
    </Card>
  )
}
