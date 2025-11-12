// ============================================================
//  📦 JourneyTimeConfigService
//  Servicio para gestión de configuraciones de tiempo de jornada
// ============================================================

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1'

export interface JourneyTimeConfig {
  id?: string
  quarterTimeMinHours: number
  quarterTimeMaxHours: number
  quarterTimeValue: number
  halfTimeMinHours: number
  halfTimeMaxHours: number
  halfTimeValue: number
  threeQuarterMinHours?: number
  threeQuarterMaxHours?: number
  threeQuarterTimeValue?: number
  fullTimeMinHours: number
  fullTimeValue: number
  maxDailyHours?: number
  effectiveYear?: number
  status?: 'ACTIVE' | 'INACTIVE' | 'DRAFT'
  createdAt?: string
  updatedAt?: string
}

export interface CreateJourneyTimeConfigDto {
  quarterTimeMinHours: number
  quarterTimeMaxHours: number
  quarterTimeValue: number
  halfTimeMinHours: number
  halfTimeMaxHours: number
  halfTimeValue: number
  threeQuarterMinHours?: number
  threeQuarterMaxHours?: number
  threeQuarterTimeValue?: number
  fullTimeMinHours: number
  fullTimeValue: number
  maxDailyHours?: number
  effectiveYear?: number
  status?: 'ACTIVE' | 'INACTIVE' | 'DRAFT'
}

export interface UpdateJourneyTimeConfigDto extends Partial<CreateJourneyTimeConfigDto> {}

export interface JourneyTimeCalculation {
  hours: number
  journeyType: string
  value: number
  isValid: boolean
}

export const JourneyTimeConfigService = {
  /**
   * 🔹 Obtiene todas las configuraciones de tiempo de jornada
   */
  async getAll(): Promise<JourneyTimeConfig[]> {
    try {
      const res = await fetch(`${API_URL}/journey-time-configs`, {
        cache: 'no-store'
      })

      if (!res.ok) {
        console.error('❌ Error al obtener configuraciones:', res.status)
        throw new Error(`Error al obtener configuraciones: ${res.status}`)
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
   * 🔹 Obtiene la configuración activa
   */
  async getActive(): Promise<JourneyTimeConfig | null> {
    try {
      const res = await fetch(`${API_URL}/journey-time-configs/active`, {
        cache: 'no-store'
      })

      if (!res.ok) {
        console.error('❌ Error al obtener configuración activa:', res.status)
        return null
      }

      const json = await res.json()
      return json?.data || json
    } catch (err) {
      console.error('⚠️ Error en getActive:', err)
      return null
    }
  },

  /**
   * 🔹 Crea una nueva configuración
   */
  async create(data: CreateJourneyTimeConfigDto): Promise<JourneyTimeConfig | null> {
    try {
      const res = await fetch(`${API_URL}/journey-time-configs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        console.error('❌ Error al crear configuración:', res.status, errorData)
        throw new Error(errorData.message || `Error al crear configuración: ${res.status}`)
      }

      const json = await res.json()
      return json?.data || json
    } catch (err) {
      console.error('⚠️ Error en create:', err)
      throw err
    }
  },

  /**
   * 🔹 Actualiza una configuración existente
   */
  async update(id: string, data: UpdateJourneyTimeConfigDto): Promise<JourneyTimeConfig | null> {
    try {
      const res = await fetch(`${API_URL}/journey-time-configs/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        console.error('❌ Error al actualizar configuración:', res.status, errorData)
        throw new Error(errorData.message || `Error al actualizar configuración: ${res.status}`)
      }

      const json = await res.json()
      return json?.data || json
    } catch (err) {
      console.error('⚠️ Error en update:', err)
      throw err
    }
  },

  /**
   * 🔹 Elimina una configuración
   */
  async delete(id: string): Promise<boolean> {
    try {
      const res = await fetch(`${API_URL}/journey-time-configs/${id}`, {
        method: 'DELETE'
      })

      if (!res.ok) {
        console.error('❌ Error al eliminar configuración:', res.status)
        return false
      }

      return true
    } catch (err) {
      console.error('⚠️ Error en delete:', err)
      return false
    }
  },

  /**
   * 🔹 Calcula el tipo de jornada según las horas
   */
  async calculateJourneyTime(hours: number): Promise<JourneyTimeCalculation | null> {
    try {
      const res = await fetch(`${API_URL}/journey-time-configs/calc?hours=${hours}`, {
        cache: 'no-store'
      })

      if (!res.ok) {
        console.error('❌ Error al calcular jornada:', res.status)
        return null
      }

      const json = await res.json()
      return json?.data || json
    } catch (err) {
      console.error('⚠️ Error en calculateJourneyTime:', err)
      return null
    }
  }
}
