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
  User,
  Building2,
  Download,
  ExternalLink,
  History,
  Info,
  FileUp,
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { DocumentHistoryTimeline } from '../history/document-history-timeline';
import { DocumentHistoryTable } from '../history/document-history-table';
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

  if (!document) return null;

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'N/A';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleDownload = () => {
    if (document.fileUrl) {
      window.open(document.fileUrl, '_blank');
    }
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

            {/* Información del Archivo */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold">Archivo</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-1">
                  <span className="text-muted-foreground">Nombre del archivo:</span>
                  <p className="font-medium truncate" title={document.fileName}>
                    {document.fileName}
                  </p>
                </div>
                <div className="space-y-1">
                  <span className="text-muted-foreground">Tipo:</span>
                  <p className="font-medium uppercase">{document.fileType}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-muted-foreground">Tamaño:</span>
                  <p className="font-medium">{formatFileSize(document.fileSize)}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-muted-foreground">Tipo de documento:</span>
                  <p className="font-medium">{document.proofDocumentType?.name || 'N/A'}</p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownload}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Descargar
                </Button>
                {onReplaceFile && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onReplaceFile(document)}
                    className="flex items-center gap-2"
                  >
                    <FileUp className="h-4 w-4" />
                    Reemplazar Archivo
                  </Button>
                )}
                {document.googleDriveFileId && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      window.open(
                        `https://drive.google.com/file/d/${document.googleDriveFileId}/view`,
                        '_blank'
                      )
                    }
                    className="flex items-center gap-2"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Ver en Drive
                  </Button>
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
