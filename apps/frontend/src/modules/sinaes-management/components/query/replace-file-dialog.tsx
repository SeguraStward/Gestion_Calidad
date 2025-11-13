/**
 * ReplaceFileDialog Component
 * Dialog para reemplazar el archivo de un documento existente
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
import { Label } from '@una-gc/ui/components/label';
import { Alert, AlertDescription } from '@una-gc/ui/components/alert';
import { FileUp, Loader2, File, Info } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { replaceDocumentFile } from '../../services/proof-documents.service';
import type { ProofDocument } from '../../types/proof-documents.types';
import { toast } from 'sonner';

interface ReplaceFileDialogProps {
  document: ProofDocument | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ReplaceFileDialog({
  document,
  open,
  onOpenChange,
}: ReplaceFileDialogProps) {
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const replaceMutation = useMutation({
    mutationFn: async (file: File) => {
      if (!document) throw new Error('No document selected');
      return replaceDocumentFile(document.id, file);
    },
    onSuccess: () => {
      toast.success('Archivo reemplazado exitosamente');
      queryClient.invalidateQueries({ queryKey: ['proof-documents'] });
      handleClose();
    },
    onError: (error: any) => {
      console.error('Error replacing file:', error);
      toast.error(error?.response?.data?.message || 'Error al reemplazar el archivo');
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedFile) {
      toast.error('Debe seleccionar un archivo');
      return;
    }

    if (!document) return;

    await replaceMutation.mutateAsync(selectedFile);
  };

  const handleClose = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onOpenChange(false);
  };

  const formatFileSize = (bytes: number | undefined): string => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  };

  if (!document) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Reemplazar Archivo</DialogTitle>
          <DialogDescription>
            Documento: <span className="font-mono font-medium">{document.code}</span>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Archivo actual */}
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <p className="mb-2 text-sm font-medium text-gray-700">Archivo actual:</p>
            <div className="flex items-center gap-2">
              <File className="h-4 w-4 text-gray-500" />
              <div className="flex-1">
                <p className="text-sm font-medium">{document.fileName}</p>
                <p className="text-xs text-gray-500">{formatFileSize(document.fileSize)}</p>
              </div>
            </div>
          </div>

          {/* Seleccionar nuevo archivo */}
          <div className="space-y-2">
            <Label htmlFor="file">
              Nuevo archivo <span className="text-red-500">*</span>
            </Label>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={replaceMutation.isPending}
                className="flex-1"
              >
                <FileUp className="mr-2 h-4 w-4" />
                {selectedFile ? 'Cambiar archivo' : 'Seleccionar archivo'}
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                id="file"
                onChange={handleFileChange}
                className="hidden"
                disabled={replaceMutation.isPending}
              />
            </div>
            {selectedFile && (
              <div className="rounded-md border border-green-200 bg-green-50 p-3">
                <div className="flex items-center gap-2">
                  <File className="h-4 w-4 text-green-600" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-green-900">{selectedFile.name}</p>
                    <p className="text-xs text-green-600">{formatFileSize(selectedFile.size)}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Advertencia */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription className="ml-2">
              El archivo anterior se mantendrá en Google Drive (no se eliminará). El nuevo archivo
              se subirá a la misma carpeta y se actualizará la referencia en el documento.
            </AlertDescription>
          </Alert>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={replaceMutation.isPending}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={replaceMutation.isPending || !selectedFile}>
              {replaceMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Reemplazar Archivo
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
