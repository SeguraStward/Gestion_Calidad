'use client'

import { useSinaesNavigation } from '../../store/sinaes-navigation.store'

export const ContentArea = () => {
  const {
    selectedDimension,
    selectedComponent,
    selectedCriterion,
    selectedStandard,
    selectedQualityEvidence
  } = useSinaesNavigation()

  if (!selectedDimension) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        <p>Selecciona una dimensión para comenzar</p>
      </div>
    )
  }

  if (!selectedComponent) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Dimensión: {selectedDimension.name}</h3>
        <p className="text-muted-foreground">{selectedDimension.description}</p>
        <p className="text-sm text-muted-foreground">Selecciona un componente para continuar</p>
      </div>
    )
  }

  if (!selectedCriterion) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Componente: {selectedComponent.name}</h3>
        <p className="text-muted-foreground">{selectedComponent.description}</p>
        <p className="text-sm text-muted-foreground">Selecciona un criterio para continuar</p>
      </div>
    )
  }

  if (!selectedStandard) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Criterio: {selectedCriterion.name}</h3>
        <p className="text-muted-foreground">{selectedCriterion.description}</p>
        <p className="text-sm text-muted-foreground">Selecciona un estándar para continuar</p>
      </div>
    )
  }

  if (!selectedQualityEvidence) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Estándar: {selectedStandard.name}</h3>
        <p className="text-muted-foreground">{selectedStandard.description}</p>
        <p className="text-sm text-muted-foreground">Selecciona una evidencia de calidad para gestionar documentos</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Evidencia: {selectedQualityEvidence.name}</h3>
      <p className="text-muted-foreground">{selectedQualityEvidence.description}</p>
      <div className="border-t pt-4">
        <h4 className="font-medium mb-2">Documentos Probatorios</h4>
        <p className="text-sm text-muted-foreground">
          Aquí se mostrarán los documentos asociados a esta evidencia de calidad.
        </p>
        {/* TODO: Aquí irá la lista de documentos probatorios */}
      </div>
    </div>
  )
}
