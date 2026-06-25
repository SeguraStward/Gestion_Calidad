'use client'

import { useState, useCallback } from 'react'
import { Card } from '@una-gc/ui/components/card'
import { Button } from '@una-gc/ui/components/button'
import { ChevronLeft, ChevronRight, FileSearch } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@una-gc/ui/components/select'
import { ProofDocumentsFilters } from './proof-documents-filters'
import { ProofDocumentsTable } from './proof-documents-table'
import { DocumentDetailsDialog } from './document-details-dialog'
import { EditDocumentDialog } from './edit-document-dialog'
import { DeleteDocumentDialog } from './delete-document-dialog'
import { useProofDocuments, type ProofDocumentFilters } from '../../services/proof-documents.service'
import type { ProofDocument } from '../../types/proof-documents.types'
import { DialogErrorBoundary } from '@/components/error-boundary/dialog-error-boundary'

export const QueryDocumentsTab = () => {
  const [filters, setFilters] = useState<ProofDocumentFilters>({
    status: 'ALL',
    page: 1,
    limit: 5, // Fixed to 5 items per page
    orderBy: 'createdAt',
    orderDirection: 'desc'
  })

  const [selectedDocument, setSelectedDocument] = useState<ProofDocument | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  // Fetch documents with current filters
  const { data, isLoading, refetch } = useProofDocuments(filters)

  const handleFiltersChange = useCallback((newFilters: ProofDocumentFilters) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
      page: 1 // Reset to first page when filters change
    }))
  }, [])

  const handleSearch = useCallback(() => {
    refetch()
  }, [refetch])

  const handleClear = useCallback(() => {
    setFilters({
      status: 'ALL',
      page: 1,
      limit: 5,
      orderBy: 'createdAt',
      orderDirection: 'desc'
    })
  }, [])

  const handlePageChange = useCallback((newPage: number) => {
    setFilters(prev => ({ ...prev, page: newPage }))
  }, [])

  const handleViewDetails = useCallback((document: ProofDocument) => {
    setSelectedDocument(document)
    setIsDialogOpen(true)
  }, [])

  const handleEdit = useCallback((document: ProofDocument) => {
    setSelectedDocument(document)
    setIsEditDialogOpen(true)
  }, [])

  const handleDelete = useCallback((document: ProofDocument) => {
    setSelectedDocument(document)
    setIsDeleteDialogOpen(true)
  }, [])

  const totalPages = data?.meta?.totalPages || 1
  const currentPage = data?.meta?.page || 1
  const total = data?.meta?.total || 0
  // Derive limit from the backend response so the displayed range matches the
  // server's pagination contract; fall back to a sane default for the first render.
  const limit = data?.meta?.limit || 5

  const startItem = total === 0 ? 0 : (currentPage - 1) * limit + 1
  const endItem = Math.min(currentPage * limit, total)

  return (
    <div className="h-full flex flex-col space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileSearch className="h-6 w-6 text-primary" />
          <div>
            <h3 className="text-lg font-semibold">Consulta de Documentos Probatorios</h3>
            <p className="text-sm text-muted-foreground">
              Busca y consulta documentos probatorios usando filtros avanzados
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <ProofDocumentsFilters
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onSearch={handleSearch}
        onClear={handleClear}
      />

      {/* Results Table */}
      <Card className="flex-1 flex flex-col">
        <div className="overflow-auto h-[400px]">
          <ProofDocumentsTable
            documents={data?.data || []}
            isLoading={isLoading}
            onViewDetails={handleViewDetails}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </div>

        {/* Pagination */}
        {data && data.data.length > 0 && (
          <div className="border-t p-4 flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Mostrando {startItem} a {endItem} de {total} resultados
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1 || isLoading}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Anterior
              </Button>
              <span className="text-sm px-4">
                Página {currentPage} de {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages || isLoading}
              >
                Siguiente
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Document Details Dialog with History */}
      <DialogErrorBoundary>
        <DocumentDetailsDialog
          document={selectedDocument}
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
        />
      </DialogErrorBoundary>

      {/* Edit Document Dialog */}
      <DialogErrorBoundary>
        <EditDocumentDialog
          document={selectedDocument}
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
        />
      </DialogErrorBoundary>

      {/* Delete Document Dialog */}
      <DialogErrorBoundary>
        <DeleteDocumentDialog
          document={selectedDocument}
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
        />
      </DialogErrorBoundary>
    </div>
  )
}
