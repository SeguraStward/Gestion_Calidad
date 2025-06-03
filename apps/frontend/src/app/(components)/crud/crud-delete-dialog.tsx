// CrudDeleteDialog.tsx
import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Button,
} from '@una-gc/ui/components'

export const CrudDeleteDialog = ({
  isOpen,
  entityName,
  onCancel,
  onConfirm,
  isProcessing,
}: {
  isOpen: boolean
  entityName: string
  onCancel: () => void
  onConfirm: () => void
  isProcessing: boolean
}) => (
  <Dialog open={isOpen} onOpenChange={onCancel}>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Confirmar eliminación</DialogTitle>
        <DialogDescription>
          ¿Está seguro de eliminar este {entityName.toLowerCase()}? Esta acción no se puede deshacer.
        </DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <Button variant="outline" onClick={onCancel} disabled={isProcessing}>
          Cancelar
        </Button>
        <Button 
          variant="destructive" 
          onClick={onConfirm}
          disabled={isProcessing}
        >
          {isProcessing ? 'Eliminando...' : 'Eliminar'}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
)