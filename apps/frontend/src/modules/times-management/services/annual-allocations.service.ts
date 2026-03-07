// ============================================================
//  📦 AnnualJourneyTimeAllocationsService
//  Servicio para gestión de asignaciones anuales de tiempo
// ============================================================

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1'

export interface AnnualJourneyTimeAllocation {
  id?: string
  year: number
  totalJourneyTime: number
  description?: string
  status: 'DRAFT' | 'APPROVED' | 'ACTIVE' | 'CLOSED'
  totalAllocatedToCampus?: number
  totalFromExternalProviders?: number
  availableJourneyTime?: number
  createdAt?: string
  updatedAt?: string
}

export interface CreateAnnualAllocationDto {
  year: number
  totalJourneyTime: number
  description?: string
  status?: 'DRAFT' | 'APPROVED' | 'ACTIVE' | 'CLOSED'
}

export interface UpdateAnnualAllocationDto extends Partial<CreateAnnualAllocationDto> {}

export interface YearSummary {
  year: number
  found: boolean
  totalJourneyTime: number
  totalAllocatedToCampus: number
  totalFromExternalProviders: number
  totalAvailable: number
  campusAllocations: any[]
  externalProviders: any[]
}

export const AnnualJourneyTimeAllocationsService = {
  /**
   * 🔹 Obtiene todas las asignaciones anuales
   */
  async getAll(): Promise<AnnualJourneyTimeAllocation[]> {
    try {
      const res = await fetch(`${API_URL}/annual-journey-time-allocations`, {
        cache: 'no-store'
      })

      if (!res.ok) {
        console.error('❌ Error al obtener asignaciones anuales:', res.status)
        throw new Error(`Error al obtener asignaciones anuales: ${res.status}`)
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
   * 🔹 Obtiene una asignación anual por ID
   */
  async getById(id: string): Promise<AnnualJourneyTimeAllocation | null> {
    try {
      const res = await fetch(`${API_URL}/annual-journey-time-allocations/${id}`, {
        cache: 'no-store'
      })

      if (!res.ok) {
        console.error('❌ Error al obtener asignación anual:', res.status)
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
   * 🔹 Obtiene la asignación anual por año
   */
  async getByYear(year: number): Promise<AnnualJourneyTimeAllocation | null> {
    try {
      const res = await fetch(`${API_URL}/annual-journey-time-allocations?year=${year}`, {
        cache: 'no-store'
      })

      if (!res.ok) {
        console.error('❌ Error al obtener asignación por año:', res.status)
        return null
      }

      const json = await res.json()
      const data = Array.isArray(json) ? json : json.data || []
      return data.length > 0 ? data[0] : null
    } catch (err) {
      console.error('⚠️ Error en getByYear:', err)
      return null
    }
  },

  /**
   * 🔹 Obtiene la asignación activa actual
   */
  async getActive(): Promise<AnnualJourneyTimeAllocation | null> {
    try {
      const currentYear = new Date().getFullYear()
      return await this.getByYear(currentYear)
    } catch (err) {
      console.error('⚠️ Error en getActive:', err)
      return null
    }
  },

  /**
   * 🔹 Obtiene resumen completo de un año
   */
  async getYearSummary(year: number): Promise<YearSummary | null> {
    try {
      const res = await fetch(`${API_URL}/annual-journey-time-allocations/summary/${year}`, {
        cache: 'no-store'
      })

      if (!res.ok) {
        console.error('❌ Error al obtener resumen del año:', res.status)
        return null
      }

      const json = await res.json()
      return json?.data || json
    } catch (err) {
      console.error('⚠️ Error en getYearSummary:', err)
      return null
    }
  },

  /**
   * 🔹 Crea una nueva asignación anual
   */
  async create(data: CreateAnnualAllocationDto): Promise<AnnualJourneyTimeAllocation | null> {
    try {
      const res = await fetch(`${API_URL}/annual-journey-time-allocations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        console.error('❌ Error al crear asignación anual:', res.status, errorData)
        throw new Error(errorData.message || `Error al crear asignación anual: ${res.status}`)
      }

      const json = await res.json()
      return json?.data || json
    } catch (err) {
      console.error('⚠️ Error en create:', err)
      throw err
    }
  },

  /**
   * 🔹 Actualiza una asignación anual existente
   */
  async update(id: string, data: UpdateAnnualAllocationDto): Promise<AnnualJourneyTimeAllocation | null> {
    try {
      const res = await fetch(`${API_URL}/annual-journey-time-allocations/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        console.error('❌ Error al actualizar asignación anual:', res.status, errorData)
        throw new Error(errorData.message || `Error al actualizar asignación anual: ${res.status}`)
      }

      const json = await res.json()
      return json?.data || json
    } catch (err) {
      console.error('⚠️ Error en update:', err)
      throw err
    }
  },

  /**
   * 🔹 Elimina una asignación anual
   */
  async delete(id: string): Promise<boolean> {
    try {
      const res = await fetch(`${API_URL}/annual-journey-time-allocations/${id}`, {
        method: 'DELETE'
      })

      if (!res.ok) {
        console.error('❌ Error al eliminar asignación anual:', res.status)
        return false
      }

      return true
    } catch (err) {
      console.error('⚠️ Error en delete:', err)
      return false
    }
  }
}
