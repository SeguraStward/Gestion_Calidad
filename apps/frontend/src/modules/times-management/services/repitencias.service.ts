// ============================================================
//   RepitenciasService
//  Servicio para gestión de repitencias (cursos con repitencia)
// ============================================================

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1'

export interface Repitencia {
  id?: string
  campusId: string
  curricularMeshId: string
  courseId: string
  academicCycleId: string
  campusAllocationId: string
  courseName: string
  courseCode: string
  careerName: string
  additionalHours: number
  studentsCount?: number
  reason?: string
  semester?: string
  status?: 'PENDING' | 'APPROVED' | 'ASSIGNED' | 'COMPLETED' | 'CANCELLED'
  createdAt?: string
  updatedAt?: string
}

export interface CreateRepitenciaDto {
  campusId: string
  curricularMeshId?: string
  courseId: string
  academicCycleId: string
  campusAllocationId: string
  courseName: string
  courseCode: string
  careerName: string
  additionalHours: number
  studentsCount?: number
  reason?: string
  semester?: string
  status?: 'PENDING' | 'APPROVED' | 'ASSIGNED' | 'COMPLETED' | 'CANCELLED'
}

export interface UpdateRepitenciaDto extends Partial<CreateRepitenciaDto> {}

export interface RepitenciaStatistics {
  total: number
  pending: number
  approved: number
  assigned: number
  totalAdditionalHours: number
}

export const RepitenciasService = {
  /**
   *  Obtiene todas las repitencias
   */
  async getAll(): Promise<Repitencia[]> {
    try {
      const res = await fetch(`${API_URL}/repitencias`, {
        cache: 'no-store',
        credentials: 'include'
      })

      if (!res.ok) {
        console.error(' Error al obtener repitencias:', res.status)
        throw new Error(`Error al obtener repitencias: ${res.status}`)
      }

      const json = await res.json()
      const data = Array.isArray(json) ? json : json.data || []
      return data
    } catch (err) {
      console.error(' Error en getAll:', err)
      return []
    }
  },

  /**
   *  Obtiene una repitencia por ID
   */
  async getById(id: string): Promise<Repitencia | null> {
    try {
      const res = await fetch(`${API_URL}/repitencias/${id}`, {
        cache: 'no-store',
        credentials: 'include'
      })

      if (!res.ok) {
        console.error(' Error al obtener repitencia:', res.status)
        return null
      }

      const json = await res.json()
      return json?.data || json
    } catch (err) {
      console.error(' Error en getById:', err)
      return null
    }
  },

  /**
   *  Obtiene repitencias por campus
   */
  async getByCampus(campusId: string): Promise<Repitencia[]> {
    try {
      const res = await fetch(`${API_URL}/repitencias/by-campus/${campusId}`, {
        cache: 'no-store',
        credentials: 'include'
      })

      if (!res.ok) {
        console.error(' Error al obtener repitencias por campus:', res.status)
        return []
      }

      const json = await res.json()
      const data = Array.isArray(json) ? json : json.data || []
      return data
    } catch (err) {
      console.error(' Error en getByCampus:', err)
      return []
    }
  },

  /**
   *  Obtiene repitencias por curso
   */
  async getByCourse(courseId: string): Promise<Repitencia[]> {
    try {
      const res = await fetch(`${API_URL}/repitencias/by-course/${courseId}`, {
        cache: 'no-store',
        credentials: 'include'
      })

      if (!res.ok) {
        console.error(' Error al obtener repitencias por curso:', res.status)
        return []
      }

      const json = await res.json()
      const data = Array.isArray(json) ? json : json.data || []
      return data
    } catch (err) {
      console.error(' Error en getByCourse:', err)
      return []
    }
  },

  /**
   *  Obtiene repitencias por ciclo académico
   */
  async getByAcademicCycle(academicCycleId: string): Promise<Repitencia[]> {
    try {
      const res = await fetch(`${API_URL}/repitencias/by-academic-cycle/${academicCycleId}`, {
        cache: 'no-store',
        credentials: 'include'
      })

      if (!res.ok) {
        console.error(' Error al obtener repitencias por ciclo:', res.status)
        return []
      }

      const json = await res.json()
      const data = Array.isArray(json) ? json : json.data || []
      return data
    } catch (err) {
      console.error(' Error en getByAcademicCycle:', err)
      return []
    }
  },

  /**
   *  Obtiene repitencias por asignación de campus
   */
  async getByCampusAllocation(campusAllocationId: string): Promise<Repitencia[]> {
    try {
      const res = await fetch(`${API_URL}/repitencias/by-campus-allocation/${campusAllocationId}`, {
        cache: 'no-store',
        credentials: 'include'
      })

      if (!res.ok) {
        console.error(' Error al obtener repitencias por asignación:', res.status)
        return []
      }

      const json = await res.json()
      const data = Array.isArray(json) ? json : json.data || []
      return data
    } catch (err) {
      console.error(' Error en getByCampusAllocation:', err)
      return []
    }
  },

  /**
   *  Calcula el total de horas adicionales por asignación de campus
   */
  async getTotalAdditionalHours(campusAllocationId: string): Promise<number> {
    try {
      const res = await fetch(`${API_URL}/repitencias/total-additional-hours/${campusAllocationId}`, {
        cache: 'no-store',
        credentials: 'include'
      })

      if (!res.ok) {
        console.error(' Error al calcular horas adicionales:', res.status)
        return 0
      }

      const json = await res.json()
      return json?.total || 0
    } catch (err) {
      console.error(' Error en getTotalAdditionalHours:', err)
      return 0
    }
  },

  /**
   *  Obtiene estadísticas de repitencias
   */
  async getStatistics(): Promise<RepitenciaStatistics | null> {
    try {
      const res = await fetch(`${API_URL}/repitencias/statistics`, {
        cache: 'no-store',
        credentials: 'include'
      })

      if (!res.ok) {
        console.error(' Error al obtener estadísticas:', res.status)
        return null
      }

      const json = await res.json()
      return json?.data || json
    } catch (err) {
      console.error(' Error en getStatistics:', err)
      return null
    }
  },

  /**
   *  Crea una nueva repitencia
   */
  async create(data: CreateRepitenciaDto): Promise<Repitencia | null> {
    try {
      const res = await fetch(`${API_URL}/repitencias`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        console.error(' Error al crear repitencia:', res.status, errorData)
        throw new Error(errorData.message || `Error al crear repitencia: ${res.status}`)
      }

      const json = await res.json()
      return json?.data || json
    } catch (err) {
      console.error(' Error en create:', err)
      throw err
    }
  },

  /**
   *  Actualiza una repitencia existente
   */
  async update(id: string, data: UpdateRepitenciaDto): Promise<Repitencia | null> {
    try {
      const res = await fetch(`${API_URL}/repitencias/${id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        console.error(' Error al actualizar repitencia:', res.status, errorData)
        throw new Error(errorData.message || `Error al actualizar repitencia: ${res.status}`)
      }

      const json = await res.json()
      return json?.data || json
    } catch (err) {
      console.error(' Error en update:', err)
      throw err
    }
  },

  /**
   *  Elimina una repitencia
   */
  async delete(id: string): Promise<boolean> {
    try {
      const res = await fetch(`${API_URL}/repitencias/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      })

      if (!res.ok) {
        console.error(' Error al eliminar repitencia:', res.status)
        return false
      }

      return true
    } catch (err) {
      console.error(' Error en delete:', err)
      return false
    }
  }
}

