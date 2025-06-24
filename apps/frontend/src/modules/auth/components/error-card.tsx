'use client'

import { AlertTriangle, AlertCircle, AlertOctagon } from 'lucide-react'
import { Card, CardContent } from '@una-gc/ui/components/card'
import { cn } from '@una-gc/ui/lib/utils'

interface ErrorCardProps {
  title?: string
  message?: string
  severity?: 'error' | 'warning' | 'info'
}

export const ErrorCard: React.FC<ErrorCardProps> = ({
  title = '¡Ups! Algo salió mal',
  message = 'No pudimos procesar tu solicitud. Intentá más tarde o volvé al inicio.',
  severity = 'error'
}) => {
  const iconMap = {
    error: <AlertOctagon className="text-red-500 w-12 h-12" />,
    warning: <AlertTriangle className="text-amber-500 w-12 h-12" />,
    info: <AlertCircle className="text-blue-500 w-12 h-12" />
  }

  const borderColorMap = {
    error: 'border-red-400',
    warning: 'border-amber-400',
    info: 'border-blue-400'
  }

  const titleColorMap = {
    error: 'text-red-600',
    warning: 'text-amber-600',
    info: 'text-blue-600'
  }

  // Ensure title and message are strings
  const safeTitle = typeof title === 'string' ? title : String(title || '¡Ups! Algo salió mal')
  const safeMessage =
    typeof message === 'string'
      ? message
      : String(message || 'No pudimos procesar tu solicitud. Intentá más tarde o volvé al inicio.')

  return (
    <Card className={cn('w-full max-w-md text-center', borderColorMap[severity])}>
      <CardContent className="p-6 flex flex-col items-center justify-center space-y-4">
        {iconMap[severity]}
        <h2 className={cn('text-xl font-semibold', titleColorMap[severity])}>{safeTitle}</h2>
        <p className="text-sm text-muted-foreground">{safeMessage}</p>
      </CardContent>
    </Card>
  )
}
