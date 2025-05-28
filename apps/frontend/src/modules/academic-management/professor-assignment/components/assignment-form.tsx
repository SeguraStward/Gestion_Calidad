'use client'

import { Card } from '@una-gc/ui/components/card'
import { Button } from '@una-gc/ui/components/button'
import { FormLayout } from '@/app/(components)/form/form-layout'
import { FormSelect } from '@/app/(components)/form/select'
import { UserPlus, Loader2 } from 'lucide-react'
import type { Assignment } from '@/modules/academic-management/professor-assignment/hooks/useProfessorAssignments'

interface AssignmentFormProps {
  courses: any[]
  professors: any[]
  selectedCourse: string | null
  selectedProfessor: string | null
  setSelectedCourse: (value: string | null) => void
  setSelectedProfessor: (value: string | null) => void
  isSubmitting: boolean
  handleAssign: () => void
  formData?: Assignment | null // <- Esta es la clave
}

export const AssignmentForm = ({
  courses,
  professors,
  selectedCourse,
  selectedProfessor,
  setSelectedCourse,
  setSelectedProfessor,
  isSubmitting,
  handleAssign
}: AssignmentFormProps) => (
  <Card className="shadow-sm border-muted p-7 transition-all hover:shadow-md">
    <FormLayout
      title="Asignar Profesor a Curso"
      onSubmit={(e) => {
        e.preventDefault()
        handleAssign()
      }}
    >
      <div className="grid gap-6 md:grid-cols-2">
        <FormSelect
          label="Curso"
          value={selectedCourse}
          onChange={setSelectedCourse}
          options={courses}
          placeholder="Seleccione un curso"
          required
        />

        <FormSelect
          label="Profesor"
          value={selectedProfessor}
          onChange={setSelectedProfessor}
          options={professors}
          placeholder="Seleccione un profesor"
          required
        />
      </div>

      <div className="flex justify-end mt-4">
        <Button
          type="submit"
          className="bg-primary hover:bg-primary/90 transition-colors"
          disabled={isSubmitting || !selectedCourse || !selectedProfessor}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Procesando...
            </>
          ) : (
            <>
              <UserPlus className="mr-2 h-4 w-4" />
              Asignar Profesor
            </>
          )}
        </Button>
      </div>
    </FormLayout>
  </Card>
)
