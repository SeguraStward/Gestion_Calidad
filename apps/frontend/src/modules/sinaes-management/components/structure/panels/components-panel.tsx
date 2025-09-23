'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@una-gc/ui/components'
import { Button } from '@una-gc/ui/components/button'
import { useComponents } from '../../../services/components.service'
import { useSinaesNavigation } from '../../../store/sinaes-navigation.store'
import { ComponentForm } from '../../forms/component-form'
import { cn } from '@una-gc/ui/lib/utils'
import type { Component } from '../../../types/components.types'

export const ComponentsPanel = () => {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingComponent, setEditingComponent] = useState<Component | null>(null)

  const {
    selectedDimension,
    selectedComponent,
    selectComponent
  } = useSinaesNavigation()

  const { data: components, isLoading } = useComponents({
    dimensionId: selectedDimension?.id || ''
  })

  const handleSelectComponent = (component: Component) => {
    if (selectedComponent?.id === component.id) {
      // Si ya está seleccionado, lo deseleccionamos
      selectComponent(null)
    } else {
      selectComponent(component)
    }
  }

  const handleEditComponent = (e: React.MouseEvent, component: Component) => {
    e.stopPropagation()
    setEditingComponent(component)
    setShowEditModal(true)
  }

  const handleCloseCreateModal = () => {
    setShowCreateModal(false)
  }

  const handleCloseEditModal = () => {
    setShowEditModal(false)
    setEditingComponent(null)
  }

  if (!selectedDimension) {
    return null
  }

  return (
    <>
      <Card className="h-full flex flex-col">
        <CardHeader className="flex-shrink-0 pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">
              Componentes
              <div className="text-xs font-normal text-muted-foreground mt-1 truncate">
                {selectedDimension.name}
              </div>
            </CardTitle>
            <Button
              size="sm"
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-1 h-7 px-2 text-xs"
            >
              <Plus className="h-3 w-3" />
              Nuevo
            </Button>
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto px-3 pb-3">
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="text-sm text-muted-foreground">Cargando...</div>
            </div>
          ) : (
            <div className="space-y-2">
              {components?.data?.map((component) => (
                <div
                  key={component.id}
                  className={cn(
                    "p-2 rounded-md border cursor-pointer transition-all hover:border-primary",
                    selectedComponent?.id === component.id
                      ? "border-primary bg-primary/5"
                      : "border-border hover:bg-muted/50"
                  )}
                  onClick={() => handleSelectComponent(component)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">
                        {component.code} - {component.name}
                      </div>
                      {component.description && (
                        <div className="text-xs text-muted-foreground mt-1 truncate">
                          {component.description}
                        </div>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => handleEditComponent(e, component)}
                      className="ml-2 h-5 w-5 p-0 text-xs flex-shrink-0"
                    >
                      <span className="sr-only">Editar</span>
                      ✏️
                    </Button>
                  </div>
                </div>
              ))}

              {components?.data?.length === 0 && (
                <div className="text-center py-6 text-muted-foreground">
                  <div className="text-sm">No hay componentes para esta dimensión</div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowCreateModal(true)}
                    className="mt-2 h-7 px-2 text-xs"
                  >
                    Crear primer componente
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <ComponentForm
        open={showCreateModal}
        onClose={handleCloseCreateModal}
        onSuccess={handleCloseCreateModal}
      />

      <ComponentForm
        open={showEditModal}
        onClose={handleCloseEditModal}
        component={editingComponent}
        onSuccess={handleCloseEditModal}
      />
    </>
  )
}