'use client'

import React, { useState, useEffect } from 'react'
import { Check, ChevronsUpDown } from 'lucide-react'
import { Button } from '@una-gc/ui/components/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator
} from '@una-gc/ui/components/command'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@una-gc/ui/components/dialog'
import { ScrollArea } from '@una-gc/ui/components/scroll-area'
import { Badge } from '@una-gc/ui/components/badge'
import { useDimensions } from '../../services/dimensions.service'
import { useComponents } from '../../services/components.service'
import { useCriteria } from '../../services/criteria.service'
import { useStandards } from '../../services/standards.service'
import { useQualityEvidences } from '../../services/quality-evidences.service'

// Componente para mostrar las evidencias de un estándar
const StandardEvidences = ({ standard, selectedEvidences, toggleEvidence }: {
  standard: any
  selectedEvidences: string[]
  toggleEvidence: (evidenceId: string) => void
}) => {
  const { data: evidencesResponse, isLoading } = useQualityEvidences({ standardId: standard.id })
  const evidences = evidencesResponse?.data || []

  if (isLoading) return <div className="pl-12 py-2 text-xs text-muted-foreground">Cargando evidencias...</div>
  if (!evidences || evidences.length === 0) return <div className="pl-12 py-2 text-xs text-muted-foreground">No hay evidencias disponibles.</div>

  return (
    <div className="pl-12 py-1 space-y-1">
      {evidences.map((evidence: any) => (
        <div
          key={evidence.id}
          className="flex items-center p-2 rounded-md hover:bg-accent cursor-pointer"
          onClick={(e) => {
            e.stopPropagation()
            toggleEvidence(evidence.id)
          }}
        >
          <div className={`w-4 h-4 mr-3 border rounded flex items-center justify-center shrink-0 ${selectedEvidences.includes(evidence.id)
            ? "bg-primary border-primary"
            : "border-muted-foreground"
            }`}>
            {selectedEvidences.includes(evidence.id) && <Check className="h-3 w-3 text-white" />}
          </div>
          <span className="text-sm">{evidence.code}: {evidence.name}</span>
        </div>
      ))}
    </div>
  )
}

