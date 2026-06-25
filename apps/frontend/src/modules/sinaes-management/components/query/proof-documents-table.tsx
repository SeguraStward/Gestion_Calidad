'use client'

import { useMemo } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@una-gc/ui/components/table'
import { Button } from '@una-gc/ui/components/button'
import { Badge } from '@una-gc/ui/components/badge'
import { Download, Eye, FileText, Calendar, Edit, Trash2 } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import type { ProofDocument } from '../../types/proof-documents.types'
import { downloadProofDocument } from '../../services/proof-documents.service'

interface ProofDocumentsTableProps {
  documents: ProofDocument[]
  isLoading: boolean
  onViewDetails?: (document: ProofDocument) => void
  onEdit?: (document: ProofDocument) => void
  onDelete?: (document: ProofDocument) => void
}

export const ProofDocumentsTable = ({
  documents,
  isLoading,
  onViewDetails,
  onEdit,
  onDelete
}: ProofDocumentsTableProps) => {
  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'N/A'
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy HH:mm', { locale: es })
    } catch {
      return dateString
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-2">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
          <p className="text-sm text-muted-foreground">Cargando documentos...</p>
        </div>
      </div>
    )
  }

  if (!documents || documents.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-2">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto" />
          <p className="text-sm text-muted-foreground">
            No se encontraron documentos con los filtros seleccionados
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[120px]">Código</TableHead>
            <TableHead>Nombre</TableHead>
            <TableHead className="w-[150px]">Tipo</TableHead>
            <TableHead className="w-[200px]">Evidencia</TableHead>
            <TableHead className="w-[100px]">Archivo</TableHead>
            <TableHead className="w-[100px]">Tamaño</TableHead>
            <TableHead className="w-[150px]">Fecha</TableHead>
            <TableHead className="w-[100px]">Estado</TableHead>
            <TableHead className="w-[220px] text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {documents.map((document) => (
            <TableRow key={document.id} className="hover:bg-muted/50">
              <TableCell className="font-medium">{document.code}</TableCell>
              <TableCell>
                <div className="flex flex-col">
                  <span className="font-medium">{document.name}</span>
                  {document.description && (
                    <span className="text-xs text-muted-foreground truncate max-w-[300px]">
                      {document.description}
                    </span>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <span className="text-sm">
                  {document.proofDocumentType?.prefix || 'N/A'}
                </span>
              </TableCell>
              <TableCell>
                <div
                  className="text-sm truncate max-w-[200px]"
                  title={document.evidence?.name ?? 'Sin evidencia asociada'}
                >
                  {document.evidence
                    ? `${document.evidence.code} - ${document.evidence.name}`
                    : <span className="text-muted-foreground">Sin evidencia</span>}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground uppercase">
                    {document.fileType}
                  </span>
                </div>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {formatFileSize(document.fileSize)}
              </TableCell>
              <TableCell className="text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {formatDate(document.createdAt)}
                </div>
              </TableCell>
              <TableCell>
                <Badge variant={document.status === 'ACTIVE' ? 'default' : 'secondary'}>
                  {document.status === 'ACTIVE' ? 'Activo' : 'Inactivo'}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-1">
                  {onViewDetails && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onViewDetails(document)}
                      className="h-8 w-8 p-0"
                      title="Ver detalles"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  )}
                  {onEdit && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onEdit(document)}
                      className="h-8 w-8 p-0"
                      title="Editar documento"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => downloadProofDocument(document)}
                    className="h-8 w-8 p-0"
                    title="Descargar documento"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  {onDelete && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onDelete(document)}
                      className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
                      title="Eliminar documento"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
