'use client'

import React, { useState } from 'react'
import { BookOpen, Plus } from 'lucide-react'
import { Button } from '@una-gc/ui/components/button'
import { Input } from '@una-gc/ui/components/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@una-gc/ui/components/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@una-gc/ui/components/card'
import { EmptyState } from './EmptyState'

export interface RepitenciaRecord {
  id: string
  carrera: string
  curso: string
  sede: string
  horas: number
  date: string
}

interface RepitenciasManagerProps {
  records: RepitenciaRecord[]
  loading?: boolean
  onAdd?: (record: Omit<RepitenciaRecord, 'id' | 'date'>) => void
}

export default function RepitenciasManager({ records, loading, onAdd }: RepitenciasManagerProps) {
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    carrera: '',
    curso: '',
    sede: '',
    horas: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.carrera || !formData.curso || !formData.sede || !formData.horas) {
      alert('Por favor completa todos los campos.')
      return
    }

    const hours = Number(formData.horas)
    if (isNaN(hours) || hours <= 0) {
      alert('Las horas deben ser un número válido mayor a 0.')
      return
    }

    onAdd?.({
      carrera: formData.carrera,
      curso: formData.curso,
      sede: formData.sede,
      horas: hours
    })

    // Reset form
    setFormData({
      carrera: '',
      curso: '',
      sede: '',
      horas: ''
    })
    setShowForm(false)
  }

  const totalHoras = records.reduce((sum, r) => sum + r.horas, 0)

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-3 text-sm text-muted-foreground">Cargando registros...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      {records.length > 0 && (
        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <BookOpen className="h-8 w-8 text-orange-600" />
                <div>
                  <p className="text-sm text-orange-700 font-medium">Total de Registros</p>
                  <p className="text-2xl font-bold text-orange-900">{records.length}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-orange-700 font-medium">Horas Totales</p>
                <p className="text-2xl font-bold text-orange-900">{totalHoras}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add Button */}
      <div className="flex justify-end">
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4 mr-2" />
          {showForm ? 'Cancelar' : 'Agregar Repitencia'}
        </Button>
      </div>

      {/* Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Registrar Repitencia</CardTitle>
            <CardDescription>Ingresa los datos del curso con repitencia</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Carrera</label>
                  <Input
                    value={formData.carrera}
                    onChange={(e) => setFormData({ ...formData, carrera: e.target.value })}
                    placeholder="Nombre de la carrera"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Curso</label>
                  <Input
                    value={formData.curso}
                    onChange={(e) => setFormData({ ...formData, curso: e.target.value })}
                    placeholder="Código o nombre del curso"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Sede</label>
                  <Select value={formData.sede} onValueChange={(val) => setFormData({ ...formData, sede: val })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona una sede" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Brunca">Brunca</SelectItem>
                      <SelectItem value="Coto">Coto</SelectItem>
                      <SelectItem value="General">Sede General</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Horas</label>
                  <Input
                    type="number"
                    value={formData.horas}
                    onChange={(e) => setFormData({ ...formData, horas: e.target.value })}
                    placeholder="Número de horas"
                    min="0"
                    step="0.5"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancelar
                </Button>
                <Button type="submit">Guardar Repitencia</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Records Table */}
      {records.length === 0 ? (
        <EmptyState
          icon={<BookOpen className="h-12 w-12" />}
          title="No hay registros de repitencias"
          description="Comienza agregando registros de cursos con repitencia para llevar el control de horas adicionales."
        />
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Carrera
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Curso
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Sede</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Horas
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Fecha
                  </th>
                </tr>
              </thead>
              <tbody className="bg-background divide-y divide-border">
                {records.map((record) => (
                  <tr key={record.id} className="hover:bg-muted/50 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">{record.carrera}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">{record.curso}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">{record.sede}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold">{record.horas}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-muted-foreground">{record.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
