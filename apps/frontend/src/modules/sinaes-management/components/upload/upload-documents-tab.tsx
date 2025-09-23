'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@una-gc/ui/components'
import { Button } from '@una-gc/ui/components'
import { Upload, X, FileText, Users, Tags } from 'lucide-react'
import { useDocumentAssignment } from '../../store/document-assignment.store'
import { FileUploadArea } from './file-upload-area'
import { EvidenceSelector } from './evidence-selector'
import { CareerSelector } from './career-selector'
import { DocumentTypeSelector } from './document-type-selector'
import { SelectedEvidencesList } from './selected-evidences-list'
import { UploadedFilesList } from './uploaded-files-list'

export const UploadDocumentsTab = () => {
  const {
    selectedEvidences,
    uploadedFiles,
    selectedCareerIds,
    selectedDocumentTypeId,
    canSubmit,
    isUploading,
    reset
  } = useDocumentAssignment()

  const handleSubmit = async () => {
    if (!canSubmit()) return

    try {
      // TODO: Implementar la lógica de subida
      console.log('Submitting documents:', {
        evidences: selectedEvidences,
        files: uploadedFiles,
        careers: selectedCareerIds,
        documentType: selectedDocumentTypeId
      })

      // Aquí iría la llamada al API
      // await uploadDocuments(...)

      alert('Documentos subidos exitosamente!')
      reset()
    } catch (error) {
      console.error('Error uploading documents:', error)
      alert('Error al subir documentos')
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Columna Izquierda: Upload y Configuración */}
      <div className="lg:col-span-1 space-y-6">
        {/* Upload de Archivos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Archivos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <FileUploadArea />
            <UploadedFilesList />
          </CardContent>
        </Card>

        {/* Selector de Carreras */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Carreras que Afecta
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CareerSelector />
          </CardContent>
        </Card>

        {/* Selector de Tipo de Documento */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Tags className="h-5 w-5 mr-2" />
              Tipo de Documento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <DocumentTypeSelector />
          </CardContent>
        </Card>

        {/* Resumen y Acción */}
        <Card>
          <CardHeader>
            <CardTitle>Resumen</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm space-y-2">
              <p>📁 Archivos: <strong>{uploadedFiles.length}</strong></p>
              <p>🎯 Evidencias: <strong>{selectedEvidences.length}</strong></p>
              <p>🏫 Carreras: <strong>{selectedCareerIds.length}</strong></p>
              <p>📋 Tipo: <strong>{selectedDocumentTypeId ? '✓' : '✗'}</strong></p>
            </div>

            <div className="space-y-2">
              <Button
                onClick={handleSubmit}
                disabled={!canSubmit()}
                className="w-full"
                size="lg"
              >
                {isUploading ? (
                  <>
                    <Upload className="h-4 w-4 mr-2 animate-spin" />
                    Subiendo...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Subir Documentos
                  </>
                )}
              </Button>

              <Button
                onClick={reset}
                variant="outline"
                className="w-full"
              >
                <X className="h-4 w-4 mr-2" />
                Limpiar Todo
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Columna Central y Derecha: Selector de Evidencias */}
      <div className="lg:col-span-2">
        <Card className="h-full">
          <CardHeader>
            <CardTitle>Seleccionar Evidencias</CardTitle>
            <p className="text-sm text-muted-foreground">
              Selecciona las evidencias a las que quieres asociar los documentos
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 h-full">
              {/* Selector de Evidencias */}
              <div>
                <EvidenceSelector />
              </div>

              {/* Lista de Evidencias Seleccionadas */}
              <div>
                <SelectedEvidencesList />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
