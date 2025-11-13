'use client'

import React from 'react'
import { Button } from '@una-gc/ui/components/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@una-gc/ui/components/dropdown-menu'
import { MoreHorizontal, Edit, Trash2, Eye, Users, Briefcase } from 'lucide-react'
import type { InstitutionalProject } from '../services/institutional-projects.service'
import { EmptyState } from './EmptyState'

interface InstitutionalProjectsTableProps {
  projects: InstitutionalProject[]
  onEdit?: (project: InstitutionalProject) => void
  onDelete?: (id: string) => void
  onView?: (project: InstitutionalProject) => void
  onManageAssignments?: (project: InstitutionalProject) => void
  loading?: boolean
}

const PROJECT_TYPE_LABELS: Record<string, string> = {
  INSTITUTIONAL: 'Institucional',
  RESEARCH: 'Investigación',
  EXTENSION: 'Extensión',
  OTHER: 'Otro'
}

const STATUS_LABELS: Record<string, string> = {
  DRAFT: 'Borrador',
  ACTIVE: 'Activo',
  PAUSED: 'Pausado',
  COMPLETED: 'Completado',
  CANCELLED: 'Cancelado'
}

const STATUS_COLORS: Record<string, string> = {
  DRAFT: 'bg-gray-100 text-gray-800',
  ACTIVE: 'bg-green-100 text-green-800',
  PAUSED: 'bg-yellow-100 text-yellow-800',
  COMPLETED: 'bg-blue-100 text-blue-800',
  CANCELLED: 'bg-red-100 text-red-800'
}

export default function InstitutionalProjectsTable({
  projects,
  onEdit,
  onDelete,
  onView,
  onManageAssignments,
  loading
}: InstitutionalProjectsTableProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-3 text-gray-600">Cargando proyectos...</span>
      </div>
    )
  }

  if (!projects || projects.length === 0) {
    return (
      <EmptyState
        icon={<Briefcase className="h-16 w-16" />}
        title="No hay proyectos institucionales registrados"
        description="Los proyectos institucionales requieren asignación de tiempo de jornada de profesores. Crea el primer proyecto para gestionar las horas."
      />
    )
  }

  const calculateCapacity = (project: InstitutionalProject) => {
    if (project.requiredJourneyTime === 0) return 0
    return Math.round((project.assignedJourneyTime / project.requiredJourneyTime) * 100)
  }

  const getCapacityColor = (capacity: number) => {
    if (capacity >= 100) return 'text-green-600'
    if (capacity >= 75) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-gray-300 px-4 py-2 text-left font-semibold">Código</th>
            <th className="border border-gray-300 px-4 py-2 text-left font-semibold">Título / Director</th>
            <th className="border border-gray-300 px-4 py-2 text-left font-semibold">Tipo</th>
            <th className="border border-gray-300 px-4 py-2 text-center font-semibold">Horas Requeridas</th>
            <th className="border border-gray-300 px-4 py-2 text-center font-semibold">Horas Asignadas</th>
            <th className="border border-gray-300 px-4 py-2 text-center font-semibold">Capacidad</th>
            <th className="border border-gray-300 px-4 py-2 text-left font-semibold">Estado</th>
            <th className="border border-gray-300 px-4 py-2 text-center font-semibold">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {projects.map((project) => {
            const capacity = calculateCapacity(project)
            return (
              <tr key={project.id} className="hover:bg-gray-50">
                <td className="border border-gray-300 px-4 py-2">
                  <span className="font-mono text-sm font-medium">{project.code}</span>
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  <div>
                    <p className="font-medium">{project.title}</p>
                    {project.director && (
                      <p className="text-sm text-gray-500 mt-1">
                        Director: {project.director.firstName} {project.director.lastName}
                      </p>
                    )}
                    {project.description && <p className="text-xs text-gray-400 mt-1 line-clamp-2">{project.description}</p>}
                  </div>
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  <span className="inline-block px-2 py-1 text-xs font-medium rounded bg-purple-100 text-purple-800">
                    {PROJECT_TYPE_LABELS[project.projectType] || project.projectType}
                  </span>
                </td>
                <td className="border border-gray-300 px-4 py-2 text-center">
                  <span className="font-semibold text-lg">{project.requiredJourneyTime}h</span>
                </td>
                <td className="border border-gray-300 px-4 py-2 text-center">
                  <span className="font-semibold text-lg">{project.assignedJourneyTime}h</span>
                </td>
                <td className="border border-gray-300 px-4 py-2 text-center">
                  <div className="flex flex-col items-center">
                    <span className={`font-bold text-xl ${getCapacityColor(capacity)}`}>{capacity}%</span>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                      <div
                        className={`h-2 rounded-full ${
                          capacity >= 100 ? 'bg-green-500' : capacity >= 75 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${Math.min(capacity, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  <span
                    className={`inline-block px-2 py-1 text-xs font-medium rounded ${
                      STATUS_COLORS[project.projectStatus || 'DRAFT']
                    }`}
                  >
                    {STATUS_LABELS[project.projectStatus || 'DRAFT']}
                  </span>
                </td>
                <td className="border border-gray-300 px-4 py-2 text-center">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Abrir menú</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {onView && (
                        <DropdownMenuItem onClick={() => onView(project)}>
                          <Eye className="mr-2 h-4 w-4" />
                          Ver detalles
                        </DropdownMenuItem>
                      )}
                      {onManageAssignments && (
                        <DropdownMenuItem onClick={() => onManageAssignments(project)}>
                          <Users className="mr-2 h-4 w-4" />
                          Gestionar asignaciones
                        </DropdownMenuItem>
                      )}
                      {onEdit && (
                        <DropdownMenuItem onClick={() => onEdit(project)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                      )}
                      {onDelete && (
                        <DropdownMenuItem
                          onClick={() => {
                            if (confirm(`¿Estás seguro de eliminar el proyecto "${project.code}"?`)) {
                              onDelete(project.id!)
                            }
                          }}
                          className="text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Eliminar
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
