'use client'

import { useState } from 'react'
import { useProfessorAssignments } from '@/modules/academic-management/professor-assignment/hooks/useProfessorAssignments'
import { AssignmentList } from './assignment-list'
import { AssignmentForm } from './assignment-form'
import { AssignmentFilter } from './assignment-filter'
import { DeleteConfirmationDialog } from './delete-confirmation-dialog'
import { LoadingState } from './loading-state'
import { PageHeader } from './page-header'
import { toast } from 'sonner'

export const ProfessorAssignmentPage = () => {
  const {
    courses,
    professors,
    assignments, // sin filtro
    addAssignment,
    deleteAssignment,
    updateAssignment,
    isLoadingCourses,
    isLoadingProfessors
  } = useProfessorAssignments()

  const [formData, setFormData] = useState<any | null>(null)
  const [assignmentToDelete, setAssignmentToDelete] = useState<string | null>(null)
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null)
  const [selectedProfessor, setSelectedProfessor] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const [assignmentFilter, setAssignmentFilter] = useState('')
  const [professorFilter, setProfessorFilter] = useState('')

  const handleEdit = (assignment: any) => {
    setFormData(assignment)
    setSelectedCourse(assignment.course.id)
    setSelectedProfessor(assignment.professor.id)
  }

  const handleAssign = async () => {
    if (!selectedCourse || !selectedProfessor) {
      toast.error('Debe seleccionar un curso y un profesor.')
      return
    }

    setIsSubmitting(true)

    // Esperamos que addAssignment devuelva el resultado
    const success = formData
      ? await updateAssignment(formData.id, selectedCourse, selectedProfessor)
      : await addAssignment(selectedCourse, selectedProfessor)

    if (!success) {
      toast.error('¡Ya existe esta asignación o hubo algún error!')
      setIsSubmitting(false)
      return
    }

    toast.success(formData ? '¡Asignación actualizada con éxito!' : '¡Asignación creada con éxito!')

    setSelectedCourse(null)
    setSelectedProfessor(null)
    setFormData(null)
    setIsSubmitting(false)
  }

  const confirmDelete = (assignmentId: string) => {
    setAssignmentToDelete(assignmentId)
    setShowDeleteDialog(true)
  }

  const handleDelete = () => {
    if (assignmentToDelete) {
      deleteAssignment(assignmentToDelete)
      toast.success('¡Asignación eliminada correctamente!.')
    }
    setShowDeleteDialog(false)
    setAssignmentToDelete(null)
  }

  const isLoading = isLoadingCourses || isLoadingProfessors

  // Filtrar la lista acá, usando los filtros separados
  const filteredAssignments = assignments
    .filter((a) => a.course && a.professor) // Solo completos
    .filter(
      (a) =>
        a.course.name.toLowerCase().includes(assignmentFilter.toLowerCase()) &&
        a.professor.name.toLowerCase().includes(professorFilter.toLowerCase())
    )

  return (
    <div className="space-y-8 max-w-4xl mx-auto py-6">
      <PageHeader />

      {isLoading ? (
        <LoadingState />
      ) : (
        <>
          <AssignmentForm
            courses={courses}
            professors={professors}
            selectedCourse={selectedCourse}
            selectedProfessor={selectedProfessor}
            setSelectedCourse={setSelectedCourse}
            setSelectedProfessor={setSelectedProfessor}
            isSubmitting={isSubmitting}
            handleAssign={handleAssign}
            formData={formData}
          />

          <AssignmentFilter
            assignmentFilter={assignmentFilter}
            setAssignmentFilter={setAssignmentFilter}
            professorFilter={professorFilter}
            setProfessorFilter={setProfessorFilter}
          />

          <AssignmentList
            assignments={filteredAssignments}
            confirmDelete={confirmDelete}
            onEdit={handleEdit}
            filter={assignmentFilter}
            setFilter={setAssignmentFilter}
          />
        </>
      )}

      <DeleteConfirmationDialog
        open={showDeleteDialog}
        onOpenChange={(isOpen) => {
          if (!isOpen) setAssignmentToDelete(null)
          setShowDeleteDialog(isOpen)
        }}
        onConfirm={handleDelete}
      />
    </div>
  )
}
