'use client'

import { useState, useMemo } from 'react'
import { Button } from '@una-gc/ui/components/button'
import { Input } from '@una-gc/ui/components/input'
import { Label } from '@una-gc/ui/components/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@una-gc/ui/components/select'
import { Card } from '@una-gc/ui/components/card'
import { Search, X, Filter } from 'lucide-react'
import { useDimensions } from '../../services/dimensions.service'
import { useComponents } from '../../services/components.service'
import { useCriteria } from '../../services/criteria.service'
import { useQualityEvidences } from '../../services/quality-evidences.service'
import { useProofDocumentTypes } from '../../services/proof-document-types.service'
import { useListCareersFlat } from '@/modules/academic-management/academic-maintenance/hooks/useCareer'
import type { ProofDocumentFilters } from '../../services/proof-documents.service'

interface ProofDocumentsFiltersProps {
  filters: ProofDocumentFilters
  onFiltersChange: (filters: ProofDocumentFilters) => void
  onSearch: () => void
  onClear: () => void
}

export const ProofDocumentsFilters = ({
  filters,
  onFiltersChange,
  onSearch,
  onClear
}: ProofDocumentsFiltersProps) => {
  const [showAdvanced, setShowAdvanced] = useState(false)

  // Load data for filters
  const { data: dimensions } = useDimensions()
  const { data: components } = useComponents(
    filters.dimensionId ? { dimensionId: filters.dimensionId } : undefined,
    { enabled: !!filters.dimensionId }
  )
  const { data: criteria } = useCriteria(
    filters.componentId ? { componentId: filters.componentId } : undefined,
    { enabled: !!filters.componentId }
  )
  const { data: evidences } = useQualityEvidences(
    filters.criterionId
      ? { criterionId: filters.criterionId }
      : filters.standardId
        ? { standardId: filters.standardId }
        : undefined,
    { enabled: !!(filters.criterionId || filters.standardId) }
  )
  const { data: documentTypes } = useProofDocumentTypes()
  const { data: careers } = useListCareersFlat()

  // Solo carreras activas para el filtro. `useListCareersFlat` devuelve un
  // arreglo plano; se normaliza por si llega envuelto.
  const activeCareers = useMemo(() => {
    const list = Array.isArray(careers) ? careers : []
    return list.filter((c: any) => c.status === 'ACTIVE')
  }, [careers])

  // El filtro de documentos por carrera es de selección única (el usuario quiere
  // ver los documentos de UNA carrera específica); se guarda como careerIds[].
  const selectedCareerId = filters.careerIds?.[0] || 'all'

  const handleChange = (key: keyof ProofDocumentFilters, value: any) => {
    const newFilters = { ...filters, [key]: value }

    // Reset dependent filters when parent changes
    if (key === 'dimensionId') {
      newFilters.componentId = undefined
      newFilters.criterionId = undefined
      newFilters.evidenceId = undefined
    } else if (key === 'componentId') {
      newFilters.criterionId = undefined
      newFilters.evidenceId = undefined
    } else if (key === 'criterionId') {
      newFilters.evidenceId = undefined
    }

    onFiltersChange(newFilters)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onSearch()
    }
  }

  const activeFiltersCount = useMemo(() => {
    let count = 0
    if (filters.search) count++
    if (filters.dimensionId) count++
    if (filters.componentId) count++
    if (filters.criterionId) count++
    if (filters.evidenceId) count++
    if (filters.proofDocumentTypeId) count++
    if (filters.careerIds && filters.careerIds.length > 0) count++
    if (filters.dateFrom) count++
    if (filters.dateTo) count++
    if (filters.status && filters.status !== 'ALL') count++
    return count
  }, [filters])

  return (
    <Card className="p-4 space-y-4">
      {/* Basic Search */}
      <div className="flex gap-2">
        <div className="flex-1">
          <Input
            placeholder="Buscar por nombre o código..."
            value={filters.search || ''}
            onChange={(e) => handleChange('search', e.target.value)}
            onKeyPress={handleKeyPress}
            className="w-full"
          />
        </div>
        <Button onClick={onSearch} className="gap-2">
          <Search className="h-4 w-4" />
          Buscar
        </Button>
        <Button
          variant="outline"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="gap-2"
        >
          <Filter className="h-4 w-4" />
          Filtros {activeFiltersCount > 0 && `(${activeFiltersCount})`}
        </Button>
        {activeFiltersCount > 0 && (
          <Button variant="ghost" onClick={onClear} className="gap-2">
            <X className="h-4 w-4" />
            Limpiar
          </Button>
        )}
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t">
          {/* Dimension */}
          <div className="space-y-2">
            <Label>Dimensión</Label>
            <Select
              value={filters.dimensionId || 'all'}
              onValueChange={(value) => handleChange('dimensionId', value === 'all' ? undefined : value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todas las dimensiones" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las dimensiones</SelectItem>
                {dimensions?.data?.map((dimension) => (
                  <SelectItem key={dimension.id} value={dimension.id}>
                    {dimension.code} - {dimension.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Component */}
          <div className="space-y-2">
            <Label>Componente</Label>
            <Select
              value={filters.componentId || 'all'}
              onValueChange={(value) => handleChange('componentId', value === 'all' ? undefined : value)}
              disabled={!filters.dimensionId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todos los componentes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los componentes</SelectItem>
                {components?.data?.map((component) => (
                  <SelectItem key={component.id} value={component.id}>
                    {component.code} - {component.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Criterion */}
          <div className="space-y-2">
            <Label>Criterio</Label>
            <Select
              value={filters.criterionId || 'all'}
              onValueChange={(value) => handleChange('criterionId', value === 'all' ? undefined : value)}
              disabled={!filters.componentId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todos los criterios" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los criterios</SelectItem>
                {criteria?.data?.map((criterion) => (
                  <SelectItem key={criterion.id} value={criterion.id}>
                    {criterion.code} - {criterion.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Evidence */}
          <div className="space-y-2">
            <Label>Evidencia</Label>
            <Select
              value={filters.evidenceId || 'all'}
              onValueChange={(value) => handleChange('evidenceId', value === 'all' ? undefined : value)}
              disabled={!filters.criterionId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todas las evidencias" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las evidencias</SelectItem>
                {evidences?.data?.map((evidence) => (
                  <SelectItem key={evidence.id} value={evidence.id}>
                    {evidence.code} - {evidence.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Document Type */}
          <div className="space-y-2">
            <Label>Tipo de Documento</Label>
            <Select
              value={filters.proofDocumentTypeId || 'all'}
              onValueChange={(value) => handleChange('proofDocumentTypeId', value === 'all' ? undefined : value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todos los tipos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los tipos</SelectItem>
                {documentTypes?.data?.map((type) => (
                  <SelectItem key={type.id} value={type.id}>
                    {type.prefix} - {type.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Career */}
          <div className="space-y-2">
            <Label>Carrera</Label>
            <Select
              value={selectedCareerId}
              onValueChange={(value) =>
                handleChange('careerIds', value === 'all' ? undefined : [value])
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Todas las carreras" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las carreras</SelectItem>
                {activeCareers.map((career: any) => (
                  <SelectItem key={career.id} value={career.id}>
                    {career.code ? `${career.code} - ${career.name}` : career.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label>Estado</Label>
            <Select
              value={filters.status || 'ALL'}
              onValueChange={(value) => handleChange('status', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todos</SelectItem>
                <SelectItem value="ACTIVE">Activo</SelectItem>
                <SelectItem value="INACTIVE">Inactivo</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Date From */}
          <div className="space-y-2">
            <Label>Fecha Desde</Label>
            <Input
              type="date"
              value={filters.dateFrom || ''}
              onChange={(e) => handleChange('dateFrom', e.target.value)}
            />
          </div>

          {/* Date To */}
          <div className="space-y-2">
            <Label>Fecha Hasta</Label>
            <Input
              type="date"
              value={filters.dateTo || ''}
              onChange={(e) => handleChange('dateTo', e.target.value)}
            />
          </div>
        </div>
      )}
    </Card>
  )
}
