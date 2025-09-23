'use client'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@una-gc/ui/components'
import { useProofDocumentTypes } from '../../services/proof-document-types.service'
import { useDocumentAssignment } from '../../store/document-assignment.store'
import type { ProofDocumentType } from '../../types/proof-document-types.types'

export const DocumentTypeSelector = () => {
  const { data: documentTypesResponse, isLoading } = useProofDocumentTypes()
  const { selectedDocumentTypeId, setSelectedDocumentTypeId } = useDocumentAssignment()

  // Extraer los datos de la respuesta paginada
  const documentTypes: ProofDocumentType[] = documentTypesResponse?.data || []

  if (isLoading) {
    return (
      <div className="text-sm text-muted-foreground">
        Cargando tipos de documentos...
      </div>
    )
  }

  if (documentTypes.length === 0) {
    return (
      <div className="text-sm text-muted-foreground">
        No hay tipos de documentos disponibles
      </div>
    )
  }

  return (
    <Select
      value={selectedDocumentTypeId || ''}
      onValueChange={setSelectedDocumentTypeId}
    >
      <SelectTrigger>
        <SelectValue placeholder="Selecciona un tipo de documento" />
      </SelectTrigger>
      <SelectContent>
        {documentTypes.map((docType) => (
          <SelectItem key={docType.id} value={docType.id}>
            <div className="flex flex-col">
              <span className="font-medium">{docType.name}</span>
              {docType.description && (
                <span className="text-xs text-muted-foreground">
                  {docType.description}
                </span>
              )}
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}