'use client'

import React, { useEffect, useState, useCallback } from 'react'
import { BookOpen, Plus, AlertCircle } from 'lucide-react'
import { Button } from '@una-gc/ui/components/button'
import { Input } from '@una-gc/ui/components/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@una-gc/ui/components/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@una-gc/ui/components/card'
import { Alert, AlertDescription } from '@una-gc/ui/components/alert'
import { EmptyState } from './EmptyState'
import { RepitenciasForm } from './RepitenciasForm'
import { useRepitenciasStore } from '../store/useRepitenciasStore'
import { useAcademicCycle } from '@/shared/hooks/useAcademicCycle'
import { useCampus } from '@/shared/hooks/useCampus'
import { useCourses } from '@/shared/hooks/useCourses'
import type { CreateRepitenciaDto } from '../services/repitencias.service'

interface RepitenciasManagerProps {
  campusAllocationId?: string
}

export default function RepitenciasManager({ campusAllocationId }: RepitenciasManagerProps) {
  const { repitencias, loading, error, fetchAll, fetchByCampusAllocation, create, clearError } = useRepitenciasStore()

  // Cargar datos de selectores
  const { data: cycles = [], isLoading: loadingCycles } = useAcademicCycle()
  const { data: campuses = [], isLoading: loadingCampuses } = useCampus()
  const { data: courses = [], isLoading: loadingCourses } = useCourses()

  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({ curricularMeshId: '' })

  const handleFormSubmit = async (data: any) => {
    const hours = Number(data.additionalHours)
    const students = Number(data.studentsCount)

    try {
      const dto: CreateRepitenciaDto = {
        campusId: data.campusId,
        curricularMeshId: formData.curricularMeshId || data.campusId, // Fallback temporal
        courseId: data.courseId,
        academicCycleId: data.academicCycleId,
        campusAllocationId: campusAllocationId || '',
        courseName: data.courseName,
        courseCode: data.courseCode,
        careerName: data.careerName,
        additionalHours: hours,
        studentsCount: students,
        reason: data.reason,
        status: 'PENDING'
      }

      await create(dto)
      setShowForm(false)
      alert('✅ Repitencia creada exitosamente')
    } catch (err) {
      console.error('Error al crear repitencia:', err)
      alert('❌ Error al crear repitencia. Verifica los datos e intenta nuevamente.')
    }
  }

  const loadCampusAllocationData = useCallback(async (allocationId: string) => {
    try {
      const url = `http://localhost:3000/api/v1/campus-journey-time-allocations/raw/${allocationId}`
      const res = await fetch(url)

      if (res.ok) {
        const json = await res.json()
        const data = json.data || json

        setFormData((prev) => ({
          ...prev,
          campusId: data.campusId || '',
          curricularMeshId: data.curricularMeshId || '',
          academicCycleId: data.academicCycleId || ''
        }))
      }
    } catch (err) {
      console.error('❌ Error al cargar campus allocation:', err)
    }
  }, [])

  useEffect(() => {
    if (campusAllocationId) {
      fetchByCampusAllocation(campusAllocationId)
      loadCampusAllocationData(campusAllocationId)
    } else {
      fetchAll()
    }
  }, [campusAllocationId, fetchAll, fetchByCampusAllocation, loadCampusAllocationData])

  const totalHoras = repitencias.reduce((sum, r) => sum + r.additionalHours, 0)

  if (loading && repitencias.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-3 text-sm text-muted-foreground">Cargando registros...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Error Message */}
      {error && (
        <div className="p-3 bg-red-100 text-red-800 rounded flex justify-between items-center">
          <span>{error}</span>
          <Button variant="ghost" size="sm" onClick={clearError}>
            Cerrar
          </Button>
        </div>
      )}

      {/* Summary Card */}
      {repitencias.length > 0 && (
        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <BookOpen className="h-8 w-8 text-orange-600" />
                <div>
                  <p className="text-sm text-orange-700 font-medium">Total de Registros</p>
                  <p className="text-2xl font-bold text-orange-900">{repitencias.length}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-orange-700 font-medium">Horas Adicionales</p>
                <p className="text-2xl font-bold text-orange-900">{totalHoras.toFixed(1)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add Button */}
      <div className="flex justify-end">
        <Button onClick={() => setShowForm(!showForm)} disabled={loading}>
          <Plus className="h-4 w-4 mr-2" />
          {showForm ? 'Cancelar' : 'Agregar Repitencia'}
        </Button>
      </div>

      {/* Form */}
      {showForm && (
        <RepitenciasForm
          cycles={cycles}
          campuses={campuses}
          courses={courses}
          loadingCycles={loadingCycles}
          loadingCampuses={loadingCampuses}
          loadingCourses={loadingCourses}
          onSubmit={handleFormSubmit}
          onCancel={() => setShowForm(false)}
          loading={loading}
        />
      )}

      {/* Records Table */}
      {repitencias.length === 0 ? (
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
                    Código
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Curso
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Carrera
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Horas
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Estudiantes
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Estado
                  </th>
                </tr>
              </thead>
              <tbody className="bg-background divide-y divide-border">
                {repitencias.map((record) => (
                  <tr key={record.id} className="hover:bg-muted/50 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">{record.courseCode}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">{record.courseName}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">{record.careerName}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold">{record.additionalHours}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">{record.studentsCount || '-'}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          record.status === 'APPROVED'
                            ? 'bg-green-100 text-green-800'
                            : record.status === 'PENDING'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {record.status || 'PENDING'}
                      </span>
                    </td>
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
