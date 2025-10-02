'use client'

import { useSinaesNavigation } from '../../store/sinaes-navigation.store'
import { DimensionsPanel } from './panels/dimensions-panel'
import { ComponentsPanel } from './panels/components-panel'
import { CriteriaPanel } from './panels/criteria-panel'
import { StandardsPanel } from './panels/standards-panel'
import { QualityEvidencesPanel } from './panels/quality-evidences-panel'
import { useStandards } from '../../services/standards.service'

export const SinaesStructureTab = () => {
  const {
    selectedDimension,
    selectedComponent,
    selectedCriterion,
    selectedStandard
  } = useSinaesNavigation()

  // Verificar si el criterio tiene estándares
  const { data: standardsResponse } = useStandards({
    criterionId: selectedCriterion?.id || ''
  })
  const hasStandards = (standardsResponse?.data?.length || 0) > 0

  return (
    <div className="h-full overflow-x-auto">
      <div className="flex gap-3 p-4 min-w-fit">
        {/* Panel 1: Dimensiones */}
        <div className="w-64 flex-shrink-0">
          <DimensionsPanel />
        </div>

        {/* Panel 2: Componentes */}
        {selectedDimension && (
          <div className="w-64 flex-shrink-0">
            <ComponentsPanel />
          </div>
        )}

        {/* Panel 3: Criterios */}
        {selectedComponent && (
          <div className="w-64 flex-shrink-0">
            <CriteriaPanel />
          </div>
        )}

        {/* Panel 4: Estándares o Evidencias Directas */}
        {selectedCriterion && (
          <div className="w-64 flex-shrink-0">
            <StandardsPanel />
          </div>
        )}

        {/* Panel 5: Evidencias - Solo cuando hay un estándar seleccionado O cuando el criterio no tiene estándares */}
        {(selectedStandard || (selectedCriterion && !hasStandards)) && (
          <div className="w-64 flex-shrink-0">
            <QualityEvidencesPanel />
          </div>
        )}
      </div>
    </div>
  )
}