// ============================================================
//   ExternalProvidersService
//  Servicio para gestión de proveedores externos de tiempo
// ============================================================

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1'

export interface ExternalProvider {
  id?: string
  name: string
  description?: string
  providerType: 'UNIVERSITY' | 'AGREEMENT' | 'EXCHANGE' | 'OTHER'
  contactEmail?: string
  contactPhone?: string
  contactPerson?: string
  annualAllocationId: string
  providedJourneyTime: number
  isFixedTime?: boolean
  startDate?: string
  endDate?: string
  status?: 'ACTIVE' | 'INACTIVE' | 'PENDING' | 'COMPLETED'
  createdAt?: string
  updatedAt?: string
}

export interface CreateExternalProviderDto {
  name: string
  description?: string
  providerType: 'UNIVERSITY' | 'AGREEMENT' | 'EXCHANGE' | 'OTHER'
  contactEmail?: string
  contactPhone?: string
  contactPerson?: string
  annualAllocationId: string
  providedJourneyTime: number
  isFixedTime?: boolean
  startDate?: string
  endDate?: string
}

export interface UpdateExternalProviderDto extends Partial<CreateExternalProviderDto> {}

export const ExternalProvidersService = {
  /**
   *  Obtiene todos los proveedores externos
   */
  async getAll(): Promise<ExternalProvider[]> {
    try {
      const res = await fetch(`${API_URL}/external-providers`, {
        cache: 'no-store',
        credentials: 'include'
      })

      if (!res.ok) {
        console.error(' Error al obtener proveedores externos:', res.status)
        throw new Error(`Error al obtener proveedores externos: ${res.status}`)
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
   *  Obtiene un proveedor externo por ID
   */
  async getById(id: string): Promise<ExternalProvider | null> {
    try {
      const res = await fetch(`${API_URL}/external-providers/${id}`, {
        cache: 'no-store',
        credentials: 'include'
      })

      if (!res.ok) {
        console.error(' Error al obtener proveedor:', res.status)
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
   *  Obtiene proveedores por asignación anual
   */
  async getByAnnualAllocation(annualAllocationId: string): Promise<ExternalProvider[]> {
    try {
      const res = await fetch(`${API_URL}/external-providers/by-annual-allocation/${annualAllocationId}`, { cache: 'no-store',
        credentials: 'include' })

      if (!res.ok) {
        console.error(' Error al obtener proveedores por año:', res.status)
        return []
      }

      const json = await res.json()
      const data = Array.isArray(json) ? json : json.data || []
      return data
    } catch (err) {
      console.error(' Error en getByAnnualAllocation:', err)
      return []
    }
  },

  /**
   *  Calcula el total de tiempo provisto por año
   */
  async getTotalProvidedTime(annualAllocationId: string): Promise<number> {
    try {
      const res = await fetch(`${API_URL}/external-providers/total-provided-time/${annualAllocationId}`, { cache: 'no-store',
        credentials: 'include' })

      if (!res.ok) {
        console.error(' Error al calcular total:', res.status)
        return 0
      }

      const json = await res.json()
      return json?.total || 0
    } catch (err) {
      console.error(' Error en getTotalProvidedTime:', err)
      return 0
    }
  },

  /**
   *  Crea un nuevo proveedor externo
   */
  async create(data: CreateExternalProviderDto): Promise<ExternalProvider | null> {
    try {
      const res = await fetch(`${API_URL}/external-providers`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        console.error(' Error al crear proveedor:', res.status, errorData)
        throw new Error(errorData.message || `Error al crear proveedor: ${res.status}`)
      }

      const json = await res.json()
      return json?.data || json
    } catch (err) {
      console.error(' Error en create:', err)
      throw err
    }
  },

  /**
   *  Actualiza un proveedor externo existente
   */
  async update(id: string, data: UpdateExternalProviderDto): Promise<ExternalProvider | null> {
    try {
      const res = await fetch(`${API_URL}/external-providers/${id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        console.error(' Error al actualizar proveedor:', res.status, errorData)
        throw new Error(errorData.message || `Error al actualizar proveedor: ${res.status}`)
      }

      const json = await res.json()
      return json?.data || json
    } catch (err) {
      console.error(' Error en update:', err)
      throw err
    }
  },

  /**
   *  Elimina un proveedor externo
   */
  async delete(id: string): Promise<boolean> {
    try {
      const res = await fetch(`${API_URL}/external-providers/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      })

      if (!res.ok) {
        console.error(' Error al eliminar proveedor:', res.status)
        return false
      }

      return true
    } catch (err) {
      console.error(' Error en delete:', err)
      return false
    }
  }
}

