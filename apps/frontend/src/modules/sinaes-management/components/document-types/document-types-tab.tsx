'use client'

import { useState } from 'react'
import { Plus, Search, Edit, Trash2, FileText } from 'lucide-react'
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
} from '@una-gc/ui/components'
import { ProofDocumentTypeForm } from './proof-document-type-form'
import { useProofDocumentTypes } from '../../services/proof-document-types.service'

export const DocumentTypesTab = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<any>(null)

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
                onChange={(e) => setSearchTerm(e.target.value)}
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
                {filteredDocumentTypes.map((docType: any) => (
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
          )}
        </CardContent>
      </Card>

      {/* Summary Card */}
      {filteredDocumentTypes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Resumen</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {filteredDocumentTypes.length}
                </div>
                <div className="text-sm text-muted-foreground">
                  Tipos configurados
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {filteredDocumentTypes.filter((dt: any) => dt.status === 'ACTIVE').length}
                </div>
                <div className="text-sm text-muted-foreground">
                  Tipos activos
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {filteredDocumentTypes.filter((dt: any) => dt.status === 'INACTIVE').length}
                </div>
                <div className="text-sm text-muted-foreground">
                  Tipos inactivos
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
