/**
 * DeleteDocumentDialog Component
 * Dialog de confirmación para eliminar documentos
 * Advierte sobre la eliminación permanente del archivo en Google Drive
 */

'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@una-gc/ui/components/dialog';
import { Button } from '@una-gc/ui/components/button';
import { Alert, AlertDescription } from '@una-gc/ui/components/alert';
import { AlertTriangle, Loader2, FileX } from 'lucide-react';
import { useDeleteProofDocument } from '../../services/proof-documents.service';
import type { ProofDocument } from '../../types/proof-documents.types';
import { useQueryClient } from '@tanstack/react-query';

interface DeleteDocumentDialogProps {
  document: ProofDocument | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteDocumentDialog({
  document,
  open,
  onOpenChange,
}: DeleteDocumentDialogProps) {
  const queryClient = useQueryClient();
  const deleteMutation = useDeleteProofDocument();

  const handleDelete = async () => {
    if (!document) return;

    try {
      await deleteMutation.mutateAsync(document.id);

      // Invalidar queries para refrescar datos
      queryClient.invalidateQueries({ queryKey: ['proof-documents'] });

      // Cerrar dialog
      onOpenChange(false);
    } catch (error) {
      console.error('Error deleting document:', error);
    }
  };

  if (!document) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="rounded-full bg-red-100 p-2">
              <FileX className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <DialogTitle>Eliminar Documento</DialogTitle>
              <DialogDescription>Esta acción no se puede deshacer</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* Información del documento */}
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-700">Documento a eliminar:</p>
              <p className="font-semibold">{document.name}</p>
              <p className="font-mono text-xs text-gray-500">{document.code}</p>
              <p className="text-sm text-gray-600">{document.fileName}</p>
            </div>
          </div>

          {/* Advertencia de Google Drive */}
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="ml-2">
              <strong>Advertencia:</strong> El archivo también será eliminado de Google Drive de
              forma permanente. No se podrá recuperar después de esta acción.
            </AlertDescription>
          </Alert>

          {/* Información adicional */}
          <div className="text-sm text-gray-600">
            <p>Se eliminarán:</p>
            <ul className="ml-4 mt-2 list-disc space-y-1">
              <li>El registro del documento en la base de datos</li>
              <li>El archivo del documento en Google Drive</li>
              <li>Las relaciones con carreras</li>
              <li>Se registrará en el historial de cambios</li>
            </ul>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={deleteMutation.isPending}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Eliminar Permanentemente
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
