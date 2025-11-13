// ============================================================
//  📦 InstitutionalProjectsService
//  Servicio para gestión de proyectos institucionales
// ============================================================

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1'

export interface InstitutionalProject {
  id?: string
  code: string
  title: string
  description?: string
  objectives?: string
  projectType: 'INSTITUTIONAL' | 'RESEARCH' | 'EXTENSION' | 'OTHER'
  requiredJourneyTime: number
  assignedJourneyTime: number
  startDate: string
  endDate: string
  campusAllocationId: string
  directorId: string
  projectStatus?: 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'CANCELLED'
  status?: 'ACTIVE' | 'INACTIVE' | 'PENDING' | 'COMPLETED'
  createdAt?: string
  updatedAt?: string
  // Relaciones
  director?: {
    id: string
    firstName: string
    lastName: string
    email: string
  }
  professorAssignments?: any[]
}

export interface CreateInstitutionalProjectDto {
  code: string
  title: string
  description?: string
  objectives?: string
  projectType: 'INSTITUTIONAL' | 'RESEARCH' | 'EXTENSION' | 'OTHER'
  requiredJourneyTime: number
  assignedJourneyTime?: number
  startDate: string
  endDate: string
  campusAllocationId: string
  directorId: string
}

export interface UpdateInstitutionalProjectDto extends Partial<CreateInstitutionalProjectDto> {}

export interface ProjectWithAvailableTime extends InstitutionalProject {
  availableTime: number
  capacityPercentage: number
}

export const InstitutionalProjectsService = {
  /**
   * 🔹 Obtiene todos los proyectos institucionales
   */
  async getAll(): Promise<InstitutionalProject[]> {
    try {
      const res = await fetch(`${API_URL}/institutional-projects`, {
        cache: 'no-store'
      })

      if (!res.ok) {
        console.error('❌ Error al obtener proyectos:', res.status)
        throw new Error(`Error al obtener proyectos: ${res.status}`)
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
   * 🔹 Obtiene un proyecto por ID
   */
  async getById(id: string): Promise<InstitutionalProject | null> {
    try {
      const res = await fetch(`${API_URL}/institutional-projects/${id}`, {
        cache: 'no-store'
      })

      if (!res.ok) {
        console.error('❌ Error al obtener proyecto:', res.status)
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
   * 🔹 Obtiene proyectos por campus
   */
  async getByCampusAllocation(campusAllocationId: string): Promise<InstitutionalProject[]> {
    try {
      const res = await fetch(`${API_URL}/institutional-projects/by-campus-allocation/${campusAllocationId}`, {
        cache: 'no-store'
      })

      if (!res.ok) {
        console.error('❌ Error al obtener proyectos por campus:', res.status)
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
   * 🔹 Obtiene proyectos por director
   */
  async getByDirector(directorId: string): Promise<InstitutionalProject[]> {
    try {
      const res = await fetch(`${API_URL}/institutional-projects/by-director/${directorId}`, { cache: 'no-store' })

      if (!res.ok) {
        console.error('❌ Error al obtener proyectos por director:', res.status)
        return []
      }

      const json = await res.json()
      const data = Array.isArray(json) ? json : json.data || []
      return data
    } catch (err) {
      console.error('⚠️ Error en getByDirector:', err)
      return []
    }
  },

  /**
   * 🔹 Obtiene proyectos con tiempo disponible
   */
  async getWithAvailableTime(): Promise<ProjectWithAvailableTime[]> {
    try {
      const res = await fetch(`${API_URL}/institutional-projects/with-available-time`, {
        cache: 'no-store'
      })

      if (!res.ok) {
        console.error('❌ Error al obtener proyectos con tiempo disponible:', res.status)
        return []
      }

      const json = await res.json()
      const data = Array.isArray(json) ? json : json.data || []
      return data
    } catch (err) {
      console.error('⚠️ Error en getWithAvailableTime:', err)
      return []
    }
  },

  /**
   * 🔹 Calcula el total de tiempo asignado por campus
   */
  async getTotalAssignedTime(campusAllocationId: string): Promise<number> {
    try {
      const res = await fetch(`${API_URL}/institutional-projects/total-assigned-time/${campusAllocationId}`, {
        cache: 'no-store'
      })

      if (!res.ok) {
        console.error('❌ Error al calcular total asignado:', res.status)
        return 0
      }

      const json = await res.json()
      return json?.total || 0
    } catch (err) {
      console.error('⚠️ Error en getTotalAssignedTime:', err)
      return 0
    }
  },

  /**
   * 🔹 Crea un nuevo proyecto institucional
   */
  async create(data: CreateInstitutionalProjectDto): Promise<InstitutionalProject | null> {
    try {
      const res = await fetch(`${API_URL}/institutional-projects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        console.error('❌ Error al crear proyecto:', res.status, errorData)
        throw new Error(errorData.message || `Error al crear proyecto: ${res.status}`)
      }

      const json = await res.json()
      return json?.data || json
    } catch (err) {
      console.error('⚠️ Error en create:', err)
      throw err
    }
  },

  /**
   * 🔹 Actualiza un proyecto institucional existente
   */
  async update(id: string, data: UpdateInstitutionalProjectDto): Promise<InstitutionalProject | null> {
    try {
      const res = await fetch(`${API_URL}/institutional-projects/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        console.error('❌ Error al actualizar proyecto:', res.status, errorData)
        throw new Error(errorData.message || `Error al actualizar proyecto: ${res.status}`)
      }

      const json = await res.json()
      return json?.data || json
    } catch (err) {
      console.error('⚠️ Error en update:', err)
      throw err
    }
  },

  /**
   * 🔹 Elimina un proyecto institucional
   */
  async delete(id: string): Promise<boolean> {
    try {
      const res = await fetch(`${API_URL}/institutional-projects/${id}`, {
        method: 'DELETE'
      })

      if (!res.ok) {
        console.error('❌ Error al eliminar proyecto:', res.status)
        return false
      }

      return true
    } catch (err) {
      console.error('⚠️ Error en delete:', err)
      return false
    }
  }
}
