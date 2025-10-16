'use client'

import { useState, useMemo } from 'react'
import { Plus, Search, Edit, Trash2, FileText, ChevronLeft, ChevronRight } from 'lucide-react'
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
} from '@una-gc/ui/components'
import { ProofDocumentTypeForm } from './proof-document-type-form'
import { useProofDocumentTypes } from '../../services/proof-document-types.service'

export const DocumentTypesTab = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<any>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  const { data: documentTypesResponse, isLoading } = useProofDocumentTypes()

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

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(Number(value))
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
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Mostrar:</span>
              <Select value={String(itemsPerPage)} onValueChange={handleItemsPerPageChange}>
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Badge variant="outline">
              {filteredDocumentTypes.length} resultado{filteredDocumentTypes.length !== 1 ? 's' : ''}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Document Types Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Lista de Tipos de Documentos
          </CardTitle>
          <CardDescription>
            Todos los tipos de documentos probatorios configurados en el sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredDocumentTypes.length === 0 ? (
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
          ) : (
            <>
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
                    <TableRow key={docType.id}>
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
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4 px-2">
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
                      <ChevronLeft className="h-4 w-4" />
                      Anterior
                    </Button>
                    <div className="text-sm">
                      Página {currentPage} de {totalPages}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Siguiente
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
