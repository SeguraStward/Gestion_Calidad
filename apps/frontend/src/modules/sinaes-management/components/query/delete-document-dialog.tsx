/**
 * DeleteDocumentDialog
 *
 * Shows the blast radius BEFORE the user confirms. Fetches a deletion preview
 * from the backend so the user sees:
 *   - which extra files (besides the main one) live in the upload folder and
 *     will be wiped too (e.g. _carreras.txt + sibling files from the same
 *     multi-file upload).
 *   - how many careers lose the association.
 *   - whether the parent type folder will also be removed (i.e. this was the
 *     last document of that type for the evidence).
 *
 * Legacy documents (no per-upload folder) get a more conservative warning
 * because only the main file is removed.
 */

'use client'

import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@una-gc/ui/components/dialog'
import { Button } from '@una-gc/ui/components/button'
import { Alert, AlertDescription } from '@una-gc/ui/components/alert'
import { Badge } from '@una-gc/ui/components/badge'
import {
  AlertTriangle,
  FileX,
  FileText,
  Folder,
  GraduationCap,
  Loader2,
} from 'lucide-react'
import {
  useDeleteProofDocument,
  useProofDocumentDeletionPreview,
} from '../../services/proof-documents.service'
import type { ProofDocument } from '../../types/proof-documents.types'
import { useQueryClient } from '@tanstack/react-query'

interface DeleteDocumentDialogProps {
  document: ProofDocument | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DeleteDocumentDialog({
  document,
  open,
  onOpenChange,
}: DeleteDocumentDialogProps) {
  const queryClient = useQueryClient()
  const deleteMutation = useDeleteProofDocument()
  const {
    data: preview,
    isLoading: previewLoading,
    isError: previewError,
  } = useProofDocumentDeletionPreview(document?.id, open && !!document)

  const handleDelete = async () => {
    if (!document) return
    try {
      await deleteMutation.mutateAsync(document.id)
      queryClient.invalidateQueries({ queryKey: ['proof-documents'] })
      onOpenChange(false)
    } catch (error) {
      console.error('Error deleting document:', error)
    }
  }

  if (!document) return null

  // Non-main files that would be wiped together with the document. Drive
  // recursive delete removes everything inside the upload folder, so we list
  // each extra file by name to set the user's expectations.
  const extraFiles = (preview?.driveFiles ?? []).filter(
    (f) => f.id !== document.googleDriveFileId,
  )

  // The preview can arrive partial (e.g. an older backend that doesn't return
  // `typeFolder`). Read every nested field through safe locals so a missing
  // property never throws during render and crashes the whole page.
  const typeFolderWillBeDeleted = preview?.typeFolder?.willBeDeleted ?? false
  const careerNames = preview?.careerNames ?? []
  const careerCount = preview?.careerCount ?? careerNames.length

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="rounded-full bg-red-100 p-2">
              <FileX className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <DialogTitle>Eliminar Documento Probatorio</DialogTitle>
              <DialogDescription>Esta acción no se puede deshacer</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
          {/* Documento a eliminar */}
          <div className="rounded-lg border bg-muted/30 p-3">
            <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">
              Documento
            </p>
            <p className="font-semibold leading-tight">{document.name}</p>
            <p className="font-mono text-xs text-muted-foreground">{document.code}</p>
            <p className="text-xs text-muted-foreground mt-1 truncate">{document.fileName}</p>
          </div>

          {/* Loading state */}
          {previewLoading && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Calculando lo que se eliminará...
            </div>
          )}

          {previewError && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="ml-2 text-xs">
                No se pudo cargar la vista previa. Aun así puedes continuar con la eliminación; se aplicarán las reglas estándar.
              </AlertDescription>
            </Alert>
          )}

          {preview && (
            <>
              {/* Multi-file warning */}
              {extraFiles.length > 0 && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription className="ml-2">
                    <p className="font-medium mb-1">
                      Esta subida contiene {extraFiles.length + 1} archivo{extraFiles.length + 1 === 1 ? '' : 's'} en la misma carpeta.
                    </p>
                    <p className="text-xs">
                      Al eliminar este documento se borrarán también:
                    </p>
                    <ul className="mt-2 space-y-1 text-xs">
                      {extraFiles.slice(0, 8).map((f) => (
                        <li key={f.id} className="flex items-center gap-1.5">
                          {f.isFolder ? (
                            <Folder className="h-3 w-3 flex-shrink-0" />
                          ) : (
                            <FileText className="h-3 w-3 flex-shrink-0" />
                          )}
                          <span className="truncate">{f.name}</span>
                        </li>
                      ))}
                      {extraFiles.length > 8 && (
                        <li className="text-muted-foreground italic">
                          …y {extraFiles.length - 8} archivo(s) más.
                        </li>
                      )}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              {/* Type-folder cleanup notice */}
              {typeFolderWillBeDeleted && (
                <Alert>
                  <Folder className="h-4 w-4" />
                  <AlertDescription className="ml-2 text-xs">
                    Era el último documento de su tipo en esta evidencia. La carpeta del tipo también se eliminará de Google Drive.
                  </AlertDescription>
                </Alert>
              )}

              {/* Legacy notice */}
              {preview.isLegacyDocument && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription className="ml-2 text-xs">
                    Documento subido con el sistema anterior — solo se eliminará el archivo principal de Drive; la carpeta de evidencia se conserva intacta.
                  </AlertDescription>
                </Alert>
              )}

              {/* Career impact */}
              <div className="rounded-lg border p-3">
                <div className="flex items-center gap-2 text-sm">
                  <GraduationCap className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">
                    {careerCount} carrera{careerCount === 1 ? '' : 's'} perderá{careerCount === 1 ? '' : 'n'} la vinculación
                  </span>
                </div>
                {careerNames.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {careerNames.slice(0, 6).map((name) => (
                      <Badge key={name} variant="secondary" className="text-[10px]">
                        {name}
                      </Badge>
                    ))}
                    {careerNames.length > 6 && (
                      <Badge variant="outline" className="text-[10px]">
                        +{careerNames.length - 6} más
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            </>
          )}

          {/* Resumen final */}
          <div className="text-xs text-muted-foreground border-t pt-3">
            <p className="font-medium mb-1">Resumen de la operación:</p>
            <ul className="ml-4 list-disc space-y-0.5">
              <li>Se eliminará el registro del documento en la base de datos</li>
              <li>
                Se eliminarán los archivos de Google Drive
                {preview && extraFiles.length > 0 ? ` (${extraFiles.length + 1} en total)` : ''}
              </li>
              <li>
                Se desvincularán {preview ? careerCount : 'las'} carrera{(preview ? careerCount : 2) === 1 ? '' : 's'}
              </li>
              <li>Se registrará la eliminación en el historial</li>
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
            disabled={deleteMutation.isPending || previewLoading}
          >
            {deleteMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Eliminar Permanentemente
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