export function SinaesEvidenceSelector({ selectedEvidences = [], onChange }: {
  selectedEvidences?: string[]
  onChange: (selectedIds: string[]) => void
}) {
  const [open, setOpen] = useState(false)
  const [selectedDimensionId, setSelectedDimensionId] = useState<string | undefined>()
  const [selectedComponentId, setSelectedComponentId] = useState<string | undefined>()
  const [selectedCriterionId, setSelectedCriterionId] = useState<string | undefined>()
  const [expandedStandards, setExpandedStandards] = useState<Set<string>>(new Set())

  const { data: dimensionsResponse, isLoading: isDimensionsLoading } = useDimensions()
  const { data: componentsResponse, isLoading: isComponentsLoading } = useComponents({ dimensionId: selectedDimensionId })
  const { data: criteriaResponse, isLoading: isCriteriaLoading } = useCriteria({ componentId: selectedComponentId })
  const { data: standardsResponse, isLoading: isStandardsLoading } = useStandards({ criterionId: selectedCriterionId })

  // Extraer datos de las respuestas paginadas
  const dimensions = dimensionsResponse?.data || []
  const components = componentsResponse?.data || []
  const criteria = criteriaResponse?.data || []
  const standards = standardsResponse?.data || []

  const toggleStandardExpansion = (standardId: string) => {
    setExpandedStandards(prev => {
      const newSet = new Set(prev)
      if (newSet.has(standardId)) {
        newSet.delete(standardId)
      } else {
        newSet.add(standardId)
      }
      return newSet
    })
  }

  const toggleEvidence = (evidenceId: string) => {
    if (!onChange) return
    const newSelection = selectedEvidences.includes(evidenceId)
      ? selectedEvidences.filter(id => id !== evidenceId)
      : [...selectedEvidences, evidenceId]
    onChange(newSelection)
  }

  // Resetear selecciones al cambiar de nivel
  useEffect(() => {
    setSelectedComponentId(undefined)
    setSelectedCriterionId(undefined)
    setExpandedStandards(new Set())
  }, [selectedDimensionId])

  useEffect(() => {
    setSelectedCriterionId(undefined)
    setExpandedStandards(new Set())
  }, [selectedComponentId])

  useEffect(() => {
    setExpandedStandards(new Set())
  }, [selectedCriterionId])

  // Función para obtener la etiqueta de una evidencia seleccionada
  const getEvidenceLabel = (evidenceId: string) => {
    // Esto se podría mejorar cacheando las evidencias o buscando en el estado global
    return `EV-${evidenceId.slice(-4)}`
  }

  return (
    <div className="flex flex-col gap-2">
      {/* Badges para mostrar lo que está seleccionado */}
      <div className="flex flex-wrap gap-1 min-h-[24px]">
        {selectedEvidences.map((evidenceId) => (
          <Badge key={evidenceId} variant="secondary">
            {getEvidenceLabel(evidenceId)}
            <button
              type="button"
              onClick={() => toggleEvidence(evidenceId)}
              className="ml-1.5 text-primary/70 hover:text-primary rounded-full"
              aria-label={`Quitar ${getEvidenceLabel(evidenceId)}`}
            >
              &times;
            </button>
          </Badge>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            {selectedEvidences.length > 0
              ? `${selectedEvidences.length} evidencia${selectedEvidences.length !== 1 ? 's' : ''} seleccionada${selectedEvidences.length !== 1 ? 's' : ''}`
              : "Seleccionar evidencias SINAES..."}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-4xl max-h-[85vh] p-0">
          <DialogHeader className="p-6 pb-4">
            <DialogTitle>Seleccionar Evidencias SINAES</DialogTitle>
            <DialogDescription>
              Navega por la jerarquía y selecciona las evidencias que este documento cumple.
            </DialogDescription>
          </DialogHeader>
          <Command className="border-t">
            <CommandInput placeholder="Buscar dimensión, componente, criterio o estándar..." />
            <CommandList>
              <ScrollArea className="h-[500px]">
                <CommandEmpty>No se encontraron resultados.</CommandEmpty>

                {/* Nivel 1: Dimensiones */}
                <CommandGroup heading="1. Dimensiones">
                  {isDimensionsLoading ? <CommandItem disabled>Cargando...</CommandItem> :
                    dimensions?.map((dimension: any) => (
                      <CommandItem
                        key={dimension.id}
                        onSelect={() => setSelectedDimensionId(dimension.id)}
                        className="cursor-pointer"
                      >
                        <Check className={`mr-2 h-4 w-4 ${selectedDimensionId === dimension.id ? 'opacity-100' : 'opacity-0'}`} />
                        {dimension.code} - {dimension.name}
                      </CommandItem>
                    ))
                  }
                </CommandGroup>

                {/* Nivel 2: Componentes */}
                {selectedDimensionId && (
                  <>
                    <CommandSeparator />
                    <CommandGroup heading="2. Componentes">
                      {isComponentsLoading ? <CommandItem disabled>Cargando...</CommandItem> :
                        components?.map((component: any) => (
                          <CommandItem
                            key={component.id}
                            onSelect={() => setSelectedComponentId(component.id)}
                            className="cursor-pointer"
                          >
                            <Check className={`mr-2 h-4 w-4 ${selectedComponentId === component.id ? 'opacity-100' : 'opacity-0'}`} />
                            {component.code} - {component.name}
                          </CommandItem>
                        ))
                      }
                    </CommandGroup>
                  </>
                )}

                {/* Nivel 3: Criterios */}
                {selectedComponentId && (
                  <>
                    <CommandSeparator />
                    <CommandGroup heading="3. Criterios">
                      {isCriteriaLoading ? <CommandItem disabled>Cargando...</CommandItem> :
                        criteria?.map((criterion: any) => (
                          <CommandItem
                            key={criterion.id}
                            onSelect={() => setSelectedCriterionId(criterion.id)}
                            className="cursor-pointer"
                          >
                            <Check className={`mr-2 h-4 w-4 ${selectedCriterionId === criterion.id ? 'opacity-100' : 'opacity-0'}`} />
                            {criterion.code} - {criterion.name}
                          </CommandItem>
                        ))
                      }
                    </CommandGroup>
                  </>
                )}

                {/* Nivel 4: Estándares y Evidencias */}
                {selectedCriterionId && (
                  <>
                    <CommandSeparator />
                    <CommandGroup heading="4. Estándares y Evidencias">
                      {isStandardsLoading ? <CommandItem disabled>Cargando...</CommandItem> :
                        standards?.map((standard: any) => (
                          <React.Fragment key={standard.id}>
                            <CommandItem
                              onSelect={() => {
                                toggleStandardExpansion(standard.id)
                              }}
                              className="flex justify-between items-center cursor-pointer"
                            >
                              <span>{standard.code} - {standard.name}</span>
                              {(() => {
                                const count = selectedEvidences.length // Se podría mejorar para contar solo las evidencias de este estándar
                                if (count > 0) return <Badge variant="secondary">{count}</Badge>
                                return null
                              })()}
                            </CommandItem>
                            {expandedStandards.has(standard.id) && (
                              <StandardEvidences
                                standard={standard}
                                selectedEvidences={selectedEvidences}
                                toggleEvidence={toggleEvidence}
                              />
                            )}
                          </React.Fragment>
                        ))
                      }
                    </CommandGroup>
                  </>
                )}
              </ScrollArea>
            </CommandList>
          </Command>
          <DialogFooter className="p-4 border-t">
            <Button type="button" onClick={() => setOpen(false)}>Cerrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}