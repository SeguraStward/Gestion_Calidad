'use client'

import { useState } from 'react'
import { Button } from '@una-gc/ui/components'
import { Card } from '@una-gc/ui/components'
import { Plus, ChevronRight, Edit, Trash2 } from 'lucide-react'
import { useComponents, useDeleteComponent } from '../../services/components.service'
import { useSinaesNavigation } from '../../store/sinaes-navigation.store'
import { ComponentForm } from '../forms/component-form'
import type { Component } from '../../types/components.types'

interface ComponentsListProps {
  dimensionId: string
}

export const ComponentsList = ({ dimensionId }: ComponentsListProps) => {
  const { data: components, isLoading, refetch } = useComponents(
    { dimensionId },
    { enabled: !!dimensionId }
  )
  const { selectedComponent, selectComponent } = useSinaesNavigation()
  const deleteComponent = useDeleteComponent()

  const [formOpen, setFormOpen] = useState(false)
  const [editingComponent, setEditingComponent] = useState<Component | null>(null)

  const handleEdit = (component: Component, e: React.MouseEvent) => {
    e.stopPropagation()
    setEditingComponent(component)
    setFormOpen(true)
  }

  const handleDelete = async (component: Component, e: React.MouseEvent) => {
    e.stopPropagation()
    if (confirm(`¿Estás seguro de eliminar el componente "${component.name}"?`)) {
      await deleteComponent.mutateAsync(component.id)
    }
  }

  const handleFormSuccess = () => {
    refetch()
    setEditingComponent(null)
  }

  const handleFormClose = () => {
    setFormOpen(false)
    setEditingComponent(null)
  }

  if (!dimensionId) {
    return <div className="text-sm text-muted-foreground">Selecciona una dimensión primero</div>
  }

  if (isLoading) {
    return <div className="text-sm text-muted-foreground">Cargando componentes...</div>
  }

  return (
    <>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium">Componentes</h4>
          <Button size="sm" variant="outline" onClick={() => setFormOpen(true)}>
            <Plus className="h-3 w-3 mr-1" />
            Nuevo
          </Button>
        </div>

        <div className="space-y-1">
          {components?.data?.map((component: Component) => (
            <Card
              key={component.id}
              className={`p-2 cursor-pointer transition-colors hover:bg-muted/50 ${selectedComponent?.id === component.id ? 'bg-primary/10 border-primary' : ''
                }`}
              onClick={() => selectComponent(component)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{component.code}</p>
                  <p className="text-xs text-muted-foreground truncate">{component.name}</p>
                </div>
                <div className="flex items-center space-x-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => handleEdit(component, e)}
                    className="h-6 w-6 p-0"
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => handleDelete(component, e)}
                    className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                  {selectedComponent?.id === component.id && (
                    <ChevronRight className="h-3 w-3 text-primary" />
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <ComponentForm
        open={formOpen}
        onClose={handleFormClose}
        component={editingComponent}
        onSuccess={handleFormSuccess}
      />
    </>
  )
}
