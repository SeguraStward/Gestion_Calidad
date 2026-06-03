/**
 * DocumentDetailsDialog Component
 * Dialog para mostrar detalles del documento con tabs (Info + Historial)
 */

'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@una-gc/ui/components/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@una-gc/ui/components/tabs';
import { Badge } from '@una-gc/ui/components/badge';
import { Button } from '@una-gc/ui/components/button';
import { Separator } from '@una-gc/ui/components/separator';
import {
  FileText,
  Calendar,
  Building2,
  Download,
  History,
  Info,
  FileUp,
  Plus,
  Trash2,
  Loader2,
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { DocumentHistoryTimeline } from '../history/document-history-timeline';
import { DocumentHistoryTable } from '../history/document-history-table';
import {
  useProofDocumentFiles,
  deleteProofDocumentFile,
  addProofDocumentFile,
  type ProofDocumentFile,
} from '../../services/proof-documents.service';
import type { ProofDocument } from '../../types/proof-documents.types';

interface DocumentDetailsDialogProps {
  document: ProofDocument | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onReplaceFile?: (document: ProofDocument) => void;
}

export function DocumentDetailsDialog({
  document,
  open,
  onOpenChange,
  onReplaceFile,
}: DocumentDetailsDialogProps) {
  const [viewMode, setViewMode] = React.useState<'timeline' | 'table'>('timeline');
  const [isAddingFile, setIsAddingFile] = React.useState(false);
  const [deletingId, setDeletingId] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  // List every file in the document's Drive folder (only while the dialog is open).
  const {
    data: filesData,
    isLoading: filesLoading,
    isError: filesError,
  } = useProofDocumentFiles(document?.id, open && !!document);
  const files = filesData?.files ?? [];
  const isLegacy = filesData?.isLegacy ?? false;
  const driveUnavailable = filesData?.driveUnavailable ?? false;
  // Per-file add/delete need a live Drive connection and a per-upload folder.
  const canManageFiles = !isLegacy && !driveUnavailable;

  const refreshFiles = () => {
    queryClient.invalidateQueries({ queryKey: ['proof-documents', document?.id, 'files'] });
    // Primary file (and therefore the table row) may have changed.
    queryClient.invalidateQueries({ queryKey: ['proof-documents'] });
  };

  const handleAddFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // permite volver a elegir el mismo archivo
    if (!file || !document) return;
    setIsAddingFile(true);
    try {
      await addProofDocumentFile(document.id, file);
      toast.success(`Archivo "${file.name}" agregado`);
      refreshFiles();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'No se pudo agregar el archivo');
    } finally {
      setIsAddingFile(false);
    }
  };

  const handleDeleteFile = async (file: ProofDocumentFile) => {
    if (!document) return;
    const ok = window.confirm(
      file.isPrimary
        ? `"${file.name}" es el archivo principal. Si lo eliminas, otro archivo pasará a ser el principal. ¿Continuar?`
        : `¿Eliminar el archivo "${file.name}"? Esta acción no se puede deshacer.`,
    );
    if (!ok) return;
    setDeletingId(file.id);
    try {
      await deleteProofDocumentFile(document.id, file.id);
      toast.success(`Archivo "${file.name}" eliminado`);
      refreshFiles();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'No se pudo eliminar el archivo');
    } finally {
      setDeletingId(null);
    }
  };

  if (!document) return null;

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'N/A';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <DialogTitle className="text-xl flex items-center gap-2">
                <FileText className="h-5 w-5" />
                {document.name}
              </DialogTitle>
              <DialogDescription className="mt-1">
                Código: <span className="font-mono font-medium">{document.code}</span>
              </DialogDescription>
            </div>

            <Badge variant={document.status === 'ACTIVE' ? 'default' : 'secondary'}>
              {document.status === 'ACTIVE' ? 'Activo' : 'Inactivo'}
            </Badge>
          </div>
        </DialogHeader>

        <Tabs defaultValue="info" className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="info" className="flex items-center gap-2">
              <Info className="h-4 w-4" />
              Información
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="h-4 w-4" />
              Historial
            </TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="flex-1 overflow-y-auto space-y-4">
            {/* Descripción */}
            {document.description && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">Descripción</h3>
                <p className="text-sm">{document.description}</p>
              </div>
            )}

            <Separator />

            {/* Archivos del documento */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">
                  Archivos del documento{files.length > 0 ? ` (${files.length})` : ''}
                </h3>
                {canManageFiles && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isAddingFile}
                    className="flex items-center gap-2"
                  >
                    {isAddingFile ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Plus className="h-4 w-4" />
                    )}
                    Agregar archivo
                  </Button>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  onChange={handleAddFile}
                />
              </div>

              {driveUnavailable && (
                <div className="rounded-md border border-amber-300 bg-amber-50 p-3 text-xs text-amber-800">
                  No se pudo conectar con Google Drive (tu sesión de Google pudo
                  expirar). Se muestra solo el archivo principal. Cerrá sesión y
                  volvé a iniciar con Google para ver y gestionar todos los archivos.
                </div>
              )}

              <div className="text-sm">
                <span className="text-muted-foreground">Tipo de documento:</span>
                <span className="ml-2 font-medium">
                  {document.proofDocumentType?.name || 'N/A'}
                </span>
              </div>

              {filesLoading ? (
                <div className="flex items-center gap-2 py-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Cargando archivos...
                </div>
              ) : filesError ? (
                <p className="text-sm text-destructive">
                  No se pudieron cargar los archivos.
                </p>
              ) : files.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Este documento no tiene archivos.
                </p>
              ) : (
                <div className="space-y-2">
                  {files.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center gap-3 rounded-lg border p-3"
                    >
                      <FileText className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="truncate text-sm font-medium" title={file.name}>
                            {file.name}
                          </p>
                          {file.isPrimary && (
                            <Badge variant="secondary" className="text-[10px]">
                              Principal
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {formatFileSize(file.size)}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        title="Descargar"
                        onClick={() => window.open(file.url, '_blank')}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      {canManageFiles && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
                          title="Eliminar archivo"
                          disabled={deletingId === file.id}
                          onClick={() => handleDeleteFile(file)}
                        >
                          {deletingId === file.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <div className="flex flex-wrap items-center gap-2 pt-1">
                {onReplaceFile && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onReplaceFile(document)}
                    className="flex items-center gap-2"
                  >
                    <FileUp className="h-4 w-4" />
                    Reemplazar principal
                  </Button>
                )}
                {isLegacy && (
                  <p className="self-center text-xs text-muted-foreground">
                    Documento del sistema anterior: solo se gestiona el archivo principal.
                  </p>
                )}
              </div>
            </div>

            <Separator />

            {/* Evidencia */}
            {document.evidence && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold">Evidencia SINAES</h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Código:</span>
                    <span className="ml-2 font-mono font-medium">{document.evidence.code}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Nombre:</span>
                    <span className="ml-2">{document.evidence.name}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Carreras */}
            {document.careerProofDocuments && document.careerProofDocuments.length > 0 && (
              <>
                <Separator />
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    Carreras
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {document.careerProofDocuments.map((cp) => (
                      <Badge key={cp.id} variant="outline">
                        {cp.career?.name || cp.careerId}
                      </Badge>
                    ))}
                  </div>
                </div>
              </>
            )}

            <Separator />

            {/* Metadatos */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold">Metadatos</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-1">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    Creado:
                  </span>
                  <p className="font-medium">
                    {format(new Date(document.createdAt), 'PPp', { locale: es })}
                  </p>
                </div>
                <div className="space-y-1">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    Actualizado:
                  </span>
                  <p className="font-medium">
                    {format(new Date(document.updatedAt), 'PPp', { locale: es })}
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="history" className="flex-1 overflow-hidden flex flex-col space-y-4">
            {/* Toggle para cambiar vista */}
            <div className="flex items-center justify-between flex-shrink-0">
              <h3 className="text-sm font-medium text-muted-foreground">
                Registro de todos los cambios en este documento
              </h3>
              <div className="flex gap-2">
                <Button
                  variant={viewMode === 'timeline' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('timeline')}
                >
                  Timeline
                </Button>
                <Button
                  variant={viewMode === 'table' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('table')}
                >
                  Tabla
                </Button>
              </div>
            </div>

            <div className="flex-1 overflow-auto min-h-0">
              {viewMode === 'timeline' ? (
                <DocumentHistoryTimeline documentId={document.id} maxItems={30} />
              ) : (
                <DocumentHistoryTable documentId={document.id} pageSize={15} />
              )}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
