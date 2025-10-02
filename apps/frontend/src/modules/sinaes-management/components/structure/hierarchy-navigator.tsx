'use client'

import { ScrollArea } from '@una-gc/ui/components'
import { useSinaesNavigation } from '../../store/sinaes-navigation.store'
import { DimensionsList } from './dimensions-list'
import { ComponentsList } from './components-list'
import { CriteriaList } from './criteria-list'
import { StandardsList } from './standards-list'
import { QualityEvidencesList } from './quality-evidences-list'

export const HierarchyNavigator = () => {
  const {
    selectedDimension,
    selectedComponent,
    selectedCriterion,
    selectedStandard
  } = useSinaesNavigation()

  return (
    <ScrollArea className="h-[600px]">
      <div className="space-y-4">
        {/* Dimensiones - Siempre visible */}
        <DimensionsList />

        {/* Componentes - Solo si hay dimensión seleccionada */}
        {selectedDimension && (
          <ComponentsList dimensionId={selectedDimension.id} />
        )}

        {/* Criterios - Solo si hay componente seleccionado */}
        {selectedComponent && (
          <CriteriaList componentId={selectedComponent.id} />
        )}

        {/* Estándares - Solo si hay criterio seleccionado */}
        {selectedCriterion && (
          <StandardsList criterionId={selectedCriterion.id} />
        )}

        {/* Evidencias de Calidad - Solo si hay estándar seleccionado */}
        {selectedStandard && (
          <QualityEvidencesList />
        )}
      </div>
    </ScrollArea>
  )
}
