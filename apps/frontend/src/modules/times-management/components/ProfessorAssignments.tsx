'use client'

import React, { useMemo, useState } from 'react'
import { AlertCircle, Clock, Search, UserPlus, Users } from 'lucide-react'
import { Button } from '@una-gc/ui/components/button'
import { Card, CardContent } from '@una-gc/ui/components/card'
import { Input } from '@una-gc/ui/components/input'

import { useAcademicCycle } from '@/shared/hooks/useAcademicCycle'
import { useCampus } from '@/shared/hooks/useCampus'
import { useCourses } from '@/shared/hooks/useCourses'
import { useProfessors } from '@/shared/hooks/useProfessors'

import { EmptyState } from './EmptyState'
import { ProfessorAssignmentsForm } from './ProfessorAssignmentsForm'

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

  const { data: cycles = [], isLoading: loadingCycles } = useAcademicCycle()
  const { data: campuses = [], isLoading: loadingCampuses } = useCampus()
  const { data: professors = [], isLoading: loadingProfessors } = useProfessors()
  const { data: courses = [], isLoading: loadingCourses } = useCourses()

  const filteredAssignments = useMemo(() => {
    if (!searchTerm) return assignments

    const term = searchTerm.toLowerCase()
    return assignments.filter(
      (assignment) =>
        assignment.professorName.toLowerCase().includes(term) ||
        assignment.professorId.toLowerCase().includes(term) ||
        assignment.campus.toLowerCase().includes(term)
    )
  }, [assignments, searchTerm])

  const summary = useMemo(() => {
    const totalTimes = assignments.reduce((sum, assignment) => sum + assignment.assignedHours, 0)
    const totalProfessors = new Set(assignments.map((assignment) => assignment.professorId)).size
    const averageTimes = totalProfessors > 0 ? (totalTimes / totalProfessors).toFixed(2) : '0'
    const totalHours = assignments.reduce((sum, assignment) => sum + assignment.assignedHours * 12, 0)

    return {
      totalTimes: totalTimes.toFixed(2),
      totalHours: totalHours.toFixed(0),
      totalProfessors,
      averageTimes
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

  const assignmentTypeLabels: Record<string, string> = {
    FULL: 'Tiempo completo',
    HALF: 'Medio tiempo',
    QUARTER: 'Cuarto de tiempo',
    THREE_QUARTER: 'Tres cuartos de tiempo'
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Profesores</p>
                <p className="text-2xl font-bold">{summary.totalProfessors}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Clock className="h-8 w-8 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Tiempos Totales</p>
                <p className="text-2xl font-bold">{summary.totalTimes}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Clock className="h-8 w-8 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Horas Totales</p>
                <p className="text-2xl font-bold">{summary.totalHours}h</p>
                <p className="text-xs text-muted-foreground">1 tiempo = 12h</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-8 w-8 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Promedio</p>
                <p className="text-2xl font-bold">{summary.averageTimes}</p>
                <p className="text-xs text-muted-foreground">tiempos/profesor</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Buscar por profesor, cedula o sede..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            className="pl-10"
          />
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="sm:w-auto">
          <UserPlus className="h-4 w-4 mr-2" />
          {showForm ? 'Cancelar' : 'Nueva Asignacion'}
        </Button>
      </div>

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

      {filteredAssignments.length === 0 ? (
        <EmptyState
          icon={<Users className="h-12 w-12" />}
          title="No hay asignaciones"
          description={
            searchTerm
              ? 'No se encontraron asignaciones que coincidan con la busqueda.'
              : 'Comienza asignando tiempos de jornada a los profesores.'
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
                    Cedula
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Sede</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Tiempos
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
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      {assignmentTypeLabels[assignment.assignmentType] || assignment.assignmentType || 'No definido'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[assignment.status]}`}
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
