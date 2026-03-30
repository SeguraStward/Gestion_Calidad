'use client'

import React, { useEffect, useState } from 'react'
import { CalendarClock, CheckCircle2, Plus } from 'lucide-react'
import { Button } from '@una-gc/ui/components/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@una-gc/ui/components/card'
import { Input } from '@una-gc/ui/components/input'

import { useAnnualAllocationsStore } from '../store/useAnnualAllocationsStore'

interface AnnualAllocationQuickCreateProps {
  onSuccess?: (allocationId: string) => void
}

export default function AnnualAllocationQuickCreate({ onSuccess }: AnnualAllocationQuickCreateProps) {
  const { activeAllocation, loading, error, fetchActive, create: createAllocation, clearError } = useAnnualAllocationsStore()

  const [showForm, setShowForm] = useState(false)
  const [year, setYear] = useState(new Date().getFullYear())
  const [totalTime, setTotalTime] = useState('2000')

  useEffect(() => {
    fetchActive()
  }, [fetchActive])

  const handleCreate = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!year || !totalTime) {
      alert('Completa todos los campos requeridos.')
      return
    }

    const total = Number(totalTime)
    if (!Number.isFinite(total) || total <= 0) {
      alert('El tiempo total debe ser un numero valido mayor a 0.')
      return
    }

    try {
      const newAllocation = await createAllocation({
        year,
        totalJourneyTime: total,
        status: 'ACTIVE'
      })

      setShowForm(false)
      alert(`Asignacion anual creada para el año ${year}`)

      if (newAllocation?.id && onSuccess) {
        onSuccess(newAllocation.id)
      }
    } catch (err) {
      console.error('Error creating annual allocation:', err)
      alert('Error al crear la asignacion anual. Intenta nuevamente.')
    }
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-3 bg-red-100 text-red-800 rounded flex justify-between items-center">
          <span>{error}</span>
          <Button variant="ghost" size="sm" onClick={clearError}>
            Cerrar
          </Button>
        </div>
      )}

      {activeAllocation && !showForm && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Asignacion Activa</p>
                  <p className="text-2xl font-bold">Año {activeAllocation.year}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Tiempo Total</p>
                <p className="text-2xl font-bold">{activeAllocation.totalJourneyTime}h</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {!activeAllocation && !showForm && !loading && (
        <Card>
          <CardContent className="p-6 text-center">
            <CalendarClock className="h-12 w-12 text-primary mx-auto mb-3" />
            <h3 className="text-lg font-semibold mb-2">Sin Asignacion Activa</h3>
            <p className="text-sm text-muted-foreground mb-4">
              No existe una asignacion anual activa. Crea una para comenzar a gestionar tiempos de jornada.
            </p>
            <Button onClick={() => setShowForm(true)} disabled={loading}>
              <Plus className="h-4 w-4 mr-2" />
              Crear Asignacion Anual
            </Button>
          </CardContent>
        </Card>
      )}

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Nueva Asignacion Anual</CardTitle>
            <CardDescription>Define el año y el tiempo total disponible para asignaciones de jornada academica</CardDescription>
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
                    onChange={(event) => setYear(Number(event.target.value))}
                    placeholder="2026"
                    min="2020"
                    max="2100"
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block">
                    Tiempo Total Disponible (horas) <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="number"
                    value={totalTime}
                    onChange={(event) => setTotalTime(event.target.value)}
                    placeholder="2000"
                    min="1"
                    step="0.5"
                    required
                  />
                </div>
              </div>

              <div className="bg-muted border rounded-lg p-4">
                <p className="text-sm font-medium mb-2">Informacion importante</p>
                <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                  <li>La nueva asignacion se creara en estado ACTIVO</li>
                  <li>Solo debe existir una asignacion activa por año</li>
                  <li>El total podra ajustarse posteriormente si es necesario</li>
                </ul>
              </div>

              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)} disabled={loading}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Creando...' : 'Crear Asignacion'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {loading && !showForm && (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-3 text-sm text-muted-foreground">Cargando asignacion activa...</span>
        </div>
      )}
    </div>
  )
}
