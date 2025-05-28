'use client'

import { Card } from '@una-gc/ui/components/card'
import { Button } from '@una-gc/ui/components/button'
import { BookOpen, Users, Trash2, CheckCircle, Pencil, X } from 'lucide-react'

interface AssignmentListProps {
  assignments: any[]
  filter: string
  confirmDelete: (assignmentId: string) => void
  setFilter: (value: string) => void
  onEdit: (assignment: any) => void
  onCancelEdit: () => void
  editingId: string | null
}

export const AssignmentList = ({
  assignments,
  filter,
  confirmDelete,
  setFilter,
  onEdit,
  onCancelEdit,
  editingId
}: AssignmentListProps) => (
  <div className="space-y-4">
    <div className="flex items-center justify-between">
      <div className="flex items-center">
        <CheckCircle className="h-5 w-5 mr-2 text-primary" />
        <h3 className="text-xl font-bold">Asignaciones actuales</h3>
      </div>
      {assignments.length > 0 && (
        <span className="bg-primary/10 text-primary text-sm py-1 px-3 rounded-full">
          {assignments.length} {assignments.length === 1 ? 'asignación' : 'asignaciones'}
        </span>
      )}
    </div>

    {assignments.length === 0 ? (
      <div className="bg-muted/30 border border-dashed border-muted rounded-lg p-8 text-center">
        <Users className="h-10 w-10 text-muted-foreground/50 mx-auto mb-3" />
        <p className="text-muted-foreground">No hay asignaciones que coincidan con el filtro actual.</p>
        {filter && (
          <Button variant="outline" size="sm" className="mt-4" onClick={() => setFilter('')}>
            Limpiar filtro
          </Button>
        )}
      </div>
    ) : (
      <div className="space-y-3">
        {assignments.map((assignment) => (
          <Card
            key={assignment.id}
            className={`flex justify-between items-center p-4 shadow-sm hover:shadow transition-all border-l-4 ${
              editingId === assignment.id ? 'border-l-blue-500 ring-2 ring-blue-200' : 'border-l-primary'
            }`}
          >
            <div className="flex items-start space-x-3">
              <Users className="h-5 w-5 text-primary mt-1" />
              <div>
                <p className="font-semibold">{assignment.professor.name}</p>
                <p className="text-sm text-muted-foreground flex items-center">
                  <BookOpen className="h-3 w-3 mr-1 inline" />
                  {assignment.course.name}
                </p>
              </div>
            </div>
            <div className="flex space-x-2">
              {editingId === assignment.id ? (
                <Button variant="outline" size="sm" className="text-muted-foreground hover:text-primary" onClick={onCancelEdit}>
                  <X className="h-3 w-4 mr-1" />
                  Cancelar edición
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  className="text-muted-foreground hover:text-primary"
                  onClick={() => onEdit(assignment)}
                >
                  <Pencil className="h-4 w-4 mr-1" />
                  Editar
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                onClick={() => confirmDelete(assignment.id)}
                disabled={editingId === assignment.id}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Eliminar
              </Button>
            </div>
          </Card>
        ))}
      </div>
    )}
  </div>
)
