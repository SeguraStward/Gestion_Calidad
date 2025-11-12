// ============================================================
//  📦 CampusJourneyTimeAllocationsService
//  Servicio para gestión de asignaciones de tiempo por campus
// ============================================================

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1'

export interface CampusJourneyTimeAllocation {
  id?: string
  campusId: string
  campusName?: string
  academicCycleId: string
  cycleName?: string
  careerId: string
  careerName?: string
  totalAllocatedTime: number
  status: 'ACTIVE' | 'INACTIVE' | 'PLANNED' | 'COMPLETED'
  notes?: string
  createdAt?: string
  updatedAt?: string
}

export interface CreateCampusAllocationDto {
  campusId: string
  academicCycleId: string
  careerId: string
  totalAllocatedTime: number
  status?: 'ACTIVE' | 'INACTIVE' | 'PLANNED' | 'COMPLETED'
  notes?: string
}

export interface UpdateCampusAllocationDto extends Partial<CreateCampusAllocationDto> {}

export interface AvailableTimeResponse {
  campusAllocationId: string
  totalAllocatedTime: number
  totalAssignedTime: number
  availableTime: number
  utilizationPercentage: number
}

export interface ValidateAvailabilityDto {
  requestedTime: number
}

export interface ValidateAvailabilityResponse {
  isAvailable: boolean
  requestedTime: number
  availableTime: number
  message: string
}

export const CampusJourneyTimeAllocationsService = {
  /**
   * 🔹 Obtiene todas las asignaciones de campus
   */
  async getAll(): Promise<CampusJourneyTimeAllocation[]> {
    try {
      const res = await fetch(`${API_URL}/campus-journey-time-allocations`, {
        cache: 'no-store'
      })

      if (!res.ok) {
        console.error('❌ Error al obtener asignaciones de campus:', res.status)
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
  async getById(id: string): Promise<CampusJourneyTimeAllocation | null> {
    try {
      const res = await fetch(`${API_URL}/campus-journey-time-allocations/${id}`, {
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
   * 🔹 Crea una nueva asignación de campus
   */
  async create(data: CreateCampusAllocationDto): Promise<CampusJourneyTimeAllocation | null> {
    try {
      const res = await fetch(`${API_URL}/campus-journey-time-allocations`, {
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
  async update(id: string, data: UpdateCampusAllocationDto): Promise<CampusJourneyTimeAllocation | null> {
    try {
      const res = await fetch(`${API_URL}/campus-journey-time-allocations/${id}`, {
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
      const res = await fetch(`${API_URL}/campus-journey-time-allocations/${id}`, {
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
  },

  /**
   * 🔹 Calcula el tiempo disponible de una asignación
   */
  async getAvailableTime(id: string): Promise<AvailableTimeResponse | null> {
    try {
      const res = await fetch(`${API_URL}/campus-journey-time-allocations/${id}/available-time`, {
        cache: 'no-store'
      })

      if (!res.ok) {
        console.error('❌ Error al calcular tiempo disponible:', res.status)
        return null
      }

      const json = await res.json()
      return json?.data || json
    } catch (err) {
      console.error('⚠️ Error en getAvailableTime:', err)
      return null
    }
  },

  /**
   * 🔹 Valida si hay disponibilidad para una asignación
   */
  async validateAvailability(id: string, requestedTime: number): Promise<ValidateAvailabilityResponse | null> {
    try {
      const res = await fetch(`${API_URL}/campus-journey-time-allocations/${id}/validate-availability`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestedTime })
      })

      if (!res.ok) {
        console.error('❌ Error al validar disponibilidad:', res.status)
        return null
      }

      const json = await res.json()
      return json?.data || json
    } catch (err) {
      console.error('⚠️ Error en validateAvailability:', err)
      return null
    }
  }
}
