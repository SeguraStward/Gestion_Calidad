'use client'

import { useState } from 'react'
import { Search, GraduationCap } from 'lucide-react'
import { Button, Checkbox, Input, ScrollArea } from '@una-gc/ui/components'
import { useQuery } from '@tanstack/react-query'
import { useDocumentAssignment } from '../../store/document-assignment.store'

interface Career {
  id: string
  name: string
  code: string
  isActive: boolean
}

export const CareerSelector = () => {
  const { selectedCareerIds, setCareerIds } = useDocumentAssignment()
  const [searchTerm, setSearchTerm] = useState('')

  const { data: careers = [], isLoading } = useQuery<Career[]>({
    queryKey: ['careers'],
    queryFn: async () => {
      const response = await fetch('/api/careers')
      if (!response.ok) throw new Error('Error loading careers')
      return response.json()
    }
  })

  const filteredCareers = careers.filter(career =>
    career.isActive && (
      career.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      career.code.toLowerCase().includes(searchTerm.toLowerCase())
    )
  )

  const handleCareerToggle = (careerId: string) => {
    const newSelectedIds = selectedCareerIds.includes(careerId)
      ? selectedCareerIds.filter(id => id !== careerId)
      : [...selectedCareerIds, careerId]

    setCareerIds(newSelectedIds)
  }

  const selectAll = () => {
    setCareerIds(filteredCareers.map(career => career.id))
  }

  const selectNone = () => {
    setCareerIds([])
  }

  const selectedCount = selectedCareerIds.length
  const totalCount = filteredCareers.length

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-6 bg-muted rounded animate-pulse" />
        <div className="h-10 bg-muted rounded animate-pulse" />
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-12 bg-muted rounded animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header con contador */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <GraduationCap className="h-5 w-5" />
          <span className="font-medium">Carreras</span>
          <span className="text-sm text-muted-foreground">
            ({selectedCount} de {totalCount} seleccionadas)
          </span>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={selectAll}>
            Todas
          </Button>
          <Button size="sm" variant="outline" onClick={selectNone}>
            Ninguna
          </Button>
        </div>
      </div>

      {/* Buscador */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar carreras por nombre o código..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Lista de carreras */}
      <ScrollArea className="h-[400px] border rounded-lg">
        <div className="p-4 space-y-2">
          {filteredCareers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm ? 'No se encontraron carreras' : 'No hay carreras disponibles'}
            </div>
          ) : (
            filteredCareers.map((career) => (
              <div
                key={career.id}
                className="flex items-center gap-3 p-3 hover:bg-muted rounded-lg cursor-pointer"
                onClick={() => handleCareerToggle(career.id)}
              >
                <Checkbox
                  checked={selectedCareerIds.includes(career.id)}
                  onCheckedChange={() => handleCareerToggle(career.id)}
                  id={`career-${career.id}`}
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{career.name}</span>
                    <span className="text-xs bg-muted px-2 py-1 rounded">
                      {career.code}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>

      {/* Resumen de selección */}
      {selectedCount > 0 && (
        <div className="p-3 bg-muted rounded-lg">
          <p className="text-sm font-medium">Carreras seleccionadas:</p>
          <div className="mt-2 flex flex-wrap gap-1">
            {selectedCareerIds.slice(0, 3).map((careerIdString) => {
              const career = careers.find(c => c.id === careerIdString)
              return career ? (
                <span key={career.id} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                  {career.code}
                </span>
              ) : null
            })}
            {selectedCount > 3 && (
              <span className="text-xs bg-muted-foreground/10 text-muted-foreground px-2 py-1 rounded">
                +{selectedCount - 3} más
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
