// ============================================================
//   TimesService
//  Servicio de conexión entre el frontend y el backend del
//  módulo de Gestión de Tiempos de Jornada
// ============================================================

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1'

export interface CareerAnnualSummary {
  careerId: string
  careerName: string
  campusId: string
  campusName: string
  byCycle: Record<string, number>
  repitencia: number
  totalYear: number
}

export interface AnnualBalance {
  year: number
  jornadasDisponibles: number
  jornadasDocencia: number
  jornadasProyectos: number
  saldo: number
}

export const TimesService = {
  /**
   *  Obtiene todas las asignaciones por campus (endpoint real)
   * Ejemplo de respuesta esperada:
   * [
   *   { campusName: "Heredia", totalHours: 120, assignedProfessors: 8 }
   * ]
   */
  async getCampusAllocations() {
    try {
      const res = await fetch(`${API_URL}/campus-journey-time-allocations`, {
        cache: 'no-store',
        credentials: 'include'
      })

      if (!res.ok) {
        console.error('Error al obtener asignaciones:', res.status, res.statusText)
        throw new Error(`Error al obtener asignaciones: ${res.status}`)
      }

      const json = await res.json()

      // Compatibilidad flexible: algunos controladores devuelven { data: [...] }
      const data = Array.isArray(json) ? json : json.data || []
      return data
    } catch (err) {
      console.error('Error en getCampusAllocations:', err)
      return [] // Devuelve array vacío para evitar romper el render
    }
  },

  /**
   *  Obtiene la configuración activa actual (rango de horas)
   * Endpoint: /api/v1/journey-time-configs/active
   */
  async getActiveConfig() {
    try {
      const res = await fetch(`${API_URL}/journey-time-configs/active`, {
        cache: 'no-store',
        credentials: 'include'
      })

      if (!res.ok) {
        console.error('Error al obtener configuración activa:', res.status, res.statusText)
        throw new Error(`Error al obtener configuración activa: ${res.status}`)
      }

      const json = await res.json()

      // Igual que arriba: puede venir directo o envuelto en { data }
      return json?.data || json
    } catch (err) {
      console.error('Error en getActiveConfig:', err)
      return null
    }
  },

  /**
   * Jornadas consumidas por carrera × ciclo para un año dado.
   * Devuelve: [ { careerId, careerName, campusId, campusName, byCycle, repitencia, totalYear } ]
   */
  async getCareerSummary(year: number) {
    try {
      const res = await fetch(`${API_URL}/times/career-summary?year=${year}`, {
        cache: 'no-store',
        credentials: 'include',
      })
      if (!res.ok) throw new Error(`Error ${res.status}`)
      return (await res.json()) as CareerAnnualSummary[]
    } catch (err) {
      console.error('Error en getCareerSummary:', err)
      return []
    }
  },

  /**
   * Balance anual: disponibles vs consumidos vs saldo.
   */
  async getAnnualBalance(year: number) {
    try {
      const res = await fetch(`${API_URL}/times/annual-balance?year=${year}`, {
        cache: 'no-store',
        credentials: 'include',
      })
      if (!res.ok) throw new Error(`Error ${res.status}`)
      return (await res.json()) as AnnualBalance
    } catch (err) {
      console.error('Error en getAnnualBalance:', err)
      return null
    }
  },

  /**
   *  Calcula equivalencia de jornada según horas dadas
   * Endpoint: /api/v1/journey-time-configs/calc?hours={n}
   */
  async calculate(hours: number) {
    try {
      const res = await fetch(`${API_URL}/journey-time-configs/calc?hours=${hours}`, {
        cache: 'no-store',
        credentials: 'include'
      })

      if (!res.ok) {
        console.error('Error en cálculo de equivalencia:', res.status, res.statusText)
        throw new Error(`Error en cálculo de equivalencia: ${res.status}`)
      }

      const json = await res.json()
      return json?.data || json
    } catch (err) {
      console.error('Error en calculate:', err)
      return { type: 'Error', value: 0 }
    }
  }
}

