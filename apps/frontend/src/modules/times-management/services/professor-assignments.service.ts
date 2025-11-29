// ============================================================
//  📦 ProfessorAssignmentsService
//  Servicio para gestión de asignaciones de profesores
// ============================================================

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1'

export interface ProfessorAssignment {
  id?: string
  professorId: string
  professorName?: string
  professorIdentification?: string
  campusAllocationId: string
  campusName?: string
  careerName?: string
  calculatedJourneyTime?: number
  assignmentType?: 'FULL' | 'THREE_QUARTER' | 'HALF' | 'QUARTER'
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING' | 'COMPLETED'
  notes?: string
  createdAt?: string
  updatedAt?: string
}

export interface CreateProfessorAssignmentDto {
  professorId: string
  academicCycleId: string
  campusId: string
  curricularMeshCourseId?: string // ✅ OPCIONAL (no siempre hay curso asignado)
  assignmentType: 'FULL' | 'THREE_QUARTER' | 'HALF' | 'QUARTER'
  campusAllocationId?: string
  institutionalProjectId?: string
  notes?: string
}

export interface UpdateProfessorAssignmentDto extends Partial<CreateProfessorAssignmentDto> {}

export const ProfessorAssignmentsService = {
  /**
   * 🔹 Obtiene todas las asignaciones de profesores
   */
  async getAll(): Promise<ProfessorAssignment[]> {
    try {
      const res = await fetch(`${API_URL}/professor-assignments`, {
        cache: 'no-store'
      })

      if (!res.ok) {
        console.error('❌ Error al obtener asignaciones de profesores:', res.status)
        throw new Error(`Error al obtener asignaciones: ${res.status}`)
      }

      const json = await res.json()
      const data = Array.isArray(json) ? json : json.data || []
      return data
    } catch (err) {
      console.error('⚠️ Error en getAll:', err)
      return []
    }
  },

  /**
   * 🔹 Obtiene una asignación por ID
   */
  async getById(id: string): Promise<ProfessorAssignment | null> {
    try {
      const res = await fetch(`${API_URL}/professor-assignments/${id}`, {
        cache: 'no-store'
      })

      if (!res.ok) {
        console.error('❌ Error al obtener asignación:', res.status)
        return null
      }

      const json = await res.json()
      return json?.data || json
    } catch (err) {
      console.error('⚠️ Error en getById:', err)
      return null
    }
  },

  /**
   * 🔹 Obtiene asignaciones por profesor
   */
  async getByProfessor(professorId: string): Promise<ProfessorAssignment[]> {
    try {
      const res = await fetch(`${API_URL}/professor-assignments?professorId=${professorId}`, {
        cache: 'no-store'
      })

      if (!res.ok) {
        console.error('❌ Error al obtener asignaciones del profesor:', res.status)
        return []
      }

      const json = await res.json()
      const data = Array.isArray(json) ? json : json.data || []
      return data
    } catch (err) {
      console.error('⚠️ Error en getByProfessor:', err)
      return []
    }
  },

  /**
   * 🔹 Obtiene asignaciones por campus
   */
  async getByCampusAllocation(campusAllocationId: string): Promise<ProfessorAssignment[]> {
    try {
      const res = await fetch(`${API_URL}/professor-assignments?campusAllocationId=${campusAllocationId}`, {
        cache: 'no-store'
      })

      if (!res.ok) {
        console.error('❌ Error al obtener asignaciones por campus:', res.status)
        return []
      }

      const json = await res.json()
      const data = Array.isArray(json) ? json : json.data || []
      return data
    } catch (err) {
      console.error('⚠️ Error en getByCampusAllocation:', err)
      return []
    }
  },

  /**
   * 🔹 Crea una nueva asignación de profesor
   */
  async create(data: CreateProfessorAssignmentDto): Promise<ProfessorAssignment | null> {
    try {
      const res = await fetch(`${API_URL}/professor-assignments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        console.error('❌ Error al crear asignación:', res.status, errorData)
        throw new Error(errorData.message || `Error al crear asignación: ${res.status}`)
      }

      const json = await res.json()
      return json?.data || json
    } catch (err) {
      console.error('⚠️ Error en create:', err)
      throw err
    }
  },

  /**
   * 🔹 Actualiza una asignación existente
   */
  async update(id: string, data: UpdateProfessorAssignmentDto): Promise<ProfessorAssignment | null> {
    try {
      const res = await fetch(`${API_URL}/professor-assignments/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        console.error('❌ Error al actualizar asignación:', res.status, errorData)
        throw new Error(errorData.message || `Error al actualizar asignación: ${res.status}`)
      }

      const json = await res.json()
      return json?.data || json
    } catch (err) {
      console.error('⚠️ Error en update:', err)
      throw err
    }
  },

  /**
   * 🔹 Elimina una asignación
   */
  async delete(id: string): Promise<boolean> {
    try {
      const res = await fetch(`${API_URL}/professor-assignments/${id}`, {
        method: 'DELETE'
      })

      if (!res.ok) {
        console.error('❌ Error al eliminar asignación:', res.status)
        return false
      }

      return true
    } catch (err) {
      console.error('⚠️ Error en delete:', err)
      return false
    }
  }
}
