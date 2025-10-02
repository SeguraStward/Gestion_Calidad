'use client'

import { X, FileCheck, ChevronRight } from 'lucide-react'
import { Button, Badge, ScrollArea } from '@una-gc/ui/components'
import { useDocumentAssignment } from '../../store/document-assignment.store'

export const SelectedEvidencesList = () => {
  const { selectedEvidences, removeEvidence } = useDocumentAssignment()

  if (selectedEvidences.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <FileCheck className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">No hay evidencias seleccionadas</p>
        <p className="text-xs mt-1">
          Selecciona evidencias del árbol de la izquierda
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">Evidencias Seleccionadas</h3>
        <Badge variant="outline">
          {selectedEvidences.length} evidencia{selectedEvidences.length !== 1 ? 's' : ''}
        </Badge>
      </div>

      <ScrollArea className="h-[500px]">
        <div className="space-y-2">
          {selectedEvidences.map((selectedEvidence) => (
            <div
              key={`${selectedEvidence.evidence.id}-${selectedEvidence.hierarchyPath}`}
              className="border rounded-lg p-3 space-y-2"
            >
              {/* Header con nombre y botón eliminar */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <FileCheck className="h-4 w-4 text-primary" />
                    <span className="font-medium text-sm">
                      {selectedEvidence.evidence.name}
                    </span>
                  </div>
                  {selectedEvidence.evidence.description && (
                    <p className="text-xs text-muted-foreground mt-1 ml-6">
                      {selectedEvidence.evidence.description}
                    </p>
                  )}
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => removeEvidence(selectedEvidence.evidence.id)}
                  className="h-6 w-6 p-0"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>

              {/* Ruta jerárquica */}
              <div className="ml-6 space-y-1">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <span>Dimensión:</span>
                  <span className="font-medium">{selectedEvidence.dimension.name}</span>
                </div>

                <div className="flex items-center gap-1 text-xs">
                  <ChevronRight className="h-3 w-3" />
                  <span className="text-muted-foreground">Componente:</span>
                  <span className="font-medium">{selectedEvidence.component.name}</span>
                </div>

                <div className="flex items-center gap-1 text-xs">
                  <ChevronRight className="h-3 w-3 ml-3" />
                  <span className="text-muted-foreground">Criterio:</span>
                  <span className="font-medium">{selectedEvidence.criterion.name}</span>
                </div>

                {selectedEvidence.standard && (
                  <div className="flex items-center gap-1 text-xs">
                    <ChevronRight className="h-3 w-3 ml-6" />
                    <span className="text-muted-foreground">Estándar:</span>
                    <span className="font-medium">{selectedEvidence.standard.name}</span>
                  </div>
                )}

                {/* Código de ruta */}
                <div className="mt-2">
                  <Badge variant="secondary" className="text-xs">
                    {selectedEvidence.hierarchyPath}
                  </Badge>
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Resumen */}
      <div className="p-3 bg-muted rounded-lg">
        <p className="text-sm font-medium mb-2">Resumen de selección:</p>
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div>
            <span className="text-muted-foreground">Dimensiones únicas:</span>
            <span className="ml-2 font-medium">
              {new Set(selectedEvidences.map(e => e.dimension.id)).size}
            </span>
          </div>
          <div>
            <span className="text-muted-foreground">Componentes únicos:</span>
            <span className="ml-2 font-medium">
              {new Set(selectedEvidences.map(e => e.component.id)).size}
            </span>
          </div>
          <div>
            <span className="text-muted-foreground">Criterios únicos:</span>
            <span className="ml-2 font-medium">
              {new Set(selectedEvidences.map(e => e.criterion.id)).size}
            </span>
          </div>
          <div>
            <span className="text-muted-foreground">Estándares únicos:</span>
            <span className="ml-2 font-medium">
              {new Set(selectedEvidences.map(e => e.standard?.id).filter(Boolean)).size}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
