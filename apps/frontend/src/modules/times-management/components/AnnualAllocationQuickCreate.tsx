'use client'

import React, { useEffect, useState } from 'react'
import { CalendarClock, Plus, CheckCircle2 } from 'lucide-react'
import { Button } from '@una-gc/ui/components/button'
import { Input } from '@una-gc/ui/components/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@una-gc/ui/components/card'
import { useAnnualAllocationsStore } from '../store/useAnnualAllocationsStore'

interface AnnualAllocationQuickCreateProps {
  onSuccess?: (allocationId: string) => void
}

/**
 * Componente para crear rápidamente una Asignación Anual de Tiempo de Jornada.
 * Permite al usuario crear una asignación para el año actual con el tiempo total disponible.
 * Este componente resuelve el problema de los IDs mockeados al permitir crear
 * registros reales en la base de datos.
 */
export default function AnnualAllocationQuickCreate({ onSuccess }: AnnualAllocationQuickCreateProps) {
  const { activeAllocation, loading, error, fetchActive, create: createAllocation, clearError } = useAnnualAllocationsStore()

  const [showForm, setShowForm] = useState(false)
  const [year, setYear] = useState(new Date().getFullYear())
  const [totalTime, setTotalTime] = useState('2000')

  useEffect(() => {
    // Cargar la asignación activa al montar
    fetchActive()
  }, [fetchActive])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!year || !totalTime) {
      alert('Por favor completa todos los campos.')
      return
    }

    const total = Number(totalTime)
    if (isNaN(total) || total <= 0) {
      alert('El tiempo total debe ser un número válido mayor a 0.')
      return
    }

    try {
      const newAllocation = await createAllocation({
        year,
        totalJourneyTime: total,
        status: 'ACTIVE'
      })

      alert(`Asignación anual creada exitosamente para el año ${year}`)
      setShowForm(false)

      // Callback con el ID de la nueva asignación
      if (newAllocation?.id && onSuccess) {
        onSuccess(newAllocation.id)
      }
    } catch (err) {
      console.error('Error al crear asignación anual:', err)
      alert('Error al crear la asignación anual. Por favor intenta nuevamente.')
    }
  }

  return (
    <div className="space-y-4">
      {/* Error Message */}
      {error && (
        <div className="p-3 bg-red-100 text-red-800 rounded flex justify-between items-center">
          <span>{error}</span>
          <Button variant="ghost" size="sm" onClick={clearError}>
            Cerrar
          </Button>
        </div>
      )}

      {/* Active Allocation Card - HIDDEN because calculated fields not synced */}
      {/* TODO: Re-enable once backend properly calculates totalAllocatedToCampus and availableJourneyTime */}
      {false && activeAllocation && !showForm && (
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-sm text-green-700 font-medium">Asignación Activa</p>
                  <p className="text-2xl font-bold text-green-900">Año {activeAllocation.year}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-green-700 font-medium">Tiempo Total</p>
                <p className="text-2xl font-bold text-green-900">{activeAllocation.totalJourneyTime}h</p>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-green-300">
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-green-700">Asignado a Sedes</p>
                  <p className="font-semibold text-green-900">{activeAllocation.totalAllocatedToCampus || 0}h</p>
                </div>
                <div>
                  <p className="text-green-700">Disponible</p>
                  <p className="font-semibold text-green-900">
                    {activeAllocation.totalJourneyTime - (activeAllocation.totalAllocatedToCampus || 0)}h
                  </p>
                </div>
                <div>
                  <p className="text-green-700">Estado</p>
                  <p className="font-semibold text-green-900">
                    {activeAllocation.status === 'DRAFT' ? 'BORRADOR' : activeAllocation.status || 'ACTIVO'}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Active Allocation - Show Create Button */}
      {!activeAllocation && !showForm && !loading && (
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6 text-center">
            <CalendarClock className="h-12 w-12 text-blue-600 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-blue-900 mb-2">Sin Asignación Activa</h3>
            <p className="text-sm text-blue-700 mb-4">
              No existe una asignación anual activa. Crea una para comenzar a gestionar tiempos de jornada.
            </p>
            <Button onClick={() => setShowForm(true)} disabled={loading}>
              <Plus className="h-4 w-4 mr-2" />
              Crear Asignación Anual
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Create Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Nueva Asignación Anual</CardTitle>
            <CardDescription>Define el año y el tiempo total disponible para asignaciones de jornada académica</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">
                    Año <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="number"
                    value={year}
                    onChange={(e) => setYear(Number(e.target.value))}
                    placeholder="2025"
                    min="2020"
                    max="2100"
                    required
                  />
                  <p className="text-xs text-muted-foreground mt-1">Año académico para la asignación</p>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">
                    Tiempo Total Disponible (horas) <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="number"
                    value={totalTime}
                    onChange={(e) => setTotalTime(e.target.value)}
                    placeholder="2000"
                    min="1"
                    step="0.5"
                    required
                  />
                  <p className="text-xs text-muted-foreground mt-1">Total de horas disponibles para asignar</p>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800 font-medium mb-2">ℹ️ Información Importante</p>
                <ul className="text-xs text-blue-700 space-y-1 list-disc list-inside">
                  <li>Una vez creada, esta asignación se marcará como ACTIVA automáticamente</li>
                  <li>El tiempo total se distribuirá entre sedes, proveedores y proyectos</li>
                  <li>Solo puede existir una asignación activa por año</li>
                  <li>Puedes ajustar el tiempo total más adelante si es necesario</li>
                </ul>
              </div>

              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)} disabled={loading}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Creando...' : 'Crear Asignación'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {loading && !showForm && (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-3 text-sm text-muted-foreground">Cargando asignación activa...</span>
        </div>
      )}
    </div>
  )
}
