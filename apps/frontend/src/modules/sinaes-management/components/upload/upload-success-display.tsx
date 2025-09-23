'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@una-gc/ui/components'
import { Badge, Button } from '@una-gc/ui/components'
import { CheckCircle, ExternalLink, FileText } from 'lucide-react'
import type { UploadDocumentResponse } from '../../services/document-upload.service'

interface UploadSuccessDisplayProps {
  result: UploadDocumentResponse
  onClose: () => void
}

export const UploadSuccessDisplay = ({ result, onClose }: UploadSuccessDisplayProps) => {
  return (
    <Card className="border-green-200 bg-green-50">
      <CardHeader>
        <CardTitle className="flex items-center text-green-700">
          <CheckCircle className="h-5 w-5 mr-2" />
          ¡Documentos Subidos Exitosamente!
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Documento Principal */}
        <div className="space-y-2">
          <h4 className="font-medium">Documento Creado:</h4>
          <div className="bg-white p-3 rounded-md border">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{result.proofDocument.name}</p>
                <p className="text-sm text-gray-600">Código: {result.proofDocument.code}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(result.proofDocument.fileUrl, '_blank')}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Ver Archivo
              </Button>
            </div>
          </div>
        </div>

        {/* Relaciones Creadas */}
        <div className="space-y-2">
          <h4 className="font-medium">Relaciones Creadas:</h4>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-blue-50 p-2 rounded text-center">
              <p className="text-sm font-medium text-blue-700">
                {result.careerRelations.length}
              </p>
              <p className="text-xs text-blue-600">Carreras Vinculadas</p>
            </div>
            <div className="bg-purple-50 p-2 rounded text-center">
              <p className="text-sm font-medium text-purple-700">
                {result.standardEvidenceRelations.length}
              </p>
              <p className="text-xs text-purple-600">Evidencias Vinculadas</p>
            </div>
          </div>
        </div>

        {/* Botón para cerrar */}
        <div className="pt-2">
          <Button onClick={onClose} className="w-full">
            <FileText className="h-4 w-4 mr-2" />
            Subir Otro Documento
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
