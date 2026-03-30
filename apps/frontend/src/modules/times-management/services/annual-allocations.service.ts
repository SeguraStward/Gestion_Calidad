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
  async getAll(): Promise<AnnualJourneyTimeAllocation[]> {
    try {
      const res = await fetch(`${API_URL}/annual-journey-time-allocations`, {
        cache: 'no-store',
        credentials: 'include'
      })

      if (!res.ok) {
        console.error('Error getting annual allocations:', res.status)
        throw new Error(`Error al obtener asignaciones anuales: ${res.status}`)
      }

      const json = await res.json()
      const data = Array.isArray(json) ? json : json.data || []
      return data
    } catch (err) {
      console.error('Error in getAll:', err)
      return []
    }
  },

  async getById(id: string): Promise<AnnualJourneyTimeAllocation | null> {
    try {
      const res = await fetch(`${API_URL}/annual-journey-time-allocations/${id}`, {
        cache: 'no-store',
        credentials: 'include'
      })

      if (!res.ok) {
        console.error('Error getting annual allocation:', res.status)
        return null
      }

      const json = await res.json()
      return json?.data || json
    } catch (err) {
      console.error('Error in getById:', err)
      return null
    }
  },

  async getByYear(year: number): Promise<AnnualJourneyTimeAllocation | null> {
    try {
      const res = await fetch(`${API_URL}/annual-journey-time-allocations?year=${year}`, {
        cache: 'no-store',
        credentials: 'include'
      })

      if (!res.ok) {
        console.error('Error getting annual allocation by year:', res.status)
        return null
      }

      const json = await res.json()
      const data = Array.isArray(json) ? json : json.data || []
      return data.length > 0 ? data[0] : null
    } catch (err) {
      console.error('Error in getByYear:', err)
      return null
    }
  },

  async getActive(): Promise<AnnualJourneyTimeAllocation | null> {
    try {
      const res = await fetch(`${API_URL}/annual-journey-time-allocations/active`, {
        cache: 'no-store',
        credentials: 'include'
      })

      if (!res.ok) {
        console.error('Error getting active annual allocation:', res.status)
        return null
      }

      const json = await res.json()
      return json?.data || json
    } catch (err) {
      console.error('Error in getActive:', err)
      return null
    }
  },

  async getYearSummary(year: number): Promise<YearSummary | null> {
    try {
      const res = await fetch(`${API_URL}/annual-journey-time-allocations/summary/${year}`, {
        cache: 'no-store',
        credentials: 'include'
      })

      if (!res.ok) {
        console.error('Error getting year summary:', res.status)
        return null
      }

      const json = await res.json()
      return json?.data || json
    } catch (err) {
      console.error('Error in getYearSummary:', err)
      return null
    }
  },

  async create(data: CreateAnnualAllocationDto): Promise<AnnualJourneyTimeAllocation | null> {
    try {
      const res = await fetch(`${API_URL}/annual-journey-time-allocations`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        console.error('Error creating annual allocation:', res.status, errorData)
        throw new Error(errorData.message || `Error al crear asignacion anual: ${res.status}`)
      }

      const json = await res.json()
      return json?.data || json
    } catch (err) {
      console.error('Error in create:', err)
      throw err
    }
  },

  async update(id: string, data: UpdateAnnualAllocationDto): Promise<AnnualJourneyTimeAllocation | null> {
    try {
      const res = await fetch(`${API_URL}/annual-journey-time-allocations/${id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        console.error('Error updating annual allocation:', res.status, errorData)
        throw new Error(errorData.message || `Error al actualizar asignacion anual: ${res.status}`)
      }

      const json = await res.json()
      return json?.data || json
    } catch (err) {
      console.error('Error in update:', err)
      throw err
    }
  },

  async delete(id: string): Promise<boolean> {
    try {
      const res = await fetch(`${API_URL}/annual-journey-time-allocations/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      })

      if (!res.ok) {
        console.error('Error deleting annual allocation:', res.status)
        return false
      }

      return true
    } catch (err) {
      console.error('Error in delete:', err)
      return false
    }
  }
}
