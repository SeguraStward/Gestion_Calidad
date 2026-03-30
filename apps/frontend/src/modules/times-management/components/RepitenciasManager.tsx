'use client'

import React, { useCallback, useEffect, useState } from 'react'
import { AlertCircle, BookOpen, Plus } from 'lucide-react'
import { Alert, AlertDescription } from '@una-gc/ui/components/alert'
import { Button } from '@una-gc/ui/components/button'
import { Card, CardContent } from '@una-gc/ui/components/card'
import { toast } from 'sonner'

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

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1'

export default function RepitenciasManager({ campusAllocationId }: RepitenciasManagerProps) {
  const { repitencias, loading, error, fetchAll, fetchByCampusAllocation, create, clearError } = useRepitenciasStore()

  const { data: cycles = [], isLoading: loadingCycles } = useAcademicCycle()
  const { data: campuses = [], isLoading: loadingCampuses } = useCampus()
  const { data: courses = [], isLoading: loadingCourses } = useCourses()

  const [showForm, setShowForm] = useState(false)
  const [curricularMeshId, setCurricularMeshId] = useState('')

  const loadCampusAllocationData = useCallback(async (allocationId: string) => {
    try {
      const res = await fetch(`${API_URL}/campus-journey-time-allocations/raw/${allocationId}`, { cache: 'no-store' })

      if (!res.ok) {
        return
      }

      const json = await res.json()
      const data = json?.data || json
      setCurricularMeshId(data?.curricularMeshId || '')
    } catch (err) {
      console.error('Error loading campus allocation:', err)
      setCurricularMeshId('')
    }
  }, [])

  useEffect(() => {
    if (campusAllocationId) {
      fetchByCampusAllocation(campusAllocationId)
      loadCampusAllocationData(campusAllocationId)
      return
    }

    fetchAll()
    setCurricularMeshId('')
  }, [campusAllocationId, fetchAll, fetchByCampusAllocation, loadCampusAllocationData])

  const handleFormSubmit = async (data: any) => {
    if (!campusAllocationId) {
      toast.error('Selecciona una asignacion de campus antes de registrar repitencias.')
      return
    }

    const additionalHours = Number(data.additionalHours)
    const studentsCount = Number(data.studentsCount)

    if (!Number.isFinite(additionalHours) || additionalHours <= 0) {
      toast.error('Las horas adicionales deben ser mayores a 0.')
      return
    }

    const dto: CreateRepitenciaDto = {
      campusId: data.campusId,
      ...(curricularMeshId ? { curricularMeshId } : {}),
      courseId: data.courseId,
      academicCycleId: data.academicCycleId,
      campusAllocationId,
      courseName: data.courseName,
      courseCode: data.courseCode,
      careerName: data.careerName,
      additionalHours,
      studentsCount: Number.isFinite(studentsCount) && studentsCount > 0 ? studentsCount : undefined,
      reason: data.reason,
      status: 'PENDING'
    }

    try {
      await create(dto)
      setShowForm(false)
      toast.success('Repitencia registrada correctamente')
    } catch (err) {
      console.error('Error creating repitencia:', err)
      toast.error('Error al crear repitencia. Verifica los datos e intenta nuevamente.')
    }
  }

  const totalHoras = repitencias.reduce((sum, item) => sum + item.additionalHours, 0)

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
      {error && (
        <div className="p-3 bg-red-100 text-red-800 rounded flex justify-between items-center">
          <span>{error}</span>
          <Button variant="ghost" size="sm" onClick={clearError}>
            Cerrar
          </Button>
        </div>
      )}

      {!campusAllocationId && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Para registrar repitencias debes contar con una asignacion de campus activa en este periodo.
          </AlertDescription>
        </Alert>
      )}

      {repitencias.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <BookOpen className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Total de Registros</p>
                  <p className="text-2xl font-bold">{repitencias.length}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Horas Adicionales</p>
                <p className="text-2xl font-bold">{totalHoras.toFixed(1)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-end">
        <Button onClick={() => setShowForm(!showForm)} disabled={loading || !campusAllocationId}>
          <Plus className="h-4 w-4 mr-2" />
          {showForm ? 'Cancelar' : 'Agregar Repitencia'}
        </Button>
      </div>

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
                    Codigo
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
