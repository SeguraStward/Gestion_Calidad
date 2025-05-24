'use client'

import { AlertMessage } from '@/app/(components)/ui/alert-message'

interface DeleteConfirmationDialogProps {
  open: boolean
  onOpenChange: (isOpen: boolean) => void
  onConfirm: () => void
}

export const DeleteConfirmationDialog = ({ open, onOpenChange, onConfirm }: DeleteConfirmationDialogProps) => (
  <AlertMessage
    title="¿Estás seguro?"
    description="Esta acción eliminará la asignación permanentemente."
    confirmText="Sí, eliminar"
    cancelText="Cancelar"
    variant="danger"
    open={open}
    onOpenChange={onOpenChange}
    onConfirm={onConfirm}
  />
)
