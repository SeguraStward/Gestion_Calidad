'use client'

import { useState } from 'react'
import { ChevronRight, ChevronDown, FileCheck, AlertCircle, Loader2 } from 'lucide-react'
import { Button, Checkbox, ScrollArea, Alert, AlertDescription } from '@una-gc/ui/components'
import { useDimensionsWithFullHierarchy } from '../../services/dimensions.service'
import { useDocumentAssignment } from '../../store/document-assignment.store'

export const EvidenceSelector = () => {
  const { selectedEvidences, toggleEvidence } = useDocumentAssignment()
  const [expandedDimensions, setExpandedDimensions] = useState<Set<string>>(new Set())
  const [expandedComponents, setExpandedComponents] = useState<Set<string>>(new Set())
  const [expandedCriteria, setExpandedCriteria] = useState<Set<string>>(new Set())
  const [expandedStandards, setExpandedStandards] = useState<Set<string>>(new Set())

  const { data: dimensions = [], isLoading, error } = useDimensionsWithFullHierarchy()

  const toggleDimension = (dimensionId: string) => {
    const newExpanded = new Set(expandedDimensions)
    if (newExpanded.has(dimensionId)) {
      newExpanded.delete(dimensionId)
    } else {
      newExpanded.add(dimensionId)
    }
    setExpandedDimensions(newExpanded)
  }

  const toggleComponent = (componentId: string) => {
    const newExpanded = new Set(expandedComponents)
    if (newExpanded.has(componentId)) {
      newExpanded.delete(componentId)
    } else {
      newExpanded.add(componentId)
    }
    setExpandedComponents(newExpanded)
  }

  const toggleCriterion = (criterionId: string) => {
    const newExpanded = new Set(expandedCriteria)
    if (newExpanded.has(criterionId)) {
      newExpanded.delete(criterionId)
    } else {
      newExpanded.add(criterionId)
    }
    setExpandedCriteria(newExpanded)
  }

  const toggleStandard = (standardId: string) => {
    const newExpanded = new Set(expandedStandards)
    if (newExpanded.has(standardId)) {
      newExpanded.delete(standardId)
    } else {
      newExpanded.add(standardId)
    }
    setExpandedStandards(newExpanded)
  }

  const isEvidenceSelected = (evidenceId: string) => {
    return selectedEvidences.some(selected => selected.evidence.id === evidenceId)
  }

  const handleEvidenceToggle = (evidence: any, dimension: any, component: any, criterion: any, standard: any) => {
    // Simplified structure for now - we'll make it type-safe later
    const evidenceWithHierarchy: any = {
      evidence: {
        id: evidence.id?.toString() || '',
        name: evidence.name || '',
        description: evidence.description || '',
        code: evidence.code || `EV-${evidence.id}`
      },
      dimension: {
        id: dimension.id?.toString() || '',
        name: dimension.name || '',
        code: dimension.code || `DIM-${dimension.id}`,
        description: dimension.description || ''
      },
      component: {
        id: component.id?.toString() || '',
        name: component.name || '',
        code: component.code || `COMP-${component.id}`,
        description: component.description || '',
        dimensionId: dimension.id?.toString() || ''
      },
      criterion: {
        id: criterion.id?.toString() || '',
        name: criterion.name || '',
        code: criterion.code || `CRIT-${criterion.id}`,
        description: criterion.description || '',
        componentId: component.id?.toString() || ''
      },
      standard: {
        id: standard.id?.toString() || '',
        name: standard.name || '',
        code: standard.code || `STD-${standard.id}`,
        description: standard.description || '',
        criterionId: criterion.id?.toString() || ''
      },
      hierarchyPath: `${dimension.id}.${component.id}.${criterion.id}.${standard.id}`
    }

    toggleEvidence(evidenceWithHierarchy)
  }

  const expandAll = () => {
    const allDimensions = new Set(dimensions.map((d: any) => d.id?.toString()).filter(Boolean) as string[])
    const allComponents = new Set(dimensions.flatMap((d: any) =>
      d.components?.map((c: any) => c.id?.toString()) || []
    ).filter(Boolean) as string[])
    const allCriteria = new Set(dimensions.flatMap((d: any) =>
      d.components?.flatMap((c: any) => c.criteria?.map((cr: any) => cr.id?.toString()) || []) || []
    ).filter(Boolean) as string[])
    const allStandards = new Set(dimensions.flatMap((d: any) =>
      d.components?.flatMap((c: any) =>
        c.criteria?.flatMap((cr: any) => cr.standards?.map((s: any) => s.id?.toString()) || []) || []
      ) || []
    ).filter(Boolean) as string[])

    setExpandedDimensions(allDimensions)
    setExpandedComponents(allComponents)
    setExpandedCriteria(allCriteria)
    setExpandedStandards(allStandards)
  }

  const collapseAll = () => {
    setExpandedDimensions(new Set())
    setExpandedComponents(new Set())
    setExpandedCriteria(new Set())
    setExpandedStandards(new Set())
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm text-muted-foreground">Cargando estructura SINAES...</span>
        </div>
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-12 bg-muted rounded animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Error al cargar la estructura SINAES. Por favor verifica que el backend esté funcionando.
        </AlertDescription>
      </Alert>
    )
  }

  if (!dimensions || dimensions.length === 0) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          No hay dimensiones SINAES configuradas. Configura la estructura desde el tab "Estructura SINAES".
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Button size="sm" variant="outline" onClick={expandAll}>
          Expandir Todo
        </Button>
        <Button size="sm" variant="outline" onClick={collapseAll}>
          Contraer Todo
        </Button>
      </div>

      <ScrollArea className="h-[600px] border rounded-lg p-4">
        <div className="space-y-2">
          {dimensions.map((dimension: any) => (
            <div key={dimension.id} className="space-y-1">
              {/* Dimensión */}
              <div
                className="flex items-center gap-2 p-2 hover:bg-muted rounded cursor-pointer"
                onClick={() => toggleDimension(dimension.id?.toString())}
              >
                {expandedDimensions.has(dimension.id?.toString()) ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
                <span className="font-medium text-sm">{dimension.name}</span>
              </div>

              {/* Componentes */}
              {expandedDimensions.has(dimension.id?.toString()) && dimension.components && (
                <div className="ml-6 space-y-1">
                  {dimension.components.map((component: any) => (
                    <div key={component.id} className="space-y-1">
                      <div
                        className="flex items-center gap-2 p-2 hover:bg-muted rounded cursor-pointer"
                        onClick={() => toggleComponent(component.id?.toString())}
                      >
                        {expandedComponents.has(component.id?.toString()) ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                        <span className="text-sm">{component.name}</span>
                      </div>

                      {/* Criterios */}
                      {expandedComponents.has(component.id?.toString()) && component.criteria && (
                        <div className="ml-6 space-y-1">
                          {component.criteria.map((criterion: any) => (
                            <div key={criterion.id} className="space-y-1">
                              <div
                                className="flex items-center gap-2 p-2 hover:bg-muted rounded cursor-pointer"
                                onClick={() => toggleCriterion(criterion.id?.toString())}
                              >
                                {expandedCriteria.has(criterion.id?.toString()) ? (
                                  <ChevronDown className="h-4 w-4" />
                                ) : (
                                  <ChevronRight className="h-4 w-4" />
                                )}
                                <span className="text-sm">{criterion.name}</span>
                              </div>

                              {/* Estándares */}
                              {expandedCriteria.has(criterion.id?.toString()) && criterion.standards && (
                                <div className="ml-6 space-y-1">
                                  {criterion.standards.map((standard: any) => (
                                    <div key={standard.id} className="space-y-1">
                                      <div
                                        className="flex items-center gap-2 p-2 hover:bg-muted rounded cursor-pointer"
                                        onClick={() => toggleStandard(standard.id?.toString())}
                                      >
                                        {expandedStandards.has(standard.id?.toString()) ? (
                                          <ChevronDown className="h-4 w-4" />
                                        ) : (
                                          <ChevronRight className="h-4 w-4" />
                                        )}
                                        <span className="text-sm">{standard.name}</span>
                                      </div>

                                      {/* Evidencias de Calidad */}
                                      {expandedStandards.has(standard.id?.toString()) && standard.qualityEvidences && (
                                        <div className="ml-6 space-y-1">
                                          {standard.qualityEvidences.map((evidence: any) => (
                                            <div
                                              key={evidence.id}
                                              className="flex items-center gap-2 p-2 hover:bg-muted rounded"
                                            >
                                              <Checkbox
                                                checked={isEvidenceSelected(evidence.id?.toString())}
                                                onCheckedChange={() => handleEvidenceToggle(evidence, dimension, component, criterion, standard)}
                                                id={`evidence-${evidence.id}`}
                                              />
                                              <FileCheck className="h-4 w-4 text-muted-foreground" />
                                              <div className="flex-1">
                                                <label
                                                  htmlFor={`evidence-${evidence.id}`}
                                                  className="text-sm cursor-pointer"
                                                >
                                                  {evidence.name}
                                                </label>
                                                {evidence.description && (
                                                  <p className="text-xs text-muted-foreground mt-1">
                                                    {evidence.description}
                                                  </p>
                                                )}
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}
