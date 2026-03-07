'use client'

import React, { useState, useMemo } from 'react'
import { UserPlus, Search, Users, Clock, AlertCircle } from 'lucide-react'
import { Button } from '@una-gc/ui/components/button'
import { Input } from '@una-gc/ui/components/input'
import { Card, CardContent } from '@una-gc/ui/components/card'
import { EmptyState } from './EmptyState'
import { ProfessorAssignmentsForm } from './ProfessorAssignmentsForm'
import { useAcademicCycle } from '@/shared/hooks/useAcademicCycle'
import { useCampus } from '@/shared/hooks/useCampus'
import { useProfessors } from '@/shared/hooks/useProfessors'
import { useCourses } from '@/shared/hooks/useCourses'

export interface ProfessorAssignmentRow {
  id: string
  professorName: string
  professorId: string
  career: string
  campus: string
  assignedHours: number
  assignmentType: string
  status: 'active' | 'inactive' | 'pending'
}

interface ProfessorAssignmentsProps {
  assignments: ProfessorAssignmentRow[]
  loading?: boolean
  onAssign?: (assignment: Record<string, any>) => void
}

export default function ProfessorAssignments({ assignments, loading, onAssign }: ProfessorAssignmentsProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [showForm, setShowForm] = useState(false)

  // Data hooks
  const { data: cycles = [], isLoading: loadingCycles } = useAcademicCycle()
  const { data: campuses = [], isLoading: loadingCampuses } = useCampus()
  const { data: professors = [], isLoading: loadingProfessors } = useProfessors()
  const { data: courses = [], isLoading: loadingCourses } = useCourses()

  const filteredAssignments = useMemo(() => {
    if (!searchTerm) return assignments

    const term = searchTerm.toLowerCase()
    return assignments.filter(
      (a) =>
        a.professorName.toLowerCase().includes(term) ||
        a.professorId.toLowerCase().includes(term) ||
        a.campus.toLowerCase().includes(term)
    )
  }, [assignments, searchTerm])

  const summary = useMemo(() => {
    const totalTimes = assignments.reduce((sum, a) => sum + a.assignedHours, 0)
    const totalProfessors = new Set(assignments.map((a) => a.professorId)).size
    const avgTimes = totalProfessors > 0 ? (totalTimes / totalProfessors).toFixed(2) : '0'

    // Convertir tiempos a horas reales según las fórmulas:
    // FULL = 1 tiempo = 12h, HALF = 0.5 tiempos = 6h, QUARTER = 0.25 tiempos = 3h
    const totalHours = assignments.reduce((sum, a) => {
      return sum + a.assignedHours * 12 // 1 tiempo = 12 horas
    }, 0)

    return {
      totalTimes: totalTimes.toFixed(2),
      totalHours: totalHours.toFixed(0),
      totalProfessors,
      avgTimes
    }
  }, [assignments])

  const handleFormSubmit = (data: any) => {
    onAssign?.(data)
    setShowForm(false)
  }

  const statusColors = {
    active: 'bg-green-100 text-green-800',
    inactive: 'bg-gray-100 text-gray-800',
    pending: 'bg-yellow-100 text-yellow-800'
  }

  const statusLabels = {
    active: 'Activo',
    inactive: 'Inactivo',
    pending: 'Pendiente'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-3 text-sm text-muted-foreground">Cargando asignaciones...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-sm text-blue-700 font-medium">Profesores</p>
                <p className="text-2xl font-bold text-blue-900">{summary.totalProfessors}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Clock className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-sm text-purple-700 font-medium">Tiempos Totales</p>
                <p className="text-2xl font-bold text-purple-900">{summary.totalTimes}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Clock className="h-8 w-8 text-orange-600" />
              <div>
                <p className="text-sm text-orange-700 font-medium">Horas Totales</p>
                <p className="text-2xl font-bold text-orange-900">{summary.totalHours}h</p>
                <p className="text-xs text-orange-600">1 tiempo = 12h</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-sm text-green-700 font-medium">Promedio</p>
                <p className="text-2xl font-bold text-green-900">{summary.avgTimes}</p>
                <p className="text-xs text-green-600">tiempos/profesor</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Buscar por profesor, cédula o sede..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="sm:w-auto">
          <UserPlus className="h-4 w-4 mr-2" />
          {showForm ? 'Cancelar' : 'Nueva Asignación'}
        </Button>
      </div>

      {/* Assignment Form */}
      {showForm && (
        <ProfessorAssignmentsForm
          cycles={cycles}
          campuses={campuses}
          professors={professors}
          courses={courses}
          loadingCycles={loadingCycles}
          loadingCampuses={loadingCampuses}
          loadingProfessors={loadingProfessors}
          loadingCourses={loadingCourses}
          onSubmit={handleFormSubmit}
          onCancel={() => setShowForm(false)}
          loading={false}
        />
      )}

      {/* Assignments Table */}
      {filteredAssignments.length === 0 ? (
        <EmptyState
          icon={<Users className="h-12 w-12" />}
          title="No hay asignaciones"
          description={
            searchTerm
              ? 'No se encontraron asignaciones que coincidan con tu búsqueda.'
              : 'Comienza asignando horas de jornada a los profesores.'
          }
        />
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Profesor
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Cédula
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Sede</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Horas
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Tipo</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Estado
                  </th>
                </tr>
              </thead>
              <tbody className="bg-background divide-y divide-border">
                {filteredAssignments.map((assignment) => (
                  <tr key={assignment.id} className="hover:bg-muted/50 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">{assignment.professorName}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-muted-foreground">{assignment.professorId}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">{assignment.campus}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold">{assignment.assignedHours}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">{assignment.assignmentType || 'N/A'}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          statusColors[assignment.status]
                        }`}
                      >
                        {statusLabels[assignment.status]}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {searchTerm && filteredAssignments.length > 0 && (
        <p className="text-sm text-muted-foreground">
          Mostrando {filteredAssignments.length} de {assignments.length} asignaciones
        </p>
      )}
    </div>
  )
}
