'use client'

import { useState } from 'react'
import { FormLayout } from '../../../../app/(components)/form/form-layout'
import { FormSelect } from '../../../../app/(components)/form/select'
import { Card } from '@una-gc/ui/components/card'
import { Button } from '@una-gc/ui/components/button'
import { Skeleton } from '@una-gc/ui/components/skeleton'
import { useProfessorAssignments } from '@/modules/academic-management/professor-assignment/hooks/useProfessorAssignments'
import { FilterBar } from '../../../../app/(components)/ui/filter-bar'
import { toast } from 'sonner'
import Swal from 'sweetalert2'

export const ProfessorAssignmentPage = () => {
  const {
    courses,
    professors,
    assignments,
    addAssignment,
    deleteAssignment,
    filter,
    setFilter,
    isLoadingCourses,
    isLoadingProfessors
  } = useProfessorAssignments()

  const [selectedCourse, setSelectedCourse] = useState<string | null>(null)
  const [selectedProfessor, setSelectedProfessor] = useState<string | null>(null)

  const handleAssign = () => {
    if (!selectedCourse || !selectedProfessor) {
      toast.error('Debe seleccionar un curso y un profesor.')
      return
    }

    const success = addAssignment(selectedCourse, selectedProfessor)

    if (!success) {
      toast.error('Ya existe esta asignación.')
    } else {
      toast.success('¡Asignación creada con éxito!')
      setSelectedCourse(null)
      setSelectedProfessor(null)
    }
  }

  const confirmDelete = (assignmentId: string) => {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción eliminará la asignación permanentemente.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      reverseButtons: true
    }).then((result) => {
      if (result.isConfirmed) {
        deleteAssignment(assignmentId)
        toast.success('Asignación eliminada correctamente.')
      }
    })
  }

  return (
    <div className="space-y-6">
      <FormLayout
        title="Asignación de Profesores a Cursos"
        onSubmit={(e) => {
          e.preventDefault()
          handleAssign()
        }}
      >
        {isLoadingCourses ? (
          <Skeleton className="h-10 w-full" />
        ) : (
          <FormSelect
            label="Curso"
            value={selectedCourse}
            onChange={setSelectedCourse}
            options={courses}
            placeholder="Seleccione un curso"
            required
          />
        )}

        {isLoadingProfessors ? (
          <Skeleton className="h-10 w-full" />
        ) : (
          <FormSelect
            label="Profesor"
            value={selectedProfessor}
            onChange={setSelectedProfessor}
            options={professors}
            placeholder="Seleccione un profesor"
            required
          />
        )}

        <Button type="submit">Asignar</Button>
      </FormLayout>

      <FilterBar value={filter} onChange={setFilter} />

      <div className="space-y-4">
        <h3 className="text-xl font-bold">Asignaciones actuales</h3>
        {assignments.length === 0 && <p className="text-gray-600">No hay asignaciones que coincidan con el filtro.</p>}
        {assignments.map((assignment) => (
          <Card key={assignment.id} className="flex justify-between items-center p-4">
            <div>
              <p className="font-semibold">{assignment.professor.name}</p>
              <p className="text-sm text-gray-500">{assignment.course.name}</p>
            </div>
            <Button variant="destructive" onClick={() => confirmDelete(assignment.id)}>
              Eliminar
            </Button>
          </Card>
        ))}
      </div>
    </div>
  )
}
