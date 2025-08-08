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
import { useDimensions, useComponents, useCriteria, useEvidencePrompts } from '../service/evidence.service'
import { CriterionType } from '../types/evidence.types'
import { evidencePromptsMock } from '../mocks/evidence-prompts'

// --- SOLUCIÓN DEFINITIVA ---
const CriterionPrompts = ({ criterion, selectedPrompts, togglePrompt }: {
  criterion: CriterionType
  selectedPrompts: string[]
  togglePrompt: (promptId: string) => void
}) => {
  const { data: prompts, isLoading } = useEvidencePrompts(criterion.id)

  if (isLoading) return <div className="pl-12 py-2 text-xs text-muted-foreground">Cargando evidencias...</div>
  if (!prompts || prompts.length === 0) return <div className="pl-12 py-2 text-xs text-muted-foreground">No hay evidencias sugeridas.</div>

  return (
    <div className="pl-12 py-1 space-y-1">
      {prompts.map(prompt => (
        <div
          key={prompt.id}
          className="flex items-center p-2 rounded-md hover:bg-accent cursor-pointer"
          onClick={(e) => {
            e.stopPropagation()
            togglePrompt(prompt.id)
          }}
        >
          <div className={`w-4 h-4 mr-3 border rounded flex items-center justify-center shrink-0 ${selectedPrompts.includes(prompt.id)
            ? "bg-primary border-primary"
            : "border-muted-foreground"
            }`}>
            {selectedPrompts.includes(prompt.id) && <Check className="h-3 w-3 text-white" />}
          </div>
          <span className="text-sm">{prompt.code}: {prompt.description}</span>
        </div>
      ))}
    </div>
  )
}

export function SinaesSelector({ selectedPrompts = [], onChange }: {
  selectedPrompts?: string[]
  onChange: (selectedIds: string[]) => void
}) {
  const [open, setOpen] = useState(false)
  const [selectedDimensionId, setSelectedDimensionId] = useState<string | undefined>()
  const [selectedComponentId, setSelectedComponentId] = useState<string | undefined>()
  const [expandedCriteria, setExpandedCriteria] = useState<Set<string>>(new Set())

  const { data: dimensions, isLoading: isDimensionsLoading } = useDimensions()
  const { data: components, isLoading: isComponentsLoading } = useComponents(selectedDimensionId)
  const { data: criteria, isLoading: isCriteriaLoading } = useCriteria(selectedComponentId)

  const toggleCriterionExpansion = (criterionId: string) => {
    setExpandedCriteria(prev => {
      const newSet = new Set(prev)
      if (newSet.has(criterionId)) {
        newSet.delete(criterionId)
      } else {
        newSet.add(criterionId)
      }
      return newSet
    })
  }

  const togglePrompt = (promptId: string) => {
    if (!onChange) return
    const newSelection = selectedPrompts.includes(promptId)
      ? selectedPrompts.filter(id => id !== promptId)
      : [...selectedPrompts, promptId]
    onChange(newSelection)
  }

  // Resetear selecciones al cambiar de nivel
  useEffect(() => {
    setSelectedComponentId(undefined)
    setExpandedCriteria(new Set())
  }, [selectedDimensionId])

  useEffect(() => {
    setExpandedCriteria(new Set())
  }, [selectedComponentId])

  // Lógica para mostrar los badges de selección
  const getPromptLabel = (promptId: string) => {
    const prompt = evidencePromptsMock.find(p => p.id === promptId)
    return prompt ? `${prompt.code}` : promptId
  }

  return (
    <div className="flex flex-col gap-2">
      {/* Badges para mostrar lo que está seleccionado */}
      <div className="flex flex-wrap gap-1 min-h-[24px]">
        {selectedPrompts.map((promptId) => (
          <Badge key={promptId} variant="secondary">
            {getPromptLabel(promptId)}
            <button
              type="button"
              onClick={() => togglePrompt(promptId)}
              className="ml-1.5 text-primary/70 hover:text-primary rounded-full"
              aria-label={`Quitar ${getPromptLabel(promptId)}`}
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
            {selectedPrompts.length > 0
              ? `${selectedPrompts.length} evidencia${selectedPrompts.length !== 1 ? 's' : ''} seleccionada${selectedPrompts.length !== 1 ? 's' : ''}`
              : "Seleccionar evidencias SINAES..."}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-2xl p-0">
          <DialogHeader className="p-6 pb-4">
            <DialogTitle>Seleccionar Evidencias SINAES</DialogTitle>
            <DialogDescription>
              Navega por la jerarquía y selecciona las evidencias que este documento cumple.
            </DialogDescription>
          </DialogHeader>
          <Command className="border-t" onSelect={() => {
            // Este onSelect vacío en el Command padre es un truco para
            // prevenir que la selección de un item cierre el diálogo.
          }}>
            <CommandInput placeholder="Buscar dimensión, componente o criterio..." />
            <CommandList>
              <ScrollArea className="h-[450px]">
                <CommandEmpty>No se encontraron resultados.</CommandEmpty>

                {/* Nivel 1: Dimensiones */}
                <CommandGroup heading="1. Dimensiones">
                  {isDimensionsLoading ? <CommandItem disabled>Cargando...</CommandItem> :
                    dimensions?.map(dimension => (
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
                        components?.map(component => (
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

                {/* Nivel 3: Criterios y Evidencias */}
                {selectedComponentId && (
                  <>
                    <CommandSeparator />
                    <CommandGroup heading="3. Criterios y Evidencias Sugeridas">
                      {isCriteriaLoading ? <CommandItem disabled>Cargando...</CommandItem> :
                        criteria?.map(criterion => (
                          <React.Fragment key={criterion.id}>
                            <CommandItem
                              onSelect={() => {
                                // Prevenir comportamiento por defecto
                                toggleCriterionExpansion(criterion.id)
                              }}
                              className="flex justify-between items-center cursor-pointer"
                            >
                              <span>{criterion.code} - {criterion.name}</span>
                              {(() => {
                                const count = selectedPrompts.filter(pId => evidencePromptsMock.find(p => p.id === pId)?.criterionId === criterion.id).length
                                if (count > 0) return <Badge variant="secondary">{count}</Badge>
                                return null
                              })()}
                            </CommandItem>
                            {expandedCriteria.has(criterion.id) && (
                              <CriterionPrompts
                                criterion={criterion}
                                selectedPrompts={selectedPrompts}
                                togglePrompt={togglePrompt}
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