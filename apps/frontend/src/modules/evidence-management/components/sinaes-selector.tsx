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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@una-gc/ui/components/popover'
import { ScrollArea } from '@una-gc/ui/components/scroll-area'
import { Badge } from '@una-gc/ui/components/badge'
import { useDimensions, useComponents, useCriteria } from '../service/evidence.service'

interface SinaesSelectorProps {
  selectedCriteria: string[]
  onChange: (selectedIds: string[]) => void
}

export function SinaesSelector({ selectedCriteria, onChange }: SinaesSelectorProps) {
  const [open, setOpen] = useState(false)
  const [selectedDimensionId, setSelectedDimensionId] = useState<string | undefined>()
  const [selectedComponentId, setSelectedComponentId] = useState<string | undefined>()
  
  const { data: dimensions, isLoading: isDimensionsLoading } = useDimensions()
  const { data: components, isLoading: isComponentsLoading } = useComponents(selectedDimensionId)
  const { data: criteria, isLoading: isCriteriaLoading } = useCriteria(selectedComponentId)
  
  // Reset component selection when dimension changes
  useEffect(() => {
    setSelectedComponentId(undefined)
  }, [selectedDimensionId])
  
  // Helper function to get criterion name by ID
  const getCriterionById = (id: string) => {
    const allCriteria = criteria || []
    const criterion = allCriteria.find(c => c.id === id)
    return criterion ? `${criterion.code} - ${criterion.name}` : id
  }
  
  const toggleCriterion = (criterionId: string) => {
    const updatedSelection = selectedCriteria.includes(criterionId)
      ? selectedCriteria.filter(id => id !== criterionId)
      : [...selectedCriteria, criterionId]
    onChange(updatedSelection)
  }
  
  const getDimensionName = (dimensionId: string) => {
    const dimension = dimensions?.find(d => d.id === dimensionId)
    return dimension ? `${dimension.code} - ${dimension.name}` : ''
  }
  
  const getComponentName = (componentId: string) => {
    const component = components?.find(c => c.id === componentId)
    return component ? `${component.code} - ${component.name}` : ''
  }
  
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-1 mb-2">
        {selectedCriteria.map((criterionId) => (
          <Badge key={criterionId} variant="secondary" className="mr-1 mb-1">
            {getCriterionById(criterionId)}
            <button 
              onClick={() => toggleCriterion(criterionId)} 
              className="ml-1 text-xs rounded-full hover:bg-muted p-1"
            >
              ×
            </button>
          </Badge>
        ))}
      </div>
      
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="justify-between w-full text-left"
          >
            {selectedCriteria.length > 0 
              ? `${selectedCriteria.length} criterio${selectedCriteria.length !== 1 ? 's' : ''} seleccionado${selectedCriteria.length !== 1 ? 's' : ''}` 
              : "Seleccionar criterios SINAES..."}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-0 w-full min-w-[300px] max-w-[500px]" align="start">
          <Command>
            <CommandInput placeholder="Buscar dimensión, componente o criterio..." />
            <CommandList>
              <CommandEmpty>No se encontraron resultados.</CommandEmpty>
              <ScrollArea className="h-[300px]">
                {isDimensionsLoading ? (
                  <div className="p-2 text-center text-sm">Cargando dimensiones...</div>
                ) : (
                  dimensions?.map((dimension) => (
                    <React.Fragment key={dimension.id}>
                      <CommandGroup heading={`${dimension.code} - ${dimension.name}`}>
                        <CommandItem 
                          onSelect={() => {
                            setSelectedDimensionId(selectedDimensionId === dimension.id ? undefined : dimension.id)
                          }}
                          className="cursor-pointer"
                        >
                          <span className={selectedDimensionId === dimension.id ? "font-medium" : ""}>
                            {dimension.code} - {dimension.name}
                          </span>
                          {selectedDimensionId === dimension.id && (
                            <Check className="ml-auto h-4 w-4 opacity-70" />
                          )}
                        </CommandItem>
                        
                        {selectedDimensionId === dimension.id && (
                          <>
                            {isComponentsLoading ? (
                              <div className="pl-6 py-2 text-sm text-muted-foreground">Cargando componentes...</div>
                            ) : (
                              components?.filter(c => c.dimensionId === dimension.id).map(component => (
                                <React.Fragment key={component.id}>
                                  <CommandItem 
                                    onSelect={() => {
                                      setSelectedComponentId(selectedComponentId === component.id ? undefined : component.id)
                                    }}
                                    className="pl-6 cursor-pointer"
                                  >
                                    <span className={selectedComponentId === component.id ? "font-medium" : ""}>
                                      {component.code} - {component.name}
                                    </span>
                                    {selectedComponentId === component.id && (
                                      <Check className="ml-auto h-4 w-4 opacity-70" />
                                    )}
                                  </CommandItem>
                                  
                                  {selectedComponentId === component.id && (
                                    <>
                                      {isCriteriaLoading ? (
                                        <div className="pl-12 py-2 text-sm text-muted-foreground">Cargando criterios...</div>
                                      ) : (
                                        criteria?.filter(cr => cr.componentId === component.id).map(criterion => (
                                          <CommandItem 
                                            key={criterion.id}
                                            onSelect={() => toggleCriterion(criterion.id)}
                                            className="pl-12 cursor-pointer"
                                          >
                                            <div className="flex items-center">
                                              <div className={`w-4 h-4 mr-2 border rounded flex items-center justify-center ${
                                                selectedCriteria.includes(criterion.id) 
                                                  ? "bg-primary border-primary" 
                                                  : "border-muted-foreground"
                                              }`}>
                                                {selectedCriteria.includes(criterion.id) && (
                                                  <Check className="h-3 w-3 text-white" />
                                                )}
                                              </div>
                                              {criterion.code} - {criterion.name}
                                            </div>
                                          </CommandItem>
                                        ))
                                      )}
                                    </>
                                  )}
                                </React.Fragment>
                              ))
                            )}
                          </>
                        )}
                      </CommandGroup>
                      <CommandSeparator />
                    </React.Fragment>
                  ))
                )}
              </ScrollArea>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}