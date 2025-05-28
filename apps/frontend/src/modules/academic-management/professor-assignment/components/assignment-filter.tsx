'use client'

import { FilterBar } from '@/app/(components)/ui/filter-bar'
import { Search } from 'lucide-react'
import { memo } from 'react'

interface AssignmentFilterProps {
  assignmentFilter: string
  setAssignmentFilter: (value: string) => void
  professorFilter: string
  setProfessorFilter: (value: string) => void
  disabled?: boolean
  className?: string
}

export const AssignmentFilter = memo<AssignmentFilterProps>(
  ({ assignmentFilter, setAssignmentFilter, professorFilter, setProfessorFilter, disabled = false, className = '' }) => (
    <div className={`bg-muted/30 p-4 rounded-lg space-y-4 ${className}`}>
      {/* Filtro por asignaciones */}
      <div>
        <div className="flex items-center mb-2">
          <Search className={`h-4 w-4 mr-2 ${disabled ? 'text-muted-foreground/50' : 'text-muted-foreground'}`} />
          <h3 className={`text-sm font-medium ${disabled ? 'text-muted-foreground/70' : ''}`}>Filtrar asignaciones</h3>
        </div>
        <FilterBar value={assignmentFilter} onChange={setAssignmentFilter} />
      </div>

      {/* Filtro por profesores */}
      <div>
        <div className="flex items-center mb-2">
          <Search className={`h-4 w-4 mr-2 ${disabled ? 'text-muted-foreground/50' : 'text-muted-foreground'}`} />
          <h3 className={`text-sm font-medium ${disabled ? 'text-muted-foreground/70' : ''}`}>Filtrar por profesor</h3>
        </div>
        <FilterBar value={professorFilter} onChange={setProfessorFilter} />
      </div>
    </div>
  )
)

AssignmentFilter.displayName = 'AssignmentFilter'
