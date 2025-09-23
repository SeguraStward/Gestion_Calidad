'use client'

import { useState } from 'react'
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@una-gc/ui/components'
import { Alert, AlertDescription, AlertTitle } from '@una-gc/ui/components'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@una-gc/ui/components'
import { RefreshCw, AlertTriangle, CheckCircle, XCircle } from 'lucide-react'
import { useAutoNumbering } from '../../hooks/use-auto-numbering'

interface RecalculateCodesAdminProps {
  className?: string
}

export const RecalculateCodesAdmin = ({ className }: RecalculateCodesAdminProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState<string>('')

  const { recalculateAllCodes, isGenerating, error, clearError } = useAutoNumbering()

  const handleRecalculate = async () => {
    setStatus('idle')
    setErrorMessage('')
    clearError()

    try {
      await recalculateAllCodes()
      setStatus('success')
      setTimeout(() => {
        setIsDialogOpen(false)
        setStatus('idle')
      }, 2000)
    } catch (err) {
      setStatus('error')
      setErrorMessage(err instanceof Error ? err.message : 'Error desconocido')
    }
  }

  const handleDialogClose = () => {
    if (!isGenerating) {
      setIsDialogOpen(false)
      setStatus('idle')
      setErrorMessage('')
      clearError()
    }
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <RefreshCw className="h-5 w-5" />
          Recálculo de Códigos SINAES
        </CardTitle>
        <CardDescription>
          Herramienta administrativa para reorganizar y recalcular todos los códigos del sistema SINAES
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>¡Atención!</AlertTitle>
            <AlertDescription>
              Esta operación recalculará TODOS los códigos de dimensiones, componentes, criterios, estándares y evidencias.
              Los códigos existentes serán reemplazados siguiendo las reglas de numeración automática.
            </AlertDescription>
          </Alert>

          <div className="space-y-2 text-sm text-muted-foreground">
            <h4 className="font-medium text-foreground">Reglas de numeración:</h4>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li><strong>Dimensiones:</strong> 1, 2, 3, 4...</li>
              <li><strong>Componentes:</strong> 1.1, 1.2, 2.1, 2.2...</li>
              <li><strong>Criterios:</strong> 1.1.1, 1.1.2, 1.2.1, 2.1.1...</li>
              <li><strong>Estándares:</strong> 1.1.1.1, 1.1.1.2, 1.1.2.1...</li>
              <li><strong>Evidencias:</strong> 1, 2, 3, 4... (numeración global secuencial)</li>
            </ul>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
            <DialogTrigger asChild>
              <Button
                variant="destructive"
                className="w-full"
                onClick={() => setIsDialogOpen(true)}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Recalcular Todos los Códigos
              </Button>
            </DialogTrigger>

            <DialogContent>
              <DialogHeader>
                <DialogTitle>Confirmar Recálculo de Códigos</DialogTitle>
                <DialogDescription>
                  ¿Está seguro de que desea recalcular todos los códigos del sistema SINAES?
                  Esta acción no se puede deshacer y afectará a todas las entidades existentes.
                </DialogDescription>
              </DialogHeader>

              {status === 'success' && (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertTitle>¡Recálculo Completado!</AlertTitle>
                  <AlertDescription>
                    Todos los códigos han sido recalculados exitosamente.
                  </AlertDescription>
                </Alert>
              )}

              {(status === 'error' || error) && (
                <Alert variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <AlertTitle>Error en el Recálculo</AlertTitle>
                  <AlertDescription>
                    {errorMessage || error || 'Ocurrió un error durante el recálculo de códigos.'}
                  </AlertDescription>
                </Alert>
              )}

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={handleDialogClose}
                  disabled={isGenerating}
                >
                  Cancelar
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleRecalculate}
                  disabled={isGenerating || status === 'success'}
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Recalculando...
                    </>
                  ) : status === 'success' ? (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Completado
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Confirmar Recálculo
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  )
}
