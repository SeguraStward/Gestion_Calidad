'use client'

import { useState, useMemo } from 'react'
import { Plus, Search, Edit, Trash2, FileText, ChevronLeft, ChevronRight } from 'lucide-react'
import { toast } from 'sonner'
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Badge,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  ScrollArea,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@una-gc/ui/components'
import { ProofDocumentTypeForm } from './proof-document-type-form'
import { useProofDocumentTypes, useDeleteProofDocumentType } from '../../services/proof-document-types.service'

export const DocumentTypesTab = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<any>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5 // Fixed to 5 items per page
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<any>(null)

  const { data: documentTypesResponse, isLoading } = useProofDocumentTypes()
  const deleteMutation = useDeleteProofDocumentType()

  // Handle paginated response
  const documentTypes = Array.isArray(documentTypesResponse)
    ? documentTypesResponse
    : documentTypesResponse?.data || []

  const filteredDocumentTypes = documentTypes.filter((docType: any) =>
    docType.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    docType.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    docType.prefix?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    docType.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Pagination logic
  const totalPages = Math.ceil(filteredDocumentTypes.length / itemsPerPage)
  const paginatedDocumentTypes = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return filteredDocumentTypes.slice(startIndex, endIndex)
  }, [filteredDocumentTypes, currentPage, itemsPerPage])

  // Reset to page 1 when search term changes
  const handleSearchChange = (value: string) => {
    setSearchTerm(value)
    setCurrentPage(1)
  }

  const handleCreate = () => {
    setEditingItem(null)
    setIsCreateDialogOpen(true)
  }

  const handleEdit = (docType: any) => {
    setEditingItem(docType)
    setIsCreateDialogOpen(true)
  }

  const handleFormSuccess = () => {
    setIsCreateDialogOpen(false)
    setEditingItem(null)
  }

  const handleDeleteClick = (docType: any) => {
    setItemToDelete(docType)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return

    try {
      await deleteMutation.mutateAsync(itemToDelete.id)
      setDeleteDialogOpen(false)
      setItemToDelete(null)
      toast.success('Tipo de documento eliminado correctamente')
    } catch (error: any) {
      console.error('Error deleting document type:', error)

      // El hook genérico ya muestra el toast de error, pero podemos personalizar el mensaje
      const errorMessage = error.response?.data?.message || error.message

      if (errorMessage?.includes('associated proof documents') ||
        errorMessage?.includes('document counter')) {
        toast.error('No se puede eliminar el tipo de documento', {
          description: 'Este tipo de documento tiene documentos probatorios asociados. Elimine primero los documentos asociados.'
        })
      }

      // Cerrar el diálogo incluso si hay error
      setDeleteDialogOpen(false)
      setItemToDelete(null)
    }
  }

  const getStatusBadge = (isActive: boolean) => {
    return (
      <Badge variant={isActive ? "default" : "secondary"}>
        {isActive ? "Activo" : "Inactivo"}
      </Badge>
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-muted rounded animate-pulse" />
        <div className="h-64 bg-muted rounded animate-pulse" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Tipos de Documentos Probatorios</h3>
          <p className="text-sm text-muted-foreground">
            Gestiona los tipos de documentos que se pueden subir como evidencias
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleCreate}>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Tipo
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingItem ? 'Editar Tipo de Documento' : 'Nuevo Tipo de Documento'}
              </DialogTitle>
              <DialogDescription>
                {editingItem
                  ? 'Modifica los datos del tipo de documento.'
                  : 'Crea un nuevo tipo de documento probatorio.'
                }
              </DialogDescription>
            </DialogHeader>
            <ProofDocumentTypeForm
              initialData={editingItem}
              onSuccess={handleFormSuccess}
              onCancel={() => setIsCreateDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre, código, prefijo o descripción..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>
            <Badge variant="outline">
              {filteredDocumentTypes.length} resultado{filteredDocumentTypes.length !== 1 ? 's' : ''}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Document Types Table */}
      <Card className="flex-1 flex flex-col">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Lista de Tipos de Documentos
          </CardTitle>
          <CardDescription>
            Todos los tipos de documentos probatorios configurados en el sistema
          </CardDescription>
        </CardHeader>
        <div className="flex-1 overflow-auto">
          {filteredDocumentTypes.length === 0 ? (
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                {searchTerm ? (
                  <div>
                    <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No se encontraron tipos de documentos que coincidan con "{searchTerm}"</p>
                  </div>
                ) : (
                  <div>
                    <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No hay tipos de documentos configurados</p>
                    <Button
                      variant="outline"
                      className="mt-2"
                      onClick={handleCreate}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Crear primer tipo
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          ) : (
            <CardContent>
              <div className="border rounded-lg overflow-auto h-[400px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Prefijo</TableHead>
                      <TableHead>Descripción</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Código</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedDocumentTypes.map((docType: any) => (
                      <TableRow key={docType.id} className="hover:bg-muted/50">
                        <TableCell className="font-medium">
                          {docType.name}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="font-mono">
                            {docType.prefix}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-xs">
                          <span className="text-sm text-muted-foreground truncate">
                            {docType.description || 'Sin descripción'}
                          </span>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(docType.status === 'ACTIVE')}
                        </TableCell>
                        <TableCell>
                          <span className="text-sm font-mono">
                            {docType.code || 'N/A'}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(docType)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive hover:text-destructive"
                              onClick={() => handleDeleteClick(docType)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          )}
        </div>

        {/* Pagination */}
        {filteredDocumentTypes.length > 0 && (
          <div className="border-t p-4 flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Mostrando {((currentPage - 1) * itemsPerPage) + 1} a {Math.min(currentPage * itemsPerPage, filteredDocumentTypes.length)} de {filteredDocumentTypes.length} resultados
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
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
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                Siguiente
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará el tipo de documento{' '}
              <span className="font-semibold">{itemToDelete?.name}</span> permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setDeleteDialogOpen(false)
              setItemToDelete(null)
            }}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? 'Eliminando...' : 'Eliminar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
